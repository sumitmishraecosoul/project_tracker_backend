const mongoose = require('mongoose');

// Test MongoDB connection
async function testMongoDBConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
    
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://sumitmishrasm004:Ecosoul%40123@cluster0.jvgspc2.mongodb.net/asana_dev?retryWrites=true&w=majority';
    
    console.log('Using URI:', mongoUri.substring(0, 50) + '...');
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('Connection state:', mongoose.connection.readyState);
    
    // Test a simple query
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log('✅ Database query successful! User count:', userCount);
    
    await mongoose.disconnect();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Error details:', error);
  }
}

testMongoDBConnection();