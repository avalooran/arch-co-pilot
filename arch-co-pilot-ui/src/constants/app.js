export const APP_NAME = "Architecture Co-Pilot";
export const APP_MENU = [
    {
        "label": "PowerBI Dashboards",
        "type": "dropdown",
        "sub": [
            {
                "label": "ARB",
                "type": "link",
                "link": "https://dtcc.sharepoint.com/sites/ITARB/Pages/1/index.aspx"
            },
            {
                "label": "Architecture Drift",
                "type": "link",
                "link": "https://app.powerbi.com/groups/c531f077-8c90-04c64-a949-746787b21802/reports/be716fbe-7346-498a-a506-2ee70b47e04c"
            },
            {
                "label": "Architecture Asset Inventory",
                "type": "link",
                "link": "https://app.powerbi.com/groups/c531f077-8c90-04c64-a949-746787b21802/reports/9aba3340-07c6-4c44-8b90-39fe8a5d3490"
            },
            {
                "label": "Business Capability",
                "type": "link",
                "link": "https://app.powerbi.com/groups/c531f077-8c90-04c64-a949-746787b21802/reports/42c63165-1d5a-46c9-974d-619961151c96"
            }
        ]        
    },
    {
        "label": "COE Resources",
        "type": "dropdown",
        "sub": [
            {
                "label": "Quality Control",
                "type": "dropdown",
                "sub": [
                    {
                        "label": "Sharepoint",
                        "type": "link",
                        "link": "https://dtcc.sharepoint.com/sites/ITARB/Pages/1/index.aspx"
                    },
                    {
                        "label": "PowerBI",
                        "type": "link",
                        "link": "https://app.powerbi.com/groups/c531f077-8c90-04c64-a949-746787b21802/reports/be716fbe-7346-498a-a506-2ee70b47e04c"
                    }
                ]
               
            },
            {
                "label": "Web App standards",
                "type": "dropdown",
                "sub": [
                    {
                        "label": "Sharepoint2",
                        "type": "link",
                        "link": "https://dtcc.sharepoint.com/sites/ITARB/Pages/1/index.aspx"
                    },
                    {
                        "label": "PowerBI2",
                        "type": "link",
                        "link": "https://app.powerbi.com/groups/c531f077-8c90-04c64-a949-746787b21802/reports/be716fbe-7346-498a-a506-2ee70b47e04c"
                    }
                ]
               
            }
        ]
    }
];
export const FAVORITE_TOPIC = "TOPICS";
export const FAVORITE_QUESTION = "QUESTIONS";

export const LS_CHAT_SESSION = "chat_session_p1";
export const LS_CHAT_HISTORY = "chat_history_p1";
export const LS_FAV_TOPICS = "chat_suggestions_p1";
export const LS_FAV_QUESTIONS = "fav_questions_p1";

export const SIMPLE = "simple";
export const COMPLEX = "complex";

export const MAX_SUGGESTIONS = 25;
export const MAX_SUGGESTIONS_PER_PAGE = 5;
export const MAX_RETRY_ATTEMPTS = 2;
export const RETRY_INTERVAL = 10 * 1000; //10s
