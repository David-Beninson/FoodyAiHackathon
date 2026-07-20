import { useState, useEffect } from 'react';
import { getUserProfile, onboardUser } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

// Helper for percentage calculations
const getMacroMetrics = (targetMacros) => {
    if (!targetMacros) return { proteinPct: 0, carbsPct: 0, fatsPct: 0 };
    const { protein = 0, carbs = 0, fats = 0 } = targetMacros;
    const proteinKcal = protein * 4;
    const carbsKcal = carbs * 4;
    const fatsKcal = fats * 9;
    const totalKcal = proteinKcal + carbsKcal + fatsKcal;

    if (totalKcal === 0) return { proteinPct: 0, carbsPct: 0, fatsPct: 0 };

    return {
        proteinPct: (proteinKcal / totalKcal) * 100,
        carbsPct: (carbsKcal / totalKcal) * 100,
        fatsPct: (fatsKcal / totalKcal) * 100,
    };
};

const mapBackendToFrontend = (data) => {
    if (!data) return null;
    return {
        ...data,
        userName: data.username || 'User',
        goalWeight: data.goalWeight || (data.weight ? data.weight - 5 : 75),
        targetMacros: {
            calories: data.daily_macros_target?.calories || 2000,
            protein: data.daily_macros_target?.protein || 150,
            carbs: data.daily_macros_target?.carbs || 180,
            fats: data.daily_macros_target?.fat || 70
        }
    };
};

const mapFrontendToBackend = (data) => {
    return {
        age: Number(data.age) || 25,
        weight: Number(data.weight) || 70,
        height: Number(data.height) || 170,
        gender: data.gender || 'male',
        activity_level: data.activity_level || 'moderately_active',
        goals: data.goals || [],
        allergies: data.allergies || [],
        preferences: data.preferences || []
    };
};

const defaultProfileState = {
    username: 'Guest',
    email: '',
    age: 25,
    weight: 70,
    height: 170,
    gender: 'male',
    activity_level: 'moderately_active',
    goals: [],
    allergies: [],
    preferences: [],
    targetMacros: {
        calories: 2000,
        protein: 150,
        carbs: 180,
        fats: 70
    }
};

export function useProfile() {
    const { user, refreshProfile } = useAuth();
    const userId = user?.id || user?._id;

    const [profile, setProfile] = useState(() => {
        const saved = localStorage.getItem('foodyai_profile');
        return saved ? { ...defaultProfileState, ...JSON.parse(saved) } : defaultProfileState;
    });

    const [isEditing, setIsEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState(() => {
        const savedTemp = localStorage.getItem('foodyai_temp_profile');
        if (savedTemp) return { ...defaultProfileState, ...JSON.parse(savedTemp) };
        const saved = localStorage.getItem('foodyai_profile');
        return saved ? { ...defaultProfileState, ...JSON.parse(saved) } : defaultProfileState;
    });
    const [newAllergy, setNewAllergy] = useState('');
    const [newPref, setNewPref] = useState('');
    const [newGoal, setNewGoal] = useState('');
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Save temporary profile progress to localStorage
    useEffect(() => {
        localStorage.setItem('foodyai_temp_profile', JSON.stringify(tempProfile));
    }, [tempProfile]);

    // Fetch profile from backend on mount or when user changes
    useEffect(() => {
        if (!userId) return;

        const fetchProfile = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getUserProfile(userId);
                const mapped = mapBackendToFrontend(data);
                setProfile(mapped);
                // Only overwrite temp profile if there is no unsaved progress
                const savedTemp = localStorage.getItem('foodyai_temp_profile');
                if (!savedTemp) {
                    setTempProfile(mapped);
                }
                localStorage.setItem('foodyai_profile', JSON.stringify(mapped));
            } catch (err) {
                console.error('Error fetching profile from API:', err);
                if (err.response && err.response.status === 404) {
                    // Profile not found - this is fine, we will let the user onboard
                    console.log('Profile not found, using local default state.');
                } else if (!err.response) {
                    setError('Connection error: Cannot connect to the server. Make sure the Backend is running.');
                } else {
                    setError('Error loading profile from the server.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const handleStartEdit = () => {
        setTempProfile({ ...profile });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setNewAllergy('');
        setNewPref('');
        setNewGoal('');
        localStorage.removeItem('foodyai_temp_profile');
        setTempProfile({ ...profile });
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!userId) return;
        setIsLoading(true);
        setError(null);
        try {
            const backendData = mapFrontendToBackend(tempProfile);
            const savedData = await onboardUser(userId, backendData);
            const mapped = mapBackendToFrontend(savedData);
            setProfile(mapped);
            localStorage.setItem('foodyai_profile', JSON.stringify(mapped));
            localStorage.removeItem('foodyai_temp_profile');
            
            // Sync with global auth state (updates isOnboarded flag)
            await refreshProfile();
            
            setIsEditing(false);
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 3000);
        } catch (err) {
            console.error('Error saving profile via API:', err);
            if (!err.response) {
                setError('Connection error: Cannot save data to the server. Make sure the Backend is running.');
            } else {
                setError('Error saving profile to the server.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field, value, isMacro = false) => {
        setTempProfile(prev => {
            if (isMacro) {
                return {
                    ...prev,
                    targetMacros: { ...prev.targetMacros, [field]: Number(value) || 0 }
                };
            }
            const isNumeric = ['weight', 'goalWeight', 'height', 'age'].includes(field);
            return {
                ...prev,
                [field]: isNumeric ? Number(value) || 0 : value
            };
        });
    };

    const addTag = (type, tagVal, setter) => {
        const trimmed = (tagVal || '').trim();
        if (!trimmed) return;
        setTempProfile(prev => {
            const list = prev[type] || [];
            if (list.includes(trimmed)) return prev;
            return { ...prev, [type]: [...list, trimmed] };
        });
        setter('');
    };

    const removeTag = (type, tagToRemove) => {
        setTempProfile(prev => ({
            ...prev,
            [type]: (prev[type] || []).filter(t => t !== tagToRemove)
        }));
    };

    const currentProfile = isEditing ? tempProfile : profile;
    const { proteinPct, carbsPct, fatsPct } = getMacroMetrics(currentProfile.targetMacros);

    return {
        currentProfile,
        tempProfile,
        isEditing,
        showSuccessToast,
        newAllergy,
        setNewAllergy,
        newPref,
        setNewPref,
        newGoal,
        setNewGoal,
        proteinPct,
        carbsPct,
        fatsPct,
        handleStartEdit,
        handleCancelEdit,
        handleSave,
        handleChange,
        addTag,
        removeTag,
        isLoading,
        error
    };
}
