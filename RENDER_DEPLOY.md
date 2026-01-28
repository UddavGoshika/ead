# Render.com Deployment Guide for e-Advocate

This project is configured as a **Monorepo** (Frontend + Backend in one repository). For Render, it is recommended to deploy the **Backend** and have it serve the static **Frontend**.

## Option 1: Single Web Service (Recommended)
This deploys the Node.js server, which also serves the React app as static files.

### ⚙️ Render Web Service Settings:
- **Runtime**: `Node`
- **Build Command**: `npm run build` (This will install everything and build the frontend)
- **Start Command**: `npm start` (Runs the backend from `server/index.js`)

### 🔑 Environment Variables to add in Render:
Add these in the "Environment" tab of your Render dashboard:

| Key | Value |
| :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://eadvocate:Advocate%401.@cluster0.rlkrhz6.mongodb.net/?appName=Cluster0` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `neurogenix187@gmail.com` |
| `SMTP_PASS` | `jnqj codi oxea zmec` |
| `NODE_ENV` | `production` |

---

## 📁 Project Structure Analysis
1. **Root**: Contains `package.json` for orchestration.
2. **Server**: Node/Express API with MongoDB/Mongoose.
3. **Frontend**: React/Vite/TSX.

## 🚀 Deployment Steps (Manual)
1. Push your code to GitHub.
2. Link the repository to Render.com.
3. Choose **Web Service**.
4. Use the settings above.
5. Add the environment variables.

---
**Note**: The server is already configured to look for the `frontend/dist` folder. When `npm run build` runs in the root, it creates this folder, and the server serves it automatically!
