var $module=(function($B){
    var _b_ = $B.builtins
    return {
        CHAR_MAX: 127,
        LC_ALL: 6,
        LC_COLLATE: 3,
        LC_CTYPE: 0,
        LC_MESSAGES: 5,
        LC_MONETARY: 4,
        LC_NUMERIC: 1,
        LC_TIME: 2,
        Error: _b_.ValueError,

        localeconv: function(){
            var conv = {'grouping': [127],
                    'currency_symbol': '',
                    'n_sign_posn': 127,
                    'p_cs_precedes': 127,
                    'n_cs_precedes': 127,
                    'mon_grouping': [],
                    'n_sep_by_space': 127,
                    'decimal_point': '.',
                    'negative_sign': '',
                    'positive_sign': '',
                    'p_sep_by_space': 127,
                    'int_curr_symbol': '',
                    'p_sign_posn': 127,
                    'thousands_sep': '',
                    'mon_thousands_sep': '',
                    'frac_digits': 127,
                    'mon_decimal_point': '',
                    'int_frac_digits': 127
             }
             var res = _b_.dict.$factory()
             res.$string_dict = conv
             return res
         },

        setlocale : function(){
            var $ = $B.args("setlocale", 2, {category: null, locale: null},
                ["category", "locale"], arguments, {locale: _b_.None},
                null, null)
            $B.locale = $.locale
        }
    }
})(__BRYTHON__)
