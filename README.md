# 🌍 Sovereign Map Explorer (v2035.1)

> **"Reclaiming the world's data layer through Decentralized Spatial Intelligence."**

Sovereign Map is a high-fidelity spatial operating system and geopolitical analyst dashboard. It reclaims the spatial commons by merging real-time **ORB-SLAM3** visual tracking with **Google Gemini AI** powered geopolitical intelligence, all anchored to the **Polygon AggLayer** for cryptographic finality.

![Sovereign Map Header](https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000)

## 🛠 Features

1.  **Simulated ORB-SLAM3 Engine**: Monocular-inertial SLAM simulation.
2.  **Geopolitical Intelligence**: Deep integration with Google Gemini 3 models.
3.  **AggLayer Finality**: ZK-Proof commitments for spatial data.

## 🚀 Build Instructions

1.  **Install**: `npm install`
2.  **Run Dev**: `npm run dev`
3.  **Build**: `npm run build`

## 🆘 Troubleshooting GitHub Sync

If you are seeing "Failed to sync" or can't push `.yml` files, follow these steps:

### 1. The ".github/" Folder Permission Issue
GitHub sometimes restricts pushing to the `.github/` folder if you haven't configured a **Personal Access Token (PAT)** with "Workflow" permissions.
- **Solution**: Go to GitHub Settings > Developer Settings > Tokens > Generate New Token (Classic). Select the `workflow` scope. Use this token as your password when pushing.

### 2. Large File / node_modules Block
If you tried to push before adding a `.gitignore`, your repo might be trying to upload 50MB+ of `node_modules`.
- **Solution**: 
  ```bash
  git rm -r --cached node_modules
  git add .
  git commit -m "fix: remove node_modules from history"
  git push origin main
  ```

### 3. Forced Push
If the remote repository has diverged significantly:
- **Solution**: `git push origin main --force` (Warning: This will overwrite remote history).

## 📜 Governance
This project operates under the **SGP (Spatial Governance Proposal)** framework. Current active proposal: **SGP-001 (Heritage Sanctuaries)**.
