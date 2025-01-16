import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import connectToDatabase from '../../../utils/mongoose';
import User from '../../../models/User';              // Importing the User model
import Photography from '../../../models/Photography'; // Your Photography model/schema
import axios from 'axios'; // Import axios for making the request to FastAPI
import { uploadFile } from '../../../utils/s3'; // Import the uploadFile function


// Disable default body parser
export const config = {
  api: {
    bodyParser: false, // Important for file uploads
  },
};

const COMFYUI_API_URL = "https://api.comfyonline.app/api/run_workflow";

// Helper to upload to S3
async function uploadToS3(fileBuffer, fileName) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: "image/jpeg",
  };

  try {
    const response = await s3.upload(params).promise();
    return response.Location; // Return the uploaded file's URL
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload to S3");
  }
}


async function imageToBase64(imageUrl) {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    return Buffer.from(response.data, "binary").toString("base64");
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw new Error("Failed to convert image to base64");
  }
}




// Function to refine the photography request using FastAPI
async function refineAdBanner(inputDetails, productPhotoUrl, referencePhotoUrl) {

  try {
    const productPhotoBase64 = productPhotoUrl
      ? await imageToBase64(productPhotoUrl)
      : null;
    const referencePhotoBase64 = referencePhotoUrl
      ? await imageToBase64(referencePhotoUrl)
      : null;

    const messages = [];


    if (productPhotoUrl && referencePhotoUrl) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `You are an expert prompt generator specializing in high-quality, professional level, visually appealing background setup for for 'ad creatives'.Below are two images: the first is the product photo, and second is the reference banner. Use the reference photo as inspiration like for design, aesthetics, lightning, fonts, etc to design the ad creative for the product provided, don't copy the exact text elements from the reference. The prompt you generate will be sent to the Flux image generation model to create the ad-banner. Ensure the generated banner is of significantly higher quality than the reference banner.
            These are the ad creative details that needs to be generated in the ad creative, make sure to mention each one of them clealy in the prompt: ${inputDetails}. 
            The prompt should only describe the advertisement setup, design elements, creative assets, color, shades and lightning in detail—strictly don't describing the product.
            The texts, OFF text, call to action button should all be very elegant, sleak and modern, they should not feel like old fashioned.
            Don't mention the word 'product' in the prompt, otherwise flux will generate the product aswell. This is because we use inpainting so you should only give prompt that defines everything other than the product. The product will always be positioned at the centre of the ad-creative so all the ther elements of the ad creative should be strictly around the centre, mention it clearly in the prompt. Provide a visually balanced design suited to the product type and theme.
            Make the prompt into 2 paragraphs. The first paragraph should describe the 'top of the ad text', 'OFF text' elements of ad creative and the other paragraph should describe 'Highlight note text' and 'Call to action text' elements.
            The prompt should always start with 'Create a productless background environment for an ad-creative...' and continue mentioning the color palette, style, formation, etc.,
            Refer to any text elements as 'text' (e.g., 'The top of the ad should say, xyzxyz...') rather than using terms like 'title' or 'bullet points.' Describe the position, style, text font, font size of all elements explicitly.`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${productPhotoBase64}`,
            },
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${referencePhotoBase64}`,
            },
          },
        ],
      });
    } else if (productPhotoUrl) {

      // Give me a prompt that should generate the background setup of a static ad creative for this below given product photo, the prompt should only describe all the elements except the product as we will place it later using flux inpainting.
      //       The details that needs to be in the ad creative are given here, make sure to mention each one of them clearly in the prompt: ${inputDetails}. 
      //       Be as detailed as possinle about the elements of the ad creative, be it color, tone, look, refreshing, design elements or objects, the ad creative should be of very high quality style, color, nature, presenting and all.
      //       The product will be placed at the centre so all the elements should be placed such that the space is well allocated for all the elements around the centre. The prompt should generate a productless background setup for the adcreative
      //       The centre product should not be mentioned in the prompt, we will use inpainting method to place the product given by user already, so the prompt should describe a productless background setup for the static ad creative, state clearly in the prompt to generate a productless setup.
      //       Dont make the OFF badge, set it as text rather than badge.


      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: ` You are an expert prompt generator specializing in high-quality, professional level, visually appealing productless background setup for for 'ad creatives'. The prompt you generate will be sent to the Flux image generation model to create the ad-banner.
            These are the ad creative details that needs to be generated in the ad creative, make sure to mention each one of them clealy in the prompt: ${inputDetails}.
            The prompt should only describe the advertisement setup, design elements, creative assets, color, shades and lightning in detail—strictly don't describing the product.
            The Highlight texts, OFF text, call to action, should all be very elegant, maintain perfect aesthetics, they should not feel like old fashioned.
            Don't mention the word 'product' in the prompt, otherwise flux will generate the product aswell. This is because we use inpainting so you should only give prompt that defines everything other than the product. The product will always be positioned at the centre of the ad-creative so all the ther elements of the ad creative should be strictly around the centre, mention it clearly in the prompt. Provide a visually balanced design suited to the product type and theme.
            Make the prompt into 2 paragraphs. The first paragraph should describe the 'top of the ad text', 'OFF text' elements of ad creative and the other paragraph should describe 'Highlight note text' and 'Call to action text' elements.
            The prompt should always start with 'Create a productless background environment for an ad-creative...' and continue mentioning the color palette, style, formation, etc.,
            Refer to any text elements as 'text' (e.g., 'The top of the ad should say, xyzxyz...') rather than using terms like 'title' or 'bullet points.' Describe the position, style, color, text font, font size of all elements explicitly.`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${productPhotoBase64}`,
            },
          },
        ],
      });
    } else {
      return res.status(400).json({
        error: "Both product and reference photos cannot be empty. Provide at least one.",
      });
    }


    // GPT-4o Vision API Call
    const gpt4oResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: messages,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const gpt4oResult = gpt4oResponse.data.choices[0].message.content.trim();
    console.log(`GPT4o Result: ${gpt4oResult}`);



    const generatedProductPhotoURL = await generateProductPhoto(gpt4oResult, productPhotoUrl)
    

    async function generateProductPhoto(gpt4oResult, productPhotoUrl) {
      try {
        // Step 1: Prepare the API payload
        const payload = {
          input: {
            CLIPTextEncode_text_4: gpt4oResult,
            LoadImage_image_7: productPhotoUrl,  // Assuming this matches the Python code's LoadImage field
            CLIPTextEncode_text_13: "nsfw, worst, blur, poor quality",  // Additional filter from Python code
          },
          //workflow_id: "4e6126ad-b230-49e4-9e64-9da7471144c0",  // Same workflow_id as in Python code
          workflow_id: "2609b103-7381-4e11-8f4b-07d1705031d4",  // Same workflow_id as in Python code
        };

        console.log(`Payload: ${payload}`);

    
        // Step 2: Make the API request to initiate the workflow
        const comfyResponse = await axios.post(COMFYUI_API_URL, payload, {
          headers: {
            Authorization: `Bearer ${process.env.COMFYUI_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        });
    
        const taskId = comfyResponse.data.data?.task_id;
        if (!taskId) {
          throw new Error("Failed to receive task ID from the API");
        }
    
        console.log(`Task ID: ${taskId} - Waiting for output...`);
    
        // Step 3: Poll the task status until it's completed
        let outputUrlList = [];
        for (let i = 0; i < 150; i++) {  // Retry for ~30 seconds
          const pollPayload = { task_id: taskId };
          const statusResponse = await axios.post(
            "https://api.comfyonline.app/api/query_run_workflow_status",
            pollPayload,
            {
              headers: {
                Authorization: `Bearer ${process.env.COMFYUI_API_TOKEN}`,
              },
            }
          );
    
          const statusJson = statusResponse.data;
          const state = statusJson.data?.state;
          const output = statusJson.data?.output;


          if (state === "COMPLETED") {
            outputUrlList = output?.output_url_list || [];
            if (outputUrlList.length > 0) {
              console.log(`Task completed. Output image(s): ${outputUrlList}`);
              break;  // Exit the loop if image is generated
            } else {
              throw new Error("Task completed but no output images found");
            }
          } else if (state === "ERROR") {
            throw new Error("Task failed with error status");
          } else {
            console.log(`Current task status: ${state}`);
          }
    
    
          // Wait for 2 seconds before polling again
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
    
        if (outputUrlList.length === 0) {
          throw new Error("No output image URL received after polling");
        }
    
        const outputImageUrl = outputUrlList[0];
    
        // Step 4: Download the generated image
        console.log(`Downloading generated image from: ${outputImageUrl}`);
        const imageResponse = await axios.get(outputImageUrl, { responseType: 'arraybuffer' });
    
        const outputFilePath = path.resolve(__dirname, 'generated_image.png');
        fs.writeFileSync(outputFilePath, imageResponse.data);
        console.log(`Image downloaded and saved locally as: ${outputFilePath}`);
    
        return outputImageUrl;  // You can return the URL or the file path, based on your requirement
    
      } catch (error) {
        console.error("Error during image generation:", error.message);
        throw new Error("Failed to generate product photography");
      }
    }

    console.error("IMage URL FROM REFINE ", generatedProductPhotoURL);
    return { gpt4oResult, generatedProductPhotoURL};

    // res.json({
    //   gpt4oResult: gpt4oResult,
    //   generatedProductPhotoURL: generatedProductPhotoUrl,
    // });

  } catch (error) {
    console.error("Error processing images:", error);
    res.status(500).json({ error: "An error occurred while processing your request" });
  }














  // try {

  //   // const fastApiUrl = process.env.NEXT_PUBLIC_FAST_API_LIVE_URL + '/refine-photo/';

  //   // const response = await axios.post(fastApiUrl, {
  //   //   input_details_banner: inputDetails,
  //   //   product_photo_url_banner: productPhotoUrl,
  //   //   reference_photo_url_banner: referencePhotoUrl,
  //   // });
   

  //   const response = await axios.post('http://127.0.0.1:8000/refine-adbanner/', {
  //     input_details_banner: inputDetails,
  //     product_photo_url_banner: productPhotoUrl,
  //     reference_photo_url_banner: referencePhotoUrl,
  //   });

    
  //   // Extract the GPT-4o result and the generated image filename 
  //   const gpt4oResult = response.data.gpt4o_result;
  //   const generatedProductPhotoURL = response.data.Generated_AdBanner_URL;

 
  //   return { gpt4oResult, generatedProductPhotoURL}; 


  // } catch (error) {
  //   console.error('Error refining photography details in function:', error.response?.data || error.message);
  //  return { 
  //   success: false,
  //   message: 'Error occurred while refining photography details in function.',
  //   details: error.response?.data || error.message
  // };
  // }
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

      const { combinedInputDetails, userId } = fields;
      const productPhoto = files.productImage ? files.productImage[0] : undefined;
      const referencePhoto = files.referenceImage ? files.referenceImage[0] : undefined;



      console.log('Input Details:', combinedInputDetails);
      console.log('Product Photo:', productPhoto);
      console.log('Reference Photo:', referencePhoto);
      console.log('userId:', userId);
 
      try {

        await connectToDatabase();

        const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
        const user = await User.findById(userId);

        console.log('Current User:', user);


        if (!user) {
          console.log('Error: User not found ');
          return res.status(404).json({ message: 'User not found' });

        }

        if (user.credits < 50) {
          console.log('Not enough credits:', user.credits);
          return res.status(400).json({ message: 'Not enough credits' });
        }

 
         // Upload to S3
         let productPhotoS3Url = '';
         let referencePhotoS3Url = '';


         if (productPhoto) {
          const productPhotoName = `${Date.now()}-${productPhoto.originalFilename}`;
          const productPhotoBuffer = fs.readFileSync(productPhoto.filepath);
          const result = await uploadFile(productPhotoBuffer, productPhotoName);
          productPhotoS3Url = result.Location; // S3 URL for the product photo
        }

        if (referencePhoto) {
          const referencePhotoName = `${Date.now()}-${referencePhoto.originalFilename}`;
          const referencePhotoBuffer = fs.readFileSync(referencePhoto.filepath);
          const result = await uploadFile(referencePhotoBuffer, referencePhotoName);
          referencePhotoS3Url = result.Location; // S3 URL for the reference photo
        }
    

        const combinedInputDetails = Array.isArray(fields.combinedInputDetails) ? fields.combinedInputDetails[0] : fields.combinedInputDetails;

       


        // Call FastAPI to refine the input details
        const refinedInput = await refineAdBanner(combinedInputDetails, productPhotoS3Url, referencePhotoS3Url);
        if (!refinedInput) {
          return res.status(500).json({ success: false, error: 'Error refining photography details' });
        }
       console.log('Refined Photography Data:', refinedInput);


        // Save the photography details to the database
        const newPhotography = new Photography({
          combinedInputDetails: combinedInputDetails, 
          productPhoto: productPhotoS3Url, 
          referencePhoto: referencePhotoS3Url,
     
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
           //generatedProductPhoto: refinedInput.generatedProductPhoto,  COMMENDTED THIS NOW
           generatedProductPhotoURL: refinedInput.generatedProductPhotoURL //WAS NOT HERE, ADdED AFTER CHATGPT IMAGE URL

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