import Head from 'next/head';
import Link from 'next/link';
import { useRef, useEffect, useState} from 'react'; // Import useRef for creating references
import { useRouter } from 'next/router';
import axios from 'axios'; // Add this line if missing
import Image from 'next/image';
import { parseCookies } from 'nookies'; // For reading cookies
import fetchCurrentUser from '../../utils/fetchCurrentUser';

 





// bg-gradient-to-b from-gray-100 to-gray-200
export default function Home({ currentUser }) {
  const router = useRouter();
  const [user, setUser] = useState(currentUser);
  const [currency, setCurrency] = useState('USD');

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

   // Check query parameter on page load and scroll to pricing if needed
   useEffect(() => {
    if (router.query.scrollToPricing === 'true' && pricingSectionRef.current) {
      pricingSectionRef.current.scrollIntoView({ behavior: 'smooth' });

      const { pathname } = router;
      router.replace(pathname, undefined, { shallow: true });
    }
  }, [router.query]);


  // Load the Razorpay checkout script dynamically when the component mounts
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);



  

  // Check if user is logged in, fetch if necessary
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


  // Function to start checkout process for a specific product
  const handlePayment = async (planId) => {

  
    if (!user) {
      // Redirect to signup if the user is not logged in
      router.push('/signup');
      return;
    }

    try {
      const userId = user._id
      const response = await axios.post('/api/payments', { planId, userId });
      const { orderId, key, credits } = response.data;
      
      // Load the Razorpay checkout script
      const options = {
        key, // Razorpay Key
        amount: response.data.amount,
        currency: 'USD',
        name: 'AdVideo - Payment',
        description: 'Choose your plan',
        order_id: orderId,
       // Credits: response.data.Credits, //added now

        handler: async function (response) {
          // Handle the successful payment response here
          alert('Payment Success: ' + response.razorpay_payment_id);

          // Call the updateUserCredits API to update the credits after successful payment
          try {
             await axios.post('/api/updateUserCredits', {
             userId,
             credits, // The credits for the selected plan
           });
          
           // Redirect to CreateProductPhoto page after updating credits
           router.push('/CreateProductPhoto');

          } catch (updateError) {
            console.error('Error updating credits:', updateError);
            alert('Error updating credits. Please contact support.');
          }

        
          //router.push('/CreateProductPhoto'); // Redirect to success page

        },
        prefill: {
          email: user.email, // You can fill these from the user's data
          //email: 'john.doe@example.com',
          //contact: '9999999999'
        },
        theme: {
          color: '#3399cc'
        }
      };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

    } catch (error) {
      console.error('Payment Error:', error);
      alert('Failed to start payment process.');
    }
  };


  const currencyMap = {
    USD: {
      basic: 19,
      pro: 39,
      ultra: 59,
    },
    INR: {
      basic: 1599,
      pro: 3199,
      ultra: 4799,
    },
  };



  return (
    <div className="flex flex-col items-center justify-center min-h-screen  bg-gradient-to-br from-purple-50 to-indigo-100">
     

      <Head>
      <title>Create Studio Level Product Photography - AdSuite</title>
        <meta name="description" content="Create professional studio-level product photography effortlessly using AdSuite." />
        <meta name="keywords" content="Product photography, Studio level, AdSuite, Professional images, AI photography, Ads" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/logo_newblue.png" />
        <meta name="author" content="AdSuite" />
        {/* Open Graph (OG) meta tags for social sharing */}
      <meta property="og:title" content="AdSuite - Create Stunning Product Photographies" />
      <meta property="og:description" content="Create studio-level product photography without spending much. AdSuite provides AI-powered tools to generate professional-quality product images with ease." />
      <meta property="og:image" content="https://www.adsuite.org/logo_newblue.png" />
      <meta property="og:url" content="https://www.adsuite.org/" />
      <meta property="og:type" content="website" />

      {/* Twitter Card meta tags for social sharing */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="AdSuite - Create professional studio-level product photography effortlessly." />
      <meta name="twitter:description" content="Create studio-level product photography without spending much. AdSuite provides AI-powered tools to generate professional-quality product images with ease." />
      <meta name="twitter:image" content="https://www.adsuite.com/logo_newblue.png" />

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
              "url": "https://www.adsuite.org/",
              "priceCurrency": "USD",
              "price": "19",
              "availability": "https://schema.org/InStock"
            }
          })}
        </script>
      </Head>



      <header className="w-full bg-white  shadow-md">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">

        
            <div className="flex-1">
            <Link href="/" className="text-sm sm:text-2xl font-bold text-purple-600 -ms-2">Ad-Suite</Link>
            </div>


            <div className="flex space-x-3 items-center">
             
              <a href="#" className="font-bold text-sm sm:text-base text-gray-600 hover:text-purple-500 lg:me-6"onClick={scrollToPricing} >
                Pricing</a> 


              <button
                className="bg-purple-500 text-white text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4 lg:px-6 font-bold rounded-full hover:bg-purple-700 transition duration-300"
                onClick={handleNavigation}
               >
                Product Photography
              </button>
            
            </div>

          </div>
        </nav>
      </header>

      <main className="flex flex-col w-full flex-1 px-6 sm:px-10 lg:px-20 text-center">

        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mt-8 leading-tight" style={{ lineHeight: '1.2' }}>
        Make your buyers &apos;awww&apos; with our  <br /> AI transformed <br />
         <a className="text-purple-600 hover:text-purple-700" onClick={handleNavigation}  href="#"> Product Photography!</a>
        </h1>

      
        
        <p className="mt-6 sm:mt-8 text-xl sm:text-2xl font-serif">
          You don&apos;t need a studio for stunning product photos.
        </p>


         {/* Image Grid Section */}
         <div className="mt-12 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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


          <section ref={pricingSectionRef}  className="bg-transparent py-12 mt-8">
            <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600 text-center mb-8">Choose Your Plan</h2>
    
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
      
            {/* Basic Plan */}
           <div className="p-4 sm:p-8 bg-gray-50 rounded-lg shadow-lg">
               <h3 className="text-xl sm:text-2xl font-serif text-black mb-4">Basic Plan</h3>
               <p className="text-4xl sm:text-5xl font-extrabold text-purple-600 mb-6">
                {currency === 'USD' ? `$${currencyMap[currency].basic}` : `₹${currencyMap[currency].basic}`}
              </p>
                {/* <p className="text-4xl sm:text-5xl font-extrabold text-purple-600 mb-6">$19</p> */}
                <p className="text-base sm:text-lg font-serif text-gray-600 mb-8">100 studio level photography generations per month</p>
               <button onClick={() => handlePayment('basic')}
                className="w-full py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                   Get Started
                </button>

                <p className="text-sm mt-4 text-center cursor-pointer text-purple-600 hover:text-purple-800 transition"
                  onClick={() => setCurrency(currency === 'USD' ? 'INR' : 'USD')}>
                  {currency === 'USD' ? 'Convert to INR' : 'Convert to USD'}
                </p>


                {/* <p className="text-sm mt-2 text-center cursor-pointer text-blue-500 hover:underline"
                onClick={() => setCurrency(currency === 'USD' ? 'INR' : 'USD')}>
                {currency === 'USD' ? 'Convert to INR' : 'Convert to USD'}
                </p> */}
           </div>
      
      {/* Pro Plan */}
      <div className="p-4 sm:p-8 bg-gray-50 rounded-lg shadow-lg">
        <h3 className="text-xl sm:text-2xl font-serif text-black mb-4">Pro Plan</h3>
        <p className="text-4xl sm:text-5xl font-extrabold text-purple-600 mb-6">
                {currency === 'USD' ? `$${currencyMap[currency].pro}` : `₹${currencyMap[currency].pro}`}
        </p>
        <p className="text-base sm:text-lg font-serif text-gray-600 mb-8">200 studio level photography generations per month</p>
        <button onClick={() => handlePayment('pro')}
        className="w-full py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
          Get Started
        </button>
        <p className="text-sm mt-4 text-center cursor-pointer text-purple-600 hover:text-purple-800 transition"
                onClick={() => setCurrency(currency === 'USD' ? 'INR' : 'USD')}>
                {currency === 'USD' ? 'Convert to INR' : 'Convert to USD'}
        </p>
      </div>
      
      {/* Ultra Plan */}
      <div className="p-4 sm:p-8 bg-gray-50 rounded-lg shadow-lg">
        <h3 className="text-xl sm:text-2xl font-serif text-black mb-4">Ultra Plan</h3>
        <p className="text-4xl sm:text-5xl font-extrabold text-purple-600 mb-6">
                {currency === 'USD' ? `$${currencyMap[currency].ultra}` : `₹${currencyMap[currency].ultra}`}
        </p>
        <p className="text-base sm:text-lg font-serif text-gray-600 mb-8">400 studio level photography generations per month</p>
        <button onClick={() => handlePayment('ultra')}
        className="w-full py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
          Get Started
        </button>

        <p className="text-sm mt-4 text-center cursor-pointer text-purple-600 hover:text-purple-800 transition"
          onClick={() => setCurrency(currency === 'USD' ? 'INR' : 'USD')}>
          {currency === 'USD' ? 'Convert to INR' : 'Convert to USD'}
        </p>

      </div>

    </div>
  </div>
</section>





<footer className="flex flex-col lg:flex-row items-center justify-center w-full h-auto lg:h-24 border-t mt-4 space-y-4 lg:space-y-0 lg:space-x-8 px-4 py-4">
  <p>© 2024 Ad-Suite. All rights reserved.</p>

  <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-8">
    <p>Contact: <a href="mailto:ianassagar@gmail.com" className="text-blue-500 hover:underline">ianassagar@gmail.com</a></p>
    <a href="/privacypolicy" className="text-blue-500 hover:underline">Privacy Policy</a>
  </div>
</footer>





      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const currentUser = await fetchCurrentUser(context.req);

  return {
    props: {
      currentUser: currentUser ? JSON.parse(JSON.stringify(currentUser)) : null,
    },
  };
}







