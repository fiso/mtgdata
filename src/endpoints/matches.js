const params = require('../params.js');

const createTableStatement = `
CREATE TABLE matches (
id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
duel_ids JSON NOT NULL,
owner INT NOT NULL,
timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`;

function fetchMatch (connection, id) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM matches WHERE id = ?', [id],
      function (error, results, fields) {
        if (error) {
          reject(error);
        } else {
          if (results.length < 1) {
            reject();
          } else {
            resolve(results[0]);
          }
        }
    });
  });
}

function mount (connection, router) {
  router.route('/matches')

    .get((req, res) => {
      connection.query('SELECT * FROM matches',
        function (error, results, fields) {
          if (error) {
            res.status(500).send();
          } else {
            res.json(results);
          }
      });
    })

    .post((req, res) => {
      let paramResult = params.collectParams(req.body, [
        {name: 'duel_ids', required: true},
      ]);

      if (paramResult.errors.length > 0) {
        res.status(422).json({errors: paramResult.errors});
        return;
      }

      paramResult.params.owner = req.user.id;

      let query = 'INSERT INTO matches (';
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
            res.status(500).send(error.code);
          } else {
            res.json({message: 'OK'});
          }
      });
    })
  ;

  router.route('/matches/:match_id')
    .get(async (req, res) => {
      try {
        res.json(await fetchMatch(connection, req.params.match_id));
      } catch (e) {
        res.status(404).send();
      }
    })

    .put(async (req, res) => {
      try {
        const match = await fetchMatch(connection, req.params.match_id);
        if (req.user.id !== match.owner) {
          res.status(422).json({errors:
            "You don't have access to modify this object"});
        } else {
          res.json({message: 'Not implemented'});
        }
      } catch (e) {
        res.status(404).send();
      }
    })

    .delete(async (req, res) => {
      try {
        const match = await fetchMatch(connection, req.params.match_id);
        if (req.user.id !== match.owner) {
          res.status(422).json({errors:
            "You don't have access to modify this object"});
        } else {
          connection.query('DELETE FROM matches WHERE id=?',
            req.params.match_id,
            function (error, results, fields) {
              if (error) {
                res.status(500).send(error.code);
              } else {
                res.json({message: 'OK'});
              }
          });
        }
      } catch (e) {
        res.status(404).send();
      }
    })
  ;
}

module.exports = {
  createTableStatement,
  mount,
};
