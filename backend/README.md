# FoodyAI Backend API

This is the backend API for **FoodyAI**, built using **FastAPI**, **Beanie ODM (MongoDB)**, and **Uvicorn**.

---

## Features

- **Onboarding & Profile Management**: Save user settings (weight, age, goals, allergies, preferences) and automatically calculate daily calorie and macronutrient targets.
- **Weekly Meal Planner**: AI-powered calendar generation (Sunday to Saturday, divided into Breakfast, Lunch, Dinner). Single database query optimization to retrieve the entire weekly plan by date.
- **Toggle Eating Status**: Mark meals as `eaten`, `skipped`, or `replaced` (updates actual daily macro stats dynamically).
- **Smart Completion ("ארוחת השלמה")**: If a meal is marked as `skipped`, the AI calculates the exact daily deficit (target minus actual eaten) and suggests a healthy snack/meal to make up for the missing nutrients, logging it as a historical record.
- **AI Food Adviser**: Real-time chat advisor to answer nutritional questions and suggest substitutions.
- **Meal Explanation**: Get immediate scientific feedback (info button) explaining why the AI suggested a specific meal.
- **Flexible AI Providers**: Ready-to-go integrations with **Google Gemini (2.5 Flash)** and **OpenAI (GPT-4o-mini)**.
- **Mock Fallback Engine**: If no API keys are provided in `.env`, the server automatically falls back to an intelligent, rule-based Hebrew meal planner that respects user goals, macros, preferences, and allergies!

---

## Prerequisites

- **Python**: version `>= 3.12`
- **MongoDB**: A running local MongoDB server on `mongodb://localhost:27017` or a MongoDB Atlas URI.
- **uv**: Python package manager (highly recommended, installed on your system!).

---

## Installation & Setup

1. **Configure Environment Variables**:
   Copy `.env.example` to `.env` (already created for you with defaults):
   ```bash
   cp .env.example .env
   ```
   *Note: If you want real AI responses, add your `OPENAI_API_KEY` or `GEMINI_API_KEY` to the `.env` file. Otherwise, the mock generator will be used.*

2. **Install Dependencies and Start Server**:
   Using `uv` (recommended):
   ```bash
   uv run main.py
   ```
   This will automatically install dependencies in a virtual environment (`.venv`) and start the Uvicorn hot-reloads server on `http://localhost:8000`.

   Alternatively, using standard virtualenv & pip:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r pyproject.toml
   python main.py
   ```

---

## API Documentation

Once the server is running, you can view the interactive documentation at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Key Endpoints

#### Users
- `POST /api/users/onboard`: Saves profile and calculates target macros.
- `GET /api/users/{user_id}`: Retrieves profile.

#### Plans
- `GET /api/plans?user_id={user_id}&date={date}`: Retrieves weekly plan containing `date` (e.g. `2026-07-20`).
- `POST /api/plans/generate`: Triggers AI generation of a new 7-day meal plan.
- `PATCH /api/plans/{plan_id}/meals/{day}/{meal_type}/status`: Toggle status (`eaten`, `skipped`, etc.) of a specific meal.
- `POST /api/plans/regenerate-meal`: Regenerate a single meal slot with a new suggestion.

#### AI
- `POST /api/ai/chat`: Interactive chat with FoodyAI.
- `POST /api/ai/explain-meal`: Request explanation for a meal.
- `POST /api/ai/completion`: Request a "smart completion" meal for skipped macros.
