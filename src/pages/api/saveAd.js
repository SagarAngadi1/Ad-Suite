import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import connectToDatabase from '../../../utils/mongoose';
import Ad from '../../../models/Ad'; // Your Ad model/schema
import axios from 'axios'; // Import axios for making the request to FastAPI

// Disable default body parser
export const config = {
  api: {
    bodyParser: false, // Important for file uploads
  },
};



// Function to refine the ad using FastAPI
async function refineAd(productDescription, adDetails) {  //refineAd is an asynchronous function that sends the productDescription and adDetails to the FastAPI endpoint /refine-ad/ using a POST request.
  try {
    const response = await axios.post('http://127.0.0.1:8000/refine-ad/', {
      product_description: productDescription,
      ad_details: adDetails,
    });

    return response.data.refined_ad;

  } catch (error) {
    console.error('Error refining ad:', error);
    return null;
  }
}





const handler = async (req, res) => {
  if (req.method === 'POST') {
    const form = formidable({
      uploadDir: path.join(process.cwd(), '/public/uploads'), // Directory where files will be uploaded
      keepExtensions: true, // Keep file extensions
      multiples: false, // Ensure we only allow single file upload for brandLogo
    });

    // Parse the incoming form data
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        return res.status(500).send('Error parsing the form');
      }

      const { productDescription, adDetails, adDuration} = fields; 
      const brandLogo = files.brandImage ? files.brandImage[0] : undefined; // Access first element if it's an array, brandLogo was being returned as array so we had to access it like an array nad only after doing this the file path got stored in the database

      console.log('Product Description:', productDescription);
      console.log('Ad Duration:', adDuration);
      console.log('Brand Logo File:', brandLogo);


      // Move the uploaded brand logo to a permanent location, this code will save the file in the same location but with the original name of the file uploaded by the user
      // if (brandLogo) { 
      //   const oldPath = brandLogo.filepath;
      //   const newPath = path.join(process.cwd(), '/public/uploads', brandLogo.originalFilename);
      //   fs.renameSync(oldPath, newPath); // Move file to new location
      //   console.log('Brand Logo File path:', newPath);
      // }

      
      try {
        await connectToDatabase();

        //When handling form submissions in Next.js or Node.js with file and text fields, sometimes data fields (like productDescription) can arrive in the form of an array (even if you expect them to be a single value).
        const productDescription = Array.isArray(fields.productDescription) ? fields.productDescription[0] : fields.productDescription;
        const adDetails = Array.isArray(fields.adDetails) ? fields.adDetails[0] : fields.adDetails;
        const adDuration = Array.isArray(fields.adDuration) ? fields.adDuration[0] : fields.adDuration;


        // Call FastAPI to refine the product description and ad details
        const refinedAd = await refineAd(productDescription, adDetails);
        console.log('Refined Ad Data:', refinedAd); // Log this to check if it's coming back from FastAPI correctly
      
        if (!refinedAd) {
          return res.status(500).json({ success: false, error: 'Error refining ad details' });
        }




        const newAd = new Ad({
          productDescription: refinedAd, // Use refined product description 
          // productDescription: refinedAd.product_description, // Use refined product description
          //adDetails: refinedAd.ad_details, // Use refined ad details
          brandImage: brandLogo ? `/uploads/${brandLogo.newFilename}` : '', //Storing the newFilename provided by Formidable ensured that the file path was accurate and not undefined.
          adDetails,
          adDuration, // Ad duration added to the database
         // productDescription,
        });


        await newAd.save();
        console.log('new Ad:', newAd);


        return res.status(201).json({ success: true, data: newAd });
      } catch (error) {
        console.error("Error saving ad:", error);
        return res.status(500).json({ success: false, error: 'Server error' });
      }
    });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};

export default handler;











//The one that works, it starts from here till
// import connectToDatabase from '../../../utils/mongoose';
// import Ad from '../../../models/Ad'; // Your Ad model/schema
// import  upload from '../../../server'; // Adjust the path as needed
// //import { nextConnect } from 'next-connect';
// import { createRouter } from 'next-connect';

// const router = createRouter();



// //const handler = nextConnect(); //we are using the below line instead of this line
// //const router = nextConnect();  //instead of router it was handler all the places 


// router.use(upload.single('brandImage')); //this 'brandImage is used based on what is in the front end formappend 'key'


// router.post(async (req, res) => {
//     console.log("Request received"); // Log for debugging


    

//     const { productDescription, adDetails } = req.body;  //presnet
//     console.log("Product Description:", productDescription); // Log request body data //present


//     try  {

//         await connectToDatabase()
//        .then(() => console.log("Connected to DB")) // Log successful DB connection
//        .catch((err) => {
//           console.error("Failed to connect to DB", err);
//          return res.status(500).json({ success: false, error: 'Database connection failed' });
//         });


//         const newAd =  new Ad({

//             productDescription: productDescription,  //present
//             adDetails: adDetails || '',
//            // brandImage: req.file ? `/uploads/${req.file.filename}` : '',  //present
//             brandImage: req.brandImage ? `/uploads/${req.brandImage.originalname}` : '',

//         });

//         console.log("Saving newAd:", newAd); // Log before saving
//         await newAd.save();

//         console.log("Ad saved successfully"); // Log after saving
//         return res.status(201).json({ success: true, data: newAd });
    

//     } catch (error) {
//         console.error("Error saving ad:", error);
//         return res.status(500).json({ success: false, error: 'Server error' });
//     }
// });

// export const config = {
//     runtime: "nodejs",
//   };
  
//   export default router.handler({
//       onError: (err, req, res) => {
//           console.error(err.stack);
//           res.status(500).end(err.message);
//       },
//   });
  //till hereee



//export default handler;
//export default router.handler()






