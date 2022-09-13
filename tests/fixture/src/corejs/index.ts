const Set = require('core-js/library/fn/set');
function* test() {}
class A {}
console.log('test:', test(), A, globalThis, new Set());
