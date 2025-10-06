const mongoose = require('mongoose');

// Test MongoDB connection
async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB Connection...\n');
    
    // Test with the current URI
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sumitmishrasm004:Ecosoul%40123@cluster0.jvgspc2.mongodb.net/asana_dev?retryWrites=true&w=majority';
    
    console.log('📡 Connection URI:', mongoUri.replace(/\/\/.*@/, '//***:***@'));
    
    // Set connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
    };
    
    console.log('⏳ Attempting to connect...');
    
    await mongoose.connect(mongoUri, options);
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database name:', mongoose.connection.db.databaseName);
    console.log('🔗 Connection state:', mongoose.connection.readyState);
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections found:', collections.length);
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'ESERVFAIL') {
      console.log('\n🔧 DNS Resolution Issue Detected:');
      console.log('1. Check your internet connection');
      console.log('2. Try using a different DNS server (8.8.8.8, 1.1.1.1)');
      console.log('3. Check if your firewall is blocking the connection');
      console.log('4. Try connecting from a different network');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 Network Issue Detected:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the MongoDB Atlas cluster is running');
      console.log('3. Check if your IP is whitelisted in MongoDB Atlas');
    }
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication Issue Detected:');
      console.log('1. Check your username and password');
      console.log('2. Verify the database user has proper permissions');
      console.log('3. Check if the user is active in MongoDB Atlas');
    }
    
    process.exit(1);
  }
}

testConnection();
