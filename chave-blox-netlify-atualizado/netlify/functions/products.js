const { PRODUCTS } = require('./_shared');
exports.handler = async () => ({ statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }, body: JSON.stringify(PRODUCTS) });
