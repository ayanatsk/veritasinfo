import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { TruthChecker } from './components/TruthChecker';
import { MediaDetector } from './components/MediaDetector';
import { GeoDashboard } from './components/GeoDashboard';
import { ChatAssistant } from './components/ChatAssistant';
import { ViralitySimulator } from './components/ViralitySimulator';
import { ViewState, Language } from './types';
import { Activity } from 'lucide-react';
import { translations } from './utils/translations';

const DashboardHome: React.FC<{ setView: (v: ViewState) => void, lang: Language }> = ({ setView, lang }) => {
  const t = translations[lang].dashboard;
  
  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-gradient-to-r from-guard-800 to-guard-900 p-8 rounded-3xl border border-guard-700 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {t.title} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-guard-cyan to-blue-500">{t.subtitle}</span>
          </h1>
          <p className="text-lg text-guard-gray mb-8">
            {t.description}
          </p>
          <button 
            onClick={() => setView(ViewState.TRUTH_CHECKER)}
            className="bg-guard-cyan text-guard-900 px-8 py-3 rounded-full font-bold hover:bg-cyan-300 transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          >
            {t.startBtn}
          </button>
        </div>
        <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-no-repeat mask-image-linear-gradient" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => setView(ViewState.MEDIA_ANALYZER)}
          className="group bg-guard-800 p-6 rounded-2xl border border-guard-700 hover:border-guard-cyan transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-guard-700 rounded-lg flex items-center justify-center mb-4 group-hover:bg-guard-cyan group-hover:text-guard-900 transition-colors">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t.cardDeepfake}</h3>
          <p className="text-guard-gray text-sm">{t.descDeepfake}</p>
        </div>
        
        <div 
          onClick={() => setView(ViewState.GEO_TRACKER)}
          className="group bg-guard-800 p-6 rounded-2xl border border-guard-700 hover:border-guard-cyan transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-guard-700 rounded-lg flex items-center justify-center mb-4 group-hover:bg-guard-cyan group-hover:text-guard-900 transition-colors">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t.cardGeo}</h3>
          <p className="text-guard-gray text-sm">{t.descGeo}</p>
        </div>

         <div 
          onClick={() => setView(ViewState.CHAT_ASSISTANT)}
          className="group bg-guard-800 p-6 rounded-2xl border border-guard-700 hover:border-guard-cyan transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-guard-700 rounded-lg flex items-center justify-center mb-4 group-hover:bg-guard-cyan group-hover:text-guard-900 transition-colors">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t.cardChat}</h3>
          <p className="text-guard-gray text-sm">{t.descChat}</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [lang, setLang] = useState<Language>('en');

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <DashboardHome setView={setCurrentView} lang={lang} />;
      case ViewState.TRUTH_CHECKER:
        return <TruthChecker lang={lang} />;
      case ViewState.MEDIA_ANALYZER:
        return <MediaDetector lang={lang} />;
      case ViewState.GEO_TRACKER:
        return <GeoDashboard lang={lang} />;
      case ViewState.CHAT_ASSISTANT:
        return <ChatAssistant lang={lang} />;
      case ViewState.VR_SIMULATOR:
        return <ViralitySimulator lang={lang} />;
      default:
        return <DashboardHome setView={setCurrentView} lang={lang} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView} lang={lang} setLang={setLang}>
      {renderView()}
    </Layout>
  );
}

export default App;