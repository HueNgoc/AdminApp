const mongoose = require('mongoose');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is missing. Add your MongoDB Atlas connection string to backend/.env.');
  }

  await mongoose.connect(uri, { dbName: 'adminpage' });
  console.log(`Connected to MongoDB database: ${mongoose.connection.name}.`);
}

module.exports = connectDatabase;
