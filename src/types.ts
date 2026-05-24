export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Node {
  id: string;
  name: string;
  ipAddress: string;
  location: string;
  apiSecret: string;
  maxCapacity: number;
  cpuUsage: number;
  ramUsage: number;
  status: 'online' | 'offline';
}

export interface Instance {
  id: string;
  name: string;
  nodeId: string;
  userId: string;
  status: 'running' | 'stopped' | 'suspended';
  cpuCores: number;
  ramGB: number;
  diskGB: number;
  ipAddress: string;
  createdAt: string;
}

export interface PortForward {
  id: string;
  vpsId: string;
  publicPort: number;
  privatePort: number;
  protocol: 'tcp' | 'udp';
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  description: string;
  userId: string;
  expirationDate: string;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  scope: 'HVM Panel' | 'Node Agent' | 'Database' | 'Security' | 'Backup';
  message: string;
  level: 'info' | 'warning' | 'error';
}

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  cpuThreshold: number;
  ramThreshold: number;
  discordEnabled: boolean;
  discordClientId: string;
  discordClientSecret: string;
  discordRedirectUri: string;
  allowAutoRegistration: boolean;
  buttonText: string;
  backgroundImageUrl?: string;
  footerText?: string;
  timezone?: string;
  faviconUrl?: string;
  userRegistration?: boolean;
}

export interface Backup {
  filename: string;
  createdAt: string;
  size: number;
}

export interface SystemInfo {
  address: string;
  netmask: string;
  broadcast: string;
  macAddress: string;
  dnsServers: string;
  env: {
    panelName: string;
    panelVersion: string;
    developer: string;
    host: string;
    debugMode: string;
    serverIp: string;
    databasePath: string;
    storagePool: string;
    backupInterval: string;
    statsUpdateInterval: string;
    currentDirectory: string;
    pythonExecutable: string;
  };
}
