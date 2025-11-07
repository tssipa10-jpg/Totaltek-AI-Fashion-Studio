
import React, { useState, useEffect, useCallback } from 'react';

interface ApiKeySelectorProps {
  onKeyReady: () => void;
  onKeyError: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeyReady, onKeyError }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasKey, setHasKey] = useState(false);

  const checkApiKey = useCallback(async () => {
    setIsChecking(true);
    try {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const keyStatus = await window.aistudio.hasSelectedApiKey();
        if (keyStatus) {
          setHasKey(true);
          onKeyReady();
        } else {
          setHasKey(false);
        }
      } else {
         // For local dev or environments without aistudio
         console.warn("aistudio context not found. Assuming API key is set in environment.");
         setHasKey(true);
         onKeyReady();
      }
    } catch (error) {
      console.error("Error checking API key:", error);
      setHasKey(false);
      onKeyError();
    } finally {
      setIsChecking(false);
    }
  }, [onKeyReady, onKeyError]);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectKey = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        // Assume success after dialog opens to avoid race conditions.
        // The parent component will handle API call errors and can trigger a re-check.
        setHasKey(true);
        onKeyReady();
      } else {
        alert("API key selection is not available in this environment.");
      }
    } catch (error) {
      console.error("Error opening API key selection:", error);
      onKeyError();
    }
  };

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800 rounded-lg">
        <p className="text-lg text-gray-300">Verifying API key status...</p>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800 rounded-lg border border-yellow-500/50">
        <h3 className="text-xl font-bold text-white mb-2">Action Required for Video Generation</h3>
        <p className="text-gray-400 mb-4">
          The Veo video generation model requires you to select an API key.
          This will be used for your requests. For more details see the{' '}
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
            billing documentation
          </a>.
        </p>
        <button
          onClick={handleSelectKey}
          className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors duration-300"
        >
          Select API Key
        </button>
      </div>
    );
  }

  return null; // Key is ready, component renders nothing.
};
