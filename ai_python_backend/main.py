from fastapi import FastAPI, HTTPException, Request  # Added Request for custom error handling
from pydantic import BaseModel
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv
import requests
import base64
import time
from fastapi.staticfiles import StaticFiles #this was not present
from fastapi.middleware.cors import CORSMiddleware



load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # You can also set to ["*"] to allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Initialize OpenAI async client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
#client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", "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"))


# Eleven Labs API key
ELEVEN_LABS_API_KEY = os.getenv("ELEVEN_LABS_API_KEY")
ELEVEN_LABS_VOICE_ID = os.getenv("ELEVEN_LABS_VOICE_ID", "Your_Default_Voice_ID")  # Default voice ID

# Directory to store product images BELOW TWO LINES WERE NOT PRESENT
image_directory = "product_images"

# Serve the product images from this directory
app.mount("/product_images", StaticFiles(directory=image_directory), name="product_images")



# Define request model for ad generation input
class AdRequest(BaseModel):
    product_description: str
    ad_details: str


# Define request model for ad script prompt generation
class AdScriptPromptRequest(BaseModel):
    refined_text: str  



# Define request model for ad script generation
class AdScriptRequest(BaseModel):
    ad_script_prompt: str 


    # Helper function to encode image to base64
def image_to_base64(image_url):
    response = requests.get(image_url)
    if response.status_code == 200:
        return base64.b64encode(response.content).decode('utf-8')
    else:
        raise Exception(f"Failed to download image from {image_url}")


# Define request model for product photography input
class PhotographyRequest(BaseModel):
    product_photo_url: str
    reference_photo_url: str
    input_details: str


# Root route
@app.get("/")
def read_root():
    return {"message": "Welcome to the Ad generation API"}


