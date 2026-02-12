import React from 'react';
import { Eye, Share2, AlertTriangle, Play } from 'lucide-react';
import { translations } from '../utils/translations';
import { Language } from '../types';

export const ViralitySimulator: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].sim;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-3xl mx-auto">
      <div className="relative group cursor-pointer">
        <div className="absolute -inset-1 bg-gradient-to-r from-guard-cyan to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-guard-800 p-8 rounded-full border border-guard-700">
           <Eye className="w-24 h-24 text-guard-cyan" />
        </div>
      </div>
      
      <h2 className="text-4xl font-bold text-white">{t.title}</h2>
      <p className="text-guard-gray text-lg">
        {t.description}
      </p>

      <div className="grid md:grid-cols-3 gap-4 w-full mt-8">
        <div className="bg-guard-800 p-6 rounded-xl border border-guard-700">
            <Share2 className="w-8 h-8 text-purple-400 mx-auto mb-4" />
            <h3 className="font-bold text-white mb-2">{t.rScore}</h3>
            <p className="text-sm text-gray-400">{t.rDesc}</p>
        </div>
        <div className="bg-guard-800 p-6 rounded-xl border border-guard-700">
            <AlertTriangle className="w-8 h-8 text-guard-red mx-auto mb-4" />
            <h3 className="font-bold text-white mb-2">{t.radius}</h3>
            <p className="text-sm text-gray-400">{t.radiusDesc}</p>
        </div>
        <div className="bg-guard-800 p-6 rounded-xl border border-guard-700">
            <Play className="w-8 h-8 text-guard-green mx-auto mb-4" />
            <h3 className="font-bold text-white mb-2">{t.run}</h3>
            <p className="text-sm text-gray-400">{t.runDesc}</p>
        </div>
      </div>
      
      <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg text-yellow-200 text-sm mt-8 max-w-md">
        {t.webgl}
      </div>
    </div>
  );
};