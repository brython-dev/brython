$B.pattern_match = function(subject, pattern){
    var _b_ = $B.builtins,
        frame = $B.last($B.frames_stack),
        locals = frame[1]

    function bind(pattern, subject){
        if(pattern.alias){
            locals[pattern.alias] = subject
        }
    }

    if(pattern === _b_.None || pattern === _b_.True || pattern === _b_.False){
        // test identity (not equality) for these values
        return subject === pattern
    }

    if(pattern.sequence){
        // iterate on subject and match each item in the sequence

        // First, check that the subject is an instance of a class that
        // supports sequence pattern matching
        var Sequence
        if($B.imported['collections.abc']){
            Sequence = $B.imported['collections.abc'].Sequence
        }
        var deque
        if($B.imported['collections']){
            deque = $B.imported['collections'].deque
        }
        var supported = false
        var klass = subject.__class__ || $B.get_class(subject)
        for(var base of [klass].concat(klass.__bases__ || [])){
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
        if(! supported && Sequence){
            // subclass of collections.abc.Sequence ?
            supported = _b_.issubclass(klass, Sequence)
        }
        if(! supported){
            return false
        }

        // Iterate on elements of subject and check that item i matches
        // pattern i
        var it = _b_.iter(subject),
            nxt = $B.$getattr(it, '__next__')
        for(var i = 0, len = pattern.sequence.length; i < len; i++){
            try{
                var subject_item = nxt()
            }catch(err){
                if($B.is_exc(err, [_b_.StopIteration])){
                    return false
                }
                throw err
            }
            if(pattern.sequence[i].capture_starred){
                if(i < len - 1){
                    // if starred identifier is not the last item, match fails
                    return false
                }
                // consume the rest of the subject
                var rest = [subject_item].concat(_b_.list.$factory(it))
                locals[pattern.sequence[i].capture_starred] = rest
                bind(pattern, subject)
                return true
            }else{
                var m = $B.pattern_match(subject_item, pattern.sequence[i])
                if(! m){
                    return false
                }
            }
        }
        // If there are still items in subject, match fails
        try{
            nxt()
            return false
        }catch(err){
            if($B.is_exc(err, [_b_.StopIteration])){
                bind(pattern, subject)
                return true
            }
            throw err
        }
        return true
    }

    if(pattern.or){
        // If one of the alternative matches, the 'or' pattern matches
        for(var item of pattern.or){
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
        var supported = false
        var Mapping
        if($B.imported['collections.abc']){
            Mapping = $B.imported['collections.abc'].Mapping
        }
        var klass = subject.__class__ || $B.get_class(subject)
        for(var base of [klass].concat(klass.__bases__ || [])){
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
        var matched = [],
            keys = []
        for(var item of pattern.mapping){
            var key_pattern = item[0],
                value_pattern = item[1]
            if(key_pattern.literal){
                var key = key_pattern.literal
            }else if(key_pattern.value){
                var key = key_pattern.value
            }
            if(_b_.list.__contains__(keys, key)){
                throw _b_.ValueError.$factory('mapping pattern checks ' +
                    'duplicate key (' +
                    _b_.str.$factory(key) + ')')
            }
            keys.push(key)
            try{
                var v = $B.$getitem(subject, key)
                if(! $B.pattern_match(v, value_pattern)){
                    return false
                }
                matched.push(key)
            }catch(err){
                if($B.is_exc(err, [_b_.KeyError])){
                    return false
                }
            }
        }
        if(pattern.rest){
            var rest = $B.empty_dict(),
                it = _b_.iter(subject)
            while(true){
                try{
                    var next_key = _b_.next(it)
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

    if(pattern.capture){
        if(pattern.capture != '_'){
            // capture identifier in local namespace
            locals[pattern.capture] = subject
            bind(pattern, subject)
        }
        return true
    }else if(pattern.capture_starred){
        locals[pattern.capture_starred] = subject
        return true
    }else if(pattern.literal){
        if(subject == pattern.literal){
            bind(pattern, subject)
            return true
        }
        return false
    }else if(subject == pattern){
        return true
    }
    return false
}