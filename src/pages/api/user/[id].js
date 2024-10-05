// pages/api/user/[id].js
//This file is an API route that allows you to retrieve or update user data based on the user's unique ID. 
//It provides a way to interact with user-specific data through HTTP requests.
//In our application anywhere, if we want to fetch user details then we make a GET request to /api/user/[id] with the user's ID and so like If the user updates their profile, you might make a PUT request to the same route to save the changes.

import connectToDatabase from '../../../../utils/mongoose'; //
import User from '../../../../models/User';

export default async function handler(req, res) {
  
   const { id } = req.query;

  try {
    await connectToDatabase();

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
