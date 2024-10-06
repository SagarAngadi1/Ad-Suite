import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import connectToDatabase from '../../../utils/mongoose';
import User from '../../../models/User';              // Importing the User model
import Photography from '../../../models/Photography'; // Your Photography model/schema
import axios from 'axios'; // Import axios for making the request to FastAPI


// Disable default body parser
export const config = {
  api: {
    bodyParser: false, // Important for file uploads
  },
};

// Function to refine the photography request using FastAPI
async function refinePhotography(inputDetails, productPhotoUrl, referencePhotoUrl) {
  try {

    // Use the environment variable for FastAPI URL
    const fastApiUrl = process.env.NEXT_PUBLIC_FAST_API_LIVE_URL + '/refine-photo/';
    const response = await axios.post(fastApiUrl, {
      input_details: inputDetails,
      product_photo_url: productPhotoUrl,
      reference_photo_url: referencePhotoUrl,
    });


    // const response = await axios.post('http://127.0.0.1:8000/refine-photo/', {
    //   input_details: inputDetails,
    //   product_photo_url: productPhotoUrl,
    //   reference_photo_url: referencePhotoUrl,
    // });

    // Extract the GPT-4o result and the generated image filename  //wasnot here
    const gpt4oResult = response.data.gpt4o_result;
    const generatedProductPhoto = response.data.Generated_Product_Photo;
 
    // Return both values
    return { gpt4oResult, generatedProductPhoto }; 


  } catch (error) {
    console.error('Error refining photography details:', error);
    return null;
  }
}



const handler = async (req, res) => {


  if (req.method === 'POST') {
    const form = formidable({
      uploadDir: path.join(process.cwd(), '/public/uploads'), // Directory where files will be uploaded
      keepExtensions: true, // Keep file extensions
      multiples: true, // Allow multiple file uploads (productPhoto, referencePhoto)
    });


   

    // Parse the incoming form data
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        return res.status(500).send('Error parsing the form');
      }

      const { inputDetails, userId } = fields;
      const productPhoto = files.productImage ? files.productImage[0] : undefined;
      const referencePhoto = files.referenceImage ? files.referenceImage[0] : undefined;



      console.log('Input Details:', inputDetails);
      console.log('Product Photo:', productPhoto);
      console.log('Reference Photo:', referencePhoto);
      console.log('userId:', userId);




       //These are required to send the photos to fastAPi , Generate URLs for the uploaded images to send to main.py gpt-4o 
      // const baseUrl = `${req.protocol}://${req.get('host')}`; // e.g., http://localhost:3000
       const baseUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`; // Fallback to 'http' if 'x-forwarded-proto' is not available
       const productPhotoUrl = productPhoto ? `${baseUrl}/uploads/${productPhoto.newFilename}` : '';
       const referencePhotoUrl = referencePhoto ? `${baseUrl}/uploads/${referencePhoto.newFilename}` : '';
       
      // Ensure the uploaded files are properly handled, these are required to store in database
       const productPhotoPath = productPhoto ? `/uploads/${productPhoto.newFilename}` : '';
       const referencePhotoPath = referencePhoto ? `/uploads/${referencePhoto.newFilename}` : '';


       
      try {

        await connectToDatabase();

        const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;

        const user = await User.findById(userId);


        //const user = await fetchCurrentUser(req); //fetching method from here to
        console.log('Current User:', user);
        if (!user) {
          console.log('Error: User not found ');
          return res.status(404).json({ message: 'User not found' });

        }

        if (user.credits < 50) {
          console.log('Not enough credits:', user.credits);
          return res.status(400).json({ message: 'Not enough credits' });
        }
 
    

        //I was here
        const inputDetails = Array.isArray(fields.inputDetails) ? fields.inputDetails[0] : fields.inputDetails;
        

       // Call FastAPI to refine the input details
       const refinedInput = await refinePhotography(inputDetails, productPhotoUrl, referencePhotoUrl);
       console.log('Refined Photography Data:', refinedInput);

        if (!refinedInput) {
          return res.status(500).json({ success: false, error: 'Error refining photography details' });
        }

        // Save the photography details to the database
        const newPhotography = new Photography({
          inputDetails: inputDetails, 
          productPhoto: productPhotoPath, 
          referencePhoto: referencePhotoPath, 
        });

        await newPhotography.save();
        console.log('New Photography Entry:', newPhotography);

        // If image generation is successful, deduct 50 credits
        user.credits -= 50;
        await user.save();


        return res.status(201).json({
           success: true,
           data: newPhotography, 
           refinedInput: refinedInput.gpt4oResult, 
          generatedProductPhoto: refinedInput.generatedProductPhoto
        }); 
      } catch (error) {
        console.error("Error saving photography details:", error);
        return res.status(500).json({ success: false, error: 'Server error' });
      }
    });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};




export default handler;
