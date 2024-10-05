//import mongoose from 'mongoose';
const mongoose = require('mongoose');

const PhotographySchema = new mongoose.Schema({
    inputDetails: { type: String, default: '',}, // Stores user input on how they want the photo
    productPhoto: { type: String, default: '' }, // Path to the uploaded product photo
    referencePhoto: { type: String, default: '' },  // Path to the uploaded reference photo (optional)
},
{ timestamps: true });

//export default mongoose.models.Photography || mongoose.model('Photography', PhotographySchema);
module.exports = mongoose.models.Photography || mongoose.model('Photography', PhotographySchema);
