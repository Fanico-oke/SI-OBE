// Vercel serverless entry point - imports compiled backend
const app = require('../backend/dist/index.js');
module.exports = app.default || app;
