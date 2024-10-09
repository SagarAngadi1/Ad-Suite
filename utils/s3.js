// utils/s3.js

import AWS from 'aws-sdk';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Store in environment variables
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, // e.g. 'us-east-1'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME; // Your S3 Bucket name

// Function to upload file to S3
const uploadFile = (fileBuffer, fileName) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,            //The actual file data (content).
    ContentType: 'image/jpeg', // Change this according to the uploaded file type
    //ACL: 'public-read', // Make the file publicly accessible //// This line should be removed or commented out because in our seetings we have set it do disable
  };

  return s3.upload(params).promise(); // Returns a promise
};

export { uploadFile };
