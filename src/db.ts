import fs from 'fs';
import path from 'path';

// Define DB paths
const DB_FILE = path.join(process.cwd(), 'db.json');
const BACKUPS_DIR = path.join(process.cwd(), 'backups');

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Node {
  id: string;
  name: string;
  ipAddress: string;
  location: string;
  apiSecret: string;
  maxCapacity: number; // in GB RAM
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
  expirationDate: string; // 'never' or ISO string
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
  logoUrl: string; // Left in panel ONLY, not on login page
  cpuThreshold: number; // For suspension triggers
  ramThreshold: number; // For suspension triggers
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

export interface DatabaseSchema {
  users: User[];
  nodes: Node[];
  instances: Instance[];
  portForwarding: PortForward[];
  apiKeys: ApiKey[];
  settings: SystemSettings;
  logs: SystemLog[];
}

const DEFAULT_SETTINGS: SystemSettings = {
  siteName: "SkydoCloud",
  siteDescription: "High-Performance VPS Management Panel",
  logoUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=100&fit=crop", // Elegant gradient circle vector
  cpuThreshold: 90,
  ramThreshold: 90,
  discordEnabled: false,
  discordClientId: "admin",
  discordClientSecret: "•••••",
  discordRedirectUri: "http://localhost:5000/auth/discord/callback",
  allowAutoRegistration: true,
  buttonText: "Continue with Discord",
  backgroundImageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1920&fit=crop",
  footerText: "Powered by SkydoCloud",
  timezone: "UTC",
  faviconUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=32&h=32&fit=crop",
  userRegistration: true
};

const INITIAL_DB: DatabaseSchema = {
  users: [
    {
      id: "u-admin",
      username: "admin",
      email: "admin@localhost",
      passwordHash: "admin123", // Storing as simple string for demonstration/configuration as requested
      isAdmin: true,
      createdAt: new Date().toISOString()
    }
  ],
  nodes: [], // Sample nodes removed as requested
  instances: [], // Sample instances removed as requested
  portForwarding: [],
  apiKeys: [],
  logs: [
    {
      id: "l-init",
      timestamp: new Date().toISOString(),
      scope: "HVM Panel",
      message: "SkydoCloud Panel Database initialized successfully.",
      level: "info"
    }
  ],
  settings: DEFAULT_SETTINGS
};

class JSONDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = { ...INITIAL_DB };
    this.init();
  }

  private init() {
    // Ensure backups dir exists
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }

    // Load db.json
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure settings are merged
        this.data.settings = { ...DEFAULT_SETTINGS, ...this.data.settings };
      } else {
        this.save();
      }
    } catch (e) {
      console.error("Failed to load local DB, starting fresh", e);
      this.save();
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error("Failed to write to local DB", e);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // Logs helper
  public addLog(scope: SystemLog['scope'], message: string, level: SystemLog['level'] = 'info') {
    const log: SystemLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      scope,
      message,
      level
    };
    this.data.logs.unshift(log);
    // Limit logs to last 500 records
    if (this.data.logs.length > 500) {
      this.data.logs = this.data.logs.slice(0, 500);
    }
    this.save();
  }

  // Backup actions
  public createBackup(): string {
    const filename = `backup-${Date.now()}.json`;
    const dest = path.join(BACKUPS_DIR, filename);
    fs.writeFileSync(dest, JSON.stringify(this.data, null, 2), 'utf-8');
    this.addLog("Backup", `Manual database backup created: ${filename}`, "info");
    return filename;
  }

  public listBackups() {
    if (!fs.existsSync(BACKUPS_DIR)) return [];
    try {
      const files = fs.readdirSync(BACKUPS_DIR);
      return files
        .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
        .map(f => {
          const stats = fs.statSync(path.join(BACKUPS_DIR, f));
          return {
            filename: f,
            createdAt: stats.mtime.toISOString(),
            size: stats.size
          };
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (e) {
      return [];
    }
  }

  public deleteBackup(filename: string): boolean {
    const target = path.join(BACKUPS_DIR, filename);
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
      this.addLog("Backup", `Database backup deleted: ${filename}`, "info");
      return true;
    }
    return false;
  }

  public restoreBackup(filename: string): boolean {
    const target = path.join(BACKUPS_DIR, filename);
    if (fs.existsSync(target)) {
      try {
        const fileContent = fs.readFileSync(target, 'utf-8');
        const restored = JSON.parse(fileContent);
        // Basic schema checks
        if (restored.users && restored.nodes && restored.instances) {
          this.data = restored;
          this.save();
          this.addLog("Backup", `Database fully restored from backup file: ${filename}`, "warning");
          return true;
        }
      } catch (e) {
        console.error("Restoration failed", e);
      }
    }
    return false;
  }
}

export const dbConnection = new JSONDatabase();
