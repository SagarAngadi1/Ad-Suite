//This file is responsible for retrieving the current authenticated user based on the JWT.
//This function is used within server-side code, like in the getServerSideProps function in CreateAd.js, to fetch the current user's data before rendering the page.
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import User from '../models/User';
import connectToDatabase from './mongoose';
//import dbConnect from '../utils/dbConnect';

const JWT_SECRET = process.env.JWT_SECRET || 'myAdVideo$$$project1setcretyeK795$$$';

const fetchCurrentUser = async (req) => {
  await connectToDatabase();

  //const token = req.cookies.token;
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
};

export default fetchCurrentUser;


























// // utils/fetchCurrentUser.js
// import cookie from 'cookie';
// import jwt from 'jsonwebtoken';


// const JWT_SECRET = process.env.JWT_SECRET || 'myAdVideo$$$project1setcretyeK795$$$';

// export const fetchCurrentUser = async (req) => {

//   console.log('Request Headers:', req.headers);

  
// //below lines were commented
//  // const cookies = cookie.parse(req ? req.headers.cookie || '' : document.cookie);
// // const cookies = cookie.parse(req ? req.headers.cookie || '' : '');





//  const cookies = cookie.parse( req.headers.cookie ||  '');
//  console.log('Parsed Cookies:', cookies);
 
//   const token = cookies.token;

// //below lines were commented
//   // console.log(req.cookies)
//   // const {token } = req.cookies;


//   if (!token) {
//     console.log("No token found in cookies");
//     return null;
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     console.log('decoded jwt:', decoded)

//     return decoded.userId;

//   } catch (error) {
//     console.error('Error verifying token:', error);
//     return null;
//   }

  

// };

// export default fetchCurrentUser;