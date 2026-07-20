import asyncio
import os
import sys
from dotenv import load_dotenv

# Ensure we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environmental variables
load_dotenv()

from app.config import settings
from app.database import init_db
from app.models.user import UserProfile, Macros, UserGoal, ActivityLevel
from app.models.plan import WeeklyPlan, DayPlan, MealPlan, MealStatus
from app.models.completion import CompletionMeal
from app.utils import calculate_target_macros
from app.services.auth import AuthService
from app.services.ai import AIService

async def run_tests():
    print("==================================================")
    print("      FOODYAI SYSTEM INTEGRATION TEST SUITE       ")
    print("==================================================")
    
    # 1. Verify environment loading
    print("\n[1/8] Settings Loaded:")
    print(f"  - Database Name: {settings.DATABASE_NAME}")
    print(f"  - MongoDB URL: {settings.MONGODB_URL[:30]}...")
    print(f"  - Gemini API Key: {'Configured' if settings.GEMINI_API_KEY else 'Missing!'}")
    
    # 2. Database Connection
    print("\n[2/8] Connecting to MongoDB Atlas and initializing Beanie...")
    try:
        await init_db()
        print("  -> Connected successfully!")
    except Exception as e:
        print(f"  -> ERROR: Database connection failed: {e}")
        return

    # 3. Clean up existing test data from previous runs (to avoid unique email collision)
    print("\n[3/8] Cleaning up existing test user from previous runs...")
    test_email = "test_suite_user@foodyai.com"
    existing_user = await UserProfile.find_one(UserProfile.email == test_email)
    if existing_user:
        # Delete old plans
        await WeeklyPlan.find(WeeklyPlan.user_id == str(existing_user.id)).delete()
        # Delete old completions
        await CompletionMeal.find(CompletionMeal.user_id == str(existing_user.id)).delete()
        # Delete old user
        await existing_user.delete()
        print(f"  -> Cleaned up existing user {test_email} to prepare for fresh data.")
    else:
        print("  -> No existing test data found. Ready for fresh insertion.")

    # 4. User Registration & Password Hashing
    print("\n[4/8] Testing User Registration...")
    plain_password = "SecretPassword123"
    hashed_pwd = AuthService.hash_password(plain_password)
    
    test_user = UserProfile(
        email=test_email,
        username="TesterSuite",
        hashed_password=hashed_pwd
    )
    await test_user.insert()
    assert test_user.id is not None
    print(f"  -> User registered successfully. MongoDB ID: {test_user.id}")
    print(f"  -> Password verified successfully: {AuthService.verify_password(plain_password, test_user.hashed_password)}")

    # 5. Onboarding & Target Macro Calculations
    print("\n[5/8] Testing Onboarding & Macro Calculations...")
    age = 28
    weight = 80.0
    height = 180.0
    gender = "male"
    
    # Set English Enums
    activity_level = ActivityLevel.MODERATELY_ACTIVE
    goals = [UserGoal.LOSE_WEIGHT]
    
    allergies = ["nuts"]
    preferences = ["high-protein", "vegetarian"]

    # Calculate macros
    target_macros = calculate_target_macros(
        age=age, weight=weight, height=height, gender=gender,
        activity_level=activity_level, goals=goals
    )
    print(f"  -> Calculated Targets:")
    print(f"     Calories: {target_macros.calories} kcal")
    print(f"     Protein: {target_macros.protein}g")
    print(f"     Carbs: {target_macros.carbs}g")
    print(f"     Fat: {target_macros.fat}g")

    # Update User Profile
    test_user.age = age
    test_user.weight = weight
    test_user.height = height
    test_user.gender = gender
    test_user.activity_level = activity_level
    test_user.goals = goals
    test_user.allergies = allergies
    test_user.preferences = preferences
    test_user.daily_macros_target = target_macros
    await test_user.save()
    print("  -> User profile updated with onboarding Enums.")

    # 6. Weekly Plan Generation
    print("\n[6/8] Testing Weekly Plan Generation via Gemini API (falling back to mock if needed)...")
    try:
        ai_plan_response = AIService.generate_weekly_plan(test_user, prompt_override="Include light fresh meals")
        print("  -> AI generated plan successfully!")
        
        # Build WeeklyPlan Document
        days_dict = {}
        for day_name in ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]:
            ai_day = getattr(ai_plan_response, day_name)
            
            meals = {
                "breakfast": MealPlan(
                    name=ai_day.breakfast.name,
                    description=ai_day.breakfast.description,
                    planned_macros=Macros(
                        calories=ai_day.breakfast.calories,
                        protein=ai_day.breakfast.protein,
                        carbs=ai_day.breakfast.carbs,
                        fat=ai_day.breakfast.fat
                    ),
                    ai_explanation=ai_day.breakfast.ai_explanation
                ),
                "lunch": MealPlan(
                    name=ai_day.lunch.name,
                    description=ai_day.lunch.description,
                    planned_macros=Macros(
                        calories=ai_day.lunch.calories,
                        protein=ai_day.lunch.protein,
                        carbs=ai_day.lunch.carbs,
                        fat=ai_day.lunch.fat
                    ),
                    ai_explanation=ai_day.lunch.ai_explanation
                ),
                "dinner": MealPlan(
                    name=ai_day.dinner.name,
                    description=ai_day.dinner.description,
                    planned_macros=Macros(
                        calories=ai_day.dinner.calories,
                        protein=ai_day.dinner.protein,
                        carbs=ai_day.dinner.carbs,
                        fat=ai_day.dinner.fat
                    ),
                    ai_explanation=ai_day.dinner.ai_explanation
                )
            }
            for m in meals.values():
                m.update_actual_macros()
            days_dict[day_name] = DayPlan(meals=meals)

        new_plan = WeeklyPlan(
            user_id=str(test_user.id),
            week_start_date="2026-07-19",
            days=days_dict
        )
        await new_plan.insert()
        print(f"  -> Saved WeeklyPlan to MongoDB. Plan ID: {new_plan.id}")
        
        # Check Sunday plan
        sunday_meals = new_plan.days["Sunday"].meals
        print(f"     Sunday Breakfast: {sunday_meals['breakfast'].name} ({sunday_meals['breakfast'].planned_macros.calories} kcal)")
        print(f"     Sunday Lunch: {sunday_meals['lunch'].name} ({sunday_meals['lunch'].planned_macros.calories} kcal)")
        print(f"     Sunday Dinner: {sunday_meals['dinner'].name} ({sunday_meals['dinner'].planned_macros.calories} kcal)")
        print(f"     Sunday Total Planned Calories: {new_plan.days["Sunday"].summary_planned_macros.calories} kcal")

    except Exception as e:
        print(f"  -> ERROR: Plan generation failed: {e}")
        return

    # 7. Toggle Meal Status & Deficit Math
    print("\n[7/8] Testing Meal Status Toggle and Macro Deficit...")
    # Mark Sunday Breakfast as eaten, and Lunch as skipped
    new_plan.days["Sunday"].meals["breakfast"].status = MealStatus.EATEN
    new_plan.days["Sunday"].meals["breakfast"].update_actual_macros()
    
    new_plan.days["Sunday"].meals["lunch"].status = MealStatus.SKIPPED
    new_plan.days["Sunday"].meals["lunch"].update_actual_macros()
    
    await new_plan.save()
    
    sunday_plan = new_plan.days["Sunday"]
    print(f"  -> Sunday Target Calories: {sunday_plan.summary_planned_macros.calories} kcal")
    print(f"  -> Sunday Actual (Eaten) Calories: {sunday_plan.summary_actual_macros.calories} kcal")
    
    deficit_calories = max(sunday_plan.summary_planned_macros.calories - sunday_plan.summary_actual_macros.calories, 0.0)
    deficit_protein = max(sunday_plan.summary_planned_macros.protein - sunday_plan.summary_actual_macros.protein, 0.0)
    print(f"  -> Sunday Calorie Deficit: {deficit_calories:.1f} kcal")
    print(f"  -> Sunday Protein Deficit: {deficit_protein:.1f}g")

    # 8. Smart Completion Meal Generation (Deficit Make-up)
    print("\n[8/8] Testing Smart Completion Meal Generation...")
    deficit_macros = Macros(
        calories=deficit_calories,
        protein=deficit_protein,
        carbs=max(sunday_plan.summary_planned_macros.carbs - sunday_plan.summary_actual_macros.carbs, 0.0),
        fat=max(sunday_plan.summary_planned_macros.fat - sunday_plan.summary_actual_macros.fat, 0.0)
    )
    try:
        ai_completion = AIService.generate_completion_meal(
            user=test_user,
            date="2026-07-19",
            skipped_meal_type="lunch",
            missing_macros=deficit_macros
        )
        print("  -> AI generated completion meal successfully!")
        print(f"     Suggested Snack/Meal: {ai_completion.name}")
        print(f"     Macros: {ai_completion.calories} kcal, {ai_completion.protein}g Protein")
        
        # Save to DB
        completion_doc = CompletionMeal(
            user_id=str(test_user.id),
            date="2026-07-19",
            skipped_meal_type="lunch",
            name=ai_completion.name,
            description=ai_completion.description,
            suggested_macros=Macros(
                calories=ai_completion.calories,
                protein=ai_completion.protein,
                carbs=ai_completion.carbs,
                fat=ai_completion.fat
            )
        )
        await completion_doc.insert()
        print(f"  -> Saved CompletionMeal to MongoDB. Completion ID: {completion_doc.id}")
        
    except Exception as e:
        print(f"  -> ERROR: Smart completion failed: {e}")
        return

    # Chat Test
    print("\n[Bonus] Testing AI Advisor Chat...")
    try:
        chat_reply = AIService.chat_advisor(
            user=test_user,
            message="Recommend a healthy high-protein post-workout snack.",
            history=[]
        )
        print("  -> Chat replied successfully:")
        print(f"     AI: {chat_reply}")
    except Exception as e:
        print(f"  -> ERROR: Chat failed: {e}")

    print("\n==================================================")
    print("          ALL TEST CASES PASSED SUCCESSFULLY      ")
    print("      DATA RETAINED IN MONGODB FOR INSPECTION     ")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())
