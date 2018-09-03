var $module = (function($B){

_b_ = $B.builtins

return  {
    __doc__: "_warnings provides basic warning filtering support.\n " +
        "It is a helper module to speed up interpreter start-up.",

    default_action: "default",

    filters: [
        ['ignore', _b_.None, _b_.DeprecationWarning, _b_.None, 0],
        ['ignore', _b_.None, _b_.PendingDeprecationWarning, _b_.None, 0],
        ['ignore', _b_.None, _b_.ImportWarning, _b_.None, 0],
        ['ignore', _b_.None, _b_.BytesWarning, _b_.None, 0]].map(
            function(x){return _b_.tuple.$factory(x)}),

    once_registry: _b_.dict.$factory(),

    warn: function(){},

    warn_explicit: function(){}

}

})(__BRYTHON__)
