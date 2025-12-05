(function($B){
"use strict";
$B.pattern_match = function(subject, pattern){
    var _b_ = $B.builtins,
        frame = $B.frame_obj.frame,
        locals = frame[1]

    function bind(pattern, subject){
        if(pattern.alias){
            locals[pattern.alias] = subject
        }
    }

    if(pattern.sequence){
        // iterate on subject and match each item in the sequence

        // First, check that the subject is an instance of a class that
        // supports sequence pattern matching
        if($B.$isinstance(subject, [_b_.str, _b_.bytes, _b_.bytearray])){
            // PEP 634 :
            // Although str, bytes, and bytearray are usually considered
            // sequences, they are not included in the above list and do not
            // match sequence patterns.
            return false
        }
        let Sequence
        if($B.imported['collections.abc']){
            Sequence = $B.imported['collections.abc'].Sequence
        }
        let deque
        if($B.imported['collections']){
            deque = $B.imported['collections'].deque
        }
        let supported = false
        let klass = subject.__class__ || $B.get_class(subject)
        for(let base of [klass].concat(klass.tp_bases || [])){
            if(base.$match_sequence_pattern){
                // set for builtin classes list, tuple, range, memoryview
                // and for array.array
                supported = true
                break
            }else if(base === Sequence || base == deque){
                supported = true
                break
            }
        }
        if((! supported) && Sequence){
            // subclass of collections.abc.Sequence ?
            supported = _b_.issubclass(klass, Sequence)
        }
        if(! supported){
            return false
        }

        // [*_] always succeeds and does nothing, even if the subject has no
        // len()
        if(pattern.sequence.length == 1 &&
                pattern.sequence[0].capture_starred == '_'){
            return true
        }

        let subject_length = _b_.len(subject),
            nb_fixed_length = 0
        for(let item of pattern.sequence){
            if(! item.capture_starred){
                nb_fixed_length++
            }
        }

        // shortcut
        if(subject_length < nb_fixed_length){
            // no need to test items
            return false
        }else if(subject_length == 0 && pattern.sequence.length == 0){
            // "case []" always match and doen't require to iterate on subject
            return true
        }

        // Iterate on elements of subject and check that item i matches
        // pattern i
        let it = _b_.iter(subject),
            nxt = $B.$getattr(it, '__next__'),
            store_starred = [],
            nb_matched_in_subject = 0
        for(let i = 0, len = pattern.sequence.length; i < len; i++){
            if(pattern.sequence[i].capture_starred){
                // Starred identifier
                // - there are nb_matches_in_subject items already matched
                // - there are len - i - 1 remaining items in the sequence
                // - compute the length of the captured list

                // Shortcut : if starred subpattern is the last item in the
                // sequence and is the wildcard, do nothing
                if(pattern.sequence[i].capture_starred == '_' &&
                        i == len - 1){
                    bind(pattern, subject)
                    return true
                }
                let starred_match_length = subject_length -
                        nb_matched_in_subject - len + i + 1
                for(let j = 0; j < starred_match_length; j++){
                    store_starred.push(nxt())
                }
                // bind capture name
                locals[pattern.sequence[i].capture_starred] = 
                    $B.$list(store_starred)
                nb_matched_in_subject += starred_match_length
            }else{
                let subject_item = nxt()
                let m = $B.pattern_match(subject_item, pattern.sequence[i])
                if(! m){
                    return false
                }
                nb_matched_in_subject++
            }
        }
        // If there are still items in subject, match fails
        if(nb_matched_in_subject != subject_length){
            return false
        }
        bind(pattern, subject)
        return true
    }

    if(pattern.group){
        if(pattern.group.length == 1){
            // match the only item
            if($B.pattern_match(subject, pattern.group[0])){
                bind(pattern, subject)
                return true
            }
        }else{
            // handle as a sequence
            pattern.sequence = pattern.group
            return $B.pattern_match(subject, pattern)
        }
    }

    if(pattern.or){
        // If one of the alternative matches, the 'or' pattern matches
        for(let item of pattern.or){
            if($B.pattern_match(subject, item)){
                bind(pattern, subject)
                return true
            }
        }
        return false
    }

    if(pattern.mapping){
        // First check that subject is an instance of a class that supports
        // mapping patterns
        let supported = false
        let Mapping
        if($B.imported['collections.abc']){
            Mapping = $B.imported['collections.abc'].Mapping
        }
        let klass = subject.__class__ || $B.get_class(subject)
        for(let base of [klass].concat(klass.tp_bases || [])){
            // $match_mapping_pattern is set for dict and mappingproxy
            if(base.$match_mapping_pattern || base === Mapping){
                supported = true
                break
            }
        }
        if((! supported) && Mapping){
            supported = _b_.issubclass(klass, Mapping)
        }

        if(! supported){
            return false
        }

        // value of pattern.mapping is a list of 2-element lists [key_pattern, value]
        let matched = [],
            keys = []
        for(let item of pattern.mapping){
            let key_pattern = item[0],
                value_pattern = item[1],
                key
            if(key_pattern.hasOwnProperty('literal')){
                key = key_pattern.literal
            }else if(key_pattern.hasOwnProperty('value')){
                key = key_pattern.value
            }
            // Check that key is not already used. Use __contains__ to handle
            // corner cases like {0: _, False: _}
            if(_b_.list.__contains__(keys, key)){
                $B.RAISE(_b_.ValueError, 'mapping pattern checks ' +
                    'duplicate key (' +
                    _b_.str.$factory(key) + ')')
            }
            keys.push(key)

            // create a dummy class to pass as default value for get()
            let missing = $B.make_class('missing',
                function(){
                    return {
                        __class__: missing
                    }
                }
            )

            try{
                let v = $B.$call($B.$getattr(subject, "get"))(key, missing)
                if(v === missing){
                    // pattern key not in subject : return false
                    return false
                }
                if(! $B.pattern_match(v, value_pattern)){
                    return false
                }
                matched.push(key)
            }catch(err){
                if($B.is_exc(err, [_b_.KeyError])){
                    return false
                }
                throw err
            }
        }
        if(pattern.rest){
            let rest = $B.empty_dict(),
                it = _b_.iter(subject),
                next_key
            while(true){
                try{
                    next_key = _b_.next(it)
                }catch(err){
                    if($B.is_exc(err, [_b_.StopIteration])){
                        locals[pattern.rest] = rest
                        return true
                    }
                    throw err
                }
                if(! _b_.list.__contains__(matched, next_key)){
                    _b_.dict.__setitem__(rest, next_key,
                        $B.$getitem(subject, next_key))
                }
            }
        }
        return true
    }

    if(pattern.class){
        let klass = pattern.class
        if(! $B.$isinstance(klass, _b_.type)){
            $B.RAISE(_b_.TypeError, 'called match pattern must be a type')
        }
        if(! $B.$isinstance(subject, klass)){
            return false
        }
        if(pattern.args.length > 0){
            if([_b_.bool, _b_.bytearray, _b_.bytes, _b_.dict,
                    _b_.float, _b_.frozenset, _b_.int, _b_.list, _b_.set,
                    _b_.str, _b_.tuple].indexOf(klass) > -1){
                // a single positional subpattern is accepted which will match
                // the entire subject
                if(pattern.args.length > 1){
                    $B.RAISE(_b_.TypeError, 'for builtin type ' +
                        $B.class_name(subject) + ', a single positional ' +
                        'subpattern is accepted')
                }
                return $B.pattern_match(subject, pattern.args[0])
            }else{
                // Conversion of positional arguments to keyword arguments
                // Get attribute __match_args__ of class
                let match_args = $B.$getattr(klass, '__match_args__',
                    $B.fast_tuple([]))
                if(! $B.$isinstance(match_args, _b_.tuple)){
                    $B.RAISE(_b_.TypeError, 
                        '__match_args__() did not return a tuple')
                }
                if(pattern.args.length > match_args.length){
                    $B.RAISE(_b_.TypeError, 
                        '__match_args__() returns ' + match_args.length +
                        ' names but ' + pattern.args.length + ' positional ' +
                        'arguments were passed')
                }
                for(let i = 0, len = pattern.args.length; i < len; i++){
                    // If Class.__match_args__ is ("a", "b"),
                    // Class(x, y) is converted to Class(a=x, b=y)
                    let pattern_arg = pattern.args[i],
                        klass_arg = match_args[i]
                    if(typeof klass_arg !== "string"){
                        $B.RAISE(_b_.TypeError, 'item in __match_args__ ' +
                            'is not a string: ' + klass_arg)
                    }
                    // Check duplicate pattern
                    if(pattern.keywords.hasOwnProperty(klass_arg)){
                        $B.RAISE(_b_.TypeError, '__match_arg__ item ' +
                            klass_arg + ' was passed as keyword pattern')
                    }
                    pattern.keywords[klass_arg] = pattern_arg
                }
            }
        }
        for(let key in pattern.keywords){
            let v = $B.$getattr(subject, key, null)
            if(v === null){
                return false
            }else if(! $B.pattern_match(v, pattern.keywords[key])){
                return false
            }
        }
        bind(pattern, subject)
        return true
    }

    if(pattern.capture){
        if(pattern.capture != '_'){
            // capture identifier in local namespace
            locals[pattern.capture] = subject
        }
        bind(pattern, subject)
        return true
    }else if(pattern.capture_starred){
        // bind name to a list, whatever the subject type
        locals[pattern.capture_starred] = $B.$list(subject)
        return true
    }else if(pattern.hasOwnProperty('literal')){
        let literal = pattern.literal
        if(literal === _b_.None || literal === _b_.True ||
                literal === _b_.False){
            // test identity (not equality) for these values
            return $B.$is(subject, literal)
        }

        if($B.rich_comp('__eq__', subject, literal)){
            bind(pattern, subject)
            return true
        }
        return false
    }else if(pattern.hasOwnProperty('value')){
        if($B.rich_comp('__eq__', subject, pattern.value)){
            bind(pattern, subject)
            return true
        }
    }else if(subject == pattern){
        return true
    }
    return false
}

})(__BRYTHON__);

