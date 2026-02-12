import React, { useState, useRef } from 'react';
import { detectDeepfake } from '../services/geminiService';
import { DeepfakeResult, Language } from '../types';
import { Upload, AlertOctagon, ShieldCheck, ScanEye, Loader2 } from 'lucide-react';
import { translations } from '../utils/translations';

interface MediaDetectorProps {
    lang: Language;
}

export const MediaDetector: React.FC<MediaDetectorProps> = ({ lang }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeepfakeResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[lang].media;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Strip prefix for Gemini API
        const base64Data = base64String.split(',')[1];
        setSelectedImage(base64Data);
        setMimeType(file.type);
        setResult(null); // Reset previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setLoading(true);
    try {
      const data = await detectDeepfake(selectedImage, mimeType, lang);
      setResult(data);
    } catch (err) {
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{t.title}</h2>
          <p className="text-guard-gray">
            {t.description}
          </p>
        </div>

        <div 
          className="border-2 border-dashed border-guard-700 bg-guard-800/50 rounded-2xl h-80 flex flex-col items-center justify-center cursor-pointer hover:border-guard-cyan hover:bg-guard-800 transition-all relative overflow-hidden"
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedImage ? (
            <img 
              src={`data:${mimeType};base64,${selectedImage}`} 
              className="w-full h-full object-contain p-4" 
              alt="Preview" 
            />
          ) : (
            <div className="text-center p-6">
              <div className="bg-guard-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="text-guard-cyan w-8 h-8" />
              </div>
              <p className="text-white font-medium">{t.dragDrop}</p>
              <p className="text-sm text-guard-gray mt-2">{t.formats}</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!selectedImage || loading}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
            loading 
              ? 'bg-guard-700 text-gray-400' 
              : 'bg-gradient-to-r from-guard-cyan to-blue-500 text-guard-900 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]'
          }`}
        >
          {loading ? (
             <><Loader2 className="animate-spin" /> {t.scanning}</>
          ) : (
             <><ScanEye /> {t.analyzeBtn}</>
          )}
        </button>
      </div>

      <div className="bg-guard-800 border border-guard-700 rounded-2xl p-6 lg:h-[600px] overflow-y-auto">
        {!result && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-guard-gray text-center opacity-50">
            <ScanEye className="w-16 h-16 mb-4" />
            <p>{lang === 'ru' ? 'Результаты анализа появятся здесь' : 'Analysis results will appear here'}</p>
          </div>
        )}

        {loading && (
          <div className="h-full flex flex-col items-center justify-center space-y-6">
             <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-4 border-guard-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-guard-cyan rounded-full border-t-transparent animate-spin"></div>
                <ScanEye className="absolute inset-0 m-auto text-guard-cyan w-10 h-10 animate-pulse" />
             </div>
             <p className="text-guard-cyan font-mono animate-pulse">{t.starting}</p>
          </div>
        )}

        {result && (
          <div className="animate-[slideIn_0.5s_ease-out] space-y-6">
            <div className={`p-4 rounded-xl border ${result.isDeepfake ? 'bg-red-900/20 border-red-500' : 'bg-green-900/20 border-green-500'} flex items-center justify-between`}>
              <div>
                <h3 className={`text-2xl font-bold ${result.isDeepfake ? 'text-red-500' : 'text-green-500'}`}>
                  {result.isDeepfake ? t.suspicious : t.authentic}
                </h3>
                <p className="text-sm text-gray-400">{t.confidence} {result.confidence}%</p>
              </div>
              {result.isDeepfake ? <AlertOctagon className="w-10 h-10 text-red-500" /> : <ShieldCheck className="w-10 h-10 text-green-500" />}
            </div>

            <div>
              <h4 className="text-guard-gray uppercase text-xs font-bold tracking-wider mb-3">{t.artifacts}</h4>
              <div className="flex flex-wrap gap-2">
                {result.indicators.length > 0 ? (
                  result.indicators.map((ind, i) => (
                    <span key={i} className="bg-guard-900 text-cyan-200 px-3 py-1 rounded-full text-sm border border-guard-700">
                      {ind}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">{t.noArtifacts}</span>
                )}
              </div>
            </div>

            <div className="bg-guard-900/50 p-4 rounded-xl border border-guard-700">
              <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                <ScanEye className="w-4 h-4 text-guard-cyan" />
                {t.techAnalysis}
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {result.technicalAnalysis}
              </p>
            </div>
            
            <div className="p-4 bg-blue-900/10 rounded-lg border border-blue-900/30">
                <p className="text-xs text-blue-300">
                    <strong>{t.disclaimer}</strong>
                </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};