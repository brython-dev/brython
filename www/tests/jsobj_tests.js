test_jsobj = {
    null_value:null,
    undef_value:undefined,
    test_num:10
}

function test_none(attr) {
    return (test_jsobj[attr] === undefined);
}
