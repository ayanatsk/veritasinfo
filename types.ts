export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TRUTH_CHECKER = 'TRUTH_CHECKER',
  MEDIA_ANALYZER = 'MEDIA_ANALYZER',
  GEO_TRACKER = 'GEO_TRACKER',
  CHAT_ASSISTANT = 'CHAT_ASSISTANT',
  VR_SIMULATOR = 'VR_SIMULATOR'
}

export type Language = 'en' | 'ru';

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface AnalysisResult {
  score: number; // 0-100
  verdict: 'FAKE' | 'PARTIAL' | 'TRUE';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskImpact: string;
  explanation: string;
  sources: GroundingSource[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface DeepfakeResult {
  isDeepfake: boolean;
  confidence: number;
  indicators: string[];
  technicalAnalysis: string;
}

export interface ViralityPrediction {
  viralityScore: number; // 0-100
  estimatedReach: string;
  velocity: 'Slow' | 'Moderate' | 'Viral' | 'Explosive';
  reasoning: string;
}