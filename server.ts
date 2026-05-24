import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { dbConnection, Node, Instance, PortForward, ApiKey, User, SystemLog } from "./src/db";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request parsers
  app.use(express.json());

  // Helper function to verify API tokens (Simulates secure API communication)
  const verifyAPIKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const apiKeyHeader = req.header("X-API-Key");
    if (!apiKeyHeader) {
      next();
      return;
    }

    const db = dbConnection.getData();
    const foundKey = db.apiKeys.find(k => k.key === apiKeyHeader);
    if (!foundKey) {
      res.status(401).json({ error: "Invalid API Access Key" });
      return;
    }

    // Check expiration if any
    if (foundKey.expirationDate !== 'never') {
      const expDate = new Date(foundKey.expirationDate);
      if (expDate.getTime() < Date.now()) {
        res.status(401).json({ error: "API Key has expired" });
        return;
      }
    }

    // Attach user information to request
    (req as any).apiKeyUser = foundKey.userId;
    next();
  };

  app.use(verifyAPIKey);

  // --- API ROUTING ENDPOINTS ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "SkydoCloud VPS Panel Engine running." });
  });

  // System Configuration & Settings
  app.get("/api/settings", (req, res) => {
    res.json(dbConnection.getData().settings);
  });

  app.post("/api/settings", (req, res) => {
    try {
      const db = dbConnection.getData();
      db.settings = { ...db.settings, ...req.body };
      dbConnection.save();
      dbConnection.addLog("HVM Panel", "System panel settings updated successfully.", "info");
      res.json({ success: true, settings: db.settings });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // System Info / Statistics
  app.get("/api/system-info", (req, res) => {
    const db = dbConnection.getData();
    const systemInfo = {
      address: "172.17.0.1",
      netmask: "255.255.0.0",
      broadcast: "172.17.255.255",
      macAddress: "02:42:81:92:1f:b8",
      dnsServers: "ff:ff:ff:ff:ff:ff",
      env: {
        panelName: db.settings.siteName,
        panelVersion: "5.2-PRO-ULTIMATE",
        developer: "ANKITDEV",
        host: "0.0.0.0:3000",
        debugMode: "Disabled",
        serverIp: "127.0.0.1",
        databasePath: "db.json",
        storagePool: "default",
        backupInterval: "3600s",
        statsUpdateInterval: "5s",
        currentDirectory: "/workspaces/VPS/hvm",
        pythonExecutable: "/workspaces/VPS/hvm/venv/bin/python3"
      }
    };
    res.json(systemInfo);
  });

  // Authentication & Profile Updates
  app.post("/api/auth/login", (req, res) => {
    const { usernameOrEmail, password } = req.body;
    const db = dbConnection.getData();
    
    const user = db.users.find(u => 
      (u.username === usernameOrEmail || u.email === usernameOrEmail) && 
      u.passwordHash === password
    );

    if (!user) {
      dbConnection.addLog("Security", `Failed logon attempt for account: ${usernameOrEmail}`, "warning");
      res.status(401).json({ error: "Invalid username, email, or credentials." });
      return;
    }

    dbConnection.addLog("Security", `User ${user.username} logged in successfully`, "info");
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    });
  });

  // Update administrative user account properties (change admin credentials)
  app.put("/api/auth/update", (req, res) => {
    const { userId, username, email, password } = req.body;
    const db = dbConnection.getData();
    
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      res.status(404).json({ error: "User profile not found." });
      return;
    }

    const originalUsername = db.users[userIndex].username;
    
    // Check conflicts
    const conflict = db.users.find((u, idx) => idx !== userIndex && (u.username === username || u.email === email));
    if (conflict) {
      res.status(400).json({ error: "Username or email is already taken" });
      return;
    }

    db.users[userIndex].username = username;
    db.users[userIndex].email = email;
    if (password && password.trim() !== '') {
      db.users[userIndex].passwordHash = password;
    }
    
    dbConnection.save();
    dbConnection.addLog("Security", `User credentials updated for ${originalUsername} (now: ${username})`, "info");
    
    res.json({
      success: true,
      user: {
        id: db.users[userIndex].id,
        username: db.users[userIndex].username,
        email: db.users[userIndex].email,
        isAdmin: db.users[userIndex].isAdmin,
        createdAt: db.users[userIndex].createdAt
      }
    });
  });

  // User Manager endpoints
  app.get("/api/users", (req, res) => {
    const db = dbConnection.getData();
    // Return sanitized users
    const sanitized = db.users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt
    }));
    res.json(sanitized);
  });

  app.post("/api/users", (req, res) => {
    const { username, email, password, isAdmin } = req.body;
    const db = dbConnection.getData();

    if (!username || !email || !password) {
      res.status(400).json({ error: "All account parameters are required" });
      return;
    }

    const conflict = db.users.find(u => u.username === username || u.email === email);
    if (conflict) {
      res.status(400).json({ error: "Username or email is already taken" });
      return;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      username,
      email,
      passwordHash: password,
      isAdmin: !!isAdmin,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    dbConnection.save();
    dbConnection.addLog("Security", `New user created: ${username} (Admin: ${newUser.isAdmin})`, "info");
    res.json({ success: true, user: { id: newUser.id, username, email, isAdmin: newUser.isAdmin } });
  });

  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const db = dbConnection.getData();
    
    if (id === "u-admin") {
      res.status(400).json({ error: "The default system admin account cannot be deleted." });
      return;
    }

    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const username = db.users[idx].username;
    db.users.splice(idx, 1);
    
    // Clean up instances associated
    db.instances = db.instances.filter(inst => {
      if (inst.userId === id) {
        dbConnection.addLog("Database", `Orphaned instance ${inst.name} removed post user deletion`, "info");
        return false;
      }
      return true;
    });

    dbConnection.save();
    dbConnection.addLog("Security", `User account ${username} was deleted by admin`, "warning");
    res.json({ success: true });
  });

  // Node endpoints
  app.get("/api/nodes", (req, res) => {
    res.json(dbConnection.getData().nodes);
  });

  app.post("/api/nodes", (req, res) => {
    const { name, ipAddress, location, apiSecret, maxCapacity } = req.body;
    if (!name || !ipAddress || !apiSecret || !maxCapacity) {
      res.status(400).json({ error: "All node parameters are mandatory." });
      return;
    }

    const newNode: Node = {
      id: `node-${Date.now()}`,
      name,
      ipAddress,
      location,
      apiSecret,
      maxCapacity: Number(maxCapacity),
      cpuUsage: 0,
      ramUsage: 0,
      status: 'online'
    };

    const db = dbConnection.getData();
    db.nodes.push(newNode);
    dbConnection.save();

    dbConnection.addLog("HVM Panel", `New remote Node added: ${name} [${ipAddress}]`, "info");
    res.json({ success: true, node: newNode });
  });

  app.delete("/api/nodes/:id", (req, res) => {
    const { id } = req.params;
    const db = dbConnection.getData();
    const nodeIdx = db.nodes.findIndex(n => n.id === id);

    if (nodeIdx === -1) {
      res.status(404).json({ error: "Node not found." });
      return;
    }

    const nodeName = db.nodes[nodeIdx].name;
    db.nodes.splice(nodeIdx, 1);

    // Remove or reassign linked instances
    const linkedVPS = db.instances.filter(i => i.nodeId === id);
    db.instances = db.instances.filter(i => i.nodeId !== id);

    dbConnection.save();
    dbConnection.addLog("HVM Panel", `Node ${nodeName} deleted. ${linkedVPS.length} associated VPS instances wiped.`, "warning");
    
    res.json({ success: true });
  });

  // Instances (VPS) endpoints
  app.get("/api/instances", (req, res) => {
    const db = dbConnection.getData();
    // Return all for Admin, or subset for API keys / users
    const userId = (req as any).apiKeyUser;
    const ownerId = req.query.ownerId as string;

    if (userId) {
      const userFiltered = db.instances.filter(i => i.userId === userId);
      res.json(userFiltered);
      return;
    }

    if (ownerId) {
      const userFiltered = db.instances.filter(i => i.userId === ownerId);
      res.json(userFiltered);
      return;
    }

    res.json(db.instances);
  });

  app.post("/api/instances", (req, res) => {
    const { name, nodeId, userId, cpuCores, ramGB, diskGB, ipAddress } = req.body;
    if (!name || !nodeId || !userId || !cpuCores || !ramGB || !diskGB || !ipAddress) {
      res.status(400).json({ error: "Missing required provisioning parameters." });
      return;
    }

    const db = dbConnection.getData();
    const node = db.nodes.find(n => n.id === nodeId);
    if (!node) {
      res.status(404).json({ error: "Target node does not exist." });
      return;
    }

    // Provision VPS Instance
    const newInst: Instance = {
      id: `vps-${Date.now()}`,
      name,
      nodeId,
      userId,
      status: 'stopped',
      cpuCores: Number(cpuCores),
      ramGB: Number(ramGB),
      diskGB: Number(diskGB),
      ipAddress,
      createdAt: new Date().toISOString()
    };

    db.instances.push(newInst);

    // Simulate Agent provisioning dialogue (Secured HTTPS Call logs matching Decoupled design)
    dbConnection.addLog("Node Agent", `Secured HTTPS instruction set dispatched to daemon at ${node.ipAddress}`);
    dbConnection.addLog("Node Agent", `Daemon response: Provision container state '${name}' - OK`);
    
    // Adjust simulated resource footprint
    node.ramUsage = Math.min(node.maxCapacity, node.ramUsage + Number(ramGB));
    node.cpuUsage = Math.min(100, node.cpuUsage + 12);

    dbConnection.save();
    dbConnection.addLog("HVM Panel", `VPS instance created successfully: ${name}`, "info");
    
    res.json({ success: true, instance: newInst });
  });

  app.delete("/api/instances/:id", (req, res) => {
    const { id } = req.params;
    const db = dbConnection.getData();
    const instIdx = db.instances.findIndex(i => i.id === id);

    if (instIdx === -1) {
      res.status(404).json({ error: "Instance not found." });
      return;
    }

    const inst = db.instances[instIdx];
    const node = db.nodes.find(n => n.id === inst.nodeId);
    
    if (node) {
      dbConnection.addLog("Node Agent", `De-provision container call dispatched to node at ${node.ipAddress}`);
      // Return space
      node.ramUsage = Math.max(0, node.ramUsage - inst.ramGB);
      node.cpuUsage = Math.max(0, node.cpuUsage - 12);
    }

    db.instances.splice(instIdx, 1);
    // Remove linked port rules
    db.portForwarding = db.portForwarding.filter(p => p.vpsId !== id);

    dbConnection.save();
    dbConnection.addLog("HVM Panel", `VPS instance ${inst.name} fully purged.`, "info");
    res.json({ success: true });
  });

  // Handle power status actions on Instances
  app.post("/api/instances/:id/action", (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'start', 'stop', 'restart', 'suspend'
    const db = dbConnection.getData();
    
    const inst = db.instances.find(i => i.id === id);
    if (!inst) {
      res.status(404).json({ error: "Target instance error." });
      return;
    }

    const node = db.nodes.find(n => n.id === inst.nodeId);
    const daemonEndpoint = node ? node.ipAddress : "unknown_endpoint";

    dbConnection.addLog("Node Agent", `API trigger dispatch: ${action.toUpperCase()} for container ${inst.id} on Daemon at ${daemonEndpoint}`);

    if (action === 'start') {
      inst.status = 'running';
    } else if (action === 'stop') {
      inst.status = 'stopped';
    } else if (action === 'restart') {
      inst.status = 'running';
      dbConnection.addLog("Node Agent", `Reboot signal returned successfully from Daemon code 200`);
    } else if (action === 'suspend') {
      inst.status = 'suspended';
    }

    dbConnection.save();
    res.json({ success: true, status: inst.status });
  });

  // Port Forwarding rules endpoints
  app.get("/api/ports", (req, res) => {
    res.json(dbConnection.getData().portForwarding);
  });

  app.post("/api/ports", (req, res) => {
    const { vpsId, publicPort, privatePort, protocol } = req.body;
    if (!vpsId || !publicPort || !privatePort || !protocol) {
      res.status(400).json({ error: "Missing port routing parameters." });
      return;
    }

    const db = dbConnection.getData();
    const vps = db.instances.find(v => v.id === vpsId);
    if (!vps) {
      res.status(404).json({ error: "Associated VPS not verified." });
      return;
    }

    const newPort: PortForward = {
      id: `port-${Date.now()}`,
      vpsId,
      publicPort: Number(publicPort),
      privatePort: Number(privatePort),
      protocol,
      createdAt: new Date().toISOString()
    };

    db.portForwarding.push(newPort);
    dbConnection.save();
    dbConnection.addLog("HVM Panel", `Inbound port routing map set: ${protocol.toUpperCase()} ${publicPort} -> ${vps.name}:${privatePort}`, "info");

    res.json({ success: true, port: newPort });
  });

  app.delete("/api/ports/:id", (req, res) => {
    const { id } = req.params;
    const db = dbConnection.getData();
    const idx = db.portForwarding.findIndex(p => p.id === id);

    if (idx === -1) {
      res.status(404).json({ error: "Routing map error" });
      return;
    }

    db.portForwarding.splice(idx, 1);
    dbConnection.save();
    dbConnection.addLog("HVM Panel", "Port forwarding rule destroyed.", "info");

    res.json({ success: true });
  });

  // REST API Keys endpoints
  app.get("/api/apikeys", (req, res) => {
    res.json(dbConnection.getData().apiKeys);
  });

  app.post("/api/apikeys", (req, res) => {
    const { name, description, userId, expirationDate } = req.body;
    if (!name || !userId) {
      res.status(400).json({ error: "Key parameters missing Name or User ID validation." });
      return;
    }

    // Generate simulated hex key
    const mockHash = Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    const keyString = `aryn_api_${mockHash}`;

    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name,
      key: keyString,
      description: description || "Access token",
      userId,
      expirationDate: expirationDate || "never",
      createdAt: new Date().toISOString()
    };

    const db = dbConnection.getData();
    db.apiKeys.push(newKey);
    dbConnection.save();

    dbConnection.addLog("Security", `Programmatic API key generated: [${name}] for user ${userId}`, "info");
    res.json({ success: true, key: newKey });
  });

  app.delete("/api/apikeys/:id", (req, res) => {
    const { id } = req.params;
    const db = dbConnection.getData();
    const idx = db.apiKeys.findIndex(k => k.id === id);

    if (idx === -1) {
      res.status(404).json({ error: "API key entry does not exist." });
      return;
    }

    db.apiKeys.splice(idx, 1);
    dbConnection.save();
    dbConnection.addLog("Security", "Programmatic API key revoked.", "warning");

    res.json({ success: true });
  });

  // Logs Endpoint
  app.get("/api/logs", (req, res) => {
    const { scope, limit } = req.query;
    let logs = dbConnection.getData().logs;

    if (scope && scope !== 'all' && scope !== 'HVM Panel') {
      logs = logs.filter(l => l.scope === scope);
    }

    const finalLimit = limit ? Number(limit) : 100;
    res.json(logs.slice(0, finalLimit));
  });

  // Maintenance Procedures & Emergency Override actions
  app.post("/api/maintenance/action", (req, res) => {
    const { action } = req.body;
    const db = dbConnection.getData();

    if (action === "emergency_stop") {
      db.instances.forEach(ins => {
        if (ins.status === 'running') {
          ins.status = 'stopped';
        }
      });
      dbConnection.addLog("Security", "!!! EMERGENCY OVERRIDE TRIGGERED: Stop all active instances dispatches !!!", "error");
      dbConnection.save();
      res.json({ success: true, message: "Emergency Stop signal dispatched to all virtual machines." });
      return;
    }

    if (action === "emergency_reboot") {
      db.instances.forEach(ins => {
        ins.status = 'running';
      });
      dbConnection.addLog("Security", "!!! EMERGENCY OVERRIDE TRIGGERED: Soft reboot and cycle all node containers !!!", "error");
      dbConnection.save();
      res.json({ success: true, message: "Emergency Reboot signals dispatched successfully to node controllers." });
      return;
    }

    if (action === "clear_suspensions") {
      db.instances.forEach(ins => {
        if (ins.status === 'suspended') {
          ins.status = 'stopped';
        }
      });
      dbConnection.addLog("HVM Panel", "Emergency system restoration: Cleared VPS hypervisor suspensions", "info");
      dbConnection.save();
      res.json({ success: true, message: "Host CPU/RAM suspensions manually set back." });
      return;
    }

    if (action === "vacuum") {
      // Simulate file shrink and garbage collecting log registers
      db.logs = db.logs.slice(0, 10);
      dbConnection.addLog("Database", "Database vacuum completed. Log database overhead recovered.", "info");
      dbConnection.save();
      res.json({ success: true, message: "Database vacuum optimization executed; logs index compression successful." });
      return;
    }

    res.status(400).json({ error: "Maintenance action parameters incorrect" });
  });

  // Backups Endpoint
  app.get("/api/backups", (req, res) => {
    res.json(dbConnection.listBackups());
  });

  app.post("/api/backups", (req, res) => {
    try {
      const filename = dbConnection.createBackup();
      res.json({ success: true, filename });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/backups/restore", (req, res) => {
    const { filename } = req.body;
    if (!filename) {
      res.status(400).json({ error: "Backup filename required." });
      return;
    }
    const success = dbConnection.restoreBackup(filename);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: "Restoration failure. Backup file integrity check failed." });
    }
  });

  app.delete("/api/backups/:filename", (req, res) => {
    const { filename } = req.params;
    const success = dbConnection.deleteBackup(filename);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Backup file not found." });
    }
  });

  // --- LOCAL FILE MANAGEMENT API ENDPOINTS ---
  app.get("/api/files/list", (req, res) => {
    try {
      const relativeDir = (req.query.dir as string) || ".";
      const targetDir = path.resolve(process.cwd(), relativeDir);
      
      // Safety check: ensure path does not escape project root
      if (!targetDir.startsWith(process.cwd())) {
        res.status(403).json({ error: "Access denied. Action escapes workspace root." });
        return;
      }

      if (!fs.existsSync(targetDir)) {
        res.status(404).json({ error: "Target directory does not exist." });
        return;
      }

      const files = fs.readdirSync(targetDir, { withFileTypes: true });
      const list = files
        .filter(f => !f.name.startsWith('.') && f.name !== 'node_modules' && f.name !== 'dist' && f.name !== '.git')
        .map(file => {
          const filePath = path.join(targetDir, file.name);
          const relativePath = path.relative(process.cwd(), filePath);
          let stat;
          try {
            stat = fs.statSync(filePath);
          } catch {
            stat = { size: 0, mtime: new Date() };
          }
          return {
            name: file.name,
            path: relativePath || ".",
            isDirectory: file.isDirectory(),
            size: stat.size,
            mtime: stat.mtime
          };
        });

      res.json({ success: true, files: list, currentPath: path.relative(process.cwd(), targetDir) || "." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/files/read", (req, res) => {
    try {
      const relativeFile = req.query.file as string;
      if (!relativeFile) {
        res.status(400).json({ error: "File parameter required." });
        return;
      }
      const targetFile = path.resolve(process.cwd(), relativeFile);
      
      // Safety check: ensure path does not escape project root
      if (!targetFile.startsWith(process.cwd())) {
        res.status(403).json({ error: "Access denied. Action escapes workspace root." });
        return;
      }

      if (fs.existsSync(targetFile) && fs.statSync(targetFile).isDirectory()) {
        res.status(400).json({ error: "Cannot read directory as file." });
        return;
      }

      if (!fs.existsSync(targetFile)) {
        res.status(404).json({ error: "File not found." });
        return;
      }

      const content = fs.readFileSync(targetFile, "utf-8");
      res.json({ success: true, content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/files/write", (req, res) => {
    try {
      const { file, content } = req.body;
      if (!file) {
        res.status(400).json({ error: "File parameter required." });
        return;
      }
      const targetFile = path.resolve(process.cwd(), file);
      
      // Safety check: ensure path does not escape project root
      if (!targetFile.startsWith(process.cwd())) {
        res.status(403).json({ error: "Access denied. Action escapes workspace root." });
        return;
      }

      fs.writeFileSync(targetFile, content || "", "utf-8");
      
      dbConnection.addLog("HVM Panel", `File written in workspace: ${path.relative(process.cwd(), targetFile)}`, "info");
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/files/create", (req, res) => {
    try {
      const { targetPath, type } = req.body;
      if (!targetPath) {
        res.status(400).json({ error: "Path is required." });
        return;
      }
      const destination = path.resolve(process.cwd(), targetPath);
      
      // Safety check: ensure path does not escape project root
      if (!destination.startsWith(process.cwd())) {
        res.status(403).json({ error: "Access denied. Action escapes workspace root." });
        return;
      }

      if (fs.existsSync(destination)) {
        res.status(400).json({ error: "File or directory already exists." });
        return;
      }

      if (type === "dir") {
        fs.mkdirSync(destination, { recursive: true });
        dbConnection.addLog("HVM Panel", `Created local directory: ${path.relative(process.cwd(), destination)}`, "info");
      } else {
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, "", "utf-8");
        dbConnection.addLog("HVM Panel", `Created local file: ${path.relative(process.cwd(), destination)}`, "info");
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/files/delete", (req, res) => {
    try {
      const { targetPath } = req.body;
      if (!targetPath) {
        res.status(400).json({ error: "Path parameters are required." });
        return;
      }
      const target = path.resolve(process.cwd(), targetPath);
      
      // Safety check: ensure path does not escape project root
      if (!target.startsWith(process.cwd())) {
        res.status(403).json({ error: "Access denied. Action escapes workspace root." });
        return;
      }

      if (!fs.existsSync(target)) {
        res.status(404).json({ error: "Path not found." });
        return;
      }

      const isDir = fs.statSync(target).isDirectory();
      if (isDir) {
        fs.rmSync(target, { recursive: true, force: true });
        dbConnection.addLog("HVM Panel", `Deleted directory: ${path.relative(process.cwd(), target)}`, "warning");
      } else {
        fs.unlinkSync(target);
        dbConnection.addLog("HVM Panel", `Deleted file: ${path.relative(process.cwd(), target)}`, "warning");
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- VITE WEB MIDDLEWARE INTEGRATION ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SkydoCloud VPS Server Engine] Booted fully on port ${PORT}`);
  });
}

startServer();
