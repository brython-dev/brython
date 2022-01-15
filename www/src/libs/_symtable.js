var $module = (function($B){
    return {
        CELL: 5,
        DEF_ANNOT: 256,
        DEF_BOUND: 134,
        DEF_FREE: 32,
        DEF_FREE_CLASS: 64,
        DEF_GLOBAL: 1,
        DEF_IMPORT: 128,
        DEF_LOCAL: 2,
        DEF_NONLOCAL: 8,
        DEF_PARAM: 4,
        FREE: 4,
        GLOBAL_EXPLICIT: 2,
        GLOBAL_IMPLICIT: 3,
        LOCAL: 1,
        SCOPE_MASK: 15,
        SCOPE_OFF: 11,
        TYPE_CLASS: 1,
        TYPE_FUNCTION: 0,
        TYPE_MODULE: 2,
        USE: 16,
        symtable: $B._PySymtable_Build
    }
})(__BRYTHON__)