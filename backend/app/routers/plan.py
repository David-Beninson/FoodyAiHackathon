from fastapi import APIRouter, HTTPException, status, Query
from beanie import PydanticObjectId
from datetime import datetime, timedelta
from app.models.user import UserProfile, Macros
from app.models.plan import WeeklyPlan, DayPlan, MealPlan, MealStatus
from app.schemas.plan import GeneratePlanRequest, UpdateMealStatusRequest, RegenerateMealRequest, SaveDraftPlanRequest
from app.services.ai import AIService
from typing import Optional

router = APIRouter(prefix="/plans", tags=["Plans"])

def get_week_start_date(date_str: str) -> str:
    """
    Given a date string (YYYY-MM-DD), returns the date string of the Sunday that starts the week.
    In Python: Monday=0, ..., Saturday=5, Sunday=6.
    """
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        # Shift so Sunday is 0, Monday is 1, ..., Saturday is 6.
        offset = (dt.weekday() + 1) % 7
        sunday = dt - timedelta(days=offset)
        return sunday.strftime("%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Expected YYYY-MM-DD."
        )

@router.get("", response_model=WeeklyPlan)
async def get_weekly_plan(
    user_id: str = Query(..., description="ID of the user"),
    date: str = Query(..., description="Any date in the target week (YYYY-MM-DD)")
):
    """
    Fetch the weekly plan for the week containing the specified date.
    Optimized to return the entire week's document in a single DB query.
    """
    week_start = get_week_start_date(date)
    plan = await WeeklyPlan.find_one(
        WeeklyPlan.user_id == user_id,
        WeeklyPlan.week_start_date == week_start
    )
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Weekly plan not found for week starting {week_start}."
        )
    return plan

@router.post("/generate", response_model=WeeklyPlan, status_code=status.HTTP_201_CREATED)
async def generate_weekly_plan(payload: GeneratePlanRequest):
    """
    Generate a brand new weekly meal plan for a user.
    Enforces that there isn't an existing plan for the targeted week.
    """
    # 1. Verify user profile exists
    try:
        user_obj_id = PydanticObjectId(payload.user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    user = await UserProfile.get(user_obj_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Please onboard first."
        )

    # 2. Get standard week start date (Sunday)
    week_start = get_week_start_date(payload.week_start_date)

    # 3. Check for existing plan
    existing_plan = await WeeklyPlan.find_one(
        WeeklyPlan.user_id == payload.user_id,
        WeeklyPlan.week_start_date == week_start
    )
    if existing_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A meal plan already exists for the week starting {week_start}."
        )

    # 4. Generate plan via AI Service
    ai_response = AIService.generate_weekly_plan(user, payload.prompt_override)

    # 5. Build Beanie Document
    days_dict = {}
    for day_name in ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]:
        ai_day = getattr(ai_response, day_name)
        
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
        # Initialize actual macros and update status
        for meal in meals.values():
            meal.update_actual_macros()
            
        days_dict[day_name] = DayPlan(meals=meals)

    new_plan = WeeklyPlan(
        user_id=payload.user_id,
        week_start_date=week_start,
        days=days_dict
    )
    await new_plan.insert()
    return new_plan

@router.patch("/{plan_id}/meals/{day}/{meal_type}/status", response_model=WeeklyPlan)
async def update_meal_status(
    plan_id: str,
    day: str,
    meal_type: str,
    payload: UpdateMealStatusRequest
):
    """
    Toggle or update the eating status of a specific meal.
    Synchronizes actual eaten macros based on whether it was eaten, skipped, or replaced.
    """
    try:
        plan_obj_id = PydanticObjectId(plan_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan ID format"
        )

    plan = await WeeklyPlan.get(plan_obj_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Weekly plan not found."
        )

    if day not in plan.days:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid day: {day}"
        )

    day_plan = plan.days[day]
    if meal_type not in day_plan.meals:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid meal type: {meal_type}"
        )

    meal = day_plan.meals[meal_type]
    meal.status = payload.status
    meal.update_actual_macros()

    plan.updated_at = datetime.utcnow()
    await plan.save()
    return plan

@router.post("/regenerate-meal", response_model=WeeklyPlan)
async def regenerate_single_meal(payload: RegenerateMealRequest):
    """
    Regenerate a single meal within a user's weekly plan.
    Updates the meal slot with a newly suggested option from the AI engine.
    """
    week_start = get_week_start_date(payload.week_start_date)

    # 1. Fetch Plan
    plan = await WeeklyPlan.find_one(
        WeeklyPlan.user_id == payload.user_id,
        WeeklyPlan.week_start_date == week_start
    )
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Weekly plan not found for the specified week."
        )

    # 2. Fetch User Profile
    try:
        user_obj_id = PydanticObjectId(payload.user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    user = await UserProfile.get(user_obj_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found."
        )

    # 3. Generate new meal details
    new_meal_data = AIService.generate_single_meal(
        user=user,
        meal_type=payload.meal_type,
        prompt_override=payload.prompt_override
    )

    # 4. Apply to Plan
    meal_slot = plan.days[payload.day].meals[payload.meal_type]
    meal_slot.name = new_meal_data.name
    meal_slot.description = new_meal_data.description
    meal_slot.planned_macros = Macros(
        calories=new_meal_data.calories,
        protein=new_meal_data.protein,
        carbs=new_meal_data.carbs,
        fat=new_meal_data.fat
    )
    meal_slot.ai_explanation = new_meal_data.ai_explanation
    meal_slot.status = MealStatus.PLANNED
    meal_slot.update_actual_macros()

    plan.updated_at = datetime.utcnow()
    await plan.save()
    return plan

@router.post("/save-draft", response_model=WeeklyPlan)
async def save_draft_weekly_plan(payload: SaveDraftPlanRequest):
    """
    Saves or updates a draft weekly plan as the official plan for that week.
    Overwrites any existing plan for the targeted week.
    """
    week_start = get_week_start_date(payload.week_start_date)
    
    # Check if a plan already exists for this user and week
    existing = await WeeklyPlan.find_one(
        WeeklyPlan.user_id == payload.user_id,
        WeeklyPlan.week_start_date == week_start
    )
    
    if existing:
        existing.days = payload.days
        existing.updated_at = datetime.utcnow()
        await existing.save()
        return existing
    else:
        new_plan = WeeklyPlan(
            user_id=payload.user_id,
            week_start_date=week_start,
            days=payload.days
        )
        await new_plan.insert()
        return new_plan

