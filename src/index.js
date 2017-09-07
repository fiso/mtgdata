const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const apiuser = require('./apiuser.js');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mtgdata',
});

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  let paramResult = collectParams(req.headers, [
    {name: 'user-id', required: true},
    {name: 'auth-token', required: true},
  ]);

  if (paramResult.errors.length > 0) {
    res.status(422).json({errors: paramResult.errors});
    return;
  }

  apiuser.verify(connection, paramResult.params['user-id'],
    paramResult.params['auth-token'])
  .then((user) => {
    req.user = user;
    next();
  })
  .catch(() => {
    res.status(403).json({error: 'Not authenticated'});
  });
});

const port = process.env.PORT || 8080;

const router = express.Router();  // eslint-disable-line

router.use(function (req, res, next) {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

/* eslint-disable *//*

jace: c421d8067b8e7343edd6d6000f93689ceb727426010ae52ea9b9212fcd70b63e8ce85398e9fcbfd31184f42198dbce98b20c1befcda47f3b0651261b531531f8

DUELS

id, archetype_a, decklist_a, archetype_b, decklist_b, winner, match_id, postboard, event_id, location_id, timestamp

CREATE TABLE duels (
id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
archetype_a VARCHAR(255) NOT NULL,
decklist_a INT,
archetype_b VARCHAR(255) NOT NULL,
decklist_b INT,
winner CHAR(1) NOT NULL,
match_id INT,
postboard BOOL,
event_key VARCHAR(255),
location_key VARCHAR(255),
owner INT NOT NULL,
timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

*//* eslint-enable */

function collectParams (request, params) {
  const errors = [];
  const collectedParams = {};

  params.forEach((param) => {
    if (param.required) {
      if (typeof request[param.name] === 'undefined') {
        errors.push(`Missing required parameter ${param.name}`);
      }
    }

    if (typeof request[param.name] !== 'undefined') {
      let accepted = true;
      if (typeof param.validator === 'function') {
        const validationError = param.validator(request[param.name]);
        if (validationError) {
          errors.push(validationError);
          accepted = false;
        }
      }
      if (accepted) {
        collectedParams[param.name] = request[param.name];
      }
    }
  });

  return {errors, params: collectedParams};
}

router.route('/duels')

  .get((req, res) => {
    connection.query('SELECT * FROM duels',
      function (error, results, fields) {
        if (error) {
          throw error;
        }

        res.json(results);
    });
  })

  .post((req, res) => {
    let paramResult = collectParams(req.body, [
      {name: 'archetype_a', required: true},
      {name: 'archetype_b', required: true},
      {name: 'winner', required: true, validator: (value) => {
        if (['a', 'b'].indexOf(String(value)) === -1) {
          return "Invalid winner. Must be 'a' or 'b'.";
        }

        return '';
      }},
      {name: 'decklist_a'},
      {name: 'decklist_b'},
      {name: 'match_id'},
      {name: 'postboard', validator: (value) => {
        if (['0', '1'].indexOf(String(value)) === -1) {
          return "Invalid value for 'postboard'. Must be '0' or '1'.";
        }

        return '';
      }},
      {name: 'event_key'},
      {name: 'location_key'},
    ]);

    if (paramResult.errors.length > 0) {
      res.status(422).json({errors: paramResult.errors});
      return;
    }

    paramResult.params.owner = req.user.id;

    let query = 'INSERT INTO duels (';
    let queryValues = 'VALUES (';

    let valueArray = [];
    Object.keys(paramResult.params).forEach((key, index) => {
      query += `${index > 0 ? ', ' : ''}${key}`;
      queryValues += `${index > 0 ? ', ' : ''}?`;
      valueArray.push(paramResult.params[key]);
    });

    query = `${query}) ${queryValues})`;
    connection.query(query, valueArray,
      function (error, results, fields) {
        if (error) {
          throw error;
        }

        res.json({message: 'OK'});
    });
  })
;

router.route('/duels/:duel_id')
  .get((req, res) => {
    connection.query('SELECT * FROM duels WHERE id = ?', [req.params.duel_id],
      function (error, results, fields) {
        if (error) {
          throw error;
        }

        res.json(results[0]);
    });
  })
  .put((req, res) => {
    res.json({message: 'Not implemented'});
  })
  .delete((req, res) => {
    res.json({message: 'Not implemented'});
  })
;

app.use('/api', router);

app.listen(port);
console.log('Listening on port ' + port);
