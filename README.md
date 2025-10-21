# HRLoop360 

## Overview
**HRLoop360** is a next-generation **AI-native Human Resource Management System (HRMS)** designed to act as an intelligent HR partner, not just a process automation tool. Unlike traditional HRMS platforms or surface-level AI add-ons, HRLoop360 integrates **AI models across the full HR–Employee lifecycle** — from recruitment and onboarding to performance and retention.

It continuously learns and adapts, creating a **360° AI feedback loop** that transforms how organizations attract, develop, and retain top talent.

---

## Key Features

### 1. Unified AI Across All HR Functions
- End-to-end AI integration across recruitment, learning, performance, and retention.  
- Predictive analytics for offer acceptance, performance, and satisfaction.  
- Adaptive learning ensures each HR cycle improves the next.  
- Explainable AI outputs with actionable insights.

### 2. Continuous AI HR Loop
Each AI stage feeds into the next, forming a self-improving ecosystem:
1. **Resume Screening**  
2. **Skill Alignment**  
3. **Offer Optimization**  
4. **Performance Prediction**  
5. **Satisfaction Analytics**  
6. **Back to Hiring Insights**

---
## Tech Stack

### Frontend
- **React.js** 
- **TailwindCSS**  

### Backend
- **Node.js (Express )**
- **MongoDB** 

### AI 
- **GeminiAPI** 
-


---

## Core Modules

| Module | Description |
|---------|--------------|
| AI Resume Screener | Parses, scores, and ranks resumes using AI embeddings. |
| Skill Gaps Analyzer | Detects capability gaps and creates learning paths. |
| Offer Optimizer | Predicts offer acceptance likelihood and recommends improvements. |
| Performance Prediction | Monitors KPIs and forecasts performance outcomes. |
| Satisfaction Prediction | Tracks engagement signals to prevent attrition. |
| HRMS Core | Attendance, payroll, leave, and performance review management. |

---



## Getting Started

### Prerequisites
- Node.js v18+  
- MongoDB  


### Installation
```bash
git clone https://github.com/shishirshebbar/AI-Powered-HRMS-Platform.git
cd AI-Powered-HRMS-Platform
cd backend
npm install
npm run dev
cd frontend
npm install 
npm run dev
```

### Environment Configuration
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_google_api_key_here
AI_PROVIDER=gemini
ENABLE_LLM_EXPLANATION=true
GEMINI_EMBED_MODEL=text-embedding-004
GEMINI_MODEL=gemini-2.0-flash
AI_DEBUG=true
