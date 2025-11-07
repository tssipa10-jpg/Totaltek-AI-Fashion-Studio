import React, { useRef, useState, useCallback } from 'react';
import { ImageFile } from '../types';

interface ImageInputProps {
  onImageChange: (image: ImageFile | null) => void;
  label: string;
  id: string;
  allowMultiple?: false;
}

interface MultiImageInputProps {
  onImageChange: (images: ImageFile[]) => void;
  label: string;
  id: string;
  allowMultiple: true;
}

const ImagePreview: React.FC<{ file: ImageFile; onRemove: () => void }> = ({ file, onRemove }) => (
  <div className="relative group">
    <img src={`data:${file.mimeType};base64,${file.base64}`} alt={file.name} className="w-24 h-24 object-cover rounded-md" />
    <button
      onClick={onRemove}
      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Remove image"
    >
      &times;
    </button>
  </div>
);

export const ImageInput: React.FC<ImageInputProps | MultiImageInputProps> = (props) => {
  const { label, id, allowMultiple } = props;
  const [previews, setPreviews] = useState<ImageFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // FIX: Explicitly type `file` as `File`. The compiler was inferring it as `unknown`,
    // causing errors when accessing properties like `.type` and `.name`, and when
    // passing it to `readAsDataURL` which expects a Blob.
    const filePromises = Array.from(files).map((file: File) => {
      return new Promise<ImageFile>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          resolve({
            base64: (reader.result as string).split(',')[1],
            mimeType: file.type,
            name: file.name
          });
        };
        reader.onerror = error => reject(error);
      });
    });

    try {
      const newImages = await Promise.all(filePromises);
      if (allowMultiple) {
        const updatedImages = [...previews, ...newImages];
        setPreviews(updatedImages);
        (props as MultiImageInputProps).onImageChange(updatedImages);
      } else {
        const singleImage = newImages[0];
        setPreviews(singleImage ? [singleImage] : []);
        (props as ImageInputProps).onImageChange(singleImage || null);
      }
    } catch (error) {
      console.error("Error processing files:", error);
    }
  }, [allowMultiple, props, previews]);

  const handleRemove = useCallback((index: number) => {
    const updatedPreviews = [...previews];
    updatedPreviews.splice(index, 1);
    setPreviews(updatedPreviews);

    if (allowMultiple) {
      (props as MultiImageInputProps).onImageChange(updatedPreviews);
    } else {
      (props as ImageInputProps).onImageChange(null);
    }
  }, [previews, allowMultiple, props]);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-cyan-500 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-1 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex text-sm text-gray-400">
            <p className="pl-1">Click to upload or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>
      <input
        id={id}
        name={id}
        type="file"
        className="sr-only"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple={allowMultiple}
      />
      {previews.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4">
          {previews.map((file, index) => (
            <ImagePreview key={index} file={file} onRemove={() => handleRemove(index)} />
          ))}
        </div>
      )}
    </div>
  );
};