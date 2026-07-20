// src/data/mockData.js

export const mockUserProfile = {
    // Backend Model Fields: UserProfile
    id: "60c72b2f9b1d8e001c8e9b8d",
    user_id: "60c72b2f9b1d8e001c8e9b8d",
    email: "david@example.com",
    username: "david",
    age: 28,
    weight: 80.0,
    height: 180.0,
    gender: "male",
    activity_level: "moderately_active",
    goals: ["lose weight", "eat healthier"],
    allergies: ["nuts"],
    preferences: ["gluten-free"],
    daily_macros_target: {
        calories: 2000.0,
        protein: 150.0,
        carbs: 180.0,
        fat: 70.0
    },
    
    // Frontend Backward-Compatibility Fields
    userName: "david",
    goalWeight: 75,
    targetMacros: {
        calories: 2000,
        protein: 150,
        carbs: 180,
        fats: 70
    }
};

export const mockUserPlan = {
    // Backend Model Fields: WeeklyPlan
    id: "60c72b2f9b1d8e001c8e9b8e",
    user_id: "60c72b2f9b1d8e001c8e9b8d",
    userName: "david", // Frontend compatibility
    week_start_date: "2026-07-19", // Sunday
    weekId: "2026-W30", // Frontend compatibility
    
    userProfile: mockUserProfile, // Frontend compatibility
    
    // Backend Dict Structure: Days (Sunday to Saturday)
    days: {
        Sunday: {
            meals: {
                breakfast: {
                    name: "חביתת ירק וגבינות",
                    description: "חביתה משתי ביצים with פטרוזיליה ובצל ירוק, מוגשת עם גבינת קוטג' 5%, סלט קצוץ ופרוסת לחם מלא",
                    status: "eaten",
                    planned_macros: { calories: 450, protein: 30, carbs: 25, fat: 15 },
                    actual_macros: { calories: 450, protein: 30, carbs: 25, fat: 15 },
                    ai_explanation: "מנה זו מותאמת באופן מדויק ליעדים שלך, מספקת חלבון איכותי לפתיחת הבוקר.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 450, protein: 30, carbs: 25, fats: 15 },
                    actualMacros: { calories: 450, protein: 30, carbs: 25, fats: 15 },
                    info: "מנה זו מותאמת באופן מדויק ליעדים שלך, מספקת חלבון איכותי לפתיחת הבוקר."
                },
                lunch: {
                    name: "חזה עוף מוקפץ עם ירקות",
                    description: "חזה עוף צלוי במחבת עם ברוקולי, פלפלים ובצל, מוגש על מצע אורז בסמטי",
                    status: "eaten",
                    planned_macros: { calories: 650, protein: 50, carbs: 60, fat: 18 },
                    actual_macros: { calories: 650, protein: 50, carbs: 60, fat: 18 },
                    ai_explanation: "חלבון גבוה מחזה העוף תומך בבניית שריר ובשריפת שומן.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 650, protein: 50, carbs: 60, fats: 18 },
                    actualMacros: { calories: 650, protein: 50, carbs: 60, fats: 18 },
                    info: "חלבון גבוה מחזה העוף תומך בבניית שריר ובשריפת שומן."
                },
                dinner: {
                    name: "פילה סלמון בתנור",
                    description: "פילה סלמון אפוי בעשבי תיבול, מוגש עם פירה בטטה רך ושעועית ירוקה מוקפצת",
                    status: "eaten",
                    planned_macros: { calories: 500, protein: 40, carbs: 35, fat: 22 },
                    actual_macros: { calories: 500, protein: 40, carbs: 35, fat: 22 },
                    ai_explanation: "סלמון מספק שומן בריא (אומגה 3) וחלבון איכותי לתהליך השיקום בלילה.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 500, protein: 40, carbs: 35, fats: 22 },
                    actualMacros: { calories: 500, protein: 40, carbs: 35, fats: 22 },
                    info: "סלמון מספק שומן בריא (אומגה 3) וחלבון איכותי לתהליך השיקום בלילה."
                }
            }
        },
        Monday: {
            meals: {
                breakfast: {
                    name: "יוגורט חלבון עם גרנולה",
                    description: "גביע יוגורט חלבון 20 גרם עם גרנולה ללא תוספת סוכר, אוכמניות וכפית דבש",
                    status: "eaten",
                    planned_macros: { calories: 400, protein: 25, carbs: 45, fat: 10 },
                    actual_macros: { calories: 400, protein: 25, carbs: 45, fat: 10 },
                    ai_explanation: "ארוחה קלה ומהירה עשירה בחלבון ופחמימות זמינות.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 400, protein: 25, carbs: 45, fats: 10 },
                    actualMacros: { calories: 400, protein: 25, carbs: 45, fats: 10 },
                    info: "ארוחה קלה ומהירה עשירה בחלבון ופחמימות זמינות."
                },
                lunch: {
                    name: "קציצות בשר ברוטב עגבניות",
                    description: "קציצות בקר רזה מבושלות ברוטב עגבניות עשיר, מוגש לצד פסטה מקמח מלא",
                    status: "skipped", // EDGE CASE: SKIPPED MEAL
                    planned_macros: { calories: 600, protein: 45, carbs: 55, fat: 18 },
                    actual_macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                    ai_explanation: "הארוחה בוטלה/דולגה על ידי המשתמש. מומלץ לצרוך ארוחת השלמה.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 600, protein: 45, carbs: 55, fats: 18 },
                    actualMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    info: "הארוחה בוטלה/דולגה על ידי המשתמש. מומלץ לצרוך ארוחת השלמה."
                },
                dinner: {
                    name: "סלט טונה וביצה קשה",
                    description: "סלט ירקות עשיר עם קופסת טונה במים, ביצה קשה, מלפפון חמוץ, מיונז קל ולימון",
                    status: "eaten",
                    planned_macros: { calories: 450, protein: 35, carbs: 20, fat: 15 },
                    actual_macros: { calories: 450, protein: 35, carbs: 20, fat: 15 },
                    ai_explanation: "מקור חלבון מצוין ודל פחמימה המתאים לסיום היום.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 450, protein: 35, carbs: 20, fats: 15 },
                    actualMacros: { calories: 450, protein: 35, carbs: 20, fats: 15 },
                    info: "מקור חלבון מצוין ודל פחמימה המתאים לסיום היום."
                }
            }
        },
        Tuesday: {
            meals: {
                breakfast: {
                    name: "דייסת שיבולת שועל מפנקת",
                    description: "דייסת קוואקר מבושלת במים/חלב שקדים עם פרוסות בננה, חמאת בוטנים וסילאן",
                    status: "eaten",
                    planned_macros: { calories: 420, protein: 20, carbs: 55, fat: 12 },
                    actual_macros: { calories: 420, protein: 20, carbs: 55, fat: 12 },
                    ai_explanation: "פחמימות מורכבות ושומנים בריאים לאנרגיה מתמשכת.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 420, protein: 20, carbs: 55, fats: 12 },
                    actualMacros: { calories: 420, protein: 20, carbs: 55, fats: 12 },
                    info: "פחמימות מורכבות ושומנים בריאים לאנרגיה מתמשכת."
                },
                lunch: {
                    name: "שניצל ביתי אפוי עם פירה",
                    description: "שניצל חזה עוף בציפוי פירורי לחם כוסמין אפוי בתנור, עם פירה תפוחי אדמה",
                    status: "replaced", // EDGE CASE: REPLACED MEAL
                    planned_macros: { calories: 700, protein: 45, carbs: 70, fat: 20 },
                    actual_macros: { calories: 650, protein: 42, carbs: 65, fat: 18 },
                    ai_explanation: "הוחלף על ידי המשתמש במנה אחרת המקורבת לערכים המקוריים.",
                    is_completion: false,
                    replaced_with_meal_name: "שווארמה בצלחת עם סלט וטחינה",
                    // Frontend Compatibility
                    plannedMacros: { calories: 700, protein: 45, carbs: 70, fats: 20 },
                    actualMacros: { calories: 650, protein: 42, carbs: 65, fats: 18 },
                    info: "הוחלף על ידי המשתמש במנה אחרת המקורבת לערכים המקוריים."
                },
                dinner: {
                    name: "טוסט כוסמין עשיר",
                    description: "שתי פרוסות לחם כוסמין עם גבינה צהובה 15%, פרוסות עגבנייה, זעתר וזיתי קלמטה",
                    status: "planned",
                    planned_macros: { calories: 400, protein: 22, carbs: 35, fat: 14 },
                    actual_macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                    ai_explanation: "מנת ערב קלאסית ומהירה להכנה.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 400, protein: 22, carbs: 35, fats: 14 },
                    actualMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    info: "מנת ערב קלאסית ומהירה להכנה."
                }
            }
        },
        Wednesday: {
            meals: {
                breakfast: {
                    name: "שקשוקה ביתית קלאסית",
                    description: "שתי ביצים מבושלות ברוטב עגבניות עשיר, שום ופלפלים עם לחם כוסמין קל בצד",
                    status: "planned",
                    planned_macros: { calories: 440, protein: 24, carbs: 30, fat: 16 },
                    actual_macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                    ai_explanation: "ארוחה חמה ועשירה בחלבון ומיקרו-נוטריאנטים מהעגבניות.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 440, protein: 24, carbs: 30, fats: 16 },
                    actualMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    info: "ארוחה חמה ועשירה בחלבון ומיקרו-נוטריאנטים מהעגבניות."
                },
                lunch: {
                    name: "קערת בודהה טופו וקינואה",
                    description: "קערת בריאות המכילה קינואה, טופו צרוב, קוביות אבוקדו, גזר, מלפפון ורוטב טחינה ירוקה",
                    status: "planned",
                    planned_macros: { calories: 600, protein: 35, carbs: 65, fat: 20 },
                    actual_macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                    ai_explanation: "ארוחה צמחונית עשירה בסיבים תזונתיים, חלבון מלא מהקינואה והטופו ושומן בריא.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 600, protein: 35, carbs: 65, fats: 20 },
                    actualMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    info: "ארוחה צמחונית עשירה בסיבים תזונתיים, חלבון מלא מהקינואה והטופו ושומן בריא."
                },
                dinner: {
                    name: "מרק עדשים חם ומזין",
                    description: "מרק עדשים ירוקות וכתומות סמיך עם גזר, סלרי, בצל ותבלינים, מוגש עם קרוטונים מלחם מלא",
                    status: "planned",
                    planned_macros: { calories: 400, protein: 22, carbs: 50, fat: 8 },
                    actual_macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                    ai_explanation: "מרק עשיר בחלבון מן הצומח ופחמימות מורכבות משביעות.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 400, protein: 22, carbs: 50, fats: 8 },
                    actualMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    info: "מרק עשיר בחלבון מן הצומח ופחמימות מורכבות משביעות."
                }
            }
        },
        Thursday: {
            meals: {
                breakfast: {
                    name: "יוגורט חלבון עם גרנולה",
                    description: "גביע ייוגורט חלבון 20 גרם עם גרנולה ללא תוספת סוכר, אוכמניות וכפית דבש",
                    status: "planned",
                    planned_macros: { calories: 400, protein: 25, carbs: 45, fat: 10 },
                    actual_macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                    ai_explanation: "ארוחה קלה ומהירה עשירה בחלבון ופחמימות זמינות.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 400, protein: 25, carbs: 45, fats: 10 },
                    actualMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    info: "ארוחה קלה ומהירה עשירה בחלבון ופחמימות זמינות."
                },
                lunch: {
                    name: "תבשיל קארי טופו וחומוס",
                    description: "קוביות טופו מוקפצות עם גרגרי חומוס, גזר ודלעת ברוטב קארי ירוק וחלב קוקוס מעל אורז מלא",
                    status: "planned",
                    planned_macros: { calories: 650, protein: 32, carbs: 75, fat: 22 },
                    actual_macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                    ai_explanation: "תבשיל עשיר בטעמים המשלב קטניות וטופו לערך תזונתי גבוה.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 650, protein: 32, carbs: 75, fats: 22 },
                    actualMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    info: "תבשיל עשיר בטעמים המשלב קטניות וטופו לערך תזונתי גבוה."
                },
                dinner: {
                    name: "סלט יווני עשיר",
                    description: "מלפפון, עגבניה, בצל, פלפל, זיתי קלמטה וגבינת פטה 5% מגוררת עם שמן זית וזעתר",
                    status: "planned",
                    planned_macros: { calories: 350, protein: 18, carbs: 15, fat: 20 },
                    actual_macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                    ai_explanation: "סלט קליל ודל פחמימה התומך במאזן היומי.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 350, protein: 18, carbs: 15, fats: 20 },
                    actualMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    info: "סלט קליל ודל פחמימה התומך במאזן היומי."
                }
            }
        },
        Friday: {
            meals: {
                breakfast: {
                    name: "שקשוקה ביתית קלאסית",
                    description: "שתי ביצים מבושלות ברוטב עגבניות עשיר, שום ופלפלים עם לחם כוסמין קל בצד",
                    status: "planned",
                    planned_macros: { calories: 440, protein: 24, carbs: 30, fat: 16 },
                    actual_macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                    ai_explanation: "ארוחה חמה ועשירה בחלבון לפתיחת יום שישי.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 440, protein: 24, carbs: 30, fats: 16 },
                    actualMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    info: "ארוחה חמה ועשירה בחלבון לפתיחת יום שישי."
                },
                lunch: {
                    name: "קציצות עדשים אדומות וטחינה",
                    description: "קציצות עדשים אדומות אפויות בתנור ברוטב עגבניות פיקנטי, מוגש עם קינואה",
                    status: "planned",
                    planned_macros: { calories: 600, protein: 28, carbs: 70, fat: 18 },
                    actual_macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                    ai_explanation: "מנה עשירה בחלבון מן הצומח וסיבים תזונתיים.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 600, protein: 28, carbs: 70, fats: 18 },
                    actualMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    info: "מנה עשירה בחלבון מן הצומח וסיבים תזונתיים."
                },
                dinner: {
                    name: "סעודת שישי משפחתית בריאה",
                    description: "עוף צלוי בתנור (150 גרם) עם תפוחי אדמה אפויים, שעועית ירוקה וסלטים ביתיים ללא מיונז",
                    status: "planned",
                    planned_macros: { calories: 700, protein: 48, carbs: 55, fat: 22 },
                    actual_macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                    ai_explanation: "מנה עשירה וחגיגית המותאמת לערכי המטרה השבועיים.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 700, protein: 48, carbs: 55, fats: 22 },
                    actualMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    info: "מנה עשירה וחגיגית המותאמת לערכי המטרה השבועיים."
                }
            }
        },
        Saturday: {
            meals: {
                breakfast: {
                    name: "שייק חלבון ופירות",
                    description: "מנת חלבון בטעם וניל, בננה, חצי כוס תותים קפואים וכוס חלב סויה ללא סוכר",
                    status: "planned",
                    planned_macros: { calories: 350, protein: 28, carbs: 40, fat: 6 },
                    actual_macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                    ai_explanation: "שייק מרענן וקל להכנה לשבת בבוקר.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 350, protein: 28, carbs: 40, fats: 6 },
                    actualMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    info: "שייק מרענן וקל להכנה לשבת בבוקר."
                },
                lunch: {
                    name: "סלט סלמון חם",
                    description: "נתחי סלמון צרובים על מצע חסה עשיר, עגבניות שרי, מלפפון, שקדים פרוסים ורוטב ויניגרט לייט",
                    status: "planned",
                    planned_macros: { calories: 550, protein: 38, carbs: 15, fat: 30 },
                    actual_macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                    ai_explanation: "מנה עשירה באומגה 3 וחלבון, מצוינת לשבת בצהריים.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 550, protein: 38, carbs: 15, fats: 30 },
                    actualMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    info: "מנה עשירה באומגה 3 וחלבון, מצוינת לשבת בצהריים."
                },
                dinner: {
                    name: "חביתת חלבונים וסלט גבינות",
                    description: "חביתה משלושה חלבונים וחלמון אחד, מוגשת לצד סלט יווני קטן ופרוסת לחם שיפון",
                    status: "planned",
                    planned_macros: { calories: 400, protein: 30, carbs: 25, fat: 12 },
                    actual_macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                    ai_explanation: "מנה דלת קלוריות ועשירה בחלבון לנעילת סוף השבוע.",
                    is_completion: false,
                    replaced_with_meal_name: null,
                    // Frontend Compatibility
                    plannedMacros: { calories: 400, protein: 30, carbs: 25, fats: 12 },
                    actualMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    info: "מנה דלת קלוריות ועשירה בחלבון לנעילת סוף השבוע."
                }
            }
        }
    }
};

// Mock Completion Meals Collection Edge Cases (e.g. for Monday when Lunch was skipped)
export const mockCompletionMeals = [
    {
        id: "60c72b2f9b1d8e001c8e9b8f",
        user_id: "60c72b2f9b1d8e001c8e9b8d",
        date: "2026-07-20", // Monday
        skipped_meal_type: "lunch",
        name: "ארוחת השלמה: שייק חלבון וגרנולה עשיר",
        description: "שייק המורכב ממנת חלבון, בננה, חמאת בוטנים וחלב שקדים להשלמת החוסר הקלורי והחלבוני של ארוחת הצהריים שדולגה",
        suggested_macros: { calories: 350.0, protein: 25.0, carbs: 30.0, fat: 10.0 },
        status: "suggested", // "suggested", "eaten", "ignored"
        created_at: "2026-07-20T14:00:00Z"
    }
];