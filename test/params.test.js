const assert = require('assert');
const params = require('../src/params');

describe('params', function () {
  describe('#collectParams', function () {
    it('should return errors when required parameters are missing',
    function () {
      const result = params.collectParams({
      }, [
        {name: 'test1', required: true},
        {name: 'test2', required: true},
      ]);

      assert.equal(2, result.errors.length);
    });

    it('should return no errors when no parameters are required',
    function () {
      const result = params.collectParams({
      }, [
        {name: 'test1'},
        {name: 'test2'},
      ]);

      assert.equal(0, result.errors.length);
    });

    it('should use custom error messages when asked',
    function () {
      const customMessage = "I'm a teapot";
      const result = params.collectParams({
      }, [
        {name: 'test1', required: true, errorMessage: customMessage},
        {name: 'test2', required: true},
      ]);

      assert.equal(2, result.errors.length);
      assert.equal(result.errors[0], customMessage);
    });
  });
});
