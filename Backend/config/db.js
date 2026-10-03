const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('---------------------------------------------------------');
      console.error('FATAL ERROR: MONGO_URI environment variable is not defined.');
      console.error('Please configure MONGO_URI in your environment or hosting dashboard.');
      console.error('Example: mongodb+srv://<username>:<password>@cluster0.mongodb.net/hostelpro?retryWrites=true&w=majority');
      console.error('---------------------------------------------------------');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
