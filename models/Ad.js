//import mongoose from 'mongoose';
const mongoose = require('mongoose');


const AdSchema = new mongoose.Schema({

    productDescription: { type: String, required: true, }, //present
    //productDescription: { type: String, required: false, },
    adDetails: { type: String, default: '', },
    adDuration: { type: String, default: '15', },
    brandImage: {type: String, default: '', },

},
{ timestamps: true });

//export default mongoose.models.Ad || mongoose.model('Ad', AdSchema);
module.exports = mongoose.models.Ad || mongoose.model('Ad', AdSchema);

