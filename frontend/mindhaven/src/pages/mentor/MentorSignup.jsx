import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setTokens } from '../../features/user/userSlice'; 
import signupImg from '../../assets/signup-img.png';
import axiosInstance from '../../utils/axiosConfig';
import { LoadingSpinner } from '../../components/LoadingSpinner';

function MentorSignup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    hourly_rate: '',
    qualification: '',
    specialization: '',
    certification: null,
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
      case 'hourly_rate':
        if (!value) {
          error = 'Hourly rate is required';
        } else if (isNaN(value) || parseFloat(value) <= 0) {
          error = 'Please enter a valid hourly rate';
        }
        break;
      case 'qualification':
        if (!value.trim()) error = 'Qualification is required';
        break;
      case 'certification':
        if (!value) error = 'Certification image is required';
        break;
      // No validation for specialization as it's optional
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      setFormData(prevData => ({
        ...prevData,
        [name]: e.target.files[0],
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
    
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: validateField(name, type === 'file' ? e.target.files[0] : value),
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
    if (touched.confirmPassword) {
      setErrors(prevErrors => ({
        ...prevErrors,
        confirmPassword: validateField('confirmPassword', formData.confirmPassword),
      }));
    }
  }, [formData.password, formData.confirmPassword, touched.confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    const formErrors = Object.keys(formData).reduce((acc, key) => {
      const error = validateField(key, formData[key]);
      if (error) acc[key] = error;
      return acc;
    }, {});

    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      setIsLoading(true);
      try {
        const formDataToSend = new FormData();
        for (const key in formData) {
          if (key !== 'confirmPassword') {
            formDataToSend.append(key, formData[key]);
          }
        }
        console.log("data send for mentor signup:",formData);
        const response = await axiosInstance.post('/register/mentor/', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Mentor registered successfully:', response.data);
        const user = response.data.user;
        
        dispatch(setUser({
          id: user.id,
          first_name: user.first_name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }));
        dispatch(setTokens(response.data.access));
        
        localStorage.setItem('token', response.data.access);
        
        navigate('/mentor');
      } catch (error) {
        console.error('Error registering mentor:', error.response ? error.response.data : error.message);
        setErrors(prevErrors => ({
          ...prevErrors,
          submit: error.response ? error.response.data.detail : 'An error occurred. Please try again.',
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12">
      {isLoading && <LoadingSpinner />}
      <div className="flex w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="hidden lg:block w-1/2 bg-custom-text p-12 text-white">
          <h2 className="text-3xl font-bold mb-6">Join MindHaven as a Mentor</h2>
          <p className="mb-6">
            Thank you for stepping up! At MindHaven, we believe that every superhero needs a guide. By joining our community, you're becoming a beacon of hope and support for those in need. Together, we can make a difference.
          </p>
          <img src={signupImg} alt="Welcome to MindHaven" className="w-full" />
        </div>
        
        <div className="w-full lg:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-center text-custom-text mb-6">Create Your Mentor Account</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* ... (keep all the form fields) */}
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
            <div>
              <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700">Hourly Rate (₹)</label>
              <input 
                type="number" 
                id="hourly_rate" 
                name="hourly_rate" 
                value={formData.hourly_rate} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border ${touched.hourly_rate && errors.hourly_rate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-custom-accent focus:border-custom-accent`}
              />
              {touched.hourly_rate && errors.hourly_rate && <p className="mt-1 text-sm text-red-500">{errors.hourly_rate}</p>}
            </div>
            <div>
              <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">Qualification</label>
              <input 
                type="text" 
                id="qualification" 
                name="qualification" 
                value={formData.qualification} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border ${touched.qualification && errors.qualification ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-custom-accent focus:border-custom-accent`}
              />
              {touched.qualification && errors.qualification && <p className="mt-1 text-sm text-red-500">{errors.qualification}</p>}
            </div>
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">Specialization (Optional)</label>
              <input 
                type="text" 
                id="specialization" 
                name="specialization" 
                value={formData.specialization} 
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-custom-accent focus:border-custom-accent"
              />
            </div>
            <div>
              <label htmlFor="certification" className="block text-sm font-medium text-gray-700">Certification (Image)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="certification" className="relative cursor-pointer bg-white rounded-md font-medium text-custom-accent hover:text-custom-bg focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-custom-accent">
                      <span>Upload a file</span>
                      <input 
                        id="certification" 
                        name="certification" 
                        type="file" 
                        className="sr-only"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              {touched.certification && errors.certification && <p className="mt-1 text-sm text-red-500">{errors.certification}</p>}
              {formData.certification && <p className="mt-2 text-sm text-gray-500">{formData.certification.name}</p>}
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
                Create Mentor Account
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

export default MentorSignup;