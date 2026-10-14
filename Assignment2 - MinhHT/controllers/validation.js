// Shared request validation used by the three controllers.
const mongoose = require('mongoose');
function fail(status, message) { const error = new Error(message); error.status = status; throw error; }
function validId(id) { if (!mongoose.isObjectIdOrHexString(id)) fail(400, 'Invalid ObjectId'); }
function bodyFields(body, allowed) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail(400, 'A JSON object is required');
  for (const key of Object.keys(body)) if (!allowed.includes(key)) fail(400, 'Unknown or read-only field: ' + key);
  return body;
}
module.exports = { fail, validId, bodyFields };
