import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
  className?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  url, 
  size = 1024, // Ultra-high default size for maximum quality
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      if (!url || !canvasRef.current) return;
      
      setIsGenerating(true);
      setError('');
      
      try {
        // Set canvas dimensions explicitly to ensure square aspect ratio
        const canvas = canvasRef.current;
        canvas.width = size;
        canvas.height = size;
        
        await QRCode.toCanvas(canvas, url, {
          width: size,
          margin: 6, // Maximum margin for optimal scanning
          scale: 16, // Maximum scale for ultra-crisp pixels
          color: {
            dark: '#000000', // Pure black for maximum contrast
            light: '#ffffff' // Pure white for better contrast
          },
          errorCorrectionLevel: 'H' // High error correction for better reliability
        });
      } catch (err) {
        console.error('Failed to generate QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setIsGenerating(false);
      }
    };

    generateQR();
  }, [url, size]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    
    // Create a maximum resolution version for download
    const canvas = canvasRef.current;
    const downloadCanvas = document.createElement('canvas');
    const downloadSize = 2048; // Maximum resolution for download (2K)
    downloadCanvas.width = downloadSize;
    downloadCanvas.height = downloadSize;
    
    const ctx = downloadCanvas.getContext('2d');
    if (ctx) {
      // Disable image smoothing for pixel-perfect scaling
      ctx.imageSmoothingEnabled = false;
      // Use crisp-edges for the best possible quality
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(canvas, 0, 0, downloadSize, downloadSize);
    }
    
    const link = document.createElement('a');
    link.download = 'math-quiz-qr-ultra-hd.png';
    link.href = downloadCanvas.toDataURL('image/png', 1.0); // Maximum quality
    link.click();
  };

  if (error) {
    return (
      <div className={`text-center text-red-400 ${className}`}>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="relative inline-block">
        <canvas 
          ref={canvasRef}
          className={`rounded-lg border-2 border-slate-600 ${isGenerating ? 'opacity-50' : 'opacity-100'}`}
          style={{ 
            width: `${size}px`,
            height: `${size}px`,
            maxWidth: '100%',
            maxHeight: '100%',
            imageRendering: 'pixelated'
          }}
        />
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      <button
        onClick={downloadQR}
        disabled={isGenerating || !!error}
        className="mt-3 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors"
      >
        📱 Download QR Code
      </button>
      
      <p className="text-xs text-slate-400 mt-2">
        Scan with any QR code reader to open the quiz
      </p>
    </div>
  );
};

export default QRCodeGenerator;
