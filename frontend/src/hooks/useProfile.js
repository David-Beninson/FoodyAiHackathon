import { useState, useEffect } from 'react';

// Helper for percentage calculations
const getMacroMetrics = (targetMacros) => {
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

export function useProfile(mockUserPlan) {
    const [profile, setProfile] = useState(() => {
        const saved = localStorage.getItem('foodyai_profile');
        return saved ? JSON.parse(saved) : mockUserPlan.userProfile;
    });

    const [isEditing, setIsEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState(profile);
    const [newAllergy, setNewAllergy] = useState('');
    const [newPref, setNewPref] = useState('');
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    useEffect(() => {
        localStorage.setItem('foodyai_profile', JSON.stringify(profile));
    }, [profile]);

    const handleStartEdit = () => {
        setTempProfile({ ...profile });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setNewAllergy('');
        setNewPref('');
    };

    const handleSave = (e) => {
        if (e) e.preventDefault();
        setProfile(tempProfile);
        setIsEditing(false);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
    };

    const handleChange = (field, value, isMacro = false) => {
        setTempProfile(prev => {
            if (isMacro) {
                return {
                    ...prev,
                    targetMacros: { ...prev.targetMacros, [field]: Number(value) || 0 }
                };
            }
            return {
                ...prev,
                [field]: field === 'weight' || field === 'goalWeight' ? Number(value) || 0 : value
            };
        });
    };

    const addTag = (type, tagVal, setter) => {
        const trimmed = tagVal.trim();
        if (!trimmed) return;
        setTempProfile(prev => {
            const list = prev[type];
            if (list.includes(trimmed)) return prev;
            return { ...prev, [type]: [...list, trimmed] };
        });
        setter('');
    };

    const removeTag = (type, tagToRemove) => {
        setTempProfile(prev => ({
            ...prev,
            [type]: prev[type].filter(t => t !== tagToRemove)
        }));
    };

    const currentProfile = isEditing ? tempProfile : profile;
    const { proteinPct, carbsPct, fatsPct } = getMacroMetrics(currentProfile.targetMacros);

    return {
        currentProfile,
        isEditing,
        showSuccessToast,
        newAllergy,
        setNewAllergy,
        newPref,
        setNewPref,
        proteinPct,
        carbsPct,
        fatsPct,
        handleStartEdit,
        handleCancelEdit,
        handleSave,
        handleChange,
        addTag,
        removeTag
    };
}
