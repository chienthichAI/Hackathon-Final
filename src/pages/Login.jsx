import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useForm from '../hooks/useForm';
import { login } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { formConfigs } from '../utils/validation';
import { logger } from '../utils/monitoring';
import { ErrorBoundary } from '../utils/errorHandler';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm(
    {
      email: '',
      password: ''
    },
    formConfigs.login,
    async (formData) => {
      try {
        const response = await login(formData.email, formData.password);
        
        // Log successful login
        logger.info('User logged in successfully', { email: formData.email });
        
        // Extract data from axios response
        const responseData = response.data;
        
        // Use AuthContext to handle login
        if (responseData && responseData.user && responseData.token) {
          await authLogin(responseData.user, responseData.token);
        } else {
          console.error('Invalid login response structure:', responseData);
          throw new Error('Invalid login response from server');
        }
        
        // Redirect to todo
        navigate('/todo');
      } catch (error) {
        // Error is automatically handled by useApi hook
        logger.error('Login failed', { email: formData.email });
        throw error;
      }
    }
  );

  const renderError = (field) => {
    if (touched[field] && errors[field]) {
      return (
        <div className="text-red-500 text-sm mt-1" data-testid={`${field}-error`}>
          {errors[field]}
        </div>
      );
    }
    return null;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-md w-full bg-gray-900 p-4 rounded-xl shadow-xl border border-gray-700">
          {/* Subtle orange accent at top */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-800 to-orange-400 opacity-80 rounded-t-xl"></div>
          <div className="space-y-4">
            <div className="text-center">
            <h2 className="mt-6 text-center text-4xl font-extrabold text-white animate-fade-in-up">
              Welcome Back
            </h2>
            <p className="mt-3 text-center text-base text-gray-300 animate-fade-in-up stagger-1 font-medium">
              Sign in to your FPT University account
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                    touched.email && errors.email
                      ? 'border-red-500'
                      : 'border-gray-600'
                  } placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm bg-gray-800`}
                  placeholder="Email address"
                  value={values.email || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  data-testid="email-input"
                />
                {renderError('email')}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                    touched.password && errors.password
                      ? 'border-red-500'
                      : 'border-gray-600'
                  } placeholder-gray-400 text-white rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm bg-gray-800`}
                  placeholder="Password"
                  value={values.password || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  data-testid="password-input"
                />
                {renderError('password')}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-orange-500 text-sm font-medium rounded-xl text-orange-500 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                data-testid="login-button"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            <div className="text-center">
              <a
                href="/register"
                className="font-medium text-orange-500 hover:text-orange-400 transition-colors"
              >
                Don't have an account? Sign up
              </a>
            </div>
          </form>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Login; 