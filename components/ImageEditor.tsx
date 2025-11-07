
import React, { useState, useCallback } from 'react';
import { editImage } from '../services/geminiService';
import { ImageFile, GalleryImage, ImageAspectRatio } from '../types';
import { ImageInput } from './ImageInput';
import { Loader } from './Loader';
import { HelpTooltip } from './HelpTooltip';

interface ImageEditorProps {
  onAddToGallery: (imageData: Omit<GalleryImage, 'id' | 'timestamp'>) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ onAddToGallery }) => {
  const [prompt, setPrompt] = useState('');
  const [inputImage, setInputImage] = useState<ImageFile | null>(null);
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<{ url: string; saved: boolean } | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please enter an editing instruction.');
      return;
    }
    if (!inputImage) {
      setError('Please upload an image to edit.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    try {
      const imageUrl = await editImage(prompt, inputImage, aspectRatio);
      setEditedImage({ url: imageUrl, saved: false });
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, inputImage, aspectRatio]);
  
  const handleSaveToGallery = () => {
    if (!editedImage || editedImage.saved) return;
    const base64 = editedImage.url.split(',')[1];
    const mimeType = editedImage.url.match(/data:(.*);base64,/)?.[1] || 'image/png';
    onAddToGallery({
      base64,
      mimeType,
      name: `edited_${inputImage?.name || 'image.png'}`,
      prompt: prompt,
    });
    setEditedImage(prev => (prev ? { ...prev, saved: true } : null));
  };


  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-white">Image Editor</h2>
        <HelpTooltip content={
          <>
            <p className="font-bold mb-2">How to Edit an Image:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Upload an image using the upload box.</li>
              <li>In the text area, describe the changes you want (e.g., "add sunglasses," "change background to a beach").</li>
              <li>Select the desired aspect ratio for the final image.</li>
              <li>Click "Apply Edits".</li>
              <li>Save your new creation to the gallery.</li>
            </ol>
          </>
        } />
      </div>
      <p className="text-gray-400">Upload an image and describe the changes you want to make. Powered by Gemini 2.5 Flash Image.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ImageInput
            label="Upload Image"
            id="editor-image-upload"
            onImageChange={setInputImage}
            allowMultiple={false}
          />
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Add a retro filter, remove the person in the background, make it look like a watercolor painting..."
            className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            rows={3}
            disabled={isLoading}
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
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
            disabled={isLoading || !prompt || !inputImage}
            className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Editing...' : 'Apply Edits'}
          </button>
        </div>

        <div className="space-y-4">
          {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}
          <div className="w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center relative group">
            {isLoading && <Loader message="Applying your edits..." />}
            {editedImage && <img src={editedImage.url} alt="Edited" className="max-w-full max-h-full object-contain rounded-lg" />}
            {!isLoading && !editedImage && <p className="text-gray-500">Your edited image will appear here</p>}

            {editedImage && (
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleSaveToGallery}
                  disabled={editedImage.saved}
                  className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-105"
                >
                  {editedImage.saved ? 'Saved ✔️' : 'Save to Gallery'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
