const createTableStatement = `
CREATE TABLE duels (
id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
archetype_a VARCHAR(255) NOT NULL,
archetype_b VARCHAR(255) NOT NULL,
last_released_set VARCHAR(255) NOT NULL,
winner CHAR(1) NOT NULL,
decklist_a INT,
decklist_b INT,
mulligans_a INT,
mulligans_b INT,
ontheplay CHAR(1),
match_id INT,
postboard BOOL,
event_key VARCHAR(255),
location_key VARCHAR(255),
owner INT NOT NULL,
timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE
CURRENT_TIMESTAMP)`;

function fetchDuel (connection, id) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM duels WHERE id = ?', [id],
      function (error, results, fields) {
        if (error) {
          throw error;
        }

        console.log(results[0]);
        resolve(results[0]);
    });
  });
}

function mount (connection, router) {
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
      let paramResult = params.collectParams(req.body, [
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
    .get(async (req, res) => {
      res.json(await fetchDuel(connection, req.params.duel_id));
    })

    .put((req, res) => {
      res.json({message: 'Not implemented'});
    })

    .delete((req, res) => {
      res.json({message: 'Not implemented'});
    })
  ;
}

module.exports = {
  createTableStatement,
  mount,
};
