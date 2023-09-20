import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/reset/${token}`, { password });
      // handle success
    } catch (error) {
      // handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type='submit'>Reset Password</button>
    </form>
  );
};

export default ResetPassword;