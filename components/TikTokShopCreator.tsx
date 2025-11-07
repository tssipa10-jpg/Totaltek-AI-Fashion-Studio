
import React, { useState, useCallback } from 'react';
import { createProductScene } from '../services/geminiService';
import { ImageFile, GalleryImage } from '../types';
import { ImageInput } from './ImageInput';
import { Loader } from './Loader';
import { HelpTooltip } from './HelpTooltip';

interface TikTokShopCreatorProps {
  onImageReadyForVideo: (image: ImageFile) => void;
  onAddToGallery: (imageData: Omit<GalleryImage, 'id' | 'timestamp'>) => void;
}

export const TikTokShopCreator: React.FC<TikTokShopCreatorProps> = ({ onImageReadyForVideo, onAddToGallery }) => {
  const [personImage, setPersonImage] = useState<ImageFile | null>(null);
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<{ file: ImageFile; saved: boolean } | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!personImage) {
      setError('Please upload a photo of the person.');
      return;
    }
    if (!productImage) {
      setError('Please upload a photo of the product.');
      return;
    }
    if (!prompt) {
      setError('Please describe the scene.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResultImage(null);
    try {
      const imageUrl = await createProductScene(prompt, personImage, productImage);
      const newImageFile = { base64: imageUrl.split(',')[1], mimeType: 'image/png', name: 'product_scene.png' };
      setResultImage({ file: newImageFile, saved: false });
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred while creating the scene.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, personImage, productImage]);

  const handleCreateVideo = () => {
    if (resultImage) {
      onImageReadyForVideo(resultImage.file);
    }
  };
  
  const handleSaveToGallery = () => {
    if (!resultImage || resultImage.saved) return;
    onAddToGallery({
      ...resultImage.file,
      prompt: prompt,
    });
    setResultImage(prev => (prev ? { ...prev, saved: true } : null));
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-white">TikTok Shop Creator</h2>
        <HelpTooltip content={
          <>
            <p className="font-bold mb-2">How to Create a Product Scene:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Upload a photo of a person.</li>
              <li>Upload a photo of your product.</li>
              <li>Describe the scene and how the person should interact with the product.</li>
              <li>Click "Generate Scene".</li>
              <li>Save the result or send it to the Video Generator to create an ad.</li>
            </ol>
          </>
        } />
      </div>
      <p className="text-gray-400">Create compelling product scenes for your e-commerce videos. Combine a person, a product, and a custom scene into a single, professional image.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ImageInput
            label="1. Upload Person Image"
            id="person-image-tiktok"
            onImageChange={setPersonImage}
            allowMultiple={false}
          />
          <ImageInput
            label="2. Upload Product Image"
            id="product-image-tiktok"
            onImageChange={setProductImage}
            allowMultiple={false}
          />
           <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="3. Describe the scene... e.g., A person happily using the product in a modern kitchen with bright, natural lighting."
            className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            rows={4}
            disabled={isLoading}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !personImage || !productImage || !prompt}
            className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generating Scene...' : 'Generate Scene'}
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Result</h3>
          {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}
          <div className="w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center relative group">
            {isLoading && <Loader message="Directing your scene..." />}
            {resultImage && <img src={`data:${resultImage.file.mimeType};base64,${resultImage.file.base64}`} alt="Generated product scene" className="max-w-full max-h-full object-contain rounded-lg" />}
            {!isLoading && !resultImage && <p className="text-gray-500 text-center p-4">Your generated scene will appear here</p>}
            
            {resultImage && (
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleSaveToGallery}
                  disabled={resultImage.saved}
                  className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-105"
                >
                  {resultImage.saved ? 'Saved ✔️' : 'Save'}
                </button>
              </div>
            )}
          </div>
          {resultImage && (
            <button
              onClick={handleCreateVideo}
              className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Video with this Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
};