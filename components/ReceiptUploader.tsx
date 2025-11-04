
import React, { useState, useRef } from 'react';
import { parseReceiptFromImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { ReceiptData } from '../types';
import Spinner from './Spinner';
import { UploadIcon } from './icons';

interface ReceiptUploaderProps {
  onReceiptParsed: (data: ReceiptData) => void;
  hasItems: boolean;
}

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onReceiptParsed, hasItems }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
          setError("File is too large. Please upload an image under 4MB.");
          return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleParseReceipt = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(selectedFile);
      const parsedData = await parseReceiptFromImage({
        mimeType: selectedFile.type,
        data: base64Data,
      });
      onReceiptParsed(parsedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h2 className="text-2xl font-bold mb-4">{hasItems ? 'Replace Receipt' : 'Scan Receipt'}</h2>
      <div className="space-y-4">
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        
        <div 
          className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-500 hover:bg-slate-700/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Receipt preview" className="max-h-60 mx-auto rounded-md" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <UploadIcon className="w-10 h-10"/>
              <span>Click to upload or drag & drop</span>
              <span className="text-sm">PNG, JPG, or WEBP (max 4MB)</span>
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        
        {isLoading ? (
          <Spinner message="AI is reading your receipt..." />
        ) : (
          <button
            onClick={handleParseReceipt}
            disabled={!selectedFile || isLoading}
            className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            {hasItems ? 'Re-scan with AI' : 'Scan with AI'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReceiptUploader;
