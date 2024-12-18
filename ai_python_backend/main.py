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
import boto3  #Import boto3 for S3 interaction
from botocore.exceptions import NoCredentialsError
#import logging
#import replicate
import json
import random




load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    #allow_origins=["http://localhost:3000"],  # You can also set to ["*"] to allow all origins #THE ISSUE IS HERE
    allow_origins=["*"],  # You can also set to ["*"] to allow all origins #THE ISSUE IS HERE
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Initialize OpenAI async client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

#logging.basicConfig(level=logging.DEBUG)

baseten_api_key = os.getenv("BASETEN_API_KEY")
model_id = os.getenv("BASETEN_MODEL_ID")

if not baseten_api_key or not model_id:
    raise EnvironmentError("Missing Baseten API Key or Model ID in environment variables")




#replicate_api_token = os.getenv('REPLICATE_API_TOKEN') 

# if not replicate_api_token:
#     raise EnvironmentError("REPLICATE_API_TOKEN not found in environment variables")

# Eleven Labs API key
ELEVEN_LABS_API_KEY = os.getenv("ELEVEN_LABS_API_KEY")
ELEVEN_LABS_VOICE_ID = os.getenv("ELEVEN_LABS_VOICE_ID", "Your_Default_Voice_ID")  # Default voice ID

comfyui_api_token = os.getenv('COMFYUI_API_TOKEN')

COMFYUI_API_URL = "https://api.comfyonline.app/api/run_workflow"

# Directory to store product images 
image_directory = "product_images"

# Serve the product images from this directory
#app.mount("/product_images", StaticFiles(directory=image_directory), name="product_images") #REMOVED NOW TO WORK IN PRODUCTION



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





def upload_to_s3(file_buffer, file_name):

    # Initialize the boto3 S3 client
    s3 = boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_REGION')
    )

    bucket_name = os.getenv('S3_BUCKET_NAME')

    # Define the S3 upload parameters
    params = {
        'Bucket': bucket_name,
        'Key': file_name,
        'Body': file_buffer,  # The actual image buffer (content).
        'ContentType': 'image/jpeg',  # Adjust based on the file type
        #'ACL': 'public-read'  # Optional: Make the file publicly accessible
    }

    try:
        # Upload the buffer to S3 using put_object
        response = s3.put_object(**params)

        # Check if the response is successful
        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            s3_url = f"https://{bucket_name}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{file_name}"
            print(f"Generated S3 url: {s3_url}")
            return s3_url
        else:
            raise HTTPException(status_code=500, detail="Failed to upload file to S3")

    except Exception as e:
        print(f"Error uploading file to S3: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred during the S3 upload.")





    # Helper function to encode image to base64 THIS WAS PRESENT EARLIER
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

    # THESE WERE HERE EARLIER
    product_photo_url = request.product_photo_url
    reference_photo_url = request.reference_photo_url
    input_details = request.input_details

    print(f"Received product photo URL: {product_photo_url}")
    print(f"Received reference photo URL: {reference_photo_url}")
    print(f"Received input details: {input_details}")



    try:
        # Convert image urls to base64 THIS WAS HERE EARLIER, because we need to send the base64 format to got
        product_photo_base64 = image_to_base64(product_photo_url) if product_photo_url else None
        reference_photo_base64 = image_to_base64(reference_photo_url) if reference_photo_url else None

        # Prepare the messages list
        messages = []

        # Logic when both product photo and reference photo are present //THIS WAS EARLIER
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
        elif reference_photo_url: #THIS WAS EARLIER
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
            model="gpt-4o",  
            messages=messages,
            max_tokens=1000
        )

        # Get the result from GPT-4o
        gpt4o_result = response.choices[0].message.content.strip()
        print(f"GPT-4o Vision Result: {gpt4o_result}")

        product_photo_filename = generate_product_photo(gpt4o_result, product_photo_url)





        if product_photo_filename:
            print(f"Product photography saved as toop: {product_photo_filename}")
            # Assuming the file is saved locally, get the file path and name ADDED FROM CHATGPT

            #problem starts from below line
            file_path = os.path.join(image_directory, product_photo_filename)
            print(f"file_path2: {file_path}")


            
            # Read the file content into a buffer
            with open(file_path, "rb") as image_file:
             image_buffer = image_file.read()

            s3_url = upload_to_s3(image_buffer, product_photo_filename)

            print(f"Generated photo url: {s3_url}")

            # Upload the file to S3 and get the S3 URL
            

        else:
            print("Failed to generate product photography.")

            
        # return {"gpt4o_result": gpt4o_result,
        #         "Generated_Product_Photo": product_photo_filename, "Generated_Product_Photo_URL": s3_url}
        return {"gpt4o_result": gpt4o_result, "Generated_Product_Photo_URL": s3_url} #HERE JUST ADD replicate url
    
  
    except Exception as e:
        print(f"Error processing images with GPT-4o: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request")
    





