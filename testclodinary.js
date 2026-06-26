require('dotenv').config();
const cloudinary = require('./config/cloudinary');

async function testCloudinary() {
  try {
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connected:', result);
  } catch (error) {
    console.error('Cloudinary failed:', error);
  }
}

testCloudinary();