const mysql = require('mysql');
const crypto = require('crypto');
const params = require('./params.js');

const createTableStatement = `
CREATE TABLE api_users (
id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(255) NOT NULL,
secret_hash VARCHAR(255) NOT NULL,
enabled BOOL DEFAULT 1
)`;

const SALT = 'f0748acc6fbe73f4bbf46d2d25b926d718e7a594f10865145edf36b23578338876f90624a3ea7736c8affd554e925eead9e89949ba1e90b10103e43c3996a6cb';  // eslint-disable-line

function hash (data) {
  const hasher = crypto.createHash('RSA-SHA256');
  hasher.update(data + SALT);
  return hasher.digest('hex');
}

function verify (connection, name, token) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM api_users WHERE name = ?', [name],
      function (error, results, fields) {
        if (error) {
          throw error;
        }

        const user = results[0];
        if (!user) {
          reject(Error('invalid credentials'));
        } else if (!user.enabled) {
          reject(Error('user disabled'));
        } else if (hash(token) === user.secret_hash) {
          resolve(user);
        } else {
          reject(Error('invalid credentials'));
        }
    });
  });
}

function create (connection, name) {
  return new Promise((resolve, reject) => {
    const token = crypto.randomBytes(64).toString('hex');

    const query = 'INSERT INTO api_users (name, secret_hash) VALUES (?, ?)';
    connection.query(query, [name, hash(token)],
      function (error, results, fields) {
        if (error) {
          throw error;
        }

        // console.log(`Created user ${name} with secret ${token}`);
        results.mtgdata = {token};
        resolve(results);
    });
  });
}

function middleware (options) {
  const connection = options.connection;

  return async function middleware (req, res, next) {
    if (req.originalUrl.indexOf('/api') !== 0) {
      next();
      return;
    }

    const whitelist = [
      '/api/matchups/',
    ];
    if (whitelist.find((entry) => req.originalUrl.indexOf(entry) === 0)) {
      next();
      return;
    }

    let paramResult = params.collectParams(req.headers, [
      {name: 'user-id', required: true, errorMessage:
        'Missing required header user-id'},
      {name: 'auth-token', required: true, errorMessage:
        'Missing required header auth-token'},
    ]);

    if (paramResult.errors.length > 0) {
      res.status(422).json({errors: paramResult.errors});
      return;
    }

    try {
      const user = await verify(connection, paramResult.params['user-id'],
        paramResult.params['auth-token']);
      req.user = user;
      next();
    } catch (e) {
      console.log(e);
      res.status(403).json({error: 'Not authenticated'});
    }
  };
}

module.exports = {
  createTableStatement,
  create,
  verify,
  middleware,
};
