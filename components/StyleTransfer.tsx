
import React, { useState, useCallback } from 'react';
import { transferStyle } from '../services/geminiService';
import { ImageFile, GalleryImage, ImageAspectRatio } from '../types';
import { ImageInput } from './ImageInput';
import { Loader } from './Loader';
import { HelpTooltip } from './HelpTooltip';

interface StyleTransferProps {
  onAddToGallery: (imageData: Omit<GalleryImage, 'id' | 'timestamp'>) => void;
}

export const StyleTransfer: React.FC<StyleTransferProps> = ({ onAddToGallery }) => {
  const [contentImage, setContentImage] = useState<ImageFile | null>(null);
  const [styleImage, setStyleImage] = useState<ImageFile | null>(null);
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<{ url: string; saved: boolean } | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!contentImage) {
      setError('Please upload a content image.');
      return;
    }
    if (!styleImage) {
      setError('Please upload a style image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResultImage(null);
    try {
      const imageUrl = await transferStyle(contentImage, styleImage, aspectRatio);
      setResultImage({ url: imageUrl, saved: false });
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [contentImage, styleImage, aspectRatio]);
  
  const handleSaveToGallery = () => {
    if (!resultImage || resultImage.saved) return;
    const base64 = resultImage.url.split(',')[1];
    const mimeType = resultImage.url.match(/data:(.*);base64,/)?.[1] || 'image/png';
    const prompt = `Style transfer between ${contentImage?.name || 'content'} and ${styleImage?.name || 'style'}`;
    onAddToGallery({
      base64,
      mimeType,
      name: `style_transfer_${Date.now()}.png`,
      prompt,
    });
    setResultImage(prev => (prev ? { ...prev, saved: true } : null));
  };


  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-white">Style Transfer</h2>
        <HelpTooltip content={
          <>
            <p className="font-bold mb-2">How to Transfer Style:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Upload a "Content Image" - this is the subject of your final image.</li>
              <li>Upload a "Style Image" - this is the artwork whose style you want to copy (e.g., a famous painting).</li>
              <li>Select the desired aspect ratio for the final artwork.</li>
              <li>Click "Transfer Style" to merge them.</li>
            </ol>
          </>
        } />
      </div>
      <p className="text-gray-400">Apply the artistic style from one image to the content of another. Powered by Gemini 2.5 Flash Image.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ImageInput
            label="1. Content Image (The 'what')"
            id="content-image-upload"
            onImageChange={setContentImage}
            allowMultiple={false}
          />
           <ImageInput
            label="2. Style Image (The 'how')"
            id="style-image-upload"
            onImageChange={setStyleImage}
            allowMultiple={false}
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">3. Aspect Ratio</label>
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
            disabled={isLoading || !contentImage || !styleImage}
            className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Applying Style...' : 'Transfer Style'}
          </button>
        </div>

        <div className="space-y-4">
          {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}
          <div className="w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center relative group">
            {isLoading && <Loader message="Fusing images..." />}
            {resultImage && <img src={resultImage.url} alt="Style Transfer Result" className="max-w-full max-h-full object-contain rounded-lg" />}
            {!isLoading && !resultImage && <p className="text-gray-500">Your masterpiece will appear here</p>}

            {resultImage && (
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleSaveToGallery}
                  disabled={resultImage.saved}
                  className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-105"
                >
                  {resultImage.saved ? 'Saved ✔️' : 'Save to Gallery'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
