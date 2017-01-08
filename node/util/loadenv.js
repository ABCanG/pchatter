const path = require('path');
const readYaml = require('read-yaml');

const env = readYaml.sync(path.join(__dirname, '../../config/application.yml'));

for (const [key, val] of Object.entries(env)) {
  process.env[key] = process.env[key] || val;
}
