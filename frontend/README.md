# FoodyAI Frontend 🖥️

The user interface for **FoodyAI**, built with **React**, **Vite**, and **Vanilla CSS** to deliver a responsive, fast, and visually clean web application.

---

## ✨ Features

1. **User Authentication & Auth State**:
   * Login and Registration pages with client-side field validation.
   * Secure session handling using JWTs stored and sent with Axios requests.
   * Auto-redirection and protected routing.

2. **Onboarding Questionnaire**:
   * Multi-step questionnaire collecting physical metrics (weight, height, age, activity level, gender), nutritional preferences (vegan, vegetarian, meat-based, etc.), food allergies, and goals (weight loss, maintenance, muscle gain).
   * Generates calculated daily calorie and macro limits on onboarding completion.

3. **Weekly Calendar / Meal Planner**:
   * Displays the weekly schedule from Sunday to Saturday.
   * Shows a breakdown of Breakfast, Lunch, and Dinner with planned macro targets.
   * Interactive toggles to mark a meal as `planned`, `eaten`, or `skipped`.
   * Live macro tracking bar showing actual daily calories, protein, carbs, and fats consumed vs. the daily target.
   * Single-meal regeneration: Request a new meal recommendation for a specific slot instantly.

4. **Smart Completion Meal Generator**:
   * Calculates nutritional deficits for skipped meals.
   * Allows requesting a customized completion recipe/snack based on what is missing for the day.

5. **AI Nutrition Coach Chat**:
   * In-app chat interface with a digital nutritionist/advisor.
   * Ask for ingredient substitutions, recipes, and dietary tips.

6. **Pantry & Shopping List Sync**:
   * Browse a list of missing ingredients automatically consolidated from your active meal plan.
   * Add items to your digital pantry with a single click once purchased.

7. **Consolidated UI Polish**:
   * Premium responsive styling.
   * Custom straight-line loading indicator indicating API request states.

---

## 🛠️ Tech Stack

* **Core**: React 19, Vite (Fast Hot Module Replacement)
* **Routing**: React Router DOM (v7)
* **State Management**: Redux Toolkit & React-Redux
* **HTTP Client**: Axios (configured with intercepts for JWT injection)
* **Styling**: Vanilla CSS (Responsive Flexbox and Grid layouts)

---

## 📁 Directory Structure

```text
frontend/
├── public/                 # Static assets (favicons, manifest)
├── src/
│   ├── api/
│   │   └── apiClient.js    # Axios client configuration & API endpoint requests
│   ├── components/         # Modular UI building blocks
│   │   ├── Calendar/       # Meal slots, days, and macro progress bars
│   │   ├── Common/         # Reusable loader, button, input elements
│   │   ├── Planner/        # Weekly planner and completion triggers
│   │   └── Profile/        # Onboarding wizard components
│   ├── context/            # React context providers
│   ├── hooks/              # Custom reusable React hooks
│   ├── pages/              # Main route views
│   │   ├── Auth/           # Login & Register views
│   │   ├── Calendar/       # Main weekly tracking interface
│   │   ├── Pantry/         # Pantry management
│   │   ├── Planner/        # Smart plan generator and coach chat
│   │   ├── Profile/        # Target macros and preference editing
│   │   └── ShoppingList/   # Auto-generated shopping list
│   ├── store/              # Redux configuration and slices
│   ├── App.jsx             # Main layout, router definitions, and auth checking
│   ├── index.css           # Global CSS variables, theme, and base styling
│   └── main.jsx            # React root mount point
└── vite.config.js          # Vite build config
```

---

## ⚙️ Setup and Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure API Endpoint**:
   Create a `.env` file in the `frontend/` directory (if not already present):
   ```env
   VITE_API_URL=http://localhost:8000
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   The application will be running locally on `http://localhost:5173`.

4. **Production Build**:
   ```bash
   npm run build
   ```
   Outputs production-ready static assets in the `dist/` directory.
