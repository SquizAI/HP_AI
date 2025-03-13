import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Lightbulb, User, Settings, Heart, BookOpen, Menu, X, ChevronRight } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Helper function to check if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (mobileMenuOpen && !target.closest('[data-mobile-menu]')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Enhanced Header with subtle gradient */}
      <header className="bg-gradient-to-r from-white to-blue-50 shadow-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center transition-transform hover:scale-105">
                  <img 
                    src="/triveratech-logo.png" 
                    alt="TriveraTech Logo" 
                    className="h-8 w-auto mr-3" 
                  />
                  <div className="flex flex-col">
                    <span className="text-[#5CB2CC] font-bold text-xl tracking-tight">AI Challenge Hub</span>
                    <span className="text-[9px] text-gray-500 font-medium -mt-1">by TriveraTech</span>
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex space-x-1">
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center relative overflow-hidden ${
                    isActive('/') || isActive('/challenges') 
                      ? 'text-[#5CB2CC] bg-blue-50' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Home size={16} className="mr-2" />
                  Challenges
                  {(isActive('/') || isActive('/challenges')) && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#5CB2CC]"></span>
                  )}
                </Link>
                <Link 
                  to="/resources" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center relative overflow-hidden ${
                    isActive('/resources') 
                      ? 'text-[#5CB2CC] bg-blue-50' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BookOpen size={16} className="mr-2" />
                  Resources
                  {isActive('/resources') && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#5CB2CC]"></span>
                  )}
                </Link>
                <a 
                  href="https://triveratech.com/about" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                >
                  <Lightbulb size={16} className="mr-2" />
                  About
                </a>
              </div>
              <button className="p-2 rounded-full bg-blue-100 text-[#5CB2CC] hover:bg-blue-200 transition-colors shadow-sm">
                <User size={20} />
              </button>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(!mobileMenuOpen);
                }} 
                className="p-2 rounded-md text-gray-600 hover:text-[#5CB2CC] focus:outline-none"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle mobile menu"
                data-mobile-menu
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu dropdown with improved animation */}
        <div 
          className={`md:hidden bg-white border-b border-gray-200 shadow-lg transform transition-all duration-300 ${
            mobileMenuOpen 
              ? 'opacity-100 max-h-96' 
              : 'opacity-0 max-h-0 pointer-events-none'
          } overflow-hidden`}
          data-mobile-menu
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/"
              className={`block px-3 py-3 rounded-md text-base font-medium ${
                isActive('/') || isActive('/challenges') 
                  ? 'text-[#5CB2CC] bg-blue-50' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Home size={18} className="mr-3" /> Challenges
                </div>
                <ChevronRight size={16} />
              </div>
            </Link>
            <Link 
              to="/resources"
              className={`block px-3 py-3 rounded-md text-base font-medium ${
                isActive('/resources') 
                  ? 'text-[#5CB2CC] bg-blue-50' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen size={18} className="mr-3" /> Resources
                </div>
                <ChevronRight size={16} />
              </div>
            </Link>
            <a 
              href="https://triveratech.com/about" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Lightbulb size={18} className="mr-3" /> About
                </div>
                <ChevronRight size={16} />
              </div>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <div className="h-16 md:hidden">
        {/* Spacer for mobile to prevent content being hidden behind the nav */}
      </div>

      {/* Updated mobile navigation with active state indicators and better touch targets */}
      <nav className="bg-white shadow-lg fixed bottom-0 left-0 right-0 border-t border-gray-200 md:hidden z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-around">
            <Link 
              to="/" 
              className={`py-4 px-4 text-center flex flex-col items-center text-xs font-medium relative ${
                isActive('/') || isActive('/challenges') ? 'text-[#5CB2CC]' : 'text-gray-500 hover:text-[#5CB2CC]'
              }`}
              aria-label="Home"
            >
              <Home size={20} className="mb-1" />
              <span>Home</span>
              {(isActive('/') || isActive('/challenges')) && (
                <span className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-[#5CB2CC] rounded-full"></span>
              )}
            </Link>
            <Link 
              to="/resources" 
              className={`py-4 px-4 text-center flex flex-col items-center text-xs font-medium relative ${
                isActive('/resources') ? 'text-[#5CB2CC]' : 'text-gray-500 hover:text-[#5CB2CC]'
              }`}
              aria-label="Resources"
            >
              <BookOpen size={20} className="mb-1" />
              <span>Resources</span>
              {isActive('/resources') && (
                <span className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-[#5CB2CC] rounded-full"></span>
              )}
            </Link>
            <Link 
              to="/settings" 
              className={`py-4 px-4 text-center flex flex-col items-center text-xs font-medium relative ${
                isActive('/settings') ? 'text-[#5CB2CC]' : 'text-gray-500 hover:text-[#5CB2CC]'
              }`}
              aria-label="Settings"
            >
              <Settings size={20} className="mb-1" />
              <span>Settings</span>
              {isActive('/settings') && (
                <span className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-[#5CB2CC] rounded-full"></span>
              )}
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Updated Mobile footer with better spacing */}
      <footer className="bg-white border-t border-gray-200 py-4 block md:hidden text-center text-xs mt-8 mb-20">
        <div className="px-4">
          <div className="flex flex-col items-center">
            <div className="text-gray-500 flex items-center mb-2 flex-wrap justify-center space-y-1">
              <span>© 2025 AI Challenge Hub</span>
              <div className="flex items-center mx-auto my-1">
                Made with <Heart size={12} className="mx-1 text-red-500 animate-pulse" fill="currentColor" /> by 
                <a href="https://triveratech.com/" target="_blank" rel="noopener noreferrer" className="ml-1 text-[#5CB2CC] font-medium">
                  TriveraTech
                </a>
              </div>
            </div>
            <div className="flex space-x-6 mb-2">
              <a href="#" className="text-gray-500 hover:text-[#5CB2CC] transition-colors">Terms</a>
              <a href="#" className="text-gray-500 hover:text-[#5CB2CC] transition-colors">Privacy</a>
              <a href="https://triveratech.com/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#5CB2CC] transition-colors">
                Contact
              </a>
            </div>
            <div className="text-gray-400 italic text-[10px]">
              "NO AI assistants were harmed in this app!"
            </div>
          </div>
        </div>
      </footer>
      
      {/* Updated Desktop footer with better styling */}
      <footer className="bg-gradient-to-r from-white to-blue-50 border-t border-gray-200 py-6 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 mb-4 md:mb-0 flex items-center">
              © 2025 AI Challenge Hub. Made with <Heart size={14} className="mx-1 text-red-500 animate-pulse" fill="currentColor" /> by 
              <a href="https://triveratech.com/" target="_blank" rel="noopener noreferrer" className="ml-1 text-[#5CB2CC] font-medium hover:underline transition-colors">
                TriveraTech
              </a>
            </div>
            <div className="flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-[#5CB2CC] transition-colors group relative">
                Terms
                <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded-md px-3 py-2 -top-12 left-1/2 transform -translate-x-1/2 w-52 text-center shadow-lg">
                  Rule #1: Don't talk about AI Club. Rule #2: Only use AI responsibly... and for memes.
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></span>
                </span>
              </a>
              <a href="#" className="text-gray-500 hover:text-[#5CB2CC] transition-colors group relative">
                Privacy
                <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded-md px-3 py-2 -top-12 left-1/2 transform -translate-x-1/2 w-52 text-center shadow-lg">
                  We respect your privacy so much we don't even know where our servers are located!
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></span>
                </span>
              </a>
              <a href="https://triveratech.com/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#5CB2CC] transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-4 text-xs text-center text-gray-500 italic">
            "In a world of AI, the most valuable skill is still knowing which questions to ask."
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout 