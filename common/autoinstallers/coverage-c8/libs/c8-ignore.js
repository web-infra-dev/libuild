const path = require('path');

/**
 * Patterns specified here will be ignored by c8
 */
const repoPatterns = ['vendors'];
const rawPatterns = ['node_modules'];
module.exports = [...repoPatterns.map((folder) => path.join(__dirname, '../../../../', folder)), rawPatterns];
