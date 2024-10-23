// C:\Users\User\VisualStudioProjects\AdVideo\advideo_nextjs\pages\signup.js
import { useState } from 'react'; // Imports the useState hook from React. This hook allows you to add state to your functional components
import { useRouter } from 'next/router';
import Link from 'next/link';


export default function SignUp() {      //Exports the SignUp function as the default export of the module
  const [email, setEmail] = useState('');  // Declares a state variable 'email' with an initial value of an empty string. setEmail is the function used to update email.
  const [password, setPassword] = useState(''); //'useState' allows us to set states to functional components(here for variable).
  const router = useRouter();


  const handleSubmit = async (e) => {      // Declares an asynchronous function named handleSubmit to handle form submission.
    e.preventDefault();                  //Prevents the default behavior of the form submission (which is to reload the page).

    
    const res = await fetch('/api/signup', {   //Uses the Fetch API to send a POST request to the '/api/signup' endpoint.
      method: 'POST',                         // Specifies the HTTP method as POST.
      headers: {                             
        'Content-Type': 'application/json',     //Sets the Content-Type header to application/json, indicating that the request body contains JSON data.
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert('User created successfully!');
      router.push('/CreateProductPhoto');


    } else {
      if (data.error === 'User already exists') {
        alert('User already exists.');
      } else {
        alert('Failed to create user.');
      }

    }

  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-br from-purple-50 to-indigo-100">
      <h1 className="text-2xl mb-4">Sign Up</h1>


      <form onSubmit={handleSubmit} className="w-full p-2 md:w-1/3 flex flex-col">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 p-2 border rounded"
          required
        />

        <button type="submit" className=" bg-purple-500 text-white text-sm py-2 px-4 font-bold rounded-2xl  hover:bg-purple-700 transition duration-300">
          Sign Up
        </button>
        
      </form>

      <h1 className="text-md font-bold mt-8" style={{ lineHeight: '1' }}>
        Already a user? Just
        <Link className="text-purple-600 hover:text-purple-700" href="/login"> Login!</Link>
        </h1>
    </div>
  );
}
