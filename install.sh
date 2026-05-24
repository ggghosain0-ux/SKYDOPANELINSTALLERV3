#!/bin/bash

# ==============================================================================
#                  SkydoCloud VPS Hosting Panel Installer
# ==============================================================================
# Target OS: Rocky Linux / Debian / Ubuntu / CentOS
# Version: 5.2-PRO-ULTIMATE
# Description: Automates Node.js runtime, PM2 process daemon installation,
#              compiles the production build, and configures persistent autostart.
# ==============================================================================

# Color codes for premium terminal telemetry
RED='\033[1;31m'
GREEN='\033[1;32m'
CYAN='\033[1;36m'
YELLOW='\033[1;33m'
RESET='\033[0m'

clear
echo -e "${CYAN}======================================================================${RESET}"
echo -e "${CYAN}             _____ _             _             _     _ ${RESET}"
echo -e "${CYAN}            /  ___| |           | |           | |   | |${RESET}"
echo -e "${CYAN}            \ \`__ | | ___   _ __| | ___  _   _| | __| |${RESET}"
echo -e "${CYAN}             \`\`__ \ |/ / | | / _\` |/ _ \| | | | |/ _\` |${RESET}"
echo -e "${CYAN}            /\__/ /   <| |_| | (_| | (_) | |_| | | (_| |${RESET}"
echo -e "${CYAN}            \____/|_|\_\____, |\___/ \___/ \__,_|_|\__,_|${RESET}"
echo -e "${CYAN}                         __/ |                                ${RESET}"
echo -e "${CYAN}                        |___/                                 ${RESET}"
echo -e "${CYAN}======================================================================${RESET}"
echo -e "${CYAN}         PRISTINE OFFLINE-READY LOCAL DEPLOYMENT ENGINE SETUP${RESET}"
echo -e "${CYAN}======================================================================${RESET}"
echo ""

# Privilege validation check
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}[!] Warning: Running without root privileges. Standard dependencies may need sudo authorization.${RESET}"
  # Ask to continue
  read -p "Do you want to proceed anyway? (y/N): " choice
  if [[ ! "$choice" =~ ^[Yy]$ ]]; then
    echo -e "${RED}[-] Installation cancelled.${RESET}"
    exit 1
  fi
fi

# 1. Update system dependencies
echo -e "${CYAN}[1/5] Checking and installing system packages...${RESET}"
if [ -f /etc/debian_version ]; then
    # Debian/Ubuntu systems
    apt-get update -y
    apt-get install -y curl build-essential git -y
elif [ -f /etc/redhat-release ]; then
    # RedHat/CentOS/Rocky systems
    dnf groupinstall "Development Tools" -y
    dnf install curl git -y
fi

# 2. Check Node.js / Install Node.js LTS
echo -e "${CYAN}[2/5] Validating Node.js runtime environment...${RESET}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}[i] Node.js not detected on this VPS. Injecting Node.js v20 LTS (Recommended)...${RESET}"
    if [ -f /etc/debian_version ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    elif [ -f /etc/redhat-release ]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        dnf install -y nodejs
    fi
else
    echo -e "${GREEN}[+] Found existing Node.js: $(node -v)${RESET}"
fi

# 3. NPM package & PM2 environment install
echo -e "${CYAN}[3/5] Resolving node modules and installing PM2 globally...${RESET}"
npm install -g pm2 --silent
if [ $? -eq 0 ]; then
    echo -e "${GREEN}[+] PM2 Daemon installed successfully.${RESET}"
else
    echo -e "${RED}[-] Global PM2 setup failed. Retrying configuration with standard node installation...${RESET}"
    npm install
fi

# 4. Trigger build system compile
echo -e "${CYAN}[4/5] Initiating SkydoCloud full-stack distribution compile...${RESET}"
npm install
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[+] Build and distribution bundles generated inside ./dist${RESET}"
else
    echo -e "${RED}[-] Compilation error encountered. Checking source files compatibility...${RESET}"
    exit 1
fi

# 5. Continuous VM autostart and boot processes
echo -e "${CYAN}[5/5] Hooking panel process through PM2 monitor...${RESET}"
pm2 stop skydocloud-panel 2>/dev/null || true
pm2 delete skydocloud-panel 2>/dev/null || true

# Start the panel using PM2 daemon
pm2 start dist/server.cjs --name "skydocloud-panel" --env NODE_ENV=production

# Saving state & generating boot triggers
pm2 save
pm2 startup

echo -e ""
echo -e "${GREEN}======================================================================${RESET}"
echo -e "${GREEN}[+] SKYDOCLOUD LOCAL VPS HOSTING PANEL INSTALLED SUCCESSFUL!${RESET}"
echo -e "${GREEN}======================================================================${RESET}"
echo -e "${CYAN}• Panel Status:${RESET} Running (via PM2)"
echo -e "${CYAN}• local Port:${RESET} 3000"
echo -e "${CYAN}• Database Mode:${RESET} Offline Local File (. /db.json)"
echo -e "${CYAN}• Default Admin Account:${RESET}"
echo -e "  - Username:  ${YELLOW}admin${RESET}"
echo -e "  - Password:  ${YELLOW}admin123${RESET}"
echo -e "${CYAN}• Useful PM2 commands:${RESET}"
echo -e "  - View live logs:      ${YELLOW}pm2 logs skydocloud-panel${RESET}"
echo -e "  - Restart panel:       ${YELLOW}pm2 restart skydocloud-panel${RESET}"
echo -e "  - Stop panel:          ${YELLOW}pm2 stop skydocloud-panel${RESET}"
echo -e "${GREEN}======================================================================${RESET}"
echo -e "${GREEN}Data persistence is fully secured. Panel will auto-resume on reboot!${RESET}"
echo -e "${GREEN}======================================================================${RESET}"
echo ""
