// src/pages/CreateAd.js
import { useEffect, useState } from 'react';
import { parseCookies } from 'nookies';
import fetchCurrentUser from '../../utils/fetchCurrentUser';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';


const CreateAd = ({ currentUser }) => {
  const [user, setUser] = useState(currentUser);
  const [productDescription, setProductDescription] = useState('');  //present
  const [adDetails, setAdDetails] = useState('');
  const [brandImage, setBrandImage] = useState(null);
  const [adDuration, setAdDuration] = useState('15'); // Default duration is 15 seconds

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
      }, [currentUser]
    );


    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      setBrandImage(file);
    };

    const handleDurationChange = (value) => {
      setAdDuration(value); // Update the selected duration in state
    };


    const handleSubmit = async (e) => {
      e.preventDefault();                  //Prevents the default behavior of the form submission (which is to reload the page).

      


      // Prepare form data, we use formData method when we are required to send files
      const formData = new FormData();
      formData.append("productDescription", productDescription); //present
      formData.append("adDetails", adDetails); 
      formData.append("adDuration", adDuration); // Add selected ad duration to form data
      if (brandImage) {
          formData.append("brandImage", brandImage); // Add brand image if any
      }


  
      //FROM HERE TRY BLOCK UNDER FORMDATA METHOD STARTS
      try {
          const res = await fetch('/api/saveAd', {
              method: 'POST',
              body: formData,
            
          });
  
        const data = await res.json();

        if(res.ok){
        alert('Ad Data stored sucessfully!');
        console.log('Ad data saved successfully:', data);

        }else{
          throw new Error('Failed to store data');
           
        }

         

      } catch (error) {
          console.error('Error creating Ad:', error);
          alert('Failed to Store Data: ' + error.message);
      }

    };
  


    const ads = new Array(20).fill(null).map((_, index) => ({
    id: index,
    description: `Description of Ad ${index + 1}`,
    videoSrc: 'path-to-your-placeholder-video.mp4',
  }));

   return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center">
      <Head>
        <title>Create Ad - AdVideo</title>
        <meta name="description" content="Create professional video ads quickly with AdVideo." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="w-full bg-transparent shadow flex justify-between items-center p-4">
        <p className="text-xl font-bold">
          Start creating stunning video ads now.
        </p>


        {user ? (

            <p className="bg-blue-700 text-white text-xs font-bold py-1.5 px-4 rounded-3xl self-end">
            {user.email}
            </p>

        ) : (


      <div className="flex space-x-4">
       <Link href="/login">
         <button className="bg-blue-700 text-white text-xs font-bold py-1.5 px-4 rounded-3xl self-end hover:bg-blue-600">
          Login
         </button>
        </Link>

        <Link href="/signup">
         <button className="bg-blue-700 text-white text-xs font-bold py-1.5 px-4 rounded-3xl self-end hover:bg-blue-600">
          Sign Up
         </button>
        </Link>
     </div>


         

        )}

       
 
      </header>

      <main className="flex w-full flex-1 px-6 py-4">

        {/* Left section for displaying generated ads */}

        <div className="w-1/4 pr-6 overflow-hidden h-screen">

          <div className="overflow-y-auto h-full pr-2 -mr-2">
            
            {ads.map((ad) => (
              <div key={ad.id} className="mb-6">
                <video className="w-full h-48 rounded" controls>
                  <source src={ad.videoSrc} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <p className="mt-2">{ad.description}</p>
              </div>
            ))}
          </div>
        </div>

        

      

        {/* Right section for creating a new ad */}
        <div className="w-3/4 pl-4 flex flex-col items-center space-y-6">

          {/* <video className="w-full h-96 rounded mb-3" controls>

            <source src="path-to-your-placeholder-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.

          </video> */}


          




          {/* <input
            type="file"
            className="mb-2"
            accept="image/*"
            onChange={handleImageUpload}
          /> */}

           



            
           {/* //PRODUCT DESCRIPTION BLOCK  //present */}
          <div className="w-full bg-white rounded-lg p-3">
            <label className="block text-sm font-bold text-slate-400 mb-2 mt-2 ms-1"> A. Product Description:</label>
            <textarea
              className="w-full  p-4 mb-4 border border-gray-200 rounded-xl bg-white shadow-sm"
              placeholder="Describe your product, anything and everything, be as specific as possible. "
              value={productDescription}
              onChange={(e) => {
                setProductDescription(e.target.value);
                e.target.style.height = 'auto';  // Reset height to auto to calculate new height
                e.target.style.height = `${e.target.scrollHeight}px`;  // Set height to match the scroll height
              }}
              rows={4}  // This sets the minimum height (approximately equivalent to `h-36`)
              style={{ minHeight: '6rem' }} 
              required

            /> 

            <div className="flex items-center mt-4 mb-2 text-slate-500">  
            <img
               src="/protip_icon.png" // Replace with the actual path to the user's profile icon
               alt="Protip Icon"
               className="w-5 h-5 rounded-full mb-1"
              />

              <label className="block text-sm font-normal text-slate-500 ms-1"> Pro-tip : You can describe what kind of vibe your product/brand should produce, like calm, relax, energetic, chill, gentle, loving, excitement, etc</label>


            </div>

          </div>  



         




            {/* //Ad Details BLOCK  //present */}
          <div className="w-full bg-white rounded-lg p-3">
            <label className="block text-sm font-bold text-slate-400 mb-2 mt-2 ms-1"> B. &apos;Ad&apos; Specific Details (Optional)</label>
             
           
            <textarea
              className="w-full  p-4 mb-4 border border-gray-200 rounded-xl bg-white shadow-sm"
              placeholder="Any specific details, requirements or inputs for the ad like, how the ad should be or what the ad should express to viewers(optional)"
              value={adDetails}
             // onChange={(e) => setAdDetails(e.target.value)}

              onChange={(e) => {
                setAdDetails(e.target.value);
                e.target.style.height = 'auto';  // Reset height to auto to calculate new height
                e.target.style.height = `${e.target.scrollHeight}px`;  // Set height to match the scroll height
              }}
              rows={4}  // This sets the minimum height (approximately equivalent to `h-36`)
              style={{ minHeight: '6rem' }} 
             // required

            /> 

          
          </div>



          
          



         {/* //Brand/Product logo BLOCK  //present */}
      <div className="w-full bg-white rounded-lg p-3">
             
         <label className="block text-sm font-bold text-slate-400 mb-2 mt-2 ms-1">
         C. Brand/product logo (Optional)</label>

             <div className="relative w-full max-w-xs mx-auto mt-6 mb-4">
                <input
                 type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />




                <div className="flex items-center justify-center w-full p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition">
              
                  <img
                  src="/upload_icon.png" // Replace with the correct path to the upload icon
                  alt="Upload Icon"
                  className="w-5 h-5 mr-2"
                  />
                  <span className="font-semibold text-gray-500">Upload Product/Brand Logo</span>
                </div>



              </div>

              
      </div>







         {/* Ad Duration Selector */}  
        <div className="w-full bg-white rounded-lg p-3">
              <label className="block text-sm font-bold text-slate-400 mb-2 mt-2 ms-1">
                D. Select Ad Duration
              </label>

            <div className="relative w-full max-w-xs mx-auto mt-6 mb-4">
                   <select
                       className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => handleDurationChange(e.target.value)} // Add your handler function for duration change
                   >    
                       <option value="15">15 sec</option>
                       <option value="30">30 sec</option>
                        <option value="45">45 sec</option>
                        <option value="60">60 sec</option>
                  </select>
            </div>

              
          </div>








          <button type="submit" 
          className="bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-3xl self-end hover:bg-blue-700"
          onClick={handleSubmit}
          >Create Ad</button>
          
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

