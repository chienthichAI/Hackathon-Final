import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Header.css';
// import { useEconomy } from '../../contexts/EconomyContext';
import LoadingSpinner from '../ui/LoadingSpinner';
// import ThemeCustomization from '../ui/ThemeCustomization';
import NotificationCenter from '../notifications/NotificationCenter';
import { motion, AnimatePresence } from 'framer-motion';

// Profile Logo Component (chỉ giữ lại cho user menu)
const ProfileLogo = ({ className = "w-6 h-6" }) => (
  <div className={`${className} relative`}>
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* User Head */}
      <circle cx="12" cy="8" r="4" fill="currentColor"/>
      
      {/* User Body */}
      <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      
      {/* Shadow Effect */}
      <circle cx="13" cy="9" r="4" fill="currentColor" opacity="0.3" transform="translate(1, 1)"/>
    </svg>
  </div>
);

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, currentTheme } = useTheme();
  // const { coins, xp, level } = useEconomy();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { path: '/', label: 'HOME' },
    { path: '/todo', label: 'TODO' },
    { path: '/advanced-chatbot', label: 'CHAT BOT' },
    { path: '/gamification', label: 'GAMIFICATION' },
    { path: '/profile', label: 'PROFILE' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/admin', label: 'Admin', icon: '⚙️' });
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        currentTheme === 'neon'
          ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] shadow-lg'
          : 'bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <Link to="/" className="flex items-center space-x-3 group animate-fade-in-left">
              {/* Professional Compact Logo Container */}
              <div className="logo-container relative w-12 h-12 bg-black rounded-2xl shadow-lg border border-gray-800 flex items-center justify-center group-hover:scale-105 transition-all duration-300 overflow-hidden">
                {/* Clean Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-2xl"></div>
                
                {/* Professional Vector Logo */}
                <div className="relative z-10 w-7 h-7 flex items-center justify-center">
                  {/* Main Circle */}
                  <div className="w-full h-full bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 rounded-full flex items-center justify-center relative">
                    {/* FPT Text */}
                    <span className="relative z-10 text-white font-black text-sm tracking-wider">
                      FPT
                    </span>
                    
                    {/* Professional Accent */}
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full opacity-90"></div>
                    <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 bg-orange-200 rounded-full opacity-80"></div>
                  </div>
                  
                  {/* Sharp Border */}
                  <div className="absolute inset-0 w-full h-full border border-orange-300/40 rounded-full"></div>
                  
                  {/* Inner Ring */}
                  <div className="absolute inset-1 w-full h-full border border-white/30 rounded-full"></div>
                </div>
                
                {/* Subtle Glow */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-orange-400/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Professional Text Content */}
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white group-hover:text-white/95 transition-all duration-300 tracking-[0.1em] drop-shadow-lg">
                  Compass
                </span>
                <span className="text-xs text-white/80 font-medium tracking-[0.1em] uppercase whitespace-nowrap">
                  AI LEARNING PLATFORM
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center justify-center space-x-4">
              {navItems.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-6 py-3 rounded-xl font-bold transition-all duration-300 group hover:scale-105 ${
                    location.pathname === item.path
                      ? 'text-[#FF6B35] bg-white shadow-lg border border-white/30'
                      : 'text-white hover:text-[#FF6B35] hover:bg-white hover:shadow-md'
                  }`}
                >
                  {/* Content */}
                  <span className="relative z-10 text-xs font-bold tracking-wide uppercase">
                    {item.label}
                  </span>
                  
                  {/* Active Indicator */}
                  {location.pathname === item.path && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-[#FF6B35] rounded-full animate-pulse"></div>
                  )}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4 animate-fade-in-right">
              {/* Theme Selector Button */}
              {/* <motion.button
                onClick={() => setShowThemeSelector(true)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  currentTheme === 'neon'
                    ? 'hover:bg-gray-800 text-cyan-400 hover:text-cyan-300'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-blue-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Change Theme"
                data-theme-button
              >
                <span className="text-xl">🎨</span>
              </motion.button> */}

              {user ? (
                <>
                  {/* User Stats */}
                  <div className="hidden sm:flex items-center space-x-3 px-3 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-yellow-300 text-sm">💰</span>
                      <span className="text-white font-bold text-xs">0</span>
                    </div>
                    <div className="w-px h-4 bg-white/20"></div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-yellow-300 text-sm">⭐</span>
                      <span className="text-white font-bold text-xs">0</span>
                    </div>
                    <div className="w-px h-4 bg-white/20"></div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-yellow-300 text-sm">🏆</span>
                      <span className="text-white font-bold text-xs">Lv.1</span>
                    </div>
                  </div>

                  {/* Notification Center */}
                  <div className="mr-2">
                    <NotificationCenter />
                  </div>

                  <div className="relative group">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-2 rounded-xl hover:bg-white/15 transition-all duration-300 group-hover:scale-105"
                    >
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                      <ProfileLogo className="w-7 h-7 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-white group-hover:text-white/90 transition-colors duration-300">
                      {user.name}
                    </span>
                    <svg className="w-4 h-4 text-white/70 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-3 w-56 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100">
                    {/* Header Section */}
                    <div className="relative overflow-hidden">
                      {/* Background Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
                      
                      {/* User Info */}
                      <div className="relative px-6 py-5 border-b border-gray-100/60">
                        <div className="flex items-center space-x-3">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <ProfileLogo className="w-7 h-7 text-white" />
                          </div>
                          
                          {/* User Details */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate leading-tight">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate leading-tight mt-0.5">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200 group/item"
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-500 group-hover/item:text-blue-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="font-medium">Profile</span>
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="w-full flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-200 group/item disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          {isLoading ? (
                            <LoadingSpinner type="dots" size="small" />
                          ) : (
                            <svg className="w-4 h-4 text-gray-500 group-hover/item:text-red-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium">
                          {isLoading ? 'Logging out...' : 'Logout'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-sm font-bold text-white hover:text-white/90 transition-colors duration-300"
                  >
                    Login
                  </Link>
                  
                  <Link
                    to="/register"
                    className="px-6 py-3 bg-white text-[#FF6B35] text-sm font-bold rounded-lg hover:bg-white/90 transition-all duration-300 shadow-md"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/15 transition-all duration-300"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden animate-slide-in-down">
              <div className="px-3 pt-3 pb-4 space-y-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/30 mt-2">
                {navItems.map((item, index) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-bold transition-all duration-300 animate-fade-in-left stagger-${index + 1} ${
                      location.pathname === item.path
                        ? 'text-[#FF6B35] bg-[#FF6B35]/15 border border-[#FF6B35]/30'
                        : 'text-gray-700 hover:text-[#FF6B35] hover:bg-[#FF6B35]/10'
                    }`}
                  >
                    <span className="font-bold text-center w-full text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E55A2B]" />
      </header>

      {/* Theme Selector Modal */}
      {/* <ThemeCustomization
            isOpen={showThemeSelector}
            onClose={() => setShowThemeSelector(false)}
          /> */}
    </>
  );
};

export default Header;