@app.post("/refine-photo/")
async def process_images(request: PhotographyRequest):


    product_photo_url = request.product_photo_url
    reference_photo_url = request.reference_photo_url
    input_details = request.input_details

    print(f"Received product photo URL: {product_photo_url}")
    print(f"Received reference photo URL: {reference_photo_url}")
    print(f"Received input details: {input_details}")

    try:
        # Convert images to base64
        product_photo_base64 = image_to_base64(product_photo_url) if product_photo_url else None
        reference_photo_base64 = image_to_base64(reference_photo_url) if reference_photo_url else None

        # Prepare the messages list
        messages = []

        # Logic when both product photo and reference photo are present
        if product_photo_url and reference_photo_url:
            messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            f"You are an expert prompt generator specializing in high-quality, studio-level product photography, below are two images: the first is the product photo, and the second is the reference photo. Use the reference photo for reference to give a prompt that generates product photography of the product available in the givem product photo. The prompt you give will be sent to flux image generation model to generate the product photography of the prduct image. Give me a prompt that generates an product photography of much better quality than this below given reference image qulaity"
                            f"Dont leave spaces inbetween lines in prompt"
                            f"Consider the input details in the prompt given by the user, {input_details}."
                            f"If there are too many small unclear texts, then omit them from prompt"
                            f"The texts in the photo should be clear and precise, product name should be clearly shown"
                            f"if any figure or design is given on the product, generate that as well"
                            f"Be clear with the shape, design, structure of the product"



                            # "You are an expert prompt generator specializing in high-quality, studio-level product photography. "
                            #  "Below are two images: the first is the product photo, and the second is the reference photo. "
                            #  "Please generate a prompt that will be sent to the Flux image generation model. "
                            #  "If the user provides only the reference photo without a product photo, generate a prompt to create an image that closely resembles the reference. "
                            #  "If only the product image is provided, create a prompt that ensures the highest quality and most appealing product photography, incorporating appropriate colors, background setups, design elements, and any other necessary details. "
                            #  "When both images are provided, ensure that the generated product photography exceeds the quality of the reference photo significantly. "
                            #  "Additionally, if the user has specified any input details, please incorporate those into the prompt for image generation. "
                            #  "Consider the product and reference images carefully, as well as these user-provided input details: {input_details}."
                          
                        )
                    },
                    {

                         "type": "image_url",  # Send the base64 encoded image in place of the URL
                            "image_url": {
                                "url": f"data:image/png;base64,{product_photo_base64}"
                            }
                    },
                    {
                        "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{reference_photo_base64}"
                            }
                    }
                ]
            })



        # Logic when only reference photo is present
        elif reference_photo_url:
            messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            f"You are an expert prompt generator specializing in high-quality, studio-level product photography, the prompt you give will be sent to flux image generation model to generate the image. Give me a prompt that generates an image much better than this below given reference image qulaity"
                            f"Dont leave spaces inbetween lines in prompt"
                            f"Consider the input details in the prompt given by the user, {input_details}."
                            f"If there are too many small unclear texts, then omit them from prompt"
                            f"The texts in the photo should be clear and precise, product name should be clearly shown"
                            f"if any figure or design is given on the product, generate that as well"
                            f"Be clear with the shape, design, structure of the product"
                            #f"If any figure or design is given on the product, make sure to generate that as well"
                            # "When giving instructions about placing texts in the image, be clear with instructions like position, color, style of the texts."
                            #"There should be no unclear texts displayed as it will ruin the quality of product photography"
                           
                           
                           
                            # "You are an expert prompt generator specializing in high-quality, studio-level product photography. "
                            # "Below is the reference photo provided by the user. Please generate a prompt that will be sent to the Flux image generation model. "
                            # "Generate a prompt to create an image that closely resembles the reference image, has the highest quality and most appealing product photography, incorporating appropriate colors, background setups, design elements, and any other necessary details"
                            # "Ensure that the generated product photography exceeds the quality of the reference photo significantly. "
                            #  "Additionally, if the user has specified any input details, please incorporate those into the prompt for image generation. "
                            #  "Consider the product and reference images carefully, as well as these user-provided input details: {input_details}."
                        )
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                           "url": f"data:image/png;base64,{reference_photo_base64}"
                        }
                    }
                ]
            })

        # Logic when only product photo is present
        elif product_photo_url:
            messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                          f"You are an expert prompt generator specializing in high-quality, studio-level product photography, the prompt you give will be sent to flux image generation model to generate the image.Below is the product photo provided by the user, give me a prompt that generates product photography of this given product photo, make both the background and product more classy, sleak, crisp and appealing"
                           f"use colors , lightning, design elements in backdrop and anything that suits the product"
                            f"Dont leave spaces inbetween lines in prompt"
                            f"Consider the input details in the prompt given by the user, {input_details}."
                            f"Dont tell in the prompt to 'generate something as provided in the photo', because flux model can see the image so you mention clearly what needs to be generated, flux model just generates according to the prompt you give so they has to be specific words and not like some description to a person "
                            # f"If there are too many small unclear texts, then omit them from prompt"
                            f"The texts in the photo should be clear and precise, product name should be clearly shown"
                            f"if any figure or design is given on the product, generate that as well"
                            f"Be clear with the shape, design, structure of the product"
                        


                        # "You are an expert prompt generator specializing in high-quality, studio-level product photography. "
                        #   "Below is the product photo provided by the user. Please generate a prompt that will be sent to the Flux image generation model. "
                        #   "create a prompt that ensures the highest quality and most appealing product photography, incorporating appropriate colors, background setups, design elements, and any other necessary details. "
                        #   "Additionally, if the user has specified any input details, please incorporate those into the prompt for image generation. "
                        #   "Consider the product and reference images carefully, as well as these user-provided input details: {input_details}."


                        )
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{product_photo_base64}"
                        }
                    }
                ]
            })

        # Logic when neither photo is provided
        else:
            print("No product or reference photo provided.")
            raise HTTPException(status_code=400, detail="Both product and reference photos cannot be empty. Please provide at least one.")
        



        # GPT-4o Vision model API call with base64 images
        response = await client.chat.completions.create(
            model="gpt-4o",  # Ensure you're using the Vision-enabled model
            messages=messages,
            max_tokens=1000
        )

        # Get the result from GPT-4o
        gpt4o_result = response.choices[0].message.content.strip()

        print(f"GPT-4o Vision Result: {gpt4o_result}")

      
        product_photo_filename = generate_product_photo(gpt4o_result)

        if product_photo_filename:
            print(f"Product photography saved as: {product_photo_filename}")
        else:
            print("Failed to generate product photography.")

            
        return {"gpt4o_result": gpt4o_result,
                "Generated_Product_Photo": product_photo_filename}
    
  
    except Exception as e:
        print(f"Error processing images with GPT-4o: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request")
    
 
         # Call the function to generate the product photo using the Flux model
  


# Function to generate a product photography image using Flux model
def generate_product_photo(image_prompt):
    url = "https://api.hyperbolic.xyz/v1/image/generation"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJpYW5hc3NhZ2FyQGdtYWlsLmNvbSJ9.51t6Z8ZHmoDC_tyxt3T12GEj8jaa9oaLpucZtQBcviU"  # Replace with your actual API key
       # "Authorization": "Bearer YOUR_API_KEY"  # Replace with your actual API key
    }
    data = {
        "model_name": "FLUX.1-dev",
        "prompt": image_prompt,
        "steps": 50,
        "cfg_scale": 2,
        "enable_refiner": False,
        "height": 1024,
        "width": 1024,
        "backend": "auto"
    }

    try:
        # Send POST request to the Flux API
        response = requests.post(url, headers=headers, json=data)

        # Handle the response
        if response.status_code == 200:
            # Extract the base64-encoded image from the response
            image_data = response.json()["images"][0]["image"]

            timestamp = int(time.time())  # Unix timestamp
            image_filename = f"product_photo_{timestamp}.png"

            #was not here, both this and its below snippet
            image_path = os.path.join(image_directory, image_filename)

            # headers = {
            #        'Content-Disposition': f'attachment; filename={image_filename}',
            #         'Access-Control-Expose-Headers': 'Content-Disposition'
            #        }
            

             # Decode and save the image in 'public/product_images'
            with open(image_path, "wb") as img_file:
                img_file.write(base64.b64decode(image_data))
            

            # # Decode and save the image locally  PRESENT EARLIER
            # with open(image_filename, "wb") as img_file:
            #     img_file.write(base64.b64decode(image_data))


            print(f"Product photo generated and saved as {image_filename}")
            #return FileResponse(image_path, headers=headers)
            return image_filename



        else:
            print(f"Error generating product photo: {response.status_code}")
            print(response.json())
            return None

    except Exception as e:
        print(f"Exception while generating product photo: {str(e)}")
        return None
    # uvicorn main:app --reload





































@app.post("/refine-ad/")
async def refine_ad(ad_request: AdRequest):
    # Step 1: REFINING THE USER INPUT
    product_description = ad_request.product_description
    ad_details = ad_request.ad_details

    print(f"Received product description: {product_description}")
    print(f"Received ad details: {ad_details}")

    try:
        # Call OpenAI API to refine the ad content using GPT-4o
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                 {
                    "role": "system", 
                    "content": """You are an expert in taking the user's input and refining them to create comprehensive and detailed ad brief that is suitable in creating high-quality, commercial-grade advertisements for businesses and your task is to do that. 
                    The brief should include details like the following:
                    - Product description that highlights the most relevant features.
                    -A suitable tone and style for the ad (eg: fun, serious, emotional, aspirational, etc.).
                    - Recommendations on what kind of ad format would be best, recommend exactly any one style that suits the ad. (e.g., UGC style, cinematic, testimonial, etc.).
                    - Identify product's unique selling points (USPs) and what benefits it offers.
                    - Relevant use case scenarios and how the product solves problems or enhances life.
                    """
                },




                   #  Your task is to take the user's inputs and refine them to create a comprehensive and detailed ad brief that is suitable for professional content creation. 
                    #- Suggestions for potential slogans, calls-to-action (CTAs), or hooks to make the ad more compelling.
                    # Target audience insights and the type of messaging that will resonate with them.
                    # A description of the ideal visual and narrative style for the ad (e.g., fast-paced, minimalist, colorful, etc.).
                    
                {
                    "role": "user", 
                    "content": f"Please refine these inputs {product_description}, {ad_details} and generate a detailed ad brief that includes tone, style, use case scenarios, product benefits, and any characteristics relevant for professional content creation."
                }
            ],
            max_tokens=350,
            temperature=0.7
        )

        refined_text = response.choices[0].message.content.strip()
        print(f"Refined Ad: {refined_text}")

    except Exception as e:
        print(f"Error refining ad: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to refine ad.")



    # Step 2: GENERATING PROMPT FOR AD SCRIPT
    try:
        response_prompt = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
            {
                    "role": "system", 
                    "content": """You are an expert at generating high-quality prompts for professional-grade ad scripts. Your task is to take the refined input and create a prompt, the prompt that you generate will be given to AI model in next step 
                    so the prompt should be such that it should generate a professional level ad script if given to AI model.
                    The prompt can have description of the ad concept, tone and style guildelines for the script like exciting, happy, emotional, aspirational, etc.  
                    Highlight the product's USPs and benefits, mention target audience, any points or hooks that make the ad more engaging. """
                },


                # - A clear description of the ad concept, highlighting key points from the refined product brief.
                #     - Tone and style guidelines for the script, based on the input brief (e.g., emotional, aspirational, humorous).
                #     - Detailed instructions for the visual and narrative style, including any specific direction for pacing, camera shots, or transitions.
                #     - Suggestions for scene progression, highlighting the product’s USPs and benefits.
                #     - Target audience insights, specifying how the messaging should align with their needs or desires.
                #     - Suggestions for a strong Call-to-Action (CTA) that ties into the brand's goals.
                #     - Any relevant slogans, taglines, or hooks from the brief to make the ad more engaging.

                {
                    "role": "user", 
                    "content": f"Based on the following refined content, create a high-quality professional prompt to generate ad script in next stage: {refined_text}"
                }
                ],
            max_tokens=300,
            temperature=0.7
        )

        ad_script_prompt = response_prompt.choices[0].message.content.strip()
        print(f"Ad Script Prompt: {ad_script_prompt}")

    except Exception as e:
        print(f"Error generating ad script prompt: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate ad script prompt.")




    # Step 3: GENERATING AD SCRIPT AND PROMPT
    try:
        response_script = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system", 
                    "content": """You are an expert ad script generator who delivers high-quality, professional-level ad scripts. 
                    Your goal is to create an ad script based on the provided prompt. Divide the script into scenes of 5 second each, for every 5 second script below should be given a clear detailed prompt that should create the image to describe the scene narrated in that scene's script.
                    With image prompts, be as detailed and professional as possible, because the generated image prompts will be fed into flux image genrating model to generate the images and the generated images will be directly used in the ad,
                    so keep in mind that the ad created will be just using the images generated from prompts so images that we generate will be of high importance, make them as better as possible.
                    Utilize different camera angles, techniques, shots in the image prompts, just like professional ad shots.
                    The script and image prompts output by you should be strictly in this below format, the script for each scene and image prompt for each scene should have title as mentioned below: \n\n"
                    f"Scene 1:\n{{Scene 1 script}}\n\nImage Prompt 1:\n{{Image Prompt for Scene 1}}\n\n"
                    f"Scene 2:\n{{Scene 2 script}}\n\nImage Prompt 2:\n{{Image Prompt for Scene 2}}\n\n"
                    f"Continue in this format for all scenes based on the script length."}
                    """
                },

                    #- Keep the ad script concise but compelling, ensuring it fits within the duration limits provided (e.g., 30 or 60 seconds).
                    #- The ad script should include detailed scene progression, describing camera angles, shots, transitions, and pacing.
                    #Divide the script into 5-second scenes. After each scene, generate a separate detailed image prompt describing the visual elements needed for that scene, the image prompt should should describe the scene so this image prompt will be sent to image generating model . The output should clearly separate each scene and image prompt with the following format: \n\n"
                    

                {"role": "user", "content": f"Based on the following ad script prompt content, write a high-quality ad script: {ad_script_prompt}"}
            ],
            max_tokens=1000,
            temperature=0.7
        )

        ad_script = response_script.choices[0].message.content.strip()
        print(f"Ad Script: {ad_script}")


                  # Process the script and image prompts
        response_data = {}
        sections = ad_script.split('\n\n')  # Split content by double newline
        scene_count = 1

        # Loop through each scene and image prompt pair
        for i in range(0, len(sections), 2):
            if i < len(sections) and sections[i].startswith(f"Scene {scene_count}"):
             # Extract and clean the Scene script
                response_data[f"scene_{scene_count}_script"] = sections[i].replace(f'Scene {scene_count}:', '').strip()
            if i + 1 < len(sections) and sections[i + 1].startswith(f"Image Prompt {scene_count}"):
              # Extract and clean the Image Prompt
                response_data[f"scene_{scene_count}_image_prompt"] = sections[i + 1].replace(f'Image Prompt {scene_count}:', '').strip()
            scene_count += 1


        



  





        # Now start the image generation using the extracted image prompts
        image_files = {}
        for scene_count in range(1, len(response_data) // 2 + 1):
            image_prompt_key = f"scene_{scene_count}_image_prompt"
            if image_prompt_key in response_data:
                image_prompt = response_data[image_prompt_key]
                print(f"Sending Image Prompt for Scene {scene_count}: {image_prompt}")
                
                # Call the function to generate the image
                image_filename = generate_image_from_flux(image_prompt, scene_count)
                
                # Store the generated image filename
                if image_filename:
                    image_files[f"scene_{scene_count}_image"] = image_filename

                # Adding a delay to avoid overwhelming the API (optional)
                time.sleep(2)

        print("All generated image files:", image_files)




        # Step 4: CONVERT SCRIPT TO SPEECH (USING ELEVEN LABS)
        audio_files = {}
        for scene_count in range(1, len(response_data) // 2 + 1):
            script_key = f"scene_{scene_count}_script"
            if script_key in response_data:
                scene_script = response_data[script_key]
                print(f"Sending script for Scene {scene_count} to Eleven Labs for voice generation.")
                
                # Call the Eleven Labs API to convert text to speech
                audio_filename = generate_speech_from_eleven_labs(scene_script, scene_count)
                
                if audio_filename:
                    audio_files[f"scene_{scene_count}_audio"] = audio_filename

        print("All generated audio files:", audio_files)



        # Return the full response
        return {
            "refined_ad": refined_text,
            "ad_script": response_data,
            "generated_images": image_files,
            "generated_audio": audio_files
        }

    except Exception as e:
        print(f"Error generating ad script or images: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate ad script and images, or audio.")






# Function to generate an image using Hyperbolic Flux model
def generate_image_from_flux(image_prompt, scene_number):
    url = "https://api.hyperbolic.xyz/v1/image/generation"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJpYW5hc3NhZ2FyQGdtYWlsLmNvbSJ9.51t6Z8ZHmoDC_tyxt3T12GEj8jaa9oaLpucZtQBcviU"  # Replace with your actual API key
       # "Authorization": "Bearer YOUR_API_KEY"  # Replace with your actual API key

    }
    data = {
        "model_name": "FLUX.1-dev",
        "prompt": image_prompt,
        "steps": 50,
        "cfg_scale": 5,
        "enable_refiner": False,
        "height": 1024,
        "width": 1024,
        "backend": "auto"
    }

    try:
        # Send POST request to the API
        response = requests.post(url, headers=headers, json=data)

        # Handle the response
        if response.status_code == 200:
            # Extract the base64-encoded image from the response
            image_data = response.json()["images"][0]["image"]
            image_filename = f"scene_{scene_number}_image.png"
            
            # Decode and save the image locally
            with open(image_filename, "wb") as img_file:
                img_file.write(base64.b64decode(image_data))
            
            print(f"Image for Scene {scene_number} generated and saved as {image_filename}")
            return image_filename
        else:
            print(f"Error generating image for Scene {scene_number}: {response.status_code}")
            print(response.json())
            return None

    except Exception as e:
        print(f"Exception while generating image for Scene {scene_number}: {str(e)}")
        return None





        # Function to generate speech using Eleven Labs API
def generate_speech_from_eleven_labs(script, scene_number):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVEN_LABS_VOICE_ID}"
    headers = {
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_LABS_API_KEY
    }
    data = {
        "text": script,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }

    try:
        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 200:
            audio_filename = f"scene_{scene_number}_audio.mp3"
            
            # Save the audio response
            with open(audio_filename, "wb") as audio_file:
                audio_file.write(response.content)
            
            print(f"Audio for Scene {scene_number} generated and saved as {audio_filename}")
            return audio_filename
        else:
            print(f"Error generating audio for Scene {scene_number}: {response.status_code}")
            print(response.json())
            return None

    except Exception as e:
        print(f"Exception while generating audio for Scene {scene_number}: {str(e)}")
        return None



# For testing, run the app using the command below:
# uvicorn main:app --reload







