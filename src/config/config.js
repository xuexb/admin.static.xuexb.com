const path = require('path');
const pkg = require('../../package.json');

module.exports = Object.assign({}, {
    pkg
}, {
    workers: 1,
    port: 8021,
    htmlDir: path.join(think.ROOT_PATH, 'www/html')
});
