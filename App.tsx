
import React, { useState, useCallback, useEffect } from 'react';
import { AppTab, ImageFile, GalleryImage } from './types';
import { TabButton } from './components/TabButton';
import { OutfitStudio } from './components/OutfitStudio';
import { ImageGenerator } from './components/ImageGenerator';
import { ImageEditor } from './components/ImageEditor';
import { VideoGenerator } from './components/VideoGenerator';
import { StyleTransfer } from './components/StyleTransfer';
import { Gallery } from './components/Gallery';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.OUTFIT_STUDIO);
  const [videoSourceImage, setVideoSourceImage] = useState<ImageFile | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    try {
      const storedImages = localStorage.getItem('styloSphereGallery');
      if (storedImages) {
        setGalleryImages(JSON.parse(storedImages));
      }
    } catch (error) {
      console.error("Failed to load images from local storage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('styloSphereGallery', JSON.stringify(galleryImages));
    } catch (error) {
      console.error("Failed to save images to local storage", error);
    }
  }, [galleryImages]);

  const handleAddToGallery = useCallback((imageData: Omit<GalleryImage, 'id' | 'timestamp'>) => {
    const newImage: GalleryImage = {
      ...imageData,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    setGalleryImages(prev => [newImage, ...prev]);
  }, []);
  
  const handleDeleteFromGallery = useCallback((id: string) => {
    setGalleryImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const handleOutfitCreated = useCallback((image: ImageFile) => {
    setVideoSourceImage(image);
    setActiveTab(AppTab.VIDEO_GENERATOR);
  }, []);
  
  const handleSelectFromGallery = useCallback((image: ImageFile) => {
      // Could be extended to use gallery images in editors
      console.log('Selected image from gallery:', image.name);
  }, []);


  const renderActiveTab = () => {
    switch (activeTab) {
      case AppTab.OUTFIT_STUDIO:
        return <OutfitStudio onOutfitCreated={handleOutfitCreated} onAddToGallery={handleAddToGallery} />;
      case AppTab.IMAGE_GENERATOR:
        return <ImageGenerator onAddToGallery={handleAddToGallery} />;
      case AppTab.IMAGE_EDITOR:
        return <ImageEditor onAddToGallery={handleAddToGallery} />;
      case AppTab.STYLE_TRANSFER:
        return <StyleTransfer onAddToGallery={handleAddToGallery} />;
      case AppTab.VIDEO_GENERATOR:
        return <VideoGenerator sourceImage={videoSourceImage} />;
      case AppTab.GALLERY:
        return <Gallery images={galleryImages} onDelete={handleDeleteFromGallery} onSelect={handleSelectFromGallery} />;
      default:
        return null;
    }
  };
  
  const comingSoonFeatures = ['Accessory Try-on', 'Pose Generation'];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
            StyloSphere AI
          </h1>
          <p className="mt-2 text-lg text-gray-400">Your Personal AI-Powered Fashion and Content Studio</p>
        </header>

        <nav className="mb-8 flex flex-wrap justify-center gap-2">
          {Object.values(AppTab).map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              isActive={activeTab === tab}
              onClick={() => {
                if(tab !== AppTab.VIDEO_GENERATOR) setVideoSourceImage(null);
                setActiveTab(tab)
              }}
            />
          ))}
          {comingSoonFeatures.map(feature => (
              <TabButton
                key={feature}
                label={`${feature} (Soon)`}
                isActive={false}
                onClick={() => {}}
                isDisabled={true}
              />
          ))}
        </nav>

        <main>
          {renderActiveTab()}
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} StyloSphere AI. All rights reserved.</p>
            <p className="mt-1">Powered by Google Gemini.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;