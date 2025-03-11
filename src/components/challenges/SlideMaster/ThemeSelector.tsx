import React, { useState } from 'react';
import { Theme, SlideMasterState } from './SlidesMasterMain';

interface ThemeSelectorProps {
  state: SlideMasterState;
  updateState: (newState: Partial<SlideMasterState>) => void;
  onClose: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  state,
  updateState,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Available theme categories
  const categories = [
    { id: 'all', name: 'All Themes' },
    { id: 'professional', name: 'Professional' },
    { id: 'creative', name: 'Creative' },
    { id: 'minimalist', name: 'Minimalist' },
    { id: 'bold', name: 'Bold' }
  ];
  
  // Sample themes
  const themes = [
    {
      name: 'Corporate Blue',
      primaryColor: '#1A4B8C',
      secondaryColor: '#2D6CC0',
      accentColor: '#F39237',
      backgroundColor: '#FFFFFF',
      fontTitle: 'Arial, sans-serif',
      fontBody: 'Arial, sans-serif',
      backgroundStyle: 'solid' as 'solid' | 'gradient' | 'image' | 'pattern',
      category: 'professional'
    },
    {
      name: 'Modern Minimal',
      primaryColor: '#333333',
      secondaryColor: '#777777',
      accentColor: '#4CAF50',
      backgroundColor: '#F5F5F5',
      fontTitle: 'Helvetica, sans-serif',
      fontBody: 'Helvetica, sans-serif',
      backgroundStyle: 'solid' as 'solid' | 'gradient' | 'image' | 'pattern',
      category: 'minimalist'
    },
    {
      name: 'Bold Impact',
      primaryColor: '#D81B60',
      secondaryColor: '#8E24AA',
      accentColor: '#FFC107',
      backgroundColor: '#121212',
      fontTitle: 'Impact, sans-serif',
      fontBody: 'Roboto, sans-serif',
      backgroundStyle: 'solid' as 'solid' | 'gradient' | 'image' | 'pattern',
      category: 'bold'
    },
    {
      name: 'Creative Purple',
      primaryColor: '#6200EA',
      secondaryColor: '#B388FF',
      accentColor: '#FF5722',
      backgroundColor: '#FAFAFA',
      fontTitle: 'Georgia, serif',
      fontBody: 'Verdana, sans-serif',
      backgroundStyle: 'gradient' as 'solid' | 'gradient' | 'image' | 'pattern',
      category: 'creative'
    },
    {
      name: 'Executive Gray',
      primaryColor: '#455A64',
      secondaryColor: '#78909C',
      accentColor: '#FFC107',
      backgroundColor: '#ECEFF1',
      fontTitle: 'Times New Roman, serif',
      fontBody: 'Arial, sans-serif',
      backgroundStyle: 'solid' as 'solid' | 'gradient' | 'image' | 'pattern',
      category: 'professional'
    },
    {
      name: 'Vibrant Orange',
      primaryColor: '#FF5722',
      secondaryColor: '#FF9800',
      accentColor: '#4CAF50',
      backgroundColor: '#FAFAFA',
      fontTitle: 'Trebuchet MS, sans-serif',
      fontBody: 'Calibri, sans-serif',
      backgroundStyle: 'solid' as 'solid' | 'gradient' | 'image' | 'pattern',
      category: 'bold'
    },
    {
      name: 'Clean White',
      primaryColor: '#0277BD',
      secondaryColor: '#03A9F4',
      accentColor: '#FF3D00',
      backgroundColor: '#FFFFFF',
      fontTitle: 'Segoe UI, sans-serif',
      fontBody: 'Segoe UI, sans-serif',
      backgroundStyle: 'solid' as 'solid' | 'gradient' | 'image' | 'pattern',
      category: 'minimalist'
    },
    {
      name: 'Artistic Teal',
      primaryColor: '#00897B',
      secondaryColor: '#4DB6AC',
      accentColor: '#FFC107',
      backgroundColor: '#E0F2F1',
      fontTitle: 'Palatino Linotype, serif',
      fontBody: 'Book Antiqua, serif',
      backgroundStyle: 'solid' as 'solid' | 'gradient' | 'image' | 'pattern',
      category: 'creative'
    }
  ];
  
  // Filter themes based on category and search query
  const filteredThemes = themes.filter(theme => {
    const matchesCategory = selectedCategory === 'all' || theme.category === selectedCategory;
    const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Check and ensure themes have all required properties
  const ensureThemeFormat = (theme: any): Theme => {
    return {
      name: theme.name || 'Unnamed Theme',
      primaryColor: theme.primaryColor || '#333333',
      secondaryColor: theme.secondaryColor || '#666666',
      accentColor: theme.accentColor || '#4CAF50',
      backgroundColor: theme.backgroundColor || '#FFFFFF',
      fontTitle: theme.fontTitle || 'Arial, sans-serif',
      fontBody: theme.fontBody || 'Arial, sans-serif',
      backgroundStyle: (theme.backgroundStyle as 'solid' | 'gradient' | 'image' | 'pattern') || 'solid'
    };
  };
  
  // Apply selected theme
  const applyTheme = (theme: typeof themes[0]) => {
    // Create a theme object that matches the Theme interface
    const newTheme = ensureThemeFormat(theme);
    
    updateState({ theme: newTheme });
    onClose();
  };
  
  // Generate a random theme
  const generateRandomTheme = () => {
    const primaryColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    const secondaryColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    const accentColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    
    const fonts = [
      'Arial, sans-serif', 
      'Helvetica, sans-serif', 
      'Georgia, serif', 
      'Times New Roman, serif',
      'Verdana, sans-serif',
      'Roboto, sans-serif'
    ];
    
    const newTheme = ensureThemeFormat({
      name: 'Custom Random Theme',
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor: '#FFFFFF',
      fontTitle: fonts[Math.floor(Math.random() * fonts.length)],
      fontBody: fonts[Math.floor(Math.random() * fonts.length)],
      backgroundStyle: 'solid'
    });
    
    updateState({ theme: newTheme });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Choose a Theme</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center mb-4 gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <button
              onClick={generateRandomTheme}
              className="px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Generate Random Theme
            </button>
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Theme Grid */}
        <div className="p-6 overflow-y-auto flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredThemes.map((theme, index) => (
              <div
                key={index}
                onClick={() => applyTheme(theme)}
                className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Theme Preview */}
                <div style={{ backgroundColor: theme.backgroundColor }} className="p-4">
                  <div 
                    style={{ backgroundColor: theme.primaryColor }} 
                    className="h-3 w-full rounded mb-2"
                  ></div>
                  <div className="flex space-x-2 mb-3">
                    <div 
                      style={{ backgroundColor: theme.secondaryColor }} 
                      className="h-3 w-1/3 rounded"
                    ></div>
                    <div 
                      style={{ backgroundColor: theme.accentColor }} 
                      className="h-3 w-1/3 rounded"
                    ></div>
                    <div 
                      style={{ backgroundColor: theme.secondaryColor }} 
                      className="h-3 w-1/3 rounded"
                    ></div>
                  </div>
                  <div style={{ fontFamily: theme.fontTitle }} className="text-base font-bold mb-1">
                    Sample Heading
                  </div>
                  <div style={{ fontFamily: theme.fontBody }} className="text-xs">
                    This is sample text that shows how this theme looks with content.
                  </div>
                </div>
                {/* Theme Info */}
                <div className="p-3 bg-white border-t border-gray-200">
                  <div className="font-medium text-sm">{theme.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{theme.category}</div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredThemes.length === 0 && (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No themes found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 mr-4 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={generateRandomTheme}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Generate New Theme
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector; 