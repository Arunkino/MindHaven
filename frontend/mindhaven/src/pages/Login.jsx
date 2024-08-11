import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setTokens, setUser } from "../features/user/userSlice";
import authService from '../utils/authService';
import { LoadingSpinner } from "../components/LoadingSpinner";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const credentials ={
        email:email,
        password:password
      }
      const data = await authService.login(credentials);
      dispatch(setUser(data.user));
      console.log("checkk")
      dispatch(setTokens({ access: data.access, refresh: data.refresh }));
      if(data.user.role ==='mentor'){
        navigate('/mentor/dashboard')
      }else if(data.user.role === 'admin'){
        navigate('/admin/dashboard')
      }else{
        navigate('/dashboard');

      }
      
    } catch (error) {
      console.error('Error logging in:', error.response?.data || error.message);
      setError(error.response?.data?.detail || 'An error occurred during login. Please try again.');
      
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-custom-text mb-6">Welcome Back</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-custom-accent focus:border-custom-accent"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-custom-accent focus:border-custom-accent"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-bg hover:bg-custom-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-accent"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner /> : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/signup" className="font-medium text-custom-accent hover:text-custom-bg">Sign up</Link>
        </p>
      </div>
      <p className="mt-8 text-center text-sm text-gray-500">
        Find peace within yourself. Every journey begins with a single step.
      </p>
    </div>
  );
}

export default Login;