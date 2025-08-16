import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hàm parse JSON an toàn
const safeJSONParse = (str, defaultValue = null) => {
  if (!str || str === 'undefined' || str === 'null' || str === '') {
    return defaultValue;
  }
  
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('Failed to parse JSON:', str, error);
    return defaultValue;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to fetch user data from database
  const fetchUserFromDB = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user from DB:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        console.log('=== DEBUG AuthContext ===');
        console.log('Token:', token);
        
        if (token) {
          // Luôn lấy user từ database để đảm bảo dữ liệu mới nhất
          const dbUser = await fetchUserFromDB(token);
          console.log('User from database:', dbUser);
          
          if (dbUser) {
            setUser(dbUser);
            // Cập nhật localStorage với dữ liệu mới từ database
            localStorage.setItem('userInfo', JSON.stringify(dbUser));
            console.log('✅ Đã cập nhật user từ database');
          } else {
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            console.log('❌ Không tìm thấy user trong database');
          }
        } else {
          setUser(null);
          console.log('❌ Không có token');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (userObj, token) => {
    if (!userObj || !token) {
      throw new Error('User object and token are required');
    }
    
    try {
      setUser(userObj);
      localStorage.setItem('token', token);
      localStorage.setItem('userInfo', JSON.stringify(userObj));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
