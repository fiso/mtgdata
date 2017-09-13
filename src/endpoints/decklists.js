const params = require('../params.js');

const createTableStatement = `
CREATE TABLE decklists (
id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
owner INT NOT NULL,
timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE
CURRENT_TIMESTAMP)`;

function fetchDecklist (connection, id) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM decklists WHERE id = ?', [id],
      function (error, results, fields) {
        if (error) {
          reject(error);
        } else {
          resolve(results[0]);
        }
    });
  });
}

function mount (connection, router) {
  router.route('/decklists')

    .get((req, res) => {
      connection.query('SELECT * FROM decklists',
        function (error, results, fields) {
          if (error) {
            res.status(500).send();
          } else {
            res.json(results);
          }
      });
    })

    .post((req, res) => {
      res.json({message: 'Not implemented'});
    })
  ;

  router.route('/decklists/:decklist_id')
    .get(async (req, res) => {
      try {
        res.json(await fetchDecklist(connection, req.params.decklist_id));
      } catch (e) {
        res.status(404).send();
      }
    })

    .put(async (req, res) => {
      try {
        const decklist = await fetchDecklist(connection,
          req.params.decklist_id);
        if (req.user.id !== decklist.owner) {
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
        const decklist = await fetchDecklist(connection,
          req.params.decklist_id);
        if (req.user.id !== decklist.owner) {
          res.status(422).json({errors:
            "You don't have access to modify this object"});
        } else {
          res.json({message: 'Not implemented'});
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
