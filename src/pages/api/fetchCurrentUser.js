//This file acts as an API endpoint that other parts of your application can interact with to fetch the current user's data.
//This file provides a way for client-side code to access server-side logic. Since client-side code (like React components) can't directly interact with server-side logic or the database, this API route serves as a bridge
//When a request is made to /api/fetchCurrentUser, this API route is triggered.
//It internally calls the fetchCurrentUser function from the utils directory (which we discussed above) to fetch the user based on the token in the request.
//If the user is found, it returns the user data in the response; if not, it returns a 404 status with an error message.
//This API route is called from client-side code, for example, in the CreateAd.js file, where a fetch request is made to /api/fetchCurrentUser to retrieve the current user's data.
import fetchCurrentUser from '../../../utils/fetchCurrentUser';

export default async function handler(req, res) {
  const user = await fetchCurrentUser(req);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.status(200).json(user);
}