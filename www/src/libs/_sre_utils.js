var $module=(function($B){

    function unicode_iscased(cp){
        // cp : Unicode code point
        var letter = String.fromCodePoint(cp)
        return (letter != letter.toLowerCase() ||
            letter != letter.toUpperCase())
    }

    function ascii_iscased(cp){
        if(cp > 255){return false}
        return unicode_iscased(cp)
    }

    function unicode_tolower(cp){
        var letter = String.fromCodePoint(cp),
            lower = letter.toLowerCase()
        return lower.charCodeAt(0)
    }

    function ascii_tolower(cp){
        return unicode_tolower(cp)
    }

return {
    unicode_iscased: unicode_iscased,
    ascii_iscased: ascii_iscased,
    unicode_tolower: unicode_tolower,
    ascii_tolower: ascii_tolower
}

}

)(__BRYTHON__)