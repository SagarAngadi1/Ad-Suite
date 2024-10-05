// pages/api/login.js
//import { serialize } from 'cookie';
import connectToDatabase from '../../../utils/mongoose';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';                        // Importing bcrypt for password hashing
import cookieParser from 'cookie-parser';
const cookie = require('cookie');


//const JWT_SECRET = process.env.JWT_SECRET || 'myAdVideo$$$project1setcretyeK795$$$';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT Secret is not defined');
}


export default async function handler(req, res) {

  const { email, password } = req.body;

  if (!email || !password) {              //// Checking if both email and password are provided
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try{
  await connectToDatabase();

  const user = await User.findOne({ email });

  if(!user){
    return res.status(401).json({ message: 'User do not exists' });

  }
  

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
  }


  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '12h' });
 // console.log('Generated JWT token in login:', token); // Log the generated token


  //from me, means from YT
  user.token = token
  user.password = undefined



  const isProduction = process.env.NODE_ENV === 'production';
  //Send token in user cookie
  const options = {
    expires: new Date(Date.now() + 3 * 24 *  60 * 60 * 1000),
    httpOnly: true,
    path: '/',  // Cookie will be available on all pages
   sameSite: 'strict',  // Ensures the cookie is only sent to your domain
   secure: isProduction // Secure cookie in production (only sent over HTTPS)
  };

  const serializedCookie = cookie.serialize('token', token, options);
  console.log('Serialized cookie in login:', serializedCookie); // Log the serialized cookie


  res.setHeader('Set-Cookie', serializedCookie);


  res.status(201).json({
    success: true,
    token,
    user,

  });

 // res.status(201).json({ message: 'User login successful' });  // // Sending a success response, this is present always



  }catch (error) {
    console.error(error); // Logging the error
    res.status(500).json({ error: 'Internal server error' });// Sending an error response


  }


}

