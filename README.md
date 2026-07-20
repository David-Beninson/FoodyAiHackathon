# FoodyAI 🍳

An AI-powered dynamic meal planner and personalized nutrition assistant designed to help individuals and families eat healthier, reduce food waste, and hit their physical goals.

This repository is split into two primary components:
1. **[Frontend (React + Vite)](file:///Users/mrjimmyy/Projects/Hackathon/frontend/README.md)** - A responsive, modern web interface.
2. **[Backend (FastAPI + Beanie ODM)](file:///Users/mrjimmyy/Projects/Hackathon/backend/README.md)** - A high-performance async API with MongoDB and AI integrations.

---

## 🚀 Key Features

* **Smart Onboarding & Profile Customization**: Calculates custom BMR and target macros (Calories, Protein, Carbs, Fat) using the scientific Mifflin-St Jeor formula based on user physical metrics, goals, diet styles, and allergies.
* **AI-Generated Weekly Meal Planner**: Produces a customized 7-day meal plan tailored to your macronutrient targets and preferences, utilizing Google Gemini (3.5 Flash) or OpenAI (GPT-4o-mini).
* **Toggle Meal Eating Status**: Track your eating habits in real-time by marking meals as `eaten` or `skipped`, dynamically updating your actual daily macro progress.
* **Smart Completion Snacks ("ארוחת השלמה")**: If you skip a meal, the system calculates the exact remaining nutritional deficit for the day and generates a custom snack/meal suggestion to fill the gap.
* **Interactive AI Advisor Chat**: Chat with a real-time AI nutrition coach to get recipe advice, swap recommendations, and kitchen hacks.
* **Pantry & Shopping List Sync**: Add ingredients directly from your auto-generated shopping list to your digital pantry as you purchase them.
* **Robust Mock Fallback Engine**: If no API keys are configured, the app works flawlessly out of the box using a smart, rule-based local mock engine.

---

## 📁 Repository Structure

```text
Hackathon/
├── frontend/               # React + Vite web application
│   ├── src/
│   │   ├── components/     # Reusable UI components (Calendar, Onboarding, Chat, etc.)
│   │   ├── pages/          # Main views (Planner, Pantry, Profile, Auth)
│   │   └── api/            # Axios API client integrations
│   └── package.json
├── backend/                # FastAPI backend service
│   ├── app/
│   │   ├── models/         # Beanie MongoDB Documents
│   │   ├── schemas/        # Pydantic schemas (Request/Response validation)
│   │   ├── services/       # Auth (JWT, bcrypt) & AI service integrations
│   │   └── routers/        # API route endpoints
│   ├── main.py
│   └── pyproject.toml
├── package.json            # Monorepo task automation
└── README.md               # You are here
```

---

## 🛠️ Getting Started

### Prerequisites
* **Node.js** (v18+)
* **Python** (3.12+) with `uv` package manager installed
* **MongoDB** (Running locally on `mongodb://localhost:27017` or configured Atlas URI)

### Quick Start (Run Both Frontend & Backend)

1. **Clone and Install Root Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Environment Files**:
   * Create a `.env` file in the `backend/` directory (see [Backend Setup](file:///Users/mrjimmyy/Projects/Hackathon/backend/README.md) for details).
   * Create a `.env` file in the `frontend/` directory (pointing to the backend API URL, default is `VITE_API_URL=http://localhost:8000`).

3. **Start Development Servers concurrently**:
   ```bash
   npm run dev
   ```
   This command starts:
   * **Frontend**: `http://localhost:5173`
   * **Backend**: `http://localhost:8000` (API Docs at `/docs`)

---

## 📖 Deep Dives

For component-specific configurations, setups, and architectural details, check out:
* 🖥️ **[Frontend Documentation](file:///Users/mrjimmyy/Projects/Hackathon/frontend/README.md)**
* ⚙️ **[Backend Documentation & Guide](file:///Users/mrjimmyy/Projects/Hackathon/backend/README.md)** (also references [DOCUMENTATION.md](file:///Users/mrjimmyy/Projects/Hackathon/backend/DOCUMENTATION.md))