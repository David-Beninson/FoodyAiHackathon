# מדריך ארכיטקטורה ותיעוד קוד: FoodyAI Backend

מסמך זה מסביר בצורה מפורטת ומקיפה את כל רכיבי השרת (Backend) של פרויקט **FoodyAI**, המבוסס על **FastAPI**, **Beanie (MongoDB Async ODM)** ו-**Uvicorn**.

---

## 1. מבנה התיקיות והקבצים

הפרויקט בנוי בצורה מודולרית לפי מוסכמות פיתוח מודרניות ב-FastAPI:

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py             # נקודת האתחול של FastAPI, הגדרת CORS וטעינת הראוטרים
│   ├── config.py           # ניהול משתני סביבה והגדרות שרת (Pydantic Settings)
│   ├── database.py         # חיבור מקביל ואסינכרוני ל-MongoDB באמצעות PyMongo Async
│   ├── utils.py            # פונקציות עזר מתמטיות (חישוב צריכת קלוריות ומאקרו יומית)
│   ├── models/             # מודלים של מסד הנתונים (Beanie Documents)
│   │   ├── __init__.py     # ריכוז כל המודלים לאתחול בבסיס הנתונים
│   │   ├── user.py         # פרופיל משתמש ויעדים תזונתיים
│   │   ├── plan.py         # תוכנית שבועית, ארוחות יומיות וסטטוס אכילה
│   │   └── completion.py   # ארוחות השלמה חכמות (היסטוריית חוסרים)
│   ├── schemas/            # סכמות קלט/פלט לאימות נתונים ב-API (Pydantic Models)
│   │   ├── __init__.py
│   │   ├── user.py         # אימות הרשמה, התחברות ואפיון
│   │   ├── plan.py         # אימות יצירת תוכניות שבועיות ושינויי סטטוס
│   │   └── ai.py           # אימות בקשות צ'אט, הסבר ארוחות והשלמות חכמות
│   ├── services/           # לוגיקה עסקית ואינטגרציות
│   │   ├── __init__.py
│   │   ├── auth.py         # הצפנת סיסמאות (bcrypt), חתימת JWT ואבטחת נתיבים
│   │   └── ai.py           # אינטגרציה עם Gemini 3.5 Flash ו-OpenAI + מנוע ה-Mock
│   └── routers/            # נתיבי ה-API (Controllers)
│       ├── __init__.py
│       ├── user.py         # API לניהול משתמשים (הרשמה, התחברות ואפיון)
│       ├── plan.py         # API לניהול תוכניות אוכל ולוח שנה
│       └── ai.py           # API לשיחה עם היועץ והמלצות השלמה חכמות
├── .env                    # קובץ הגדרות סביבה מקומי (אינו עולה לגיט)
├── .env.example            # תבנית להגדרות סביבה
├── .gitignore              # הגדרת קבצים מוחרגים מגיט (קאש, .env, סביבה וירטואלית)
├── pyproject.toml          # ניהול חבילות ותלויות פייתון באמצעות uv
├── README.md               # הוראות הפעלה מהירות
└── tests/
    └── test_backend.py     # סקריפט בדיקה מקיף לכל המערכות
