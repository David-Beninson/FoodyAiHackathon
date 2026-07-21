# FoodyAI Backend API ⚙️

This is the backend API for **FoodyAI**, built using **FastAPI**, **Beanie ODM (MongoDB)**, and **Uvicorn**. It powers the authentication, AI-based menu planner, macro calculator, smart recipe advisor, and shopping list logic.

For a deep-dive architectural guide, see the **[DOCUMENTATION.md](file:///Users/mrjimmyy/Projects/Hackathon/backend/DOCUMENTATION.md)**.

---

## ✨ Features

- **Onboarding & Profile Management**: Save user settings (weight, age, goals, allergies, preferences) and automatically calculate daily calorie and macronutrient targets.
- **Weekly Meal Planner**: AI-powered calendar generation (Sunday to Saturday, divided into Breakfast, Lunch, Dinner). Single database query optimization to retrieve the entire weekly plan by date.
- **Toggle Eating Status**: Mark meals as `eaten` or `skipped` (updates actual daily macro stats dynamically).
- **Smart Completion ("ארוחת השלמה")**: If a meal is marked as `skipped`, the AI calculates the exact daily deficit (target minus actual eaten) and suggests a healthy snack/meal to make up for the missing nutrients, logging it as a historical record.
- **AI Food Adviser**: Real-time chat advisor to answer nutritional questions and suggest substitutions.
- **Meal Explanation**: Get immediate scientific feedback explaining why the AI suggested a specific meal.
- **Flexible AI Providers**: Ready-to-go integrations with **Google Gemini (3.5 Flash)** and **OpenAI (GPT-4o-mini)**.
- **Mock Fallback Engine**: If no API keys are provided in `.env`, the server automatically falls back to an intelligent, rule-based meal planner that respects user goals, macros, preferences, and allergies.

---

## 📁 Directory Structure

```text
backend/
├── app/
│   ├── main.py             # FastAPI entry point, CORS, and router initialization
│   ├── config.py           # Settings and environment variables (Pydantic Settings)
│   ├── database.py         # Asynchronous MongoDB connection using Beanie ODM
│   ├── utils.py            # Calorie and macro target calculations (Mifflin-St Jeor)
│   ├── models/             # Beanie ODM Database Models (User, Plan, Completion)
│   ├── schemas/            # Pydantic validation schemas (Request/Response shapes)
│   ├── services/           # Business logic: auth (JWT, bcrypt) & AI (Gemini/OpenAI/Mock)
│   └── routers/            # Route controllers (user, plan, AI endpoints)
├── .env.example            # Environment template file
├── pyproject.toml          # UV Python project configuration and packages
├── DOCUMENTATION.md        # Detailed backend architectural documentation
└── README.md               # You are here
```

---

## 🛠️ Prerequisites

- **Python**: version `>= 3.12`
- **MongoDB**: A running local MongoDB server on `mongodb://localhost:27017` or a MongoDB Atlas connection.
- **uv**: Modern, high-performance Python package manager.

---

## ⚙️ Installation & Setup

1. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Modify `.env` with your settings:
   ```env
   # API Keys for Gemini/OpenAI (Optional - mock engine will run if empty)
   GEMINI_API_KEY=your_gemini_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Database URI
   MONGODB_URI=mongodb://localhost:27017/foodyai
   
   # JWT Configuration
   JWT_SECRET_KEY=your_jwt_secret_key_here
   ```

2. **Start Server**:
   Using `uv` (recommended):
   ```bash
   uv run main.py
   ```
   This will automatically install dependencies in a virtual environment (`.venv`) and start the Uvicorn hot-reload server on `http://localhost:8000`.

   Alternatively, using standard virtualenv & pip:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r pyproject.toml
   python main.py
   ```

---

## 📖 API Documentation

Once the server is running, interactive API docs are available at:
* **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Key Endpoints

#### Users (`/api/users`)
* `POST /onboard`: Saves user profile, calculates targets, and updates DB.
* `GET /{user_id}`: Retrieves profile details.

#### Plans (`/api/plans`)
* `GET /`: Retrieves the weekly plan containing the queried date.
* `POST /generate`: Triggers AI generation of a new 7-day meal plan.
* `PATCH /{plan_id}/meals/{day}/{meal_type}/status`: Toggle status (`planned`, `eaten`, `skipped`) of a specific meal.
* `POST /regenerate-meal`: Re-roll a single meal slot.

#### AI (`/api/ai`)
* `POST /chat`: Interactive conversation with FoodyAI.
* `POST /explain-meal`: Get detailed scientific context for a meal choice.
* `POST /completion`: Get a deficit-filling snack/meal.
