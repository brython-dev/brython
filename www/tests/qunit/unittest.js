
/*
 * Helper functions to integrate Python unittest test cases with QUnit
 */

;(function() {
  this.qunit_unittest_wrapper = function(test, result) {
    return function(assert) {
        test_call =  __BRYTHON__.builtins.getattr(test, '__call__')
        test_call(result);
        var msg = '';
        if (result.details !== __BRYTHON__.builtins.None) {
            msg = '[' + result.lastOutcome + '] - ' + result.details;
        }
        assert.ok(__BRYTHON__.builtins.getattr(result, 'wasSuccessful')(),
                  msg)
    }
  }

  if (this['define'] !== undefined && (typeof this.define['amd'] === 'object')) {
    // Running AMD loader
    define({
      qunit_unittest_wrapper : this.qunit_unittest_wrapper 
    })
  } 
})()


