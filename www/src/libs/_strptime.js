var _b_ = __BRYTHON__.builtins

var $module = (function($B){
    return {
        _strptime_datetime: function(cls, s, fmt){
            var pos_s = 0,
                pos_fmt = 0,
                dt = {}
            function error(){
                throw Error("no match " + pos_s + " " + s.charAt(pos_s) + " "+
                    pos_fmt + " " + fmt.charAt(pos_fmt))
            }

            var locale = __BRYTHON__.locale,
                shortdays = [],
                longdays = [],
                conv_func = locale == "C" ?
                    function(d){return d.toDateString()} :
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
                var d = new Date(Date.UTC(2012, month, 1, 3, 0, 0))
                shortmonths.push(conv_func(d, {month: 'short'}))
                longmonths.push(conv_func(d, {month: 'long'}))
            }

            var shortdays_re = new RegExp(shortdays.join("|").replace(".", "\\.")),
                longdays_re = new RegExp(longdays.join("|")),
                shortmonths_re = new RegExp(shortmonths.join("|").replace(".", "\\.")),
                longmonths_re = new RegExp(longmonths.join("|"))

            var regexps = {
                d: ["day", new RegExp("0[1-9]|[123][0-9]")],
                H: ["hour", new RegExp("[01][0-9]|2[0-3]|\\d")],
                I: ["hour", new RegExp("0[0-9]|1[0-2]")],
                m: ["month", new RegExp("0[1-9]|1[012]")],
                M: ["minute", new RegExp("[0-5][0-9]")],
                S: ["second", new RegExp("([1-5]\\d)|(0?\\d)")],
                y: ["year", new RegExp("0{0,2}\\d{2}")],
                Y: ["year", new RegExp("\\d{4}")]
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
                            error()
                        }else{
                            if(dt[attr] !== undefined){
                                throw Error(attr + " is defined more than once")
                            }else{
                                dt[attr] = parseInt(res[0])
                                pos_fmt += 2
                                pos_s += res[0].length
                            }
                        }
                    }else if(spec == "a" || spec == "A"){
                        // Locale's abbreviated (a) or full (A) weekday name
                        var attr = "weekday",
                            re = spec == "a" ? shortdays_re : longdays_re,
                            t = spec == "a" ? shortdays : longdays
                            res = re.exec(s.substr(pos_s))
                        if(res === null){
                            error()
                        }else{
                            var match = res[0],
                                ix = t.indexOf(match)
                        }
                        if(dt.weekday !== undefined){
                            throw Error(attr + " is defined more than once")
                        }else{
                            dt.weekday = ix
                        }
                        pos_fmt += 2
                        pos_s += match.length
                    }else if(spec == "b" || spec == "B"){
                        // Locales's abbreviated (b) or full (B) month
                        var attr = "month",
                            re = spec == "b" ? shortmonths_re : longmonths_re,
                            t = spec == "b" ? shortmonths : longmonths,
                            res = re.exec(s.substr(pos_s))
                        if(res === null){
                            error()
                        }else{
                            var match = res[0],
                                ix = t.indexOf(match)
                        }
                        if(dt.month !== undefined){
                            throw Error(attr + " is defined more than once")
                        }else{
                            dt.month = ix + 1
                        }
                        pos_fmt += 2
                        pos_s += match.length
                    }else if(spec == "c"){
                        // Locale's appropriate date and time representation
                        var fmt1 = fmt.substr(0, pos_fmt - 1) + _locale_c_format() +
                            fmt.substr(pos_fmt + 2)
                        console.log("fmt1", fmt1)
                        fmt = fmt1
                    }else if(spec == "%"){
                        if(s.charAt(pos_s) == "%"){
                            pos_fmt++
                            pos_s++
                        }else{
                            error()
                        }
                    }else{
                        pos_fmt++
                    }
                }else{
                    if(car == s.charAt(pos_s)){
                        pos_fmt++
                        pos_s++
                    }else{
                        error()
                    }
                }
            }
            return $B.$call(cls)(dt.year, dt.month, dt.day,
                dt.hour || 0, dt.minute || 0, dt.second || 0)
        }
    }
})(__BRYTHON__)
