// src/pages/api/signup.js
//This file is responsible for handling the user signup process, including saving the user’s credentials in the database and generating a JWT (JSON Web Token).
import connectToDatabase from '../../../utils/mongoose';      // Importing the connection function
import User from '../../../models/User';              // Importing the User model
import bcrypt from 'bcryptjs';                        // Importing bcrypt for password hashing
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
const cookie = require('cookie');
//import cookie from 'cookie';

//const JWT_SECRET = process.env.JWT_SECRET || 'myAdVideo$$$project1setcretyeK795$$$';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT Secret is not defined');
}


export default async function handler(req, res) {   // API route handler function and this line exports the 'handler' function as the default export of the module.
 
  const { email, password } = req.body;           // Extracting email and password from the request body

  if (!email || !password) {              //// Checking if both email and password are provided
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    await connectToDatabase();     // Connecting to the database

    const existingUser = await User.findOne({ email }); // Checking if the user already exists, uses the 'User' model
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); //// Hashing the password, The second parameter (10) is the salt rounds, determining the cost factor of the hashing

          //newUser
    const user = await new User({ // Creates a new instance of the User model with the provided email and hashed password.
      email,
      password: hashedPassword,
      credits: 150
    });


    await user.save();  // Saving the user to the database


    //The token generation code starts below
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '12h' });
    //console.log('Generated JWT token:', token); // Log the generated token


    //from me, means from YT
    user.token = token
    user.password = undefined


    const isProduction = process.env.NODE_ENV === 'production';
    //Send token in user cookie
    const options = {
      expires: new Date(Date.now() + 3 * 24 *  60 * 60 * 1000),
      httpOnly: true,
      secure: isProduction
    };

    const serializedCookie = cookie.serialize('token', token, options);
    console.log('Serialized cookie:', serializedCookie); // Log the serialized cookie

    res.setHeader('Set-Cookie', serializedCookie);

    res.status(201).json({
      success: true,
      token,
      user,
    });


   // res.status(201).json({ message: 'User created successfully' });  // // Sending a success response, this is present always

  } catch (error) {

    console.error(error); // Logging the error
    res.status(500).json({ error: 'Internal server error' });// Sending an error response

  }
}































// import connectToDatabase from '../../utils/mongoose';
// import User from '../../models/User';
// import bcrypt from 'bcryptjs';

// export default async function handler(req, res) {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: 'Email and password are required' });
//   }

//   try {
//     await connectToDatabase();

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       email,
//       password: hashedPassword,
//     });

//     await newUser.save();

//     res.status(201).json({ message: 'User created successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }


































// import connectToDatabase from '../../utils/mongoose';
// import User from '../../models/User';
// import bcrypt from 'bcryptjs';


// // C:\Users\User\VisualStudioProjects\AdVideo\advideo_nextjs\pages\api\signup.js



// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     const { email, password } = req.body;

//     await connectToDatabase();

//     // Check if the user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a new user
//     const user = new User({ email, password: hashedPassword });
//     await user.save();

//     return res.status(201).json({ message: 'User created successfully' });
//   } else {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }
// }
