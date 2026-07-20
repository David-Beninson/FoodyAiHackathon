from fastapi import APIRouter, HTTPException, status
from beanie import PydanticObjectId
from datetime import datetime
from app.models.user import UserProfile, Macros
from app.models.plan import WeeklyPlan
from app.models.completion import CompletionMeal
from app.schemas.ai import ChatRequest, ExplainMealRequest, CompletionRequest
from app.services.ai import AIService
from app.routers.plan import get_week_start_date

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@router.post("/chat")
async def chat_advisor(payload: ChatRequest):
    """
    Interact with the FoodyAI Advisor.
    Maintains memory via the history payload.
    """
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

    # Convert chat history to simple dict structures for the AI service
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in payload.history]

    response_text = AIService.chat_advisor(user, payload.message, history_dicts)
    return {"response": response_text}

@router.post("/explain-meal")
async def explain_meal(payload: ExplainMealRequest):
    """
    Explain the nutrition logic behind a suggested meal (Info button trigger).
    """
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

    explanation = AIService.generate_meal_explanation(
        user=user,
        meal_name=payload.meal_name,
        meal_description=payload.meal_description
    )
    return {"explanation": explanation}

@router.post("/completion", response_model=CompletionMeal, status_code=status.HTTP_201_CREATED)
async def generate_completion_meal(payload: CompletionRequest):
    """
    Generate and save a 'smart completion' meal for skipped meal slots.
    Calculates exact missing nutrients for the day and creates a historical log in MongoDB.
    """
    # 1. Fetch User Profile
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

    # 2. Find Weekly Plan for this date
    week_start = get_week_start_date(payload.date)
    plan = await WeeklyPlan.find_one(
        WeeklyPlan.user_id == payload.user_id,
        WeeklyPlan.week_start_date == week_start
    )
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Weekly plan containing this date does not exist."
        )

    # 3. Determine current weekday name (e.g. "Sunday")
    try:
        dt = datetime.strptime(payload.date, "%Y-%m-%d")
        day_name = dt.strftime("%A")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Expected YYYY-MM-DD."
        )

    if day_name not in plan.days:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Day '{day_name}' not found in the plan."
        )

    # 4. Check for existing completion meal to avoid duplication
    existing_completion = await CompletionMeal.find_one(
        CompletionMeal.user_id == payload.user_id,
        CompletionMeal.date == payload.date,
        CompletionMeal.skipped_meal_type == payload.skipped_meal_type
    )
    if existing_completion:
        return existing_completion

    # 5. Calculate nutritional deficit for the day
    day_plan = plan.days[day_name]
    planned = day_plan.summary_planned_macros
    actual = day_plan.summary_actual_macros

    deficit = Macros(
        calories=max(planned.calories - actual.calories, 0.0),
        protein=max(planned.protein - actual.protein, 0.0),
        carbs=max(planned.carbs - actual.carbs, 0.0),
        fat=max(planned.fat - actual.fat, 0.0)
    )

    # If the user has eaten everything, deficit will be 0.
    # But if they skipped a meal, deficit will represent the missing macros.
    if deficit.calories <= 0:
        # Fallback to the skipped meal's planned macros if deficit math yields zero
        skipped_meal = day_plan.meals.get(payload.skipped_meal_type)
        if skipped_meal:
            deficit = skipped_meal.planned_macros
        else:
            deficit = Macros(calories=300, protein=20, carbs=35, fat=8) # reasonable snack fallback

    # 6. Call AI engine for a completion meal suggestion
    ai_meal = AIService.generate_completion_meal(
        user=user,
        date=payload.date,
        skipped_meal_type=payload.skipped_meal_type,
        missing_macros=deficit
    )

    # 7. Create CompletionMeal document
    completion_document = CompletionMeal(
        user_id=payload.user_id,
        date=payload.date,
        skipped_meal_type=payload.skipped_meal_type,
        name=ai_meal.name,
        description=ai_meal.description,
        suggested_macros=Macros(
            calories=ai_meal.calories,
            protein=ai_meal.protein,
            carbs=ai_meal.carbs,
            fat=ai_meal.fat
        ),
        status="suggested"
    )
    await completion_document.insert()
    return completion_document

@router.get("/completions/{user_id}", response_model=list[CompletionMeal])
async def get_completion_meals_history(user_id: str):
    """
    Fetch history of smart completion meals for a user.
    """
    return await CompletionMeal.find(CompletionMeal.user_id == user_id).to_list()
