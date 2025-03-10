import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Lightbulb, User, Settings, Heart } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center">
                  <span className="text-2xl mr-2">🧠</span>
                  <span className="text-[#5CB2CC] font-bold text-xl">AI Challenge Hub</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-1">
                <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Leaderboard
                </a>
                <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Resources
                </a>
                <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                  About
                </a>
              </div>
              <button className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                <User size={20} />
              </button>
            </div>
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

      <nav className="bg-white shadow-lg fixed bottom-0 left-0 right-0 border-t border-gray-200 md:hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-around">
            <Link to="/" className="py-3 px-4 text-center flex flex-col items-center text-xs font-medium text-[#5CB2CC]">
              <Home size={20} className="mb-1" />
              Home
            </Link>
            <Link to="/explore" className="py-3 px-4 text-center flex flex-col items-center text-xs font-medium text-gray-500 hover:text-[#5CB2CC]">
              <Lightbulb size={20} className="mb-1" />
              Explore
            </Link>
            <Link to="/settings" className="py-3 px-4 text-center flex flex-col items-center text-xs font-medium text-gray-500 hover:text-[#5CB2CC]">
              <Settings size={20} className="mb-1" />
              Settings
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Mobile footer - above the nav bar */}
      <footer className="bg-white border-t border-gray-200 py-3 block md:hidden text-center text-xs mt-8 mb-20">
        <div className="px-4">
          <div className="flex flex-col items-center">
            <div className="text-gray-500 flex items-center mb-2 flex-wrap justify-center">
              <span>© 2025 AI Challenge Hub</span>
              <div className="mx-2 flex items-center">
                Made with <Heart size={12} className="mx-1 text-red-500 animate-pulse" fill="currentColor" /> by TriveraTech
              </div>
            </div>
            <div className="flex space-x-4 mb-2">
              <a href="#" className="text-gray-500">Terms</a>
              <a href="#" className="text-gray-500">Privacy</a>
              <a href="https://triveratech.com/" target="_blank" rel="noopener noreferrer" className="text-gray-500">
                Contact
              </a>
            </div>
            <div className="text-gray-400 italic text-[10px]">
              "NO AI assistants were harmed in this app!"
            </div>
          </div>
        </div>
      </footer>
      
      {/* Desktop footer */}
      <footer className="bg-white border-t border-gray-200 py-6 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 mb-4 md:mb-0 flex items-center">
              © 2025 AI Challenge Hub. NO AI assistants were harmed in the making of this app. Made with <Heart size={14} className="mx-1 text-red-500 animate-pulse" fill="currentColor" /> by <a href="https://triveratech.com/" target="_blank" rel="noopener noreferrer" className="ml-1 text-[#5CB2CC] hover:underline">TriveraTech</a>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700 group relative">
                Terms
                <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-2 py-1 -top-10 left-1/2 transform -translate-x-1/2 w-48 text-center">
                  Rule #1: Don't talk about AI Club. Rule #2: Only use AI responsibly... and for memes.
                </span>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 group relative">
                Privacy
                <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-2 py-1 -top-10 left-1/2 transform -translate-x-1/2 w-48 text-center">
                  We respect your privacy so much we don't even know where our servers are located!
                </span>
              </a>
              <a href="https://triveratech.com/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-4 text-xs text-center text-gray-400 italic">
            "In a world of AI, the most valuable skill is still knowing which questions to ask."
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout 