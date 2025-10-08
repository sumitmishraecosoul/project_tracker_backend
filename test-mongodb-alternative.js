const mongoose = require('mongoose');

// Test alternative MongoDB connection methods
async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB connection with different methods...\n');
  
  // Method 1: Standard connection
  console.log('Method 1: Standard connection...');
  try {
    await mongoose.connect('mongodb+srv://sumitmishrasm004:Ecosoul%40123@cluster0.jvgspc2.mongodb.net/asana_dev?retryWrites=true&w=majority&serverSelectionTimeoutMS=10000&connectTimeoutMS=10000&socketTimeoutMS=10000');
    console.log('✅ Standard connection successful!');
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ Standard connection failed:', error.message);
  }
  
  // Method 2: With retryWrites=false
  console.log('\nMethod 2: With retryWrites=false...');
  try {
    await mongoose.connect('mongodb+srv://sumitmishrasm004:Ecosoul%40123@cluster0.jvgspc2.mongodb.net/asana_dev?retryWrites=false&w=majority&serverSelectionTimeoutMS=10000&connectTimeoutMS=10000&socketTimeoutMS=10000');
    console.log('✅ retryWrites=false connection successful!');
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ retryWrites=false connection failed:', error.message);
  }
  
  // Method 3: Direct connection (without SRV)
  console.log('\nMethod 3: Direct connection...');
  try {
    await mongoose.connect('mongodb://sumitmishrasm004:Ecosoul%40123@cluster0-shard-00-00.jvgspc2.mongodb.net:27017,cluster0-shard-00-01.jvgspc2.mongodb.net:27017,cluster0-shard-00-02.jvgspc2.mongodb.net:27017/asana_dev?ssl=true&replicaSet=atlas-123456-shard-0&authSource=admin&retryWrites=true&w=majority');
    console.log('✅ Direct connection successful!');
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ Direct connection failed:', error.message);
  }
  
  console.log('\n🏁 Connection test completed.');
}

testMongoDBConnection();
