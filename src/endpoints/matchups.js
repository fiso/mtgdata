const params = require('../params.js');

/*

select * from duels where
(archetype_a=? and archetype_b=?) or
(archetype_b=? and archetype_a=?)

*/

function fetchMatchup (connection, archetypeA, archetypeB) {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM duels WHERE
      (archetype_a=? and archetype_b=?) or
      (archetype_b=? and archetype_a=?)`,
      [archetypeA, archetypeB, archetypeA, archetypeB],
      function (error, results, fields) {
        if (error) {
          reject(error);
        } else {
          if (results.length < 1) {
            reject();
          } else {
            resolve(results);
          }
        }
    });
  });
}

function mount (connection, router) {
  router.route('/matchups/:archetype_a/:archetype_b')
    .get(async (req, res) => {
      try {
        const duels = await fetchMatchup(connection, req.params.archetype_a,
          req.params.archetype_b);
        const aWins = duels.reduce((total, duel) => {
          return total + (duel.winner === req.params.archetype_a ? 1 : 0);
        }, 0);
        const result = {};
        result[req.params.archetype_a] = 100 * aWins / duels.length;
        result[req.params.archetype_b] = 100 - result[req.params.archetype_a];
        result.samplesize = duels.length;
        res.json(result);
      } catch (e) {
        res.status(404).send();
      }
    });
}

module.exports = {
  mount,
};
