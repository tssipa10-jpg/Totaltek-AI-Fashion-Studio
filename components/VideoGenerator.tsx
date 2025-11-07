
import React, { useState, useCallback, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import { ImageFile, AspectRatio } from '../types';
import { ImageInput } from './ImageInput';
import { Loader } from './Loader';
import { ApiKeySelector } from './ApiKeySelector';
import { HelpTooltip } from './HelpTooltip';

interface VideoGeneratorProps {
  sourceImage: ImageFile | null;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ sourceImage: initialImage }) => {
  const [prompt, setPrompt] = useState('');
  const [inputImage, setInputImage] = useState<ImageFile | null>(initialImage);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [apiKeyReady, setApiKeyReady] = useState(false);

  useEffect(() => {
    setInputImage(initialImage);
  }, [initialImage]);

  const resetApiKey = useCallback(() => {
    setApiKeyReady(false);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!inputImage) {
      setError('Please upload an image to start.');
      return;
    }
    if (!apiKeyReady) {
      setError('API Key is not ready. Please select an API key.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Initializing...');
    setError(null);
    setGeneratedVideoUrl(null);
    try {
      const videoUrl = await generateVideo(prompt, inputImage, aspectRatio, setLoadingMessage);
      setGeneratedVideoUrl(videoUrl);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      if (errorMessage.includes('Requested entity was not found')) {
        setError('API Key not found or invalid. Please select your key again.');
        resetApiKey();
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, inputImage, aspectRatio, apiKeyReady, resetApiKey]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-white">Video Generator</h2>
        <HelpTooltip content={
          <>
            <p className="font-bold mb-2">How to Generate a Video:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>This tab requires an API key. Select one if prompted.</li>
              <li>An image from the Outfit Studio may be pre-loaded. If not, upload one.</li>
              <li>(Optional) Add a prompt to describe the desired motion.</li>
              <li>Choose an aspect ratio (Landscape or Portrait).</li>
              <li>Click "Generate Video". This may take a few minutes.</li>
            </ol>
          </>
        } />
      </div>
      <p className="text-gray-400">Bring your images to life. Generate a short video from an image and an optional prompt. Powered by Veo.</p>
      
      {!apiKeyReady ? (
        <ApiKeySelector onKeyReady={() => setApiKeyReady(true)} onKeyError={resetApiKey} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {!initialImage && (
                <ImageInput
                    label="Upload Starting Image"
                    id="video-image-upload"
                    onImageChange={setInputImage}
                    allowMultiple={false}
                />
            )}
             {inputImage && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Starting Image</label>
                    <img 
                        src={`data:${inputImage.mimeType};base64,${inputImage.base64}`} 
                        alt="Video source"
                        className="rounded-lg max-h-48"
                    />
                </div>
             )}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Optional: Describe the motion, e.g., 'A gentle breeze blows through her hair, subtle zoom in.'"
              className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              rows={3}
              disabled={isLoading}
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
              <div className="flex gap-2">
                {(['16:9', '9:16'] as AspectRatio[]).map(ar => (
                  <button
                    key={ar}
                    onClick={() => setAspectRatio(ar)}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${aspectRatio === ar ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    {ar} {ar === '16:9' ? '(Landscape)' : '(Portrait)'}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !inputImage}
              className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Generating Video...' : 'Generate Video'}
            </button>
          </div>

          <div className="space-y-4">
            {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}
            <div className={`w-full bg-gray-900 rounded-lg flex items-center justify-center ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'}`}>
              {isLoading && <Loader message={loadingMessage} />}
              {generatedVideoUrl && <video src={generatedVideoUrl} controls autoPlay loop className="max-w-full max-h-full object-contain rounded-lg" />}
              {!isLoading && !generatedVideoUrl && <p className="text-gray-500 text-center p-4">Your generated video will appear here</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
