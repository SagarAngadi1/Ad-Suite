// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { setCookie } from 'nookies';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert('Log in successful');
      router.push('/CreateProductPhoto');

    } else {
      if (data.error === 'User does not exists') {
        alert('User does not exists');
      } else {
        alert('Failed to login the user.');
      }

    }



   
  };




  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-br from-purple-50 to-indigo-100">
      <h1 className="text-2xl mb-4">Log In</h1>

      <form onSubmit={handleLogin} className="w-1/3 flex flex-col">
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

        <button type="submit" className="bg-purple-500 text-white text-sm py-2 px-4 font-bold rounded-2xl  hover:bg-purple-700 transition duration-300">
          Log In
        </button>

       
        
      </form>

      <h1 className="text-md font-bold mt-8" style={{ lineHeight: '1' }}>
        New to Ad-Suite? Just 
         <a className="text-purple-600 hover:text-purple-700" href="/signup"> SignUp!</a>
        </h1>
    </div>


  );
};

export default Login;
