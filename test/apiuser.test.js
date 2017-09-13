const mysql = require('mysql');
const assert = require('assert');
const apiuser = require('../src/apiuser');
const crypto = require('crypto');

describe('apiuser', function () {
  let username = '';
  let token = '';
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mtgdata_test_db',
  });

  describe('#create()', function () {
    it('should create a new user',
    async function () {
      username = `testuser-${crypto.randomBytes(8).toString('hex')}`;
      const result = await apiuser.create(connection, username);

      assert.equal(1, result.affectedRows);
      assert.equal(0, result.warningCount);
      assert(result.mtgdata);
      assert(result.mtgdata.token);
      assert.notEqual(0, result.insertId);

      token = result.mtgdata.token;
    });
  });

  describe('#verify()', function () {
    it('should be able to verify the new user',
    async function () {
      assert.doesNotThrow(async function () {
        const result = await apiuser.verify(connection, username, token);
      });
    });

    it('should reject invalid credentials',
    async function () {
      try {
        const result = await apiuser.verify(connection, username + 'invalid',
          token);
      } catch (e) {
        assert.equal('invalid credentials', e.message);
      }
    });
  });
});
