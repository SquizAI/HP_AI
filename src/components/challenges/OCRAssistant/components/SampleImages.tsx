import React from 'react';
import { FileText, Edit3 } from 'lucide-react';

interface SampleImagesProps {
  onSelectImage: (imageUrl: string, isHandwriting: boolean) => void;
}

const SampleImages: React.FC<SampleImagesProps> = ({ onSelectImage }) => {
  // Sample images with both printed and handwritten text
  const sampleImages = [
    {
      url: 'https://images.unsplash.com/photo-1585909695284-32d2985ac9c0',
      alt: 'Printed document',
      description: 'Business Letter',
      isHandwriting: false
    },
    {
      url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
      alt: 'Business receipt',
      description: 'Receipt',
      isHandwriting: false
    },
    {
      url: 'https://images.unsplash.com/photo-1611346125273-9436ad1f97a5',
      alt: 'Handwritten note',
      description: 'Handwritten Note',
      isHandwriting: true
    },
    {
      url: 'https://images.unsplash.com/photo-1623531079302-608c4e670cde',
      alt: 'Wikipedia article',
      description: 'Printed Article',
      isHandwriting: false
    },
    {
      url: 'https://images.unsplash.com/photo-1598343672916-de13ab0636ed',
      alt: 'Handwritten journal',
      description: 'Handwritten Journal',
      isHandwriting: true
    },
    {
      url: 'https://images.unsplash.com/photo-1555421689-3f034debb7a6',
      alt: 'Menu card',
      description: 'Restaurant Menu',
      isHandwriting: false
    }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {sampleImages.map((image, index) => (
        <div 
          key={index}
          className="relative group overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200"
          onClick={() => onSelectImage(image.url, image.isHandwriting)}
        >
          <img 
            src={`${image.url}?auto=format&fit=crop&w=300&h=200`}
            alt={image.alt}
            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              // Fallback if image fails to load - use a specific fallback for printed vs handwritten
              (e.target as HTMLImageElement).src = image.isHandwriting 
                ? "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=300&h=200" // Handwritten fallback
                : "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=300&h=200"; // Printed fallback
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80" />
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <span className="text-white text-sm font-medium block truncate">{image.description}</span>
            <div className="flex items-center mt-1">
              {image.isHandwriting ? (
                <span className="flex items-center text-xs text-amber-300">
                  <Edit3 size={10} className="mr-1" />
                  Handwritten
                </span>
              ) : (
                <span className="flex items-center text-xs text-blue-300">
                  <FileText size={10} className="mr-1" />
                  Printed
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SampleImages; 