def generate_product_photo(image_prompt, product_photo_url):
    try:

        payload = {
            "input": {
                "CLIPTextEncode_text_4": image_prompt,  # The prompt for the product photo
                "LoadImage_image_7": product_photo_url,  # The input product photo URL
                "CLIPTextEncode_text_13": "",
                "CLIPTextEncode_text_37": "",
                "CLIPTextEncode_text_38": "",
                "CLIPTextEncode_text_55": "",
                "CLIPTextEncode_text_56": ""
            },
            "workflow_id": "4b636913-b7b2-4866-b5aa-b034c2625430",  # Replace with your workflow_id
             #"webhook": ""  # Optional: Provide a webhook URL if you want async results
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {comfyui_api_token}"
        }

        response = requests.post(COMFYUI_API_URL, headers=headers, json=payload)

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to start ComfyUI workflow")

        response_json = response.json()
        task_id = response_json.get("data", {}).get("task_id")

        if not task_id:
            raise HTTPException(status_code=500, detail="Task ID not received from API")

        # Step 3: Poll the webhook response or task status
        print(f"Task ID: {task_id} - Waiting for output...")

        output_url_list = None
        for _ in range(150):  # Retry for ~30 seconds
            status_response = requests.get(
                f"https://api.comfyonline.app/api/task_status/{task_id}",
                headers=headers
            )

            if status_response.status_code != 200:
                raise HTTPException(status_code=500, detail="Failed to get task status")

            status_json = status_response.json()
            status = status_json.get("status")

            if status == "COMPLETED":
                output_url_list = status_json.get("output", {}).get("output_url_list")
                break
            elif status == "ERROR":
                raise HTTPException(status_code=500, detail="Task failed with error status")

            time.sleep(2)  # Wait for 2 seconds before polling again

        if not output_url_list or not output_url_list[0]:
            raise HTTPException(status_code=500, detail="Output image URL not received")

        # Step 4: Download and save the generated image
        output_image_url = output_url_list[0]
        image_response = requests.get(output_image_url)

        if image_response.status_code == 200:
            output_file_path = "generated_image.png"
            with open(output_file_path, "wb") as img_file:
                img_file.write(image_response.content)
            print(f"Image saved locally as: {output_file_path}") 
            return output_file_path  # Return only the local file path   
            #return {"message": "Image generated successfully", "image_path": output_file_path}
        else:
            raise HTTPException(status_code=500, detail="Failed to download the generated image")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


    





# def generate_product_photo(image_prompt, product_photo_url):
#     try:
#         # Prepare payload for Baseten API call
#         values = {
#             "positive_prompt": "Create a high-quality, studio-level product photograph featuring",
#             "negative_prompt": "blurry, low quality",
#             "image_input": product_photo_url,
#             "seed": random.randint(1, 1000000)
#             #"seed": request.seed
#         }

#         # Make API request to Baseten model
#         response = requests.post(
#             f"https://model-4w5jm7r3.api.baseten.co/deployment/qz0dl83/predict",
#             #f"https://model-{model_id}.api.baseten.co/development/predict",
#             headers={"Authorization": f"Api-Key {baseten_api_key}"},
#             json={"workflow_values": values}
#         )

#         # Handle response
#         if response.status_code == 200:
#             res_json = response.json()
#             preamble = "data:image/png;base64,"
#             output_image = base64.b64decode(res_json["result"][1]["image"].replace(preamble, ""))

#             # Save image locally (optional)
#             output_file_path = "generated_image.png"
#             with open(output_file_path, 'wb') as img_file:
#                 img_file.write(output_image)

#             # Return response with success message
#             return {"message": "Image generated successfully", "image_path": output_file_path}
#         else:
#             raise HTTPException(status_code=500, detail="Model API call failed")

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))    
  










# def generate_product_photo(image_prompt, product_photo_url):
#     # Escaping quotes in the image_prompt to prevent JSON format issues
#     safe_image_prompt = image_prompt.replace('"', '\\"')
#     safe_product_photo_url = product_photo_url.replace('"', '\\"')


