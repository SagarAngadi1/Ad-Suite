// src/pages/ProductPhotography.js
import { useEffect, useState} from 'react';
import { parseCookies } from 'nookies';
import fetchCurrentUser from '../../utils/fetchCurrentUser';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios'; // Import axios
import { useRouter } from 'next/router'; // Correct import




const ProductPhotography = ({ currentUser }) => {
  const [user, setUser] = useState(currentUser);
  const [inputDetails, setInputDetails] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null); // Preview for product photo
  const [referenceImage, setReferenceImage] = useState(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState(null); // Preview for reference photo
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);  //was not here
  const router = useRouter(); // Now useRouter is defined
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [progress, setProgress] = useState(0); // Progress bar state


  useEffect(() => {
    if (!currentUser) {
      const fetchUser = async () => {
        const res = await fetch('/api/fetchCurrentUser', {
          headers: {
            'Authorization': `Bearer ${parseCookies().token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      };

      fetchUser();
    }
  }, [currentUser]);

  const addCredits = () => {
    // Navigate to index.js with a query parameter 'scrollToPricing'
    router.push({
      pathname: '/',
      query: { scrollToPricing: 'true' },
    });
  };



  // Handle image upload for product photo and show preview
  const handleProductImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
    setProductImage(file);
    setProductImagePreview(reader.result); // Preview image after reading it
    };
    reader.readAsDataURL(file);
  };



  // Handle image upload for reference photo and show preview
  const handleReferenceImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;


    const reader = new FileReader();
    reader.onloadend = () => {
    setReferenceImage(file);
    setReferenceImagePreview(reader.result); // Preview image after reading it
    };
    reader.readAsDataURL(file);
  };




  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      // Redirect to SignUp.js if user is not authenticated
      router.push('/signup');
      return;
    }

    if (user.credits < 50) {
      alert('You need at least 50 credits to generate a product photo.');
      return;
    }

    // Check if all inputs are empty
    if (!inputDetails && !productImage && !referenceImage) {
      alert('Nothing to submit. Please give something to submit.');
      return;
    }

    // Check if neither productImage nor referenceImage is selected
    if (!productImage && !referenceImage) {
       alert('Please select either a product photo or a reference photo.');
       return;
    }


    setProgress(0); // Reset progress to 0
    // Simulate progress bar increment
    let interval;
    interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5; // Increment progress by 5%
      });
    }, 500); // Progress will increase every 1000ms



    // Prepare form data
    const formData = new FormData();
    formData.append("inputDetails", inputDetails);
    if (productImage) { formData.append("productImage", productImage);  }
    if (referenceImage) { formData.append("referenceImage", referenceImage); }
    formData.append("userId", user._id); 

    // Set loading state to true when submission starts
    setIsLoading(true);

    try {
      const res = await fetch('/api/savePhotography', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      // Set loading state to false after receiving the response
      setIsLoading(false);

      if (res.ok) {
      const generatedPhoto = data.generatedProductPhoto;
      //const generatedImagePath = `http://127.0.0.1:8000/product_images/${generatedPhoto}?t=${new Date().getTime()}`;
      
      const generatedImagePath = data.generatedProductPhotoURL
      setGeneratedImageUrl(generatedImagePath);

   
        //alert('Product Photography Data stored successfully!');
        console.log('Data saved successfully:', data);
        console.log('generatedImage:', generatedImagePath);
      } else {
        throw new Error('Failed to store data');
      }

    } catch (error) {
      console.error('Error creating photography data:', error);
      alert('Failed to Store Data: ' + error.message);
    }
  };



  // Axios method to download image as a blob
  const downloadImage = async () => {
    try {

      if (!generatedImageUrl) {
        alert("Image URL not available for download.");
        return;
      }

      console.log('Attempting to download image from URL:', generatedImageUrl); 
      const response = await axios.get(generatedImageUrl, {
        responseType: 'blob',  // Set response type to 'blob'
      });

      console.log('Image download response:', response); 

      // Create a link element, use it to download the image
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'generated-product-photo.jpg'); // Filename for the download
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up the element
    } catch (error) {
      console.error('Error downloading the image:', error);
      alert('Failed to download the image');
    }
  };


  
  

  


 

  
  


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col items-center">
      
      <Head>
        <title>Create Studio Level Product Photography - AdSuite</title>
        <meta name="description" content="Create professional studio-level product photography effortlessly using AdSuite." />
        <meta name="keywords" content="Product photography, Studio level, AdSuite, Professional images, AI photography, Ads" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/logo_newblue.png" />
        {/* Open Graph Meta Tags for better social sharing */}
        <meta property="og:title" content="Create professional studio-level product photography effortlessly using AdSuite." />
        <meta property="og:description" content="Create professional studio-level product photography effortlessly using AdSuite." />
        <meta property="og:image" content="/logo_newblue.png" />
        <meta property="og:url" content="https://adsuite.org/CreateProductPhoto" />
        <meta property="og:type" content="product" />
        {/* Structured Data (JSON-LD) for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Studio Level Product Photography",
            "image": "https://adsuite.org/logo_newblue.png",
            "description": "Create professional-level product photography using AdSuite's AI-powered tools.",
            "brand": "AdSuite",
            "offers": {
              "@type": "Offer",
              "url": "https://adsuite.org/CreateProductPhoto",
              "priceCurrency": "USD",
              "price": "19",
              "availability": "https://schema.org/InStock"
            }
          })}
        </script>
      </Head>


      <header className="w-full bg-white  shadow-md">
        <nav className="container mx-auto px-0 py-2">
         <div className="flex-row space-y-2  justify-between items-center sm:flex">

         <div className="flex-2 items-center ms-4 lg:-ms-20">
          <h1 className="text-lg sm:text-2xl font-bold text-purple-600 -ms-2">Product Photography</h1>  {/* Use <h1> for page title */}
        </div>

        {user ? (
           <div className="flex space-x-4 items-center me-2 lg:-me-24 ">
           {/* Credits Display */}
           <div className="flex items-center border border-purple-500 rounded-2xl py-1 px-1 ms-0.5">
           <span className="text-purple-500 font-bold text-xs sm:text-sm">{user.credits}</span> 
             {/* <span className="text-purple-500 font-bold">150</span> Set the dynamic value here */}
              <button className="bg-purple-500 text-white text-xs sm:text-sm ml-0.5 py-1 px-2 font-bold rounded-2xl  hover:bg-purple-700 transition duration-300 ms-4"onClick={addCredits}>
              Credits
              </button>
           </div>
 
           {/* User Email */}
           <p className="bg-purple-500 text-white text-xs px-2 py-2 sm:text-sm  sm:px-3 sm:font-bold rounded-full hover:bg-purple-700 transition duration-300">
             {user.email}
           </p>
         </div>
        ) : (
          <div className="flex space-x-1 md:space-x-2  lg:-me-24">

            <Link href="/login">
              <button className="bg-purple-500 text-white text-xs py-1.5 px-2 md:py-2 md:px-4 md:font-bold rounded-xl md:text-sm md:rounded-2xl  hover:bg-purple-700 transition duration-300 ms-2 md:ms-4">
                Login
              </button>
            </Link>

            <Link href="/signup">
              <button className="bg-purple-500 text-white text-xs py-1.5 px-2 md:py-2 md:px-4 md:font-bold rounded-xl md:text-sm md:rounded-2xl hover:bg-purple-700 transition duration-300 ms-2 md:ms-4">
                Sign Up
              </button>
            </Link>
          </div>
        )}

      </div>
      </nav>

    
      </header>





      <main className="w-full flex flex-col flex-1 p-6 bg-gradient-to-br from-purple-50 to-indigo-100">

           {/* Display the generated image and download button */}
      {generatedImageUrl && (
        //<div className="relative w-1/2 mx-auto rounded-lg flex flex-col items-center mt-0 mb-8 p-2">
        <div className="relative w-full md:w-1/2 mx-auto rounded-lg flex flex-col items-center mt-8 mb-8 p-2">
          <h2 className="text-slate-500 font-semibold mb-2">Generated Product Photo:</h2>
          <div className="relative w-4/5 max-w-lg h-auto">
          <img
              src={generatedImageUrl}
              alt="Generated Product Photography"
              className="w-full h-auto rounded-lg"
              width={500} height={300}
            />

            {/* Download Icon */}
            <button
              onClick={downloadImage}  // Call the downloadImage function
              className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-200 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
        </div>
      )}


           {/* Progress Bar */}
           {isLoading && (
               <div className="w-full bg-gray-200 h-2 mt-4 relative">
                <div
                   className="bg-purple-500 h-full absolute left-0"
                   style={{ width: progress + '%' }}  // Progress percentage
                ></div>
                </div>
                )}



        {/* <div className="w-full p-1 flex flex-row flex-grow rounded-lg bg-transparent"> original one*/} 
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 rounded-lg bg-transparent">
        {/* <div className="w-full flex flex-col md:flex-row md:flex-grow gap-6 rounded-lg bg-transparent"> kinda of working that makes elements grow in large size, add md:w-1/3 to all the three elements */}




          {/* Product Image Upload Block */}
          <div className="bg-white rounded-lg p-3 flex flex-col flex-grow justify-between">
          {/* <div className="w-1/3 me-6 bg-white rounded-lg p-3 flex flex-col  flex-grow justify-between"></div> */}
            
            <label className="block text-sm font-bold text-slate-500 sm:mb-2 sm:mt-4 sm:ms-4">A. Upload Product Photo:</label>
            
             {/* Product Image Preview */}
             {productImagePreview && (
              <div className="w-full h-full mt-4 flex justify-center items-center">
                <img src={productImagePreview} alt="Product Preview"
                 className="w-full h-full object-cover rounded-md shadow" />
              </div>
            )}



            <div className="relative h-1/2 w-full max-w-xs mx-auto mt-6 mb-4">

              <input
                type="file"
                accept="image/*"
                onChange={handleProductImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="flex items-center justify-center h-10 w-full p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition">
                <img
                  src="/upload_icon.png"
                  alt="Upload Icon"
                  className="w-5 h-5 mr-2"
                />
                <span className="font-semibold text-gray-500">Upload Product Photo</span>
              </div>
            </div>


          </div>





          {/* Reference Image Upload Block */}
          <div className=" bg-white rounded-lg p-3 flex flex-col justify-between">
          {/* <div className="w-1/3 me-6 bg-white rounded-lg p-3 flex flex-col flex-grow justify-between"> */}


            <label className="block text-sm font-bold text-slate-500 sm:mb-2 sm:mt-4 sm:ms-4">B. Upload Reference Photo:</label>
            
            {/* Reference Image Preview */}
            {referenceImagePreview && (
              <div className="w-full h-full mt-4 flex justify-center items-center">
                <img src={referenceImagePreview} alt="Reference Preview"
                 className="w-full h-full object-cover rounded-md shadow" />
              </div>
            )}
            

            
            <div className="relative h-1/2 w-full max-w-xs mx-auto mt-6 mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleReferenceImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center w-full h-10 p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition">
                <img
                  src="/upload_icon.png"
                  alt="Upload Icon"
                  className="w-5 h-5 mr-2"
                />
                <span className="font-semibold text-gray-500">Upload Reference Photo</span>
              </div>
            </div>

            
          </div>




          {/* Input Details Block */}
          <div className=" bg-white rounded-lg p-3 flex flex-col  justify-between">

            <label className="block text-sm font-bold text-slate-500 sm:mb-2 sm:mt-4 sm:ms-4">C. Any details or inputs you want to add? (Optional):</label>
            
            <textarea
              className="w-full h-full p-4 mb-4 border border-gray-200 rounded-xl bg-white shadow-sm mt-2"
              placeholder="You can include any additional inputs like, nature, color, tone, style of your product photography."
              value={inputDetails}
              onChange={(e) => {
              //  setProductDescription(e.target.value);
                setInputDetails(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              rows={4}
              style={{ minHeight: '6rem' }}
              required
            />
          </div>

          {/* <button
            type="submit"
            className="bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-3xl self-end hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Create Photography
          </button> */}


        </div>
{/* Button below the div */}
   <div className="w-full flex justify-end mt-3 mb-0 h-auto"> {/* Container for the button */}
     <button
      type="submit"
      className={`bg-purple-500 text-white text-sm font-bold py-2 px-4 rounded-3xl hover:bg-purple-700 transition duration-300 ${
       isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={handleSubmit}
      disabled={isLoading} // Disable button during loading
      >
      {isLoading ? 'Creating Photography...' : 'Create Photography'}
    </button>
    </div>



          
      </main>
    </div>
  );
};

export async function getServerSideProps(context) {
  const currentUser = await fetchCurrentUser(context.req);

  return {
    props: {
      currentUser: currentUser ? JSON.parse(JSON.stringify(currentUser)) : null,
    },
  };
}

export default ProductPhotography;

