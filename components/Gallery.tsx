
import React, { useState, useCallback } from 'react';
import { GalleryImage, ImageFile } from '../types';
import { HelpTooltip } from './HelpTooltip';

interface GalleryProps {
  images: GalleryImage[];
  onDelete: (id: string) => void;
  onSelect: (image: ImageFile) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ images, onDelete, onSelect }) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      onDelete(id);
      setSelectedImage(null);
    }
  }, [onDelete]);

  if (images.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-2xl font-bold text-white">My Gallery</h2>
          <HelpTooltip content="This is your personal gallery of saved creations. Click on any image to view its details, including the prompt used to create it, or to delete it." />
        </div>
        <p className="mt-4 text-gray-400">Your gallery is empty. Head over to one of the studios to create and save your first masterpiece!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-white">My Gallery</h2>
        <HelpTooltip content="This is your personal gallery of saved creations. Click on any image to view its details, including the prompt used to create it, or to delete it." />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {images.map(image => (
          <div
            key={image.id}
            className="aspect-square bg-gray-900 rounded-lg overflow-hidden cursor-pointer group relative"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={`data:${image.mimeType};base64,${image.base64}`}
              alt={image.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-sm font-bold text-center p-2">View Details</p>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" 
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 flex justify-between items-start border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Image Details</h3>
              <button onClick={() => setSelectedImage(null)} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
            </div>
            <div className="p-4 sm:p-6 grid md:grid-cols-2 gap-6 overflow-y-auto">
              <div className="bg-gray-900 rounded-lg flex items-center justify-center">
                <img src={`data:${selectedImage.mimeType};base64,${selectedImage.base64}`} alt={selectedImage.name} className="rounded-lg w-full object-contain max-h-[60vh]" />
              </div>
              <div className="flex flex-col gap-4">
                <div>
                    <p className="text-sm font-semibold text-cyan-400">Prompt:</p>
                    <p className="mt-1 bg-gray-900 p-3 rounded-md text-gray-300 text-sm max-h-48 overflow-y-auto">{selectedImage.prompt}</p>
                </div>
                <div>
                    <p className="text-sm font-semibold text-cyan-400">Generated:</p>
                    <p className="mt-1 text-gray-300 text-sm">{new Date(selectedImage.timestamp).toLocaleString()}</p>
                </div>
                 <div>
                    <p className="text-sm font-semibold text-cyan-400">Filename:</p>
                    <p className="mt-1 text-gray-300 text-sm">{selectedImage.name}</p>
                </div>
                <div className="mt-auto flex flex-col sm:flex-row gap-2">
                    <button onClick={() => handleDelete(selectedImage.id)} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">Delete Image</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
