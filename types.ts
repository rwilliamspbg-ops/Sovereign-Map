export interface CountryData {
  id: string;
  name: string;
  capital: string;
  population: number;
  gdp: string;
  region: string;
  subregion: string;
  flag: string;
}

export interface RiskFactor {
  name: string;
  severity: number;
}

export interface SovereignInsight {
  summary: string;
  politicalStatus: string;
  economicOutlook: string;
  recentEvents: string[];
  keyRisks: RiskFactor[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface MeshNode {
  id: string;
  lat: number;
  lng: number;
  strength: number;
  timestamp: number;
  classification?: 'Infrastructure' | 'Logistics' | 'Fleet' | 'Stationary' | 'Hub' | 'Edge';
  predictedDrift?: { lat: number; lng: number };
  originSignature?: string;
  isVerified?: boolean;
  peers?: string[]; // IDs of connected peers
}

export interface Voxel {
  id: string;
  x: number;
  y: number;
  z: number;
  color: string;
  intensity: number;
  isPeerData: boolean;
}

export interface SentinelRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
}

export type MapLayer = 'MESH' | 'RISK' | 'ASSETS' | 'TRAFFIC' | 'GRID' | 'SECURITY';

export type UserRole = 'ARCHITECT' | 'GUARD' | 'SCOUT' | 'CONTRIBUTOR';

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number;
  staked: number;
  earnings: number;
  rank: number;
  role?: UserRole;
  manifesto?: string;
  contributionPoints?: number;
}

export interface WorkloadConfig {
  active: boolean;
  intensity: number;
  type: 'SPATIAL' | 'GEOPOLITICAL' | 'SENTINEL';
  hardwareCapability?: {
    lidar: boolean;
    npu: boolean;
    gps: boolean;
  };
}

export interface SecurityEvent {
  id: string;
  type: 'INJECTION' | 'SPOOFING' | 'INTEGRITY' | 'ANOMALY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
  timestamp: number;
  resolved: boolean;
}

export interface ThreatAssessment {
  overallRisk: number;
  integrityScore: number;
  activeThreats: number;
  shieldStatus: 'NOMINAL' | 'DEGRADED' | 'REINFORCED';
}

export type ViewMode = 'MAP' | 'VOXEL' | 'NETWORK_GRAPH';