// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { setCookie } from 'nookies';
import Link from 'next/link';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false); // State to toggle forgot password UI
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
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
      router.push({
        pathname: '/',
      });
      // router.push('/CreateProductPhoto');

    } else {
      if (data.error === 'User does not exists') {
        alert('User does not exists');
      } else {
        alert('Failed to login the user.');
      }

    }



   
  };


  // Handle Forgot Password (Step 1: Verify Email)
  const handleForgotPassword = async () => {
    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail }),
    });

    const data = await res.json();
    if (res.ok) {
      alert('Verification successful. Enter new password.');
      setResetSuccess(true);
    } else {
      alert(data.error || 'User not found.');
    }
  };

  // Handle Reset Password (Step 2: Resetting the password)
  const handleResetPassword = async () => {
    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail, newPassword }),
    });

    if (res.ok) {
      alert('Password reset successful! You can now log in.');
      setIsForgotPassword(false); // Reset UI back to login
      setResetSuccess(false);
    } else {
      alert('Failed to reset password.');
    }
  };



  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-br from-purple-50 to-indigo-100">
      <h1 className="text-2xl mb-4">Log In</h1>

    {!isForgotPassword && (
      <form onSubmit={handleLogin} className="w-full p-2 md:w-1/3 flex flex-col">
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
      )}


      {/* Forgot Password UI */}
      {isForgotPassword && !resetSuccess && (
        <div className="w-full p-2 md:w-1/3 flex flex-col">
          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="mb-4 p-2 border rounded"
          />
          <button
            onClick={handleForgotPassword}
            className="bg-blue-500 text-white text-sm py-2 px-4 font-bold rounded-2xl hover:bg-blue-700 transition duration-300"
          >
            Verify Email
          </button>
        </div>
      )}

      {resetSuccess && (
        <div className="w-full p-2 md:w-1/3 flex flex-col">
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mb-4 p-2 border rounded"
          />
          <button
            onClick={handleResetPassword}
            className="bg-green-500 text-white text-sm py-2 px-4 font-bold rounded-2xl hover:bg-green-700 transition duration-300"
          >
            Reset Password
          </button>
        </div>
      )}

      <h1 className="text-md font-bold mt-8" style={{ lineHeight: '1' }}>
        New to Ad-Suite? Just 
        <Link className="text-purple-600 hover:text-purple-700" href="/signup"> SignUp!</Link>
      </h1>

      {/* Forgot Password Link */}
      {!isForgotPassword && (
        <p className="mt-4 text-sm">
          <span
            onClick={() => setIsForgotPassword(true)}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Forgot Password?
          </span>
        </p>
      )}

    </div>


  );
};

export default Login;