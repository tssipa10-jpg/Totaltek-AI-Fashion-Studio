
import React, { useState, useCallback } from 'react';
import { enhancePrompt, generateImage } from '../services/geminiService';
import { Loader } from './Loader';
import { GalleryImage } from '../types';
import { HelpTooltip } from './HelpTooltip';

interface ImageGeneratorProps {
  onAddToGallery: (imageData: Omit<GalleryImage, 'id' | 'timestamp'>) => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onAddToGallery }) => {
  const [prompt, setPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<{ url: string; saved: boolean } | null>(null);

  const handleEnhancePrompt = useCallback(async () => {
    if (!prompt) return;
    setIsEnhancing(true);
    setError(null);
    try {
      const enhancedPrompt = await enhancePrompt(prompt);
      setPrompt(enhancedPrompt);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred while enhancing prompt.');
    } finally {
      setIsEnhancing(false);
    }
  }, [prompt]);

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const imageUrl = await generateImage(prompt);
      setGeneratedImage({ url: imageUrl, saved: false });
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const handleSaveToGallery = () => {
    if (!generatedImage || generatedImage.saved) return;
    const base64 = generatedImage.url.split(',')[1];
    onAddToGallery({
      base64,
      mimeType: 'image/jpeg',
      name: `${prompt.substring(0, 30).trim().replace(/\s/g, '_')}.jpg`,
      prompt: prompt,
    });
    setGeneratedImage(prev => (prev ? { ...prev, saved: true } : null));
  };


  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-white">Image Generator</h2>
        <HelpTooltip content={
          <>
            <p className="font-bold mb-2">How to Generate an Image:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Type a description of the image you want into the text area.</li>
              <li>(Optional) Click "✨ Enhance Prompt" to let AI improve your description for better results.</li>
              <li>Click "Generate Image" and wait for your creation to appear.</li>
              <li>Hover over the image and click "Save to Gallery" to keep it.</li>
            </ol>
          </>
        } />
      </div>
      <p className="text-gray-400">Enter a simple idea or a detailed prompt. You can use the AI Enhancer to refine your prompt for better results.</p>
      
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A photorealistic image of a futuristic cyberpunk city at night."
          className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          rows={4}
          disabled={isLoading || isEnhancing}
        />
        <div className="flex flex-col sm:flex-row gap-2">
            <button
                onClick={handleEnhancePrompt}
                disabled={isLoading || isEnhancing || !prompt}
                className="w-full sm:w-auto bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
             {isEnhancing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enhancing...
                </>
              ) : '✨ Enhance Prompt'}
            </button>
            <button
                onClick={handleGenerate}
                disabled={isLoading || isEnhancing || !prompt}
                className="w-full sm:flex-grow bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Generating...' : 'Generate Image'}
            </button>
        </div>
      </div>

      {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}

      <div className="w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center relative group">
        {isLoading && <Loader message="Creating your image..." />}
        {generatedImage && <img src={generatedImage.url} alt="Generated" className="max-w-full max-h-full object-contain rounded-lg" />}
        {!isLoading && !generatedImage && <p className="text-gray-500">Your generated image will appear here</p>}

        {generatedImage && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleSaveToGallery}
              disabled={generatedImage.saved}
              className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-105"
            >
              {generatedImage.saved ? 'Saved ✔️' : 'Save to Gallery'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
