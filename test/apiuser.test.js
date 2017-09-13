const mysql = require('mysql');
const assert = require('assert');
const apiuser = require('../src/apiuser');
const crypto = require('crypto');

describe('apiuser', function () {
  describe('#create()', function () {
    it('should create a new user',
    async function () {
      const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'mtgdata_test_db',
      });

      const result = await apiuser.create(connection,
        `testuser-${crypto.randomBytes(8).toString('hex')}`);

      assert.equal(1, result.affectedRows);
      assert.equal(0, result.warningCount);
      assert.notEqual(0, result.insertId);
    });
  });

  describe('#verify()', function () {
  });

  describe('#expressVerify()', function () {
  });
});