```

---

## 2. מודלים של מסד הנתונים (Database Models)

בבסיס הנתונים (MongoDB) אנו משתמשים ב-**Beanie**, המאפשרת לעבוד עם מונגו בצורה אסינכרונית ובטוחה באמצעות הגדרת מחלקות יורשות של `Document`.

### 2.1. UserProfile (אוסף `users`)
מייצג משתמש במערכת. הפיצול בין **הרשמה** ל-**אפיון (Onboarding)** מיושם על ידי הגדרת שדות אפיון אופציונליים (`Optional`).
* **שדות מפתח**:
  * `email` & `username`: נתוני הרשמה בסיסיים.
  * `hashed_password`: סיסמה מוצפנת בלבד (אבטחת מידע).
  * `age`, `weight`, `height`, `gender`, `activity_level`: פרטים פיזיים המתווספים בשלב האפיון.
  * `goals`, `allergies`, `preferences`: יעדים והעדפות תזונתיות לסינון ב-AI.
  * `daily_macros_target`: יעד הקלוריות והמאקרו (חלבון, פחמימה, שומן) היומי המחושב אוטומטית.

### 2.2. WeeklyPlan (אוסף `weekly_plans`)
מייצג תפריט של שבוע שלם (מיום ראשון עד שבת) עבור משתמש מסוים.
* **אופטימיזציה לביצועים**: במקום לבצע שליפה נפרדת לכל יום, השרת שולף את **כל השבוע במסמך בודד (Single Query)** לפי מזהה משתמש ותאריך תחילת השבוע (תמיד יום ראשון).
* **מבנה מקונן (Nested)**:
  * מסמך שבועי (`WeeklyPlan`) מכיל מילון של ימים (`days`).
  * כל יום (`DayPlan`) מכיל מילון של ארוחות (`meals`) הממופה ל-`breakfast`, `lunch` ו-`dinner`.
  * כל ארוחה (`MealPlan`) מכילה:
    * `name` & `description`: כותרת הארוחה והסבר ההכנה שלה באנגלית.
    * `status`: Enum מסוג `MealStatus` המגדיר האם הארוחה מתוכננת (`planned`), נאכלה (`eaten`), או דולגה (`skipped`).
    * `planned_macros`: ערכי המאקרו המתוכננים המקוריים של המנה.
    * `actual_macros`: ערכי המאקרו שנאכלו בפועל (מתעדכן אוטומטית על פי הסטטוס: אם הארוחה דולגה, הערכים בפועל הופכים ל-0).
    * `ai_explanation`: הסבר תזונתי קצר מדוע המנה הזו נבחרה למשתמש.

### 2.3. CompletionMeal (אוסף `completion_meals`)
מייצג ארוחת השלמה חכמה ("ארוחת השלמה").
* מוגדר כמסמך עצמאי השומר היסטוריית ארוחות השלמה שהומלצו למשתמש בעקבות פספוס ארוחות רגילות.

---

## 3. אבטחה והזדהות (Authentication & JWT)

מנגנון האבטחה מרוכז ב-[app/services/auth.py](file:///home/oren/Documents/Repos/FullStackCourse/FoodyAiHackathon/backend/app/services/auth.py) ומבוסס על שני עקרונות:

### 3.1. הצפנת סיסמאות (Direct bcrypt Hashing)
* אנו משתמשים ישירות בספריית `bcrypt` (ולא ב-`passlib` הישן כדי לשמור על תאימות מלאה לפייתון 3.12+).
* פונקציית `hash_password` מייצרת מלח (Salt) רנדומלי ומצפינה את הסיסמה ל-Hash חד-כיווני מאובטח.
* פונקציית `verify_password` משווה באופן בטוח בין סיסמה שהוזנה בטופס לבין ה-Hash השמור בבסיס הנתונים.

### 3.2. טוקני JWT (JSON Web Tokens)
* עם התחברות מוצלחת, השרת מייצר טוקן חתום באמצעות ה-`JWT_SECRET_KEY` וסוג החתימה `HS256`.
* הטוקן מכיל מזהה משתמש (`sub`), כתובת אימייל ותאריך תפוגה מוגדר (24 שעות).
* **אבטחת נתיבים**: השרת מייצא פונקציית תלויות (FastAPI Dependency) בשם `get_current_user`. כאשר נרצה לאבטח נתיב כלשהו (למשל, קבלת התפריט של המשתמש), נגדיר אותו כדרוש את התלות הזו. השרת יבדוק אוטומטית את ה-Header של ה-HTTP, יאמת את הטוקן, ישלוף את המשתמש המתאים ממונגו ויחזיר אותו, או יזרוק שגיאת 401 (Unauthorized) אם הטוקן לא תקין או פג תוקף.

---

## 4. מנוע ה-AI ומצב ה-Mock החכם

מנוע ה-AI מרוכז ב-[app/services/ai.py](file:///home/oren/Documents/Repos/FullStackCourse/FoodyAiHackathon/backend/app/services/ai.py) והוא הלב של הפרויקט:

### 4.1. אינטגרציה עם Gemini 3.5 Flash ו-OpenAI
* המנוע מנסה תחילה להשתמש ב-Gemini של גוגל באמצעות הלקוח החדיש `google-genai` וממודל ה-`gemini-3.5-flash`.
* ה-API של Gemini מופעל עם **Structured Outputs** (סכמת פלט מובנית) – אנו שולחים ל-API את המבנה של הפלט התזונתי הרצוי כמודל Pydantic (`AIWeeklyPlanResponse`), וה-AI מתחייב להחזיר תשובת JSON תקינה התואמת במאת האחוזים למבנה המבוקש. זה מונע שגיאות פענוח (Parsing).
* אם Gemini נכשל או אינו זמין (למשל, בעומס שרתים זמני), המערכת מנסה לפנות ל-OpenAI (`gpt-4o-mini`).

### 4.2. מנוע ה-Mock התשתיתי (Fallback)
* **חשיבות עליונה להאקתון**: במידה ולא הוגדרו מפתחות API של OpenAI/Gemini ב-`.env`, המערכת לא תקרוס. במקום זאת, מופעל אלגוריתם Mock חכם מקומי.
* אלגוריתם זה מחזיק מאגר רחב של ארוחות מגוונות ובריאות באנגלית (דייסות קוואקר, שקשוקות, חזה עוף מוקפץ, קציצות עדשים, דגים, סלטים וכו') ומחלק אותן לפי סגנון תזונתי (טבעוני, צמחוני, בשרי).
* המערכת בוחרת ארוחות מתאימות לפי הגדרות המשתמש (למשל, מסננת ארוחות בשריות אם המשתמש סימן "צמחוני", ומסננת רכיבים המכילים אלרגנים כמו אגוזים).
* **התאמת מאקרו יוניקית**: המערכת לוקחת את יעד המאקרו היומי של המשתמש, מחלקת אותו ביחס של 30% לבוקר, 40% לצהריים ו-30% לערב, ומכפילה את ערכי הארוחות הנבחרות ביחס המשלים כך שסך כל הארוחות ביום יתאים בדיוק ליעד המאקרו של המשתמש!

---

## 5. לוגיקות מרכזיות באפיון

### 5.1. חישוב יעדי תזונה (Mifflin-St Jeor)
בקובץ [app/utils.py](file:///home/oren/Documents/Repos/FullStackCourse/FoodyAiHackathon/backend/app/utils.py), מיושמת נוסחת ה-BMR המדעית לחישוב שריפת קלוריות בסיסית:
$$BMR = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age (years)} + s$$
כאשר הקבוע $s$ הוא $+5$ לגברים ו-$-161$ לנשים.
הערך מוכפל במקדם רמת הפעילות של המשתמש (TDEE). במידה והיעד הוא ירידה במשקל, מופחתות 500 קלוריות. במידה והיעד הוא עלייה במסה, מתווספות 300 קלוריות.
לאחר מכן מתבצע חיתוך של אבות המזון:
* 30% מהקלוריות מגיעות מחלבונים (1 גרם = 4 קלוריות).
* 40% מהקלוריות מגיעות מפחמימות (1 גרם = 4 קלוריות).
* 30% מהקלוריות מגיעות משומנים (1 גרם = 9 קלוריות).

### 5.2. חישוב גירעון וארוחת השלמה חכמה
כאשר ארוחה מסוימת מסומנת כ-`skipped`, ערכי המאקרו בפועל שלה הופכים ל-0. 
כאשר המשתמש מבקש ארוחת השלמה עבור יום מסוים:
1. המערכת מחשבת את סך כל הערכים התזונתיים המתוכננים לאותו יום ומפחיתה מהם את מה שנאכל בפועל (סכום הארוחות שסומנו כ-`eaten`).
2. ההפרש מייצג את החוסר התזונתי (הגירעון) של המשתמש לאותו יום.
3. המערכת פונה ל-AI (או ל-Mock) עם הגירעון התזונתי המדויק ומבקשת להמליץ על מנה אחת או נשנוש שיכסה בדיוק את הקלוריות והחלבונים החסרים.
4. המנה המומלצת נשמרת במונגו כתיעוד היסטורי עצמאי ומוחזרת ל-Frontend להצגה.

---
---

# Architecture Guide and Code Documentation: FoodyAI Backend

This document provides a detailed and comprehensive explanation of all backend components of the **FoodyAI** project, built using **FastAPI**, **Beanie (MongoDB Async ODM)**, and **Uvicorn**.

---

## 1. Directory and File Structure

The project is structured modularly following modern FastAPI development best practices:

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py             # FastAPI entry point, CORS configuration, and router initialization
│   ├── config.py           # Environment variables and server configuration (Pydantic Settings)
│   ├── database.py         # Asynchronous MongoDB connection using PyMongo Async MongoClient
│   ├── utils.py            # Mathematical helper functions (daily calorie and macro goal calculations)
│   ├── models/             # Database models (Beanie Documents)
│   │   ├── __init__.py     # Registry of all models for Beanie initialization
│   │   ├── user.py         # User profile and nutritional targets
│   │   ├── plan.py         # Weekly plan, daily meals, and eating statuses
│   │   └── completion.py   # Smart completion meals (nutritional deficit history)
│   ├── schemas/            # Request/Response validation schemas (Pydantic Models)
│   │   ├── __init__.py
│   │   ├── user.py         # Registration, login, and onboarding schemas
│   │   ├── plan.py         # Weekly plan creation and meal status update schemas
│   │   └── ai.py           # Advisor chat, meal explanation, and completion requests schemas
│   ├── services/           # Business logic and external integrations
│   │   ├── __init__.py
│   │   ├── auth.py         # Password hashing (bcrypt), JWT generation, and dependency security
│   │   └── ai.py           # Google Gemini (3.5 Flash) and OpenAI integrations + Mock Fallback engine
│   └── routers/            # API Route controllers
│       ├── __init__.py
│       ├── user.py         # User management APIs (register, login, onboard)
│       ├── plan.py         # Meal plan and calendar management APIs
│       └── ai.py           # Advisor chat and smart completion APIs
├── .env                    # Local environment settings (git-ignored)
├── .env.example            # Template for environment settings
├── .gitignore              # Files excluded from git
├── pyproject.toml          # Package dependency management using uv
├── README.md               # Quick start manual
└── tests/
    └── test_backend.py     # Consolidated system integration test suite
```

