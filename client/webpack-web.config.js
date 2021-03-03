const config = require('./webpack.config');

config.mode = 'production';
config.output.filename = 'app-web.js';
config.resolve.extensions.unshift('.web.ts', '.web.tsx');

module.exports = config;
