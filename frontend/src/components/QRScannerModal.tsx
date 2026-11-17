import React, { useState, useEffect, useRef } from 'react';
import { 
  X, QrCode, Camera, ArrowRight, ShieldCheck, Upload, 
  AlertCircle, CheckCircle2, RefreshCw, FileUp, Sparkles 
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPassport: (customId: string) => void;
}

export function parsePassportId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  
  // 1. Match /passport/:id in URL
  const urlMatch = trimmed.match(/\/passport\/([a-zA-Z0-9_-]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].toUpperCase();
  }
  
  // 2. Match standard ReCircuit ID pattern: RC-YYYY-XXXXX
  const rcMatch = trimmed.match(/\b(RC-\d{4}-\d+)\b/i);
  if (rcMatch && rcMatch[1]) {
    return rcMatch[1].toUpperCase();
  }
  
  // 3. Fallback to raw string without special query chars
  const clean = trimmed.split('?')[0].split('#')[0].replace(/^.*\/+/, '');
  return clean.toUpperCase();
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPassport,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'file'>('camera');
  const [manualId, setManualId] = useState('');
  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'scanning' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedId, setDetectedId] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const readerElementId = 'reciruit-qr-reader-surface';

  // Handle successful code detection
  const handleScanSuccess = (decodedText: string) => {
    const passportId = parsePassportId(decodedText);
    if (!passportId) return;

    setDetectedId(passportId);
    setCameraState('success');

    // Stop scanner if active
    stopScanner();

    // Short tactile pause for user confirmation before navigation
    setTimeout(() => {
      onNavigateToPassport(passportId);
      onClose();
    }, 700);
  };

  // Stop scanner safely
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING || scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Scanner stop/clear handled safely:', err);
      }
      scannerRef.current = null;
    }
  };

  // Start live camera stream
  const startCamera = async () => {
    setErrorMessage(null);
    setCameraState('starting');

    // Give DOM a tick to guarantee container presence
    await new Promise((r) => setTimeout(r, 100));

    const element = document.getElementById(readerElementId);
    if (!element) {
      setCameraState('error');
      setErrorMessage('Scanner container not found. Please try again.');
      return;
    }

    // Stop any existing instance first
    await stopScanner();

    try {
      const html5QrCode = new Html5Qrcode(readerElementId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' }, // Prefer rear-facing camera on mobile
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // Frame-by-frame error is normal when no QR is in viewfinder; ignore
        }
      );

      setCameraState('scanning');
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setCameraState('error');
      const errStr = String(err?.message || err);
      if (errStr.includes('NotAllowedError') || errStr.includes('Permission denied')) {
        setErrorMessage('Camera access was denied. Please allow camera permissions in your browser or upload a QR image.');
      } else if (errStr.includes('NotFoundError') || errStr.includes('Requested device not found')) {
        setErrorMessage('No camera device detected. You can upload a QR image file or enter the ID below.');
      } else {
        setErrorMessage('Unable to activate camera stream. Please use file upload or manual ID verification.');
      }
    }
  };

  // File upload scanner
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsProcessingFile(true);
    setErrorMessage(null);

    try {
      // Create temporary scanner instance for file decoding if not present
      let fileScanner = scannerRef.current;
      if (!fileScanner) {
        fileScanner = new Html5Qrcode(readerElementId);
      }

      const decodedText = await fileScanner.scanFile(file, true);
      setIsProcessingFile(false);
      handleScanSuccess(decodedText);
    } catch (err: any) {
      setIsProcessingFile(false);
      console.warn('File scan error:', err);
      setErrorMessage('No valid QR code was detected in this image. Please upload a clear, well-lit QR code.');
    }
  };

  // Lifecycle effect when modal opens/closes or active tab changes
  useEffect(() => {
    if (isOpen) {
      setDetectedId(null);
      setErrorMessage(null);
      if (activeTab === 'camera') {
        startCamera();
      } else {
        stopScanner();
      }
    } else {
      stopScanner();
      setCameraState('idle');
      setDetectedId(null);
      setErrorMessage(null);
    }

    return () => {
      stopScanner();
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      const parsed = parsePassportId(manualId.trim());
      onNavigateToPassport(parsed);
      onClose();
    }
  };

  const handleSampleClick = (id: string) => {
    onNavigateToPassport(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E5EBE5] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EBE5] bg-[#F8FAF7]">
          <div className="flex items-center gap-2.5 text-[#084D36]">
            <div className="w-8 h-8 rounded-xl bg-[#EBF8E9] flex items-center justify-center text-[#084D36]">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-[#151A17]">Digital Product Passport Scanner</h3>
              <p className="text-[11px] text-[#6B756E]">Instant circular lifecycle & provenance verification</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-xl text-[#6B756E] hover:text-[#151A17] hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#E5EBE5] bg-[#F8FAF7] px-6 pt-2">
          <button
            onClick={() => setActiveTab('camera')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'camera'
                ? 'border-[#084D36] text-[#084D36]'
                : 'border-transparent text-[#6B756E] hover:text-[#151A17]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>

          <button
            onClick={() => {
              stopScanner();
              setActiveTab('file');
            }}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'file'
                ? 'border-[#084D36] text-[#084D36]'
                : 'border-transparent text-[#6B756E] hover:text-[#151A17]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload QR Image</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* TAB 1: LIVE CAMERA */}
          {activeTab === 'camera' && (
            <div className="relative w-full aspect-square bg-[#0f1713] rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white border border-[#E5EBE5]">
              {/* Target scanner container for html5-qrcode */}
              <div 
                id={readerElementId} 
                className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
              />

              {/* Viewfinder Overlay (Only visible when camera is scanning or starting) */}
              {cameraState === 'scanning' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                  {/* Viewfinder box with glowing corners */}
                  <div className="relative w-60 h-60 border-2 border-emerald-400/40 rounded-2xl">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#22C55E] rounded-tl-md" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#22C55E] rounded-tr-md" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#22C55E] rounded-bl-md" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#22C55E] rounded-br-md" />

                    {/* Laser scanning beam */}
                    <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent animate-pulse shadow-lg shadow-emerald-400/60" />
                  </div>
                </div>
              )}

              {/* Starting Camera State */}
              {cameraState === 'starting' && (
                <div className="absolute inset-0 bg-[#084D36]/90 flex flex-col items-center justify-center p-6 text-center">
                  <RefreshCw className="w-8 h-8 text-lime-400 animate-spin mb-3" />
                  <p className="text-sm font-bold text-white">Connecting Camera...</p>
                  <p className="text-xs text-emerald-200/80 mt-1">Requesting video permissions</p>
                </div>
              )}

              {/* Success Overlay */}
              {cameraState === 'success' && detectedId && (
                <div className="absolute inset-0 bg-[#084D36]/95 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
                  <div className="w-14 h-14 rounded-full bg-[#EBF8E9] text-[#084D36] flex items-center justify-center mb-3 shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-[#16834D]" />
                  </div>
                  <h4 className="font-heading font-extrabold text-lg text-white">QR Code Verified!</h4>
                  <div className="font-mono text-sm font-bold text-lime-300 bg-white/10 px-3 py-1 rounded-lg mt-2">
                    {detectedId}
                  </div>
                  <p className="text-xs text-emerald-100 mt-2">Loading digital passport...</p>
                </div>
              )}

              {/* Error State */}
              {cameraState === 'error' && (
                <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-rose-200 px-4 leading-relaxed">
                    {errorMessage || 'Camera stream could not be started.'}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={startCamera}
                      className="px-3.5 py-1.5 bg-[#084D36] hover:bg-[#063b29] text-white text-xs font-bold rounded-xl border border-emerald-500/30 flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Camera</span>
                    </button>
                    <button
                      onClick={() => {
                        stopScanner();
                        setActiveTab('file');
                      }}
                      className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      <span>Upload File Instead</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD IMAGE FILE */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className="relative aspect-square sm:aspect-[4/3] rounded-2xl border-2 border-dashed border-[#CCD7CE] hover:border-[#084D36] bg-[#F8FAF7] hover:bg-[#EBF8E9]/30 transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center group"
              >
                {/* Hidden container needed by html5-qrcode for scanFile rendering */}
                <div id={readerElementId} className="hidden" />

                {isProcessingFile ? (
                  <div className="flex flex-col items-center space-y-2">
                    <RefreshCw className="w-8 h-8 text-[#084D36] animate-spin" />
                    <p className="text-xs font-bold text-[#151A17]">Decoding QR image...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#EBF8E9] text-[#084D36] group-hover:scale-110 transition-transform flex items-center justify-center shadow-xs">
                      <FileUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#151A17]">Click to upload or drag QR screenshot</p>
                      <p className="text-xs text-[#6B756E] mt-0.5">Supports PNG, JPG, WebP, SVG images</p>
                    </div>
                    <span className="px-3 py-1 bg-white text-[#084D36] text-[11px] font-bold rounded-lg border border-[#CCD7CE] shadow-2xs">
                      Browse Files
                    </span>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* MANUAL IDENTIFIER INPUT */}
          <div className="pt-2 border-t border-[#E5EBE5]">
            <label className="block text-[11px] font-bold text-[#6B756E] uppercase tracking-wider mb-2">
              Or Enter Passport ID Directly
            </label>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. RC-2026-00142"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                className="flex-1 px-4 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white text-[#151A17] font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-[#084D36]/20 focus:border-[#084D36]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#084D36] hover:bg-[#063b29] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Verify</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* QUICK VERIFIED TEST SAMPLES */}
          <div className="bg-[#EBF8E9] p-3.5 rounded-2xl border border-[#d3ecd0] text-xs text-[#084D36]">
            <div className="flex items-center gap-1.5 font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#16834D]" />
              <span>One-Click Test QR Passports:</span>
            </div>
            <div className="flex flex-wrap gap-2 font-mono">
              <button
                type="button"
                onClick={() => handleSampleClick('RC-2026-00142')}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 rounded-lg border border-[#c4e3c1] font-semibold text-xs text-[#084D36] shadow-2xs hover:border-[#084D36] transition-colors"
              >
                RC-2026-00142 (Latitude 5420)
              </button>
              <button
                type="button"
                onClick={() => handleSampleClick('RC-2026-00138')}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 rounded-lg border border-[#c4e3c1] font-semibold text-xs text-[#084D36] shadow-2xs hover:border-[#084D36] transition-colors"
              >
                RC-2026-00138 (Inspiron 5570)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