---

## 2. Database Models

We use **Beanie** (a MongoDB Async ODM) to work with MongoDB asynchronously and safely using Python classes inheriting from `Document`.

### 2.1. UserProfile (`users` collection)
Represents a user in the system. The separation between **registration** and **onboarding** is implemented by defining onboarding fields as optional (`Optional`).
* **Key Fields**:
  * `email` & `username`: Basic registration details.
  * `hashed_password`: Securely hashed password.
  * `age`, `weight`, `height`, `gender`, `activity_level`: Physical details supplied during onboarding.
  * `goals`, `allergies`, `preferences`: Nutritional goals and preferences for AI filtering.
  * `daily_macros_target`: Daily calorie and macro targets (protein, carbs, fat) calculated automatically.

### 2.2. WeeklyPlan (`weekly_plans` collection)
Represents a user's meal plan for an entire week (from Sunday to Saturday).
* **Performance Optimization**: Instead of querying the database for each day separately, the server retrieves the **entire week in a single document (Single Query)** based on the user ID and the start date of the week (always a Sunday).
* **Nested Structure**:
  * A weekly document (`WeeklyPlan`) contains a dictionary of days (`days`).
  * Each day (`DayPlan`) contains a dictionary of meals (`meals`) mapped to `breakfast`, `lunch`, and `dinner`.
  * Each meal (`MealPlan`) contains:
    * `name` & `description`: Meal title and preparation instructions in English.
    * `status`: A `MealStatus` Enum defining whether the meal is planned (`planned`), eaten (`eaten`), or skipped (`skipped`).
    * `planned_macros`: Original planned macros for the meal.
    * `actual_macros`: Calories/macros eaten (automatically set: if skipped, actual macros become 0).
    * `ai_explanation`: Brief nutritional explanation of why this meal fits the user's goals.

