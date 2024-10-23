// C:\Users\User\VisualStudioProjects\AdVideo\advideo_nextjs\models\User.js

// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({            //Defines a new schema for the User model. The schema defines the structure of the documents that will be stored in the MongoDB collection
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: { type: Number, default: 150 },
  CurrentPlan: {type: String, enum: ['basic', 'pro', 'ultra', null], default: null},
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);  //Exports the User model. If the User model already exists in the mongoose.models cache, it reuses it; otherwise, it creates a new model.





