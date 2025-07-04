
(function($B){
    var _b_ = __BRYTHON__.builtins
    $B.imported._strptime = {
        _strptime_datetime: function(cls, s, fmt){
            var pos_s = 0,
                pos_fmt = 0,
                dt = {}
            function error(time_data, format){
                throw _b_.ValueError.$factory(
                    `time data '${time_data}' does not match format '${format}'`)
            }

            if(! $B.$isinstance(s, _b_.str)){
                throw _b_.TypeError.$factory(
                    `strptime() argument 1 must be str, not ${$B.class_name(s)}`)
            }

            var locale = __BRYTHON__.locale,
                shortdays = [],
                longdays = [],
                conv_func = locale == "C" ?
                    function(d, options){
                        return d.toLocaleDateString('en-EN', options)
                    } :
                    function(d, options){
                        return d.toLocaleDateString(locale, options)
                    }

            for(var day = 16; day < 23; day++){
                var d = new Date(Date.UTC(2012, 11, day, 3, 0, 0))
                shortdays.push(conv_func(d, {weekday: 'short'}))
                longdays.push(conv_func(d, {weekday: 'long'}))
            }

            var shortmonths = [],
                longmonths = []

            for(var month = 0; month < 12; month++){
                var d = new Date(Date.UTC(2012, month, 11, 3, 0, 0))
                shortmonths.push(conv_func(d, {month: 'short'}))
                longmonths.push(conv_func(d, {month: 'long'}))
            }

            var shortdays_re = new RegExp(shortdays.join("|").replace(".", "\\.")),
                longdays_re = new RegExp(longdays.join("|")),
                shortmonths_re = new RegExp(shortmonths.join("|").replace(".", "\\.")),
                longmonths_re = new RegExp(longmonths.join("|"))

            var regexps = {
                d: ["day", new RegExp("^[123][0-9]|0?[1-9]")],
                f: ["microsecond", new RegExp("^\\d{1,6}")],
                H: ["hour", new RegExp("^[01][0-9]|2[0-3]|\\d")],
                I: ["hour", new RegExp("^1[0-2]|0?[0-9]")],
                m: ["month", new RegExp("^1[012]|0?[1-9]")],
                M: ["minute", new RegExp("^[1-5][0-9]|0?[0-9]")],
                S: ["second", new RegExp("^[1-5]\\d|0?\\d")],
                y: ["year", new RegExp("^0{0,2}\\d{2}")],
                Y: ["year", new RegExp("^\\d{4}")],
                z: ["tzinfo", new RegExp("^Z|([+-]\\d{2}[0-5]\\d)([0-5]\\d(\.\\d{1,6})?)?")],
                Z: ["timezone", new RegExp("UTC|GMT")]
            }

            for(var key in regexps){
                var re = new RegExp('%' + key, "g"),
                    mo = fmt.match(re)
                if(mo && mo.length > 1){
                    throw _b_.ValueError.$factory('strptime directive %' +
                        key + ' defined more than once')
                }
            }

            while(pos_fmt < fmt.length){
                var car = fmt.charAt(pos_fmt)
                if(car == "%"){
                    var spec = fmt.charAt(pos_fmt + 1),
                        regexp = regexps[spec]
                    if(regexp !== undefined){
                        var re = regexp[1],
                            attr = regexp[0],
                            res = re.exec(s.substr(pos_s))
                        if(res === null){
                            error(s, fmt)
                        }else{
                            dt[attr] = parseInt(res[0])
                            if(attr == "microsecond"){
                                var ms = res[0]
                                ms += '0'.repeat(6 - ms.length)
                                dt[attr] = parseInt(ms)
                            }else if(attr == "timezone"){
                                var dt_module = $B.imported[cls.__module__]
                                dt.tzinfo = dt_module.timezone[res[0].toLowerCase()]
                            }else if(attr == "tzinfo"){
                                var seconds = 0,
                                    microseconds = 0

                                if(res[0] != 'Z'){
                                    let HHMM = res[1]
                                    let sign = HHMM[0] == '+' ? 1 : -1
                                    let hh = parseInt(HHMM.substr(1, 2))
                                    let mm = parseInt(HHMM.substr(3))
                                    seconds = 3600 * hh + 60 * mm
                                    if(res[2]){
                                        seconds += parseInt(res[2])
                                    }
                                    seconds = sign * seconds
                                    if(res[3]){
                                        let ms = res[3].substr(1)
                                        ms += '0'.repeat(6 - ms.length)
                                        microseconds = sign * parseInt(ms)
                                    }
                                }
                                var dt_module = $B.imported[cls.__module__]
                                let timedelta = dt_module.timedelta.$factory(0,
                                    seconds, microseconds)
                                let days = $B.$getattr(timedelta, 'days')
                                if(Math.abs(days) > 1){
                                    throw _b_.ValueError.$factory("offset " +
                                        "must be a timedelta strictly between" +
                                        " -timedelta(hours=24) and timedelta" +
                                        "(hours=24), not " +
                                        _b_.repr(timedelta))
                                }
                                let tz = dt_module.timezone
                                dt.tzinfo = tz.__new__(tz, timedelta)
                            }
                            pos_fmt += 2
                            pos_s += res[0].length
                        }
                    }else if(spec == "a" || spec == "A"){
                        // Locale's abbreviated (a) or full (A) weekday name
                        var attr = "weekday",
                            re = spec == "a" ? shortdays_re : longdays_re,
                            t = spec == "a" ? shortdays : longdays
                            res = re.exec(s.substr(pos_s))
                        if(res === null){
                            console.log('error', re, 'string', s.substr(pos_s), 'fmt', fmt)
                            error(s, fmt)
                        }else{
                            var match = res[0],
                                ix = t.indexOf(match)
                        }
                        dt.weekday = ix
                        pos_fmt += 2
                        pos_s += match.length
                    }else if(spec == "b" || spec == "B"){
                        // Locales's abbreviated (b) or full (B) month
                        var attr = "month",
                            re = spec == "b" ? shortmonths_re : longmonths_re,
                            t = spec == "b" ? shortmonths : longmonths,
                            res = re.exec(s.substr(pos_s))
                        if(res === null){
                            error(s, fmt)
                        }else{
                            var match = res[0],
                                ix = t.indexOf(match)
                        }
                        dt.month = ix + 1
                        pos_fmt += 2
                        pos_s += match.length
                    }else if(spec == "c"){
                        // Locale's appropriate date and time representation
                        var fmt1 = fmt.substr(0, pos_fmt - 1) + _locale_c_format() +
                            fmt.substr(pos_fmt + 2)
                        fmt = fmt1
                    }else if(spec == "%"){
                        if(s.charAt(pos_s) == "%"){
                            pos_fmt++
                            pos_s++
                        }else{
                            error(s, fmt)
                        }
                    }else if(spec == 'p'){
                        // AM or PM
                        var next2 = s.substr(pos_s, 2)
                        if(next2.toUpperCase() == 'AM'){
                            if(dt.hasOwnProperty('hour')){
                                if(dt.hour > 0 && dt.hour < 12){
                                    // ok
                                }else if(dt.hour == 12){
                                    dt.hour = 0
                                }else{
                                    error(s, fmt)
                                }
                            }else{
                                error(s, fmt)
                            }
                        }else if(next2.toUpperCase() == 'PM'){
                            if(dt.hasOwnProperty('hour')){
                                if(dt.hour > 0 && dt.hour < 12){
                                    dt.hour += 12
                                }else if(dt.hour == 12){
                                    dt.hour = 12
                                }else{
                                    error(s, fmt)
                                }
                            }else{
                                error(s, fmt)
                            }
                        }else{
                            error(s, fmt)
                        }
                        pos_fmt += 2
                        pos_s += 2
                    }else{
                        pos_fmt++
                    }
                }else{
                    if(car == s.charAt(pos_s)){
                        pos_fmt++
                        pos_s++
                    }else{
                        error(s, fmt)
                    }
                }
            }

            if(pos_s < s.length){
                throw _b_.ValueError.$factory('unconverted data remains: ' +
                    s.substr(pos_s))
            }

            return $B.$call(cls)(dt.year ?? 1900, dt.month ?? 1,
                dt.day ?? 1,
                dt.hour || 0, dt.minute || 0, dt.second || 0,
                dt.microsecond || 0, dt.tzinfo || _b_.None)
        }
    }
})(__BRYTHON__)
