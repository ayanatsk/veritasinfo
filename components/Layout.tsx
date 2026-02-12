import React from 'react';
import { ViewState, Language } from '../types';
import { Activity, Search, Image as ImageIcon, MessageSquare, Globe, Eye, Menu, X, Languages } from 'lucide-react';
import { translations } from '../utils/translations';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  children: React.ReactNode;
  lang: Language;
  setLang: (l: Language) => void;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, setView, children, lang, setLang }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const t = translations[lang];

  const navItems = [
    { id: ViewState.DASHBOARD, label: t.nav[ViewState.DASHBOARD], icon: Activity },
    { id: ViewState.TRUTH_CHECKER, label: t.nav[ViewState.TRUTH_CHECKER], icon: Search },
    { id: ViewState.MEDIA_ANALYZER, label: t.nav[ViewState.MEDIA_ANALYZER], icon: ImageIcon },
    { id: ViewState.GEO_TRACKER, label: t.nav[ViewState.GEO_TRACKER], icon: Globe },
    { id: ViewState.CHAT_ASSISTANT, label: t.nav[ViewState.CHAT_ASSISTANT], icon: MessageSquare },
    { id: ViewState.VR_SIMULATOR, label: t.nav[ViewState.VR_SIMULATOR], icon: Eye },
  ];

  const toggleLang = () => {
    setLang(lang === 'en' ? 'ru' : 'en');
  };

  return (
    <div className="flex h-screen bg-guard-900 text-white overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-guard-800 border-r border-guard-700">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Veritas Logo" className="w-16 h-16 object-contain" />
            <h1 className="text-xl font-bold tracking-wider text-guard-cyan font-mono">Veritas</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentView === item.id
                ? 'bg-guard-700 text-guard-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-guard-gray hover:bg-guard-700/50 hover:text-white'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-guard-700 flex justify-center">
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 px-4 py-2 bg-guard-700 rounded-lg hover:bg-guard-600 transition-colors text-sm font-bold text-guard-cyan"
          >
            <Languages className="w-4 h-4" />
            {lang === 'en' ? 'English' : 'Русский'}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-guard-800 border-b border-guard-700 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Veritas Logo" className="w-12 h-12 object-contain" />
          <span className="font-bold font-mono text-lg">Veritas</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleLang} className="p-2 bg-guard-700 rounded-full text-guard-cyan">
            <span className="text-xs font-bold">{lang.toUpperCase()}</span>
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-guard-900 pt-20 px-4">
          <nav className="space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg border border-guard-700 ${currentView === item.id
                  ? 'bg-guard-700 text-guard-cyan'
                  : 'text-guard-gray'
                  }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-lg">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 scroll-smooth">
        {children}
      </main>
    </div>
  );
};