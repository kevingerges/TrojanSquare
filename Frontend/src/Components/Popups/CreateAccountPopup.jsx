import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useGlobalCotext } from '../../Context/Context';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { m } from '../Magic-client';
import { toast } from 'react-toastify';
import showLoginPopup from '../Popups/LoginPopup';

const CreateAccountPopup = ({ socket }) => {
  const navigate = useNavigate();
  const { isCreateAccountPopupOpen, showCreateAccountPopup, useLogin } = useGlobalCotext();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    privacypolicy: false,
    socketid: socket.id,
  });
  const handleSignup = async (e) => {
    e.preventDefault();
  
    if (!formData.email.toLowerCase().endsWith('@usc.edu')) {
      toast.error('Please provide a valid USC email ending with @usc.edu', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
      return;
    }  
    setLoading(!loading);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/createuser`,
        formData
      );
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        privacypolicy: false,
      });
      showCreateAccountPopup();
      const token = res.data.token;
      setLoading(!loading);
      if (token) {
        const { _id, fullName } = res.data.user;
        const user = { _id, fullName };
        localStorage.setItem('hacktechtoken', token);
        localStorage.setItem('user', JSON.stringify(user));
        useLogin();
        socket.emit('newuser', {
          userid: _id,
          socketId: socket.id,
        });
        navigate('/');
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  // const handleSignup = async (e) => {
  //   e.preventDefault();

  //   if (!formData.email.toLowerCase().endsWith('@usc.edu')) {
  //     toast.error('Please provide a valid USC email ending with @usc.edu', {
  //       position: 'top-right',
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true, 
  //       progress: undefined,
  //       theme: 'light',
  //     });
  //     return;
  //   }

  //   setLoading(!loading);
  //   try {
  //     const res = await axios.post(
  //       `${import.meta.env.VITE_BACKEND_URL}/api/user/createuser`,
  //       formData
  //     );
  //     setFormData({
  //       fullName: '',
  //       email: '',
  //       password: '',
  //       confirmPassword: '',
  //       privacypolicy: false,
  //     });
  //     showCreateAccountPopup();
  //     const token = res.data.token;
  //     setLoading(!loading);
  //     if (token) {
  //       const { _id, fullName } = res.data.user;
  //       const user = { _id, fullName };
  //       localStorage.setItem('hacktechtoken', token);
  //       localStorage.setItem('user', JSON.stringify(user));
  //       useLogin();
  //       socket.emit('newuser', {
  //         userid: _id,
  //         socketId: socket.id,
  //       });
  //       navigate('/');
  //     }
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
    });
  };

  return (
    <div
      className={`${
        isCreateAccountPopupOpen
          ? 'w-full h-screen fixed bg-black/50  z-20 '
          : ''
      }`}
    >
      <div
        className={`${
          isCreateAccountPopupOpen
            ? 'show absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2  bg-white rounded-2xl'
            : 'hidden'
        }`}
      >
        <button onClick={showCreateAccountPopup} className='absolute right-0 top-0 m-2'>X</button>
        <form
          className='flex flex-col justify-center items-center p-5 gap-3 '
          onSubmit={handleSignup}
        >
          <h1 className='text-4xl font-bold'>Create an Account!</h1>
          <button className='border text-lg w-full h-8 flex gap-2 align-middle justify-center'>
            <img src='/assets/Frame.png' className='mt-1' />
            <span>Continue with Google</span>
          </button>
          <div className='flex flex-col w-full'>
            <label className='font-semibold text-base'>Full Name</label>
            <input
              type='text'
              className='border border-[#CDCED2] rounded-sm h-8'
              name='fullName'
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
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
          <div className='flex flex-col w-full'>
            <label className='font-semibold text-base'>Confirm Password</label>
            <input
              type='password'
              placeholder='Use at least 8 characters'
              className='border border-[#CDCED2] rounded-sm h-8 px-2'
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <div className='flex gap-2'>
            <input
              type='checkbox'
              name='privacypolicy'
              checked={formData.privacypolicy}
              onChange={handleChange}
              required
            />
            <label className='text-xs'>
              I agree to the uniswap Terms of Service and Privacy Policy
            </label>
          </div>
          <button className='bg-[#DB3B39]  text-white w-full p-1' type='submit'>
            {!loading ? 'Sign up' : 'Loading...'}
          </button>
          {/* <span className='text-[#006ACB] text-sm cursor pointer-events-none' onClick={showLoginPopup}>
            Have an account already? Login instead
          </span> */}
                    <span
className='text-[#006ACB] text-sm'
  style={{ cursor: 'pointer' }}
  onClick={showLoginPopup}
>
  <span style={{ cursor: 'inherit' }}>Have an account already? Login instead</span>
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

export default CreateAccountPopup;