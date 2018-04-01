const path = require('path');

module.exports = {
    workers: 1,
    port: 8021,
    htmlDir: path.join(think.ROOT_PATH, 'www/html'),
    token: '*'
};
