const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mtgdata',
});

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const port = process.env.PORT || 8080;

const router = express.Router();  // eslint-disable-line

router.use(function (req, res, next) {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

/* eslint-disable *//*

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
timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

*//* eslint-enable */

function requireParams (paramsObject, params) {
  const errors = [];

  params.forEach((param) => {
    if (typeof paramsObject[param] === 'undefined') {
      errors.push(`Missing ${param} parameter`);
    }
  });

  return errors;
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
    let errors =
      requireParams(req.body, ['archetype_a', 'archetype_b', 'winner']);

    if (['a', 'b'].indexOf(String(req.body.winner).toLowerCase()) === -1) {
      errors.push("Invalid winner. Must be 'a' or 'b'.");
    }

    const values = {
      archetype_a: req.body.archetype_a,
      archetype_b: req.body.archetype_b,
      winner: String(req.body.winner).toLowerCase(),
    };

    ['decklist_a', 'decklist_b', 'match_id', 'postboard', 'event_key',
    'location_key'].forEach((optionalParam) => {
      if (typeof req.body[optionalParam] !== 'undefined') {
        values[optionalParam] = req.body[optionalParam];
      }
    });

    if (typeof values.postboard !== 'undefined') {
      values.postboard = parseInt(values.postboard, 10);
      if (values.postboard !== 1) {
        values.postboard = 0;
      }
    }

    if (errors.length > 0) {
      res.status(422).json({errors});
      return;
    }

    let query = 'INSERT INTO duels (';
    let queryValues = 'VALUES (';

    let valueArray = [];
    Object.keys(values).forEach((key, index) => {
      query += `${index > 0 ? ', ' : ''}${key}`;
      queryValues += `${index > 0 ? ', ' : ''}?`;
      valueArray.push(values[key]);
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
