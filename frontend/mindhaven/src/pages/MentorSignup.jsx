import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../features/user/userSlice'; // Ensure this path is correct
import signupImg from '../assets/signup-img.png';
import axiosInstance from '../utils/axiosConfig'; // Ensure this path is correct
import { LoadingSpinner } from '../components/LoadingSpinner';





function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'first_name':
        if (!value.trim()) error = 'Full Name is required';
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Email is invalid';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      default:
        break;
    }
    return error;
  };

  // handling change in input fields 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: validateField(name, value),
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true,
    }));
  };

  useEffect(() => {
    // Validate confirmPassword when password changes
    if (touched.confirmPassword) {
      setErrors(prevErrors => ({
        ...prevErrors,
        confirmPassword: validateField('confirmPassword', formData.confirmPassword),
      }));
    }
  }, [formData.password, formData.confirmPassword, touched.confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate all fields
    const formErrors = Object.keys(formData).reduce((acc, key) => {
      const error = validateField(key, formData[key]);
      if (error) acc[key] = error;
      return acc;
    }, {});

    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      setIsLoading(true); //start loading
      try {
        const response = await axiosInstance.post('/mentor/register/', {
          first_name: formData.first_name,
          email: formData.email,
          password: formData.password,
        });

        console.log('Mentor registered successfully:', response.data);
        const payload={
          first_name: response.data.first_name,
          role : 'mentor'
        }
        dispatch(setUser(payload));
        dispatch(setToken(response.data.access));
        
        localStorage.setItem('token', response.data.access);
        
        navigate('/mentor');
      } catch (error) {
        console.error('Error registering Mentor:', error.response ? error.response.data : error.message);
        setErrors(prevErrors => ({
          ...prevErrors,
          submit: error.response ? error.response.data.detail : 'An error occurred. Please try again.',
        }));
      } finally{
        setIsLoading(false); //stop loading
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      {isLoading && <LoadingSpinner />}
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left side - Image and message */}
        <div className="hidden md:block w-1/2 bg-custom-bg p-12 text-white">
          <h2 className="text-3xl font-bold mb-6">Mentor Sign UP</h2>
          <p className="mb-6">
            Dear Mentor,<br/>
            Join our community to help them
          </p>
          <img src={signupImg} alt="Welcome to MindHaven" className="w-full" />
        </div>
        
        {/* Right side - Signup form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-center text-custom-text mb-6">Create Your Account</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                type="text" 
                id="first_name" 
                name="first_name" 
                value={formData.first_name} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border ${touched.first_name && errors.first_name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-custom-accent focus:border-custom-accent`}
              />
              {touched.first_name && errors.first_name && <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-custom-accent focus:border-custom-accent`}
              />
              {touched.email && errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-custom-accent focus:border-custom-accent`}
              />
              {touched.password && errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-custom-accent focus:border-custom-accent`}
              />
              {touched.confirmPassword && errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
            <div className="flex items-center">
              <input id="terms" name="terms" type="checkbox" className="h-4 w-4 text-custom-accent focus:ring-custom-accent border-gray-300 rounded" required />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the <a href="/terms" className="text-custom-accent hover:text-custom-bg">Terms of Service</a> and <a href="/privacy" className="text-custom-accent hover:text-custom-bg">Privacy Policy</a>
              </label>
            </div>
            {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}
            <div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-bg hover:bg-custom-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-accent">
                Create Account
              </button>
            </div>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="font-medium text-custom-accent hover:text-custom-bg">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;