// src/data/mockData.js

export const mockUserPlan = {
    userName: "david",
    weekId: "2026-W30",
    userProfile: {
        weight: 80,
        goalWeight: 75,
        targetMacros: { calories: 2000, protein: 150, fats: 70, carbs: 180 },
        preferences: ["Gluten-Free"],
        allergies: ["Nuts"]
    },
    days: [
        {
            date: "2026-07-20",
            meals: {
                breakfast: {
                    name: "חביתה משתי ביצים וסלט",
                    plannedMacros: { calories: 300, protein: 20 },
                    actualMacros: { calories: 300, protein: 20 },
                    status: "eaten", // אופציות: planned, eaten, skipped, replaced
                    info: "בחרתי בחלבון גבוה כדי לפתוח את היום."
                },
                lunch: {
                    name: "חזה עוף (150ג) עם אורז מלא",
                    plannedMacros: { calories: 600, protein: 45 },
                    actualMacros: { calories: 0, protein: 0 },
                    status: "planned",
                    info: "מנת חלבון קלאסית."
                },
                dinner: {
                    name: "יוגורט חלבון עם גרנולה",
                    plannedMacros: { calories: 400, protein: 25 },
                    actualMacros: { calories: 0, protein: 0 },
                    status: "planned",
                    info: "ארוחה קלה לפני השינה."
                }
            }
        },
        {
            date: "2026-07-21",
            meals: {
                breakfast: {
                    name: "שיבולת שועל עם חלבון",
                    plannedMacros: { calories: 350, protein: 25 },
                    actualMacros: { calories: 0, protein: 0 },
                    status: "planned",
                    info: "פחמימה מורכבת לאנרגיה."
                },
                lunch: {
                    name: "סלט טונה עשיר",
                    plannedMacros: { calories: 500, protein: 40 },
                    actualMacros: { calories: 0, protein: 0 },
                    status: "planned",
                    info: "ארוחה קרה ומהירה."
                },
                dinner: {
                    name: "פילה דג בתנור",
                    plannedMacros: { calories: 450, protein: 35 },
                    actualMacros: { calories: 0, protein: 0 },
                    status: "planned",
                    info: "אומגה 3 וחלבון איכותי."
                }
            }
        }
    ]
};