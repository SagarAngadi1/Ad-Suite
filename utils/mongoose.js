// C:\Users\User\VisualStudioProjects\AdVideo\advideo_nextjs\utils\mongoose.js
//This utility manages the connection to the MongoDB database, using a cached connection to improve performance.
const mongoose = require('mongoose'); //this line imports mongoose

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let cached = global.mongoose;    //This line assigns the value of 'global.mongoose' to the variable 'cached'. Declares a block-scoped local variable named 'cached', 'global' is an object that holds global variables

if (!cached) {                   //This condition checks whether cached is undefined or not. If it is undefined, it means the mongoose object is not yet initialized and goes to the next line
  cached = global.mongoose = { conn: null, promise: null };       //This line initializes 'global.mongoose' with an object containing 'conn' and 'promise', both set to 'null'. It also assigns this same object to 'cached'.
}

async function connectToDatabase() {  // Declares an asynchronous function named connectToDatabase. This function will handle connecting to the MongoDB database. Asynchronous, meaning it can use await within its body to wait for asynchronous operations.
  if (cached.conn) {                  //Checks if 'cached.conn' is already set (i.e., if a connection to the database already exists).
    return cached.conn;               // If a connection exists, return it immediately. This avoids creating a new connection if one is already available
  }

  if (!cached.promise) {               //Checks if cached.promise is not set (i.e., if a promise to connect to the database has not been created yet).
    const opts = {                     //Declares a constant variable 'opts' which holds options for the Mongoose connection.
      bufferCommands: false,            // An option for Mongoose that disables buffering of commands while the connection is being established. This can prevent issues if commands are issued before the connection is ready.
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
   
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => { //Initiates a connection to the MongoDB database using the connection string stored in 'MONGODB_URI' and the options defined in 'opts'.
      return mongoose;            //Returns a promise that resolves with the mongoose object once the connection is successfully established.
    });
  }

  cached.conn = await cached.promise;  //Waits for the promise stored in cached.promise to resolve. The resolved value is the mongoose object representing the active database connection. Assigns the resolved value (the connection object) to cached.conn, caching the connection.
  return cached.conn;              //Returns the active database connection, whether it was newly created or retrieved from the cache
}

module.exports = connectToDatabase;   // Exports the connectToDatabase function so it can be used in other parts of the application. This allows you to import and call connectToDatabase wherever a database connection is needed


















// import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
// }

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// async function connectToDatabase() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       bufferCommands: false,
//     };

//     cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
//       return mongoose;
//     });
//   }
//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// export default connectToDatabase;
