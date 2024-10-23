import connectToDatabase from '../../../utils/mongoose';
import User from '../../../models/User';              // Importing the User model


export default async function handler(req, res) {
  await connectToDatabase(); // Ensure DB connection

  const { userId, credits } = req.body; // Get userId and credits from the request body

  try {

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.credits = credits;
    await user.save();



    // Find the user by their ID and update their credits
    // const updatedUser = await User.findByIdAndUpdate(
    //   userId,
    //   { $inc: { credits: credits } }, // Increment credits by the plan's credits
    //   { new: true }
    // );

    // if (!updatedUser) {
    //   return res.status(404).json({ success: false, message: 'User not found' });
    // }

    return res.status(200).json({ success: true, user: user });
  } catch (error) {
    console.error('Error updating credits:', error);
    return res.status(500).json({ success: false, message: 'Failed to update credits' });
  }
}