#     # Create the input data JSON safely with escaped image_prompt
#     workflow_json = {
#   "1": {
#     "inputs": {
#       "value": 1536
#     },
#     "class_type": "INTConstant"
#   },
#   "2": {
#     "inputs": {
#       "value": 1024
#     },
#     "class_type": "INTConstant"
#   },
#   "3": {
#     "inputs": {
#       "image": safe_product_photo_url,
#       "upload": "image"
#     },
#     "class_type": "LoadImage"
#   },
#   "4": {
#     "inputs": {
#       "sam_model": "sam_vit_h (2.56GB)",
#       "grounding_dino_model": "GroundingDINO_SwinT_OGC (694MB)",
#       "threshold": 0.3,
#       "detail_method": "GuidedFilter",
#       "detail_erode": 6,
#       "detail_dilate": 6,
#       "black_point": 0.15,
#       "white_point": 0.99,
#       "process_detail": True,
#       "prompt": "subject",
#       "device": "cuda",
#       "max_megapixels": 2,
#       "image": [
#         "3",
#         0
#       ]
#     },
#     "class_type": "LayerMask: SegmentAnythingUltra"
#   },
#   "5": {
#     "inputs": {
#       "images": [
#         "4",
#         0
#       ]
#     },
#     "class_type": "PreviewImage"
#   },
#   "7": {
#     "inputs": {
#       "invert_mask": True,
#       "blend_mode": "normal",
#       "opacity": 100,
#       "x_percent": 50,
#       "y_percent": 65,
#       "mirror": "None",
#       "scale": 0.32,
#       "aspect_ratio": 1,
#       "rotate": 0,
#       "transform_method": "lanczos",
#       "anti_aliasing": 0,
#       "background_image": [
#         "8",
#         0
#       ],
#       "layer_image": [
#         "4",
#         0
#       ],
#       "layer_mask": [
#         "10",
#         3
#       ]
#     },
#     "class_type": "LayerUtility: ImageBlendAdvance V2"
#   },
#   "8": {
#     "inputs": {
#       "panel_width": [
#         "1",
#         0
#       ],
#       "panel_height": [
#         "2",
#         0
#       ],
#       "fill_color": "custom",
#       "fill_color_hex": [
#         "10",
#         1
#       ]
#     },
#     "class_type": "CR Color Panel"
#   },
#   "9": {
#     "inputs": {
#       "images": [
#         "8",
#         0
#       ]
#     },
#     "class_type": "PreviewImage"
#   },
#   "10": {
#     "inputs": {
#       "mode": "main_color",
#       "color_of": "mask",
#       "remove_bkgd_method": "none",
#       "invert_mask": False,
#       "mask_grow": 0,
#       "image": [
#         "4",
#         0
#       ],
#       "mask": [
#         "4",
#         1
#       ]
#     },
#     "class_type": "LayerUtility: GetColorToneV2"
#   },
#   "11": {
#     "inputs": {
#       "images": [
#         "7",
#         0
#       ]
#     },
#     "class_type": "PreviewImage"
#   },
#   "15": {
#     "inputs": {
#       "mask": [
#         "7",
#         1
#       ]
#     },
#     "class_type": "InvertMask"
#   },
#   "17": {
#     "inputs": {
#       "ckpt_name": "flux1-dev-fp8.safetensors"
#     },
#     "class_type": "CheckpointLoaderSimple"
#   },
#   "18": {
#     "inputs": {
#       "text": safe_image_prompt,
#       "clip": [
#         "17",
#         1
#       ]
#     },
#     "class_type": "CLIPTextEncode"
#   },
#   "19": {
#     "inputs": {
#       "text": "",
#       "clip": [
#         "17",
#         1
#       ]
#     },
#     "class_type": "CLIPTextEncode"
#   },
#   "20": {
#     "inputs": {
#       "positive": [
#         "18",
#         0
#       ],
#       "negative": [
#         "19",
#         0
#       ],
#       "vae": [
#         "17",
#         2
#       ],
#       "pixels": [
#         "7",
#         0
#       ],
#       "mask": [
#         "15",
#         0
#       ]
#     },
#     "class_type": "InpaintModelConditioning"
#   },
#   "21": {
#     "inputs": {
#       "guidance": 3.5,
#       "conditioning": [
#         "20",
#         0
#       ]
#     },
#     "class_type": "FluxGuidance"
#   },
#   "22": {
#     "inputs": {
#       "seed": 694440766939451,
#       "steps": 25,
#       "cfg": 1,
#       "sampler_name": "euler",
#       "scheduler": "beta",
#       "denoise": 1,
#       "model": [
#         "17",
#         0
#       ],
#       "positive": [
#         "21",
#         0
#       ],
#       "negative": [
#         "20",
#         1
#       ],
#       "latent_image": [
#         "20",
#         2
#       ]
#     },
#     "class_type": "KSampler"
#   },
#   "23": {
#     "inputs": {
#       "samples": [
#         "22",
#         0
#       ],
#       "vae": [
#         "17",
#         2
#       ]
#     },
#     "class_type": "VAEDecode"
#   },
#   "24": {
#     "inputs": {
#       "images": [
#         "23",
#         0
#       ]
#     },
#     "class_type": "PreviewImage"
#   },
#   "129": {
#     "inputs": {
#       "mask": [
#         "15",
#         0
#       ]
#     },
#     "class_type": "MaskPreview+"
#   },
#   "130": {
#     "inputs": {
#       "mask": [
#         "4",
#         1
#       ]
#     },
#     "class_type": "LayerMask: MaskPreview"
#   },
#   "135": {
#     "inputs": {
#       "ckpt_name": "realisticVisionV60B1_v51HyperVAE.safetensors"
#     },
#     "class_type": "CheckpointLoaderSimple"
#   },
#   "136": {
#     "inputs": {
#       "vae_name": "vae-ft-mse-840000-ema-pruned.safetensors"
#     },
#     "class_type": "VAELoader"
#   },
#   "137": {
#     "inputs": {
#       "text": "",
#       "clip": [
#         "135",
#         1
#       ]
#     },
#     "class_type": "CLIPTextEncode"
#   },
#   "138": {
#     "inputs": {
#       "text": "nsfw, blur, worst quality, bad quality, low quality\n",
#       "clip": [
#         "135",
#         1
#       ]
#     },
#     "class_type": "CLIPTextEncode"
#   },
#   "140": {
#     "inputs": {
#       "pixels": [
#         "23",
#         0
#       ],
#       "vae": [
#         "136",
#         0
#       ]
#     },
#     "class_type": "VAEEncode"
#   },
#   "141": {
#     "inputs": {
#       "multiplier": 0.18215,
#       "positive": [
#         "137",
#         0
#       ],
#       "negative": [
#         "138",
#         0
#       ],
#       "vae": [
#         "136",
#         0
#       ],
#       "foreground": [
#         "140",
#         0
#       ]
#     },
#     "class_type": "ICLightConditioning"
#   },
#   "142": {
#     "inputs": {
#       "seed": 0,
#       "steps": 25,
#       "cfg": 1.5,
#       "sampler_name": "dpmpp_2m",
#       "scheduler": "karras",
#       "denoise": 1,
#       "model": [
#         "144",
#         0
#       ],
#       "positive": [
#         "141",
#         0
#       ],
#       "negative": [
#         "141",
#         1
#       ],
#       "latent_image": [
#         "143",
#         0
#       ]
#     },
#     "class_type": "KSampler"
#   },
#   "143": {
#     "inputs": {
#       "pixels": [
#         "147",
#         0
#       ],
#       "vae": [
#         "136",
#         0
#       ]
#     },
#     "class_type": "VAEEncode"
#   },
#   "144": {
#     "inputs": {
#       "model_path": "iclight_sd15_fc_unet_ldm.safetensors",
#       "model": [
#         "135",
#         0
#       ]
#     },
#     "class_type": "LoadAndApplyICLightUnet"
#   },
#   "145": {
#     "inputs": {
#       "lama_model": "lama",
#       "device": "cuda",
#       "invert_mask": False,
#       "mask_grow": 25,
#       "mask_blur": 8,
#       "image": [
#         "23",
#         0
#       ],
#       "mask": [
#         "7",
#         1
#       ]
#     },
#     "class_type": "LayerUtility: LaMa"
#   },
#   "146": {
#     "inputs": {
#       "shadow_brightness": 3,
#       "shadow_saturation": 1,
#       "shadow_hue": 0,
#       "shadow_level_offset": 0,
#       "shadow_range": 0.25,
#       "highlight_brightness": 1,
#       "highlight_saturation": 1,
#       "highlight_hue": 0,
#       "highlight_level_offset": 0,
#       "highlight_range": 0.25,
#       "image": [
#         "145",
#         0
#       ]
#     },
#     "class_type": "LayerColor: Color of Shadow & Highlight"
#   },
#   "147": {
#     "inputs": {
#       "blur": 10
#     },
#     "class_type": "LayerFilter: GaussianBlur"
#   },
#   "148": {
#     "inputs": {
#       "images": [
#         "145",
#         0
#       ]
#     },
#     "class_type": "PreviewImage"
#   },
#   "149": {
#     "inputs": {
#       "images": [
#         "146",
#         0
#       ]
#     },
#     "class_type": "PreviewImage"
#   },
#   "150": {
#     "inputs": {
#       "images": [
#         "147",
#         0
#       ]
#     },
#     "class_type": "PreviewImage"
#   },
#   "151": {
#     "inputs": {
#       "samples": [
#         "142",
#         0
#       ],
#       "vae": [
#         "136",
#         0
#       ]
#     },
#     "class_type": "VAEDecode"
#   },
#   "152": {
#     "inputs": {
#       "images": [
#         "151",
#         0
#       ]
#     },
#     "class_type": "PreviewImage"
#   },
#   "153": {
#     "inputs": {
#       "ckpt_name": "flux1-schnell-fp8.safetensors"
#     },
#     "class_type": "CheckpointLoaderSimple"
#   },
#   "154": {
#     "inputs": {
#       "text": safe_image_prompt,
#       "clip": [
#         "153",
#         1
#       ]
#     },
#     "class_type": "CLIPTextEncode"
#   },
#   "155": {
#     "inputs": {
#       "text": "",
#       "clip": [
#         "153",
#         1
#       ]
#     },
#     "class_type": "CLIPTextEncode"
#   },
#   "156": {
#     "inputs": {
#       "guidance": 3.5,
#       "conditioning": [
#         "154",
#         0
#       ]
#     },
#     "class_type": "FluxGuidance"
#   },
#   "157": {
#     "inputs": {
#       "seed": 77,
#       "steps": 20,
#       "cfg": 1,
#       "sampler_name": "euler",
#       "scheduler": "beta",
#       "denoise": 0.35,
#       "model": [
#         "153",
#         0
#       ],
#       "positive": [
#         "156",
#         0
#       ],
#       "negative": [
#         "155",
#         0
#       ],
#       "latent_image": [
#         "158",
#         0
#       ]
#     },
#     "class_type": "KSampler"
#   },
#   "158": {
#     "inputs": {
#       "pixels": [
#         "151",
#         0
#       ],
#       "vae": [
#         "153",
#         2
#       ]
#     },
#     "class_type": "VAEEncode"
#   },
#   "159": {
#     "inputs": {
#       "samples": [
#         "157",
#         0
#       ],
#       "vae": [
#         "153",
#         2
#       ]
#     },
#     "class_type": "VAEDecode"
#   },
#   "160": {
#     "inputs": {
#       "images": [
#         "159",
#         0
#       ]
#     },
#     "class_type": "PreviewImage"
#   },
#   "161": {
#     "inputs": {
#       "keep_high_freq": 64,
#       "erase_low_freq": 32,
#       "mask_blur": 16,
#       "image": [
#         "159",
#         0
#       ],
#       "detail_image": [
#         "7",
#         0
#       ],
#       "mask": [
#         "7",
#         1
#       ]
#     },
#     "class_type": "LayerUtility: HLFrequencyDetailRestore"
#   },
#   "165": {
#     "inputs": {
#       "images": [
#         "161",
#         0
#       ]
#     },
#     "class_type": "PreviewImage"
#   }
# }
    
#     input_data = {
#         "workflow_json": json.dumps(workflow_json),  # Serializing to JSON string
#         "output_quality": 80
#     }

#     # Debug: Print input_data to verify JSON is formatted correctly
#     print("Serialized input_data for replicate.run:", input_data)

#     # Run the model on Replicate
#     try:
#         output = replicate.run(

#             "fofr/any-comfyui-workflow:10990543610c5a77a268f426adb817753842697fa0fa5819dc4a396b632a5c15",
#            # "fofr/any-comfyui-workflow:ca6589497a1d31922ec4e2b7c4d17d4a168bc6ac6d0971b2c8c60fc3de0fee4b", #this was earlier
#             input=input_data
#         )
        
#         # Debug: Check if output is None or contains an error
#         if output is None:
#             print("Replicate returned None, likely due to an error in processing the input data.")
#         else:
#             print(f"Generated image URL: {output[0]}")  # Display the generated image URL

#     except Exception as e:
#         print(f"Error running Replicate model: {e}")






















    
    
    




 
























   





































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







