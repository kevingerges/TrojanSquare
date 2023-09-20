import React, { useState } from 'react';
import { useGlobalCotext } from '../../Context/Context';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { m } from '../Magic-client';
import { toast } from 'react-toastify';
import showCreateAccountPopup from '../Popups/CreateAccountPopup';



const LoginPopup = ({ socket }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { isLoginPopupOpen, useLogin, showLoginPopup } = useGlobalCotext();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    privacyPolicy: false,
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => {
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
    });
  };

  const handleSignin = async (e) => {
    e.preventDefault();

    setLoading(!loading);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/loginuser`,
        formData
      );
      setFormData({
        email: '',
        password: '',
      });
      showLoginPopup();
      const token = res.data.token;
      setLoading(!loading);
      if (token) {
        console.log(res.data.user);
        const { _id, fullName, image } = res.data.user;
        console.log(image);
        const user = { _id, fullName };

        localStorage.setItem('hacktechtoken', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('profile', image);
        useLogin();
        socket.emit('newuser', {
          userid: _id,
          socketId: socket.id,
        });
        navigate('/');
      }
    } catch {
      console.log('something went wrong');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/resetpassword`,
        { email: formData.email }
      );
      toast.success('An email has been sent with further instructions.');
    } catch (error) {
      toast.error('An error occurred.');
    }
  };

  return (
    <div
      className={`${
        isLoginPopupOpen ? 'w-full h-screen fixed bg-black/50  z-20 ' : ''
      }`}
    >
      <div
        className={`${
          isLoginPopupOpen
            ? 'show absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2  bg-white rounded-2xl'
            : 'hidden'
        }`}
      >
        <button onClick={showLoginPopup} className='absolute right-0 top-0 m-2'>
          X
        </button>
        <form
          className='flex flex-col justify-center items-center p-5 gap-3 '
          onSubmit={handleSignin}
        >
          <h1 className='text-4xl font-bold'>Login into an Account!</h1>
          <GoogleOAuthProvider clientId='402471966178-64i90065ujh2ga5e2793g3l6jn00mq4c.apps.googleusercontent.com'>
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                console.log(credentialResponse);
              }}
              onError={() => {
                console.log('Login Failed');
              }}
            />
          </GoogleOAuthProvider>
          <div className='flex flex-col w-full'>
            <label className='font-semibold text-base'>Email address</label>
            <input
              type='email'
              className='border border-[#CDCED2] rounded-sm h-8'
              name='email'
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className='flex flex-col w-full'>
            <label className='font-semibold text-base'>Password</label>
            <input
              type='password'
              placeholder='Use at least 8 characters'
              className='border border-[#CDCED2] rounded-sm h-8 px-2'
              name='password'
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className='flex gap-2'>
            <input
              type='checkbox'
              name='privacyPolicy'
              checked={formData.privacyPolicy}
              onChange={handleChange}
              required
            />
            <label className='text-xs'>
              I agree to the TrojanSqaure Terms of Service and Privacy Policy
            </label>
          </div>
          <button className='bg-[#DB3B39] text-white w-full p-1' type='submit'>
            {!loading ? 'Sign in' : 'Loading...'}
          </button>
          <span
className='text-[#006ACB] text-sm'
  style={{ cursor: 'pointer' }}
  onClick={showCreateAccountPopup}
>
  <span style={{ cursor: 'inherit' }}>don't have an account? try sign up instead</span>
</span>

          <div className='w-64 font-normal text-xs items-center'>
            <p>
              We keep your information safe. We never use your information
              outside of uniswap.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPopup;
