from fastapi import APIRouter, HTTPException, status
from beanie import PydanticObjectId
from app.models.user import UserProfile
from app.utils import calculate_target_macros
from app.schemas.user import UserCreate, OnboardRequest, UserLogin, TokenResponse
from app.services.auth import AuthService
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])


@router.post(
    "/register", response_model=UserProfile, status_code=status.HTTP_201_CREATED
)
async def register_user(payload: UserCreate):
    """
    Register a new user with email, username, and password.
    Saves a hashed version of the password in the database.
    """
    existing_user = await UserProfile.find_one(UserProfile.email == payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email is already registered.",
        )

    hashed_pwd = AuthService.hash_password(payload.password)
    new_user = UserProfile(
        email=payload.email, username=payload.username, hashed_password=hashed_pwd
    )
    await new_user.insert()
    return new_user


@router.post("/login", response_model=TokenResponse)
async def login_user(payload: UserLogin):
    """
    Authenticate user credentials and return a JWT access token.
    """
    user = await UserProfile.find_one(UserProfile.email == payload.email)
    if not user or not AuthService.verify_password(
        payload.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    access_token = AuthService.create_access_token(
        user_id=str(user.id), email=user.email
    )
    return TokenResponse(
        access_token=access_token, user_id=str(user.id), username=user.username
    )


@router.post("/{user_id}/onboard", response_model=UserProfile)
async def onboard_user(user_id: str, payload: OnboardRequest):
    """
    Onboard a user by filling in age, physical stats, goals, preferences, and allergies.
    Automatically calculates and saves daily calorie/macro goals.
    """
    try:
        obj_id = PydanticObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format."
        )

    user = await UserProfile.get(obj_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )

    # 1. Calculate target macros if not provided
    macros = payload.daily_macros_target
    if not macros:
        macros = calculate_target_macros(
            age=payload.age,
            weight=payload.weight,
            height=payload.height,
            gender=payload.gender,
            activity_level=payload.activity_level,
            goals=payload.goals,
        )

    # 2. Update user profile
    user.age = payload.age
    user.weight = payload.weight
    user.height = payload.height
    user.gender = payload.gender
    user.activity_level = payload.activity_level
    user.goals = payload.goals
    user.allergies = payload.allergies
    user.preferences = payload.preferences
    user.daily_macros_target = macros
    user.is_family_mode = payload.is_family_mode if payload.is_family_mode is not None else False

    # Process family members and compute their macros if missing
    processed_members = []
    if payload.family_members:
        for m in payload.family_members:
            if not m.daily_macros_target:
                m.daily_macros_target = calculate_target_macros(
                    age=m.age,
                    weight=m.weight,
                    height=m.height,
                    gender=m.gender,
                    activity_level=m.activity_level,
                    goals=m.goals
                )
            processed_members.append(m)
    user.family_members = processed_members

    await user.save()
    return user


@router.get("/{user_id}", response_model=UserProfile)
async def get_user_profile(user_id: str):
    """
    Retrieve user profile by user_id (MongoDB ObjectId).
    """
    try:
        obj_id = PydanticObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format"
        )

    user = await UserProfile.get(obj_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user
