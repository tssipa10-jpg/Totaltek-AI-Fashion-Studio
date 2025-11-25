import React, { useState, useCallback } from 'react';
import { createOutfit } from '../services/geminiService';
import { ImageFile, GalleryImage, ImageAspectRatio } from '../types';
import { ImageInput } from './ImageInput';
import { Loader } from './Loader';
import { HelpTooltip } from './HelpTooltip';

interface OutfitStudioProps {
  onImageReadyForVideo: (image: ImageFile) => void;
  onAddToGallery: (imageData: Omit<GalleryImage, 'id' | 'timestamp'>) => void;
}

export const OutfitStudio: React.FC<OutfitStudioProps> = ({ onImageReadyForVideo, onAddToGallery }) => {
  const [personImage, setPersonImage] = useState<ImageFile | null>(null);
  const [clothingImages, setClothingImages] = useState<ImageFile[]>([]);
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('9:16');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<{ file: ImageFile; saved: boolean } | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!personImage) {
      setError('Please upload a photo of the person.');
      return;
    }
    if (clothingImages.length === 0) {
      setError('Please upload at least one clothing item.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResultImage(null);
    try {
      const imageUrl = await createOutfit(prompt, personImage, clothingImages, aspectRatio);
      const newImageFile = { base64: imageUrl.split(',')[1], mimeType: 'image/png', name: 'outfit.png' };
      setResultImage({ file: newImageFile, saved: false });
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, personImage, clothingImages, aspectRatio]);

  const handleCreateVideo = () => {
    if (resultImage) {
      onImageReadyForVideo(resultImage.file);
    }
  };
  
  const handleSaveToGallery = () => {
    if (!resultImage || resultImage.saved) return;
    onAddToGallery({
      ...resultImage.file,
      prompt: prompt || 'Outfit created in StyloSphere Studio',
    });
    setResultImage(prev => (prev ? { ...prev, saved: true } : null));
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = `data:${resultImage.file.mimeType};base64,${resultImage.file.base64}`;
    link.download = `outfit_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-white">Outfit Studio</h2>
        <HelpTooltip content={
          <>
            <p className="font-bold mb-2">How to Create an Outfit:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Upload a full-body photo of a person.</li>
              <li>Upload one or more images of clothing items on plain backgrounds.</li>
              <li>(Optional) Describe how the outfit should be worn or specific styling details.</li>
              <li>Select your desired aspect ratio.</li>
              <li>Click "Dress Me Up!" to see the AI style the person.</li>
              <li>You can then save the result or use it to generate a video.</li>
            </ol>
          </>
        } />
      </div>
      <p className="text-gray-400">Upload a photo of a person and some clothing items. The AI will dress the person for you.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ImageInput
            label="1. Upload Photo of Person"
            id="person-image-upload"
            onImageChange={setPersonImage}
            allowMultiple={false}
          />
          <ImageInput
            label="2. Upload Clothing Items"
            id="clothing-image-upload"
            onImageChange={setClothingImages}
            allowMultiple={true}
          />
          
          <div>
            <label htmlFor="outfit-prompt" className="block text-sm font-medium text-gray-300 mb-2">3. Styling Instructions (Optional)</label>
            <textarea
              id="outfit-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Tuck the shirt in, roll up the sleeves, add a casual vibe..."
              className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">4. Select Aspect Ratio</label>
            <div className="flex flex-wrap gap-2">
              {([
                { value: '1:1', label: 'Square' },
                { value: '9:16', label: 'Portrait' },
                { value: '16:9', label: 'Landscape' },
                { value: '4:3', label: 'Standard' },
                { value: '3:4', label: 'Vertical' },
              ] as {value: ImageAspectRatio, label: string}[]).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setAspectRatio(value)}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-md font-semibold text-sm transition-colors ${aspectRatio === value ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  {label} ({value})
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !personImage || clothingImages.length === 0}
            className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Styling...' : 'Dress Me Up!'}
          </button>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-white">Result</h3>
          {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}
          <div className="w-full aspect-[9/16] bg-gray-900 rounded-lg flex items-center justify-center relative group">
            {isLoading && <Loader message="Creating your look..." />}
            {resultImage && <img src={`data:${resultImage.file.mimeType};base64,${resultImage.file.base64}`} alt="Final Outfit" className="max-w-full max-h-full object-contain rounded-lg" />}
            {!isLoading && !resultImage && <p className="text-gray-500 text-center p-4">Your final look will appear here</p>}
            
            {resultImage && (
              <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-transform duration-200 hover:scale-105"
                >
                  Download ⬇️
                </button>
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