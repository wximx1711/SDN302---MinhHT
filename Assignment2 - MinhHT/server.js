const connectDB = require('./config/db');
const app = require('./app');
const mongoose = require('mongoose');

connectDB().then(() => {
  console.log('Connected to MongoDB: ' + mongoose.connection.name);
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => console.log('Library API: http://localhost:' + port));
  server.on('error', async error => {
    console.error(error.code === 'EADDRINUSE' ? 'Port ' + port + ' is in use. Stop the previous API or change PORT in .env.' : error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}).catch(error => { console.error(error.message); process.exitCode = 1; });
