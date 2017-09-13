const request = require('request-promise');
const fs = require('fs');

const apiRoot = 'http://localhost:8080/api/';

const config = JSON.parse(fs.readFileSync('secret.json'));
const authHeaders = {
  'user-id': config.userid,
  'auth-token': config.token,
};

function get (endpoint, params) {
  return request({
    url: apiRoot + endpoint,
    headers: authHeaders,
  });
}

function post (endpoint, params) {
  return request({
    method: 'POST',
    url: apiRoot + endpoint,
    headers: authHeaders,
    body: params,
    json: true,
  });
}

const archetypes = [
  'burn',
  'affinity',
  'tron',
  'scapeshift',
  'ad nauseam',
  'storm',
  'soul sisters',
  'jund',
  'uw control',
  'death\'s shadow',
  'delver',
  'taking turns',
];

function randomElement (a) {
  return a[Math.floor(Math.random() * a.length)];
}

async function generateDuel (n) {
  const a = randomElement(archetypes);
  const b = randomElement(archetypes);
  const w = randomElement([a, b]);
  const body = await post('duels', {
    archetype_a: a,
    archetype_b: b,
    winner: w,
    format: 'modern',
  });
}

for (let i = 0; i < 500; i++) {
  generateDuel();
}
