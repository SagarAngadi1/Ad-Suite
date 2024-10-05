import Head from 'next/head';
import Link from 'next/link';
import { useRef } from 'react'; // Import useRef for creating references
import { useRouter } from 'next/router';
//import { SparklesIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';




// bg-gradient-to-b from-gray-100 to-gray-200
export default function Home() {
  const router = useRouter();

  const handleNavigation = () => {
    router.push('/CreateProductPhoto');
  };

  const pricingSectionRef = useRef(null);

   // Scroll to the pricing section when the Pricing link is clicked
   const scrollToPricing = () => {
    if (pricingSectionRef.current) {
      pricingSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };




  return (
    <div className="flex flex-col items-center justify-center min-h-screen  bg-gradient-to-br from-purple-50 to-indigo-100">
     

      <Head>
        <title>AdVideo - Create Stunning Video Ads</title>
        <meta name="description" content="Create professional video ads quickly with AdVideo." />
        <link rel="icon" href="/favicon.ico" />
      </Head>



      <header className="w-full bg-white  shadow-md">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">

          {/* <img
               src="/logo_newblue.png" // Replace with the actual path to the user's profile icon
               alt="Protip Icon"
               className="w-4 h-4 rounded-full mb-1"
          /> */}


            <div className="flex-2 items-center -ms-14">
            <Link href="/" className="text-2xl font-bold text-purple-600">Ad-Suite</Link>
            </div>


            <div className="hidden md:flex space-x-9 items-center">
              {/* <a href="#" className="font-bold  text-gray-800 hover:text-blue-600 ">Home</a>
              <a href="#" className="font-bold  text-gray-800 hover:text-blue-600">Features</a> */}
              <a href="#" className="font-bold text-base text-gray-600 hover:text-purple-500"onClick={scrollToPricing} >
                Pricing</a> 

             {/* <a href="#" className="font-bold  text-gray-800 hover:text-blue-600">About</a> */}

              {/* <Link href="/CreateAd">
              <button className="bg-blue-600 text-white text-sm font-bold py-1.5 px-4 rounded-3xl hover:bg-blue-700">Create Ad</button>
              </Link> */}

              {/* <Link href="/CreateProductPhoto" prefetch={true}>
              <button className="bg-purple-500 text-white text-sm py-2 px-6 font-bold rounded-full  hover:bg-purple-700 transition duration-300 ms-4">Product Photography </button>
              </Link> */}

              <button
                className="bg-purple-500 text-white text-sm py-2 px-6 font-bold rounded-full hover:bg-purple-700 transition duration-300 ms-4"
                onClick={handleNavigation}
               >
                Product Photography
              </button>
            
            </div>

          </div>
        </nav>
      </header>

      <main className="flex flex-col w-full flex-1 px-20 text-center">

        <h1 className="text-5xl font-bold mt-8" style={{ lineHeight: '1.2' }}>
        Make your buyers &apos;awww&apos; with our  <br /> AI transformed
         <a className="text-purple-600 hover:text-purple-700" href="#"> Product Photography!</a>
        </h1>
        
        <p className="mt-6 text-2xl">
          You don&apos;t need a studio for stunning product photos.
        </p>


         {/* Image Grid Section */}
         <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* <img src="http://localhost:8000/product_images/product_photo.png" alt="Product 1" className="rounded-lg shadow-lg"/> this is how we can an image from product_images directory of main.py file, we have an endpoint there with name 'product_images' */}

            <img src="/arokart.png" alt="Product 1" width={500} height={300} className="rounded-lg shadow-lg"/>
            <img src="/earbudsOrange.png" alt="Product 2" width={500} height={300} className="rounded-lg shadow-lg"/>
            <img src="/primeBlue.png" alt="Product 3" width={500} height={300} className="rounded-lg shadow-lg"/>
            <img src="/clearSnackBar.png" alt="Product 4" width={500} height={300} className="rounded-lg shadow-lg"/>
            <img src="/juiceBottle.png" alt="Product 5" width={500} height={300} className="rounded-lg shadow-lg"/>
            <img src="/olipop.png" alt="Product 6" width={500} height={300} className="rounded-lg shadow-lg"/>
            <img src="/female_glasses.png" alt="Product 7" width={500} height={300} className="rounded-lg shadow-lg"/>
            <img src="/perfume.png" alt="Product 8" width={500} height={300} className="rounded-lg shadow-lg"/>
            <img src="/arokartPalm.png" alt="Product 9" width={500} height={300} className="rounded-lg shadow-lg"/>
            <img src="/faceMask.png" alt="Product 10" width={500} height={300} className="rounded-lg shadow-lg"/>
            <img src="/supplement_bottle.png" alt="Product 11" width={500} height={300} className="rounded-lg shadow-lg"/>
            <img src="/lipstick.png" alt="Product 12" width={500} height={300} className="rounded-lg shadow-lg"/>
          
          </div>


          <section ref={pricingSectionRef}  className="bg-transparent py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-purple-600 text-center mb-8">Choose Your Plan</h2>
    
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
            {/* Basic Plan */}
           <div className="p-8 bg-gray-50 rounded-lg shadow-lg">
               <h3 className="text-2xl font-bold text-gray-800 mb-4">Basic Plan</h3>
                <p className="text-5xl font-extrabold text-purple-600 mb-6">$19</p>
                <p className="text-lg text-gray-600 mb-8">100 image generations</p>
               <button className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                   Get Started
                </button>
           </div>
      
      {/* Pro Plan */}
      <div className="p-8 bg-gray-50 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Pro Plan</h3>
        <p className="text-5xl font-extrabold text-purple-600 mb-6">$36</p>
        <p className="text-lg text-gray-600 mb-8">200 image generations</p>
        <button className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
          Get Started
        </button>
      </div>
      
      {/* Ultra Plan */}
      <div className="p-8 bg-gray-50 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Ultra Plan</h3>
        <p className="text-5xl font-extrabold text-purple-600 mb-6">$59</p>
        <p className="text-lg text-gray-600 mb-8">400 image generations</p>
        <button className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
          Get Started
        </button>
      </div>

    </div>
  </div>
</section>


        <footer className="flex items-center justify-center w-full h-24 border-t mt-4">
          <p>© 2024 Ad-Suite. All rights reserved.</p>
        </footer>


      </main>
    </div>
  );
}







// import Head from 'next/head';
// import NavBar from '../components/NavBar';


// export default function Home() {
//   return (

//     <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-b from-gray-100 to-gray-200">

//       <Head>
//         <title>AdVideo - Create Stunning Video Ads</title>

//         <meta name="description" content="Create professional video ads quickly with AdVideo." />

//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       <NavBar />

//       <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">

//         <h1 className="text-6xl font-bold">
//           Welcome to <a className="text-blue-600" href="#">AdVideo!</a>
//         </h1>

//         <p className="mt-3 text-2xl">
//           Create stunning video ads effortlessly.
//         </p>

//         <footer className="flex items-center justify-center w-full h-24 border-t mt-4">
//           <p>© 2024 AdVideo. All rights reserved.</p>
//         </footer>
        
//       </main>
//     </div>
//   );
// }





