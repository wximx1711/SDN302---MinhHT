require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
async function connectDB() {
  await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 });
  const models = [require('../models/Book'), require('../models/Member'), require('../models/Loan')];
  for (const model of models) await model.init();
  return mongoose.connection;
}
module.exports = connectDB;