### 2.3. CompletionMeal (`completion_meals` collection)
Represents a smart completion snack or meal.
* Stored as an independent document logging the history of suggested completion meals recommended to the user following skipped meals.

---

## 3. Security and Authentication (JWT)

Security logic is located in [app/services/auth.py](file:///home/oren/Documents/Repos/FullStackCourse/FoodyAiHackathon/backend/app/services/auth.py) and operates on two principles:

### 3.1. Password Hashing (Direct bcrypt Hashing)
* We use the `bcrypt` library directly to keep full compatibility with Python 3.12+.
* The `hash_password` function generates a random salt and hashes the password into a secure one-way hash.
* The `verify_password` function securely compares a form password with the hash saved in the database.

### 3.2. JWT Tokens (JSON Web Tokens)
* Upon successful login, the server generates a token signed using `JWT_SECRET_KEY` and algorithm `HS256`.
* The token contains the user ID (`sub`), email address, and an expiration date (24 hours).
* **Route Protection**: The server exports a dependency function `get_current_user`. When we want to protect a route, we require this dependency. The server checks the Authorization header, validates the token, retrieves the user from MongoDB, and returns them, throwing a 401 Unauthorized exception if the token is invalid or expired.

---

## 4. AI Engine and Smart Mock Fallback

The AI Engine is located in [app/services/ai.py](file:///home/oren/Documents/Repos/FullStackCourse/FoodyAiHackathon/backend/app/services/ai.py) and is the core of the project:

### 4.1. Gemini 3.5 Flash and OpenAI Integration
* The engine first attempts to use Google's Gemini using the `google-genai` client and model `gemini-3.5-flash`.
* The Gemini API is called with **Structured Outputs** – we send the structural schema to the API using a Pydantic model (`AIWeeklyPlanResponse`), and the AI is guaranteed to return a valid JSON response conforming to the schema.
* If Gemini fails or is unavailable, the system falls back to OpenAI (`gpt-4o-mini`).

### 4.2. Mock Fallback Engine
* **Crucial for Hackathons**: If no API keys are provided in `.env`, the system does not crash. Instead, it activates a smart local Mock engine.
* This engine contains a wide variety of healthy English meals (Oatmeal, Shakshuka, Stir-fried chicken, lentil patties, salads, etc.) categorized by diet style (vegan, vegetarian, meat-based).
* The engine selects appropriate meals matching user preferences and automatically filters allergen components (e.g. nuts).
* **Macro Matching Algorithm**: The engine takes the user's daily targets, divides them (30% breakfast, 40% lunch, 30% dinner), and adjusts the size of mock meals so that the final daily summary matches the user's exact daily targets!

---

## 5. Main Onboarding Logics

### 5.1. Target Macro Calculation (Mifflin-St Jeor)
In [app/utils.py](file:///home/oren/Documents/Repos/FullStackCourse/FoodyAiHackathon/backend/app/utils.py), we calculate the scientific BMR:
$$BMR = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age (years)} + s$$
where constant $s$ is $+5$ for males and $-161$ for females.
The value is multiplied by the activity level coefficient (TDEE). If the goal is weight loss, we subtract 500 kcal. If the goal is muscle gain, we add 300 kcal.
Macro splitting:
* 30% of calories from protein (1g = 4 kcal).
* 40% of calories from carbs (1g = 4 kcal).
* 30% of calories from fat (1g = 9 kcal).

### 5.2. Deficit Calculation and Completion Meal
When a meal is marked as `skipped`, its actual macros become 0. When the user requests a completion meal for that day:
1. The system calculates the planned daily macros and subtracts the actual eaten macros.
2. The difference represents the nutritional deficit.
3. The system queries the AI (or Mock fallback) with the deficit details to suggest a single snack or meal matching the missing nutrients.
4. The suggested meal is saved to the database and returned to the client.