export default CreateAd;
















// export async function getServerSideProps(context) {
//   const userId = await fetchCurrentUser(context.req);
//   let currentUser = null;

//   if (userId) {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/${userId}`);
//     currentUser = await res.json();
//   }

//   return {
//     props: {
//       currentUser: currentUser || null,
//     },
//   };
// }

// export default CreateAd;













//my previous code
// import Head from 'next/head';
// import Link from 'next/link';
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import fetchCurrentUser from '../../utils/fetchCurrentUser';



// export default function CreateAd({ currentUser }) {  //this line didnt had the 'currentuser'

//   const [user, setUser] = useState(currentUser);

//   useEffect(() => {
//     if (!user) {
//       console.log("No current user found");
//     }
//   }, []);





//   const ads = new Array(20).fill(null).map((_, index) => ({
//     id: index,
//     description: `Description of Ad ${index + 1}`,
//     videoSrc: 'path-to-your-placeholder-video.mp4',
//   }));


//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center">
//       <Head>
//         <title>Create Ad - AdVideo</title>
//         <meta name="description" content="Create professional video ads quickly with AdVideo." />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       <header className="w-full bg-transparent shadow flex justify-between items-center p-4">
//         <p className="text-xl font-bold">
//           Start creating stunning video ads now.
//         </p>


//         {user ? (

//           <img
//             src="/profile_icon.png" // Replace with the actual path to the user's profile icon
//             alt="Profile Icon"
//             className="w-8 h-8 rounded-full"

//           />
//         ) : (
//           <Link href="/signup">
//             <button className="bg-blue-700 text-white text-xs font-bold py-1.5 px-4 rounded-3xl self-end hover:bg-blue-700">
//               Sign Up
//             </button>
//           </Link>
//         )}

       
 
//       </header>

//       <main className="flex w-full flex-1 px-6 py-4">

//         {/* Left section for displaying generated ads */}

//         <div className="w-1/2 pr-6 overflow-hidden h-screen">

//           <div className="overflow-y-auto h-full pr-2 -mr-2">
            
//             {ads.map((ad) => (
//               <div key={ad.id} className="mb-6">
//                 <video className="w-full h-48 rounded" controls>
//                   <source src={ad.videoSrc} type="video/mp4" />
//                   Your browser does not support the video tag.
//                 </video>
//                 <p className="mt-2">{ad.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>

        

      

//         {/* Right section for creating a new ad */}
//         <div className="w-1/2 pl-4 flex flex-col items-center">

//           <video className="w-full h-96 rounded mb-3" controls>

//             <source src="path-to-your-placeholder-video.mp4" type="video/mp4" />
//             Your browser does not support the video tag.

//           </video>

//           <textarea
//             className="w-full h-22 p-4 mb-2 border border-gray-300 rounded-xl"
//             placeholder="Describe your product, be as specific as possible"
//           >

//           </textarea>

//             <button className="bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-3xl self-end hover:bg-blue-700">Create Ad</button>
          
//         </div>
//       </main>
//     </div>
//   );
// }




// export async function getServerSideProps(context) {

//   console.log('Context Headers:', context.req.headers); 


//   const userId = await fetchCurrentUser(context.req);

  

//   if (!userId) {
//     console.log("No user ID found after token verification");
//     return { props: { currentUser: null } };
//   }


//   console.log('User ID:', userId); // Log the user ID for verification

//   const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/${userId}`;
//   console.log('API URL:', apiUrl); // Log the API URL for verification

//   const res = await fetch(apiUrl);
//   const currentUser = await res.json();



//   console.log('Current User:', currentUser); // Log the fetched user data for verification


//   return {
//     props: {
//       currentUser: currentUser || null,
//     },
//   };
// }


