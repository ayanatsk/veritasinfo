import React, { useState, useEffect } from 'react';
import { verifyTextWithSearch, predictVirality } from '../services/geminiService';
import { AnalysisResult, ViralityPrediction, Language } from '../types';
import { Search, AlertTriangle, CheckCircle, Info, ExternalLink, Zap, MapPin, Globe } from 'lucide-react';
import { translations } from '../utils/translations';

interface TruthCheckerProps {
    lang: Language;
}

export const TruthChecker: React.FC<TruthCheckerProps> = ({ lang }) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [virality, setVirality] = useState<ViralityPrediction | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number } | undefined>(undefined);

  const t = translations[lang].truthChecker;

  useEffect(() => {
    // Attempt to get user location for better Maps grounding
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log("Geolocation info not available for Maps grounding:", error),
        { timeout: 5000 }
      );
    }
  }, []);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult(null);
    setVirality(null);
    
    try {
      const [analysis, viralStats] = await Promise.all([
        verifyTextWithSearch(inputText, location, lang),
        predictVirality(inputText, lang)
      ]);
      setResult(analysis);
      setVirality(viralStats);
    } catch (error) {
      console.error(error);
      alert(lang === 'ru' ? "Ошибка анализа. Пожалуйста, попробуйте снова." : "Analysis error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-guard-green border-guard-green';
    if (score >= 50) return 'text-yellow-400 border-yellow-400';
    return 'text-guard-red border-guard-red';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">{t.title}</h2>
        <p className="text-guard-gray">
          {t.description}
        </p>
      </header>

      {/* Input Section */}
      <div className="bg-guard-800 p-6 rounded-2xl border border-guard-700 shadow-xl">
        <textarea
          className="w-full bg-guard-900 text-white border border-guard-700 rounded-xl p-4 focus:outline-none focus:border-guard-cyan focus:ring-1 focus:ring-guard-cyan transition-all h-32 resize-none"
          placeholder={t.placeholder}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-guard-gray flex items-center gap-1">
             {location ? (
               <><MapPin className="w-3 h-3 text-guard-cyan" /> {t.geoOn}</>
             ) : (
               <><Info className="w-3 h-3" /> {t.geoOff}</>
             )}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !inputText}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-guard-900 transition-all ${
              loading 
                ? 'bg-guard-gray cursor-not-allowed' 
                : 'bg-guard-cyan hover:bg-cyan-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]'
            }`}
          >
            {loading ? (
              <span className="animate-pulse">{t.analyzing}</span>
            ) : (
              <>
                <Search className="w-5 h-5" />
                {t.analyzeBtn}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="grid md:grid-cols-3 gap-6 animate-[fadeIn_0.5s_ease-out]">
          
          {/* Main Verdict Card */}
          <div className="md:col-span-2 bg-guard-800 rounded-2xl border border-guard-700 p-6 relative overflow-hidden">
             <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-${result.verdict === 'TRUE' ? 'green' : result.verdict === 'FAKE' ? 'red' : 'yellow'}-500/10 rounded-bl-full pointer-events-none`} />
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}%
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {result.verdict}
                </h3>
                <p className="text-guard-gray text-sm">{t.verdictTitle}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-guard-900/50 p-4 rounded-lg border border-guard-700">
                <h4 className="text-guard-cyan font-mono text-sm mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" /> {t.explanation}
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
              </div>

              <div>
                <h4 className="text-guard-red font-mono text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {t.impact}
                </h4>
                <p className="text-gray-400 text-sm italic">{result.riskImpact}</p>
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            
            {/* Virality Score */}
            {virality && (
              <div className="bg-guard-800 rounded-2xl border border-guard-700 p-6">
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" /> {t.virality}
                </h4>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-bold text-white">{virality.viralityScore}</span>
                  <span className="text-sm text-gray-500 mb-1">/100</span>
                </div>
                <div className="w-full bg-guard-900 h-2 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500" 
                    style={{ width: `${virality.viralityScore}%` }}
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.velocity}</span>
                    <span className="text-white">{virality.velocity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.reach}</span>
                    <span className="text-white">{virality.estimatedReach}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Grounding Sources */}
            <div className="bg-guard-800 rounded-2xl border border-guard-700 p-6">
              <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" /> {t.sources}
              </h4>
              {result.sources && result.sources.length > 0 ? (
                <ul className="space-y-3">
                  {result.sources.map((source, idx) => (
                    <li key={idx} className="text-sm">
                      <a 
                        href={source.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-start gap-2 text-guard-cyan hover:underline group"
                      >
                         {source.title.toLowerCase().includes('map') || source.uri.includes('google.com/maps') ? (
                           <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                         ) : (
                           <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" />
                         )}
                         <span className="line-clamp-2">{source.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">{t.noSources}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};