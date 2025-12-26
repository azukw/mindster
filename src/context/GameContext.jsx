// src/context/GameContext.jsx
import { createContext, useContext, useReducer, useEffect } from "react";
import { THEMES } from "../components/Shop";

const GameContext = createContext();

const COLORS_NORMAL = ["red", "blue", "yellow", "green", "orange", "purple"];
const COLORS_HARD = ["red", "blue", "yellow", "green", "purple", "orange", "pink", "cyan"];

const getThemeColors = (mode, themeId) => {
    if (!themeId || themeId === "default") {
        return mode === "hard" ? COLORS_HARD : COLORS_NORMAL;
    }
    const themes = mode === "hard" ? THEMES.hard : THEMES.normal;
    const theme = themes.find(t => t.id === themeId);
    if (theme?.colors) {
        return theme.colors.map((_, i) => `theme-${themeId}-${i}`);
    }
    return mode === "hard" ? COLORS_HARD : COLORS_NORMAL;
};

const getDailyCode = (mode, themeId) => {
    const colors = getThemeColors(mode, themeId);
    const codeLength = mode === "hard" ? 6 : 4;
    const today = new Date().toISOString().split("T")[0];

    let hash = 0;
    const seedString = today + mode;
    for (let i = 0; i < seedString.length; i++) {
        const char = seedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    hash = Math.abs(hash);

    const mulberry32 = (seed) => {
        return () => {
            let t = seed += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    };

    const random = mulberry32(hash);

    const shuffled = [...colors];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, codeLength);
};

const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow - now;
};

const initialState = {
    mode: "normal",
    savedGames: {
        normal: null,
        hard: null,
    },
    attempts: [],
    currentAttempt: [],
    gameStatus: "playing",
    secretCode: getDailyCode("normal", "default"),
    maxAttempts: 8,
    settings: {
        darkMode: true,
        highContrast: false,
        language: "fr",
    },
    stats: {
        normal: { played: 0, won: 0, streak: 0, maxStreak: 0 },
        hard: { played: 0, won: 0, streak: 0, maxStreak: 0 },
    },
    selectedThemes: {
        normal: "default",
        hard: "default",
    },
};

const loadState = () => {
    const saved = localStorage.getItem("mastermind-state");
    if (saved) {
        const parsed = JSON.parse(saved);
        const today = new Date().toISOString().split("T")[0];
        if (parsed.lastPlayed !== today) {
            return {
                ...initialState,
                settings: parsed.settings || initialState.settings,
                stats: parsed.stats || initialState.stats,
                selectedThemes: parsed.selectedThemes || initialState.selectedThemes,
            };
        }
        return {
            ...initialState,
            ...parsed,
            secretCode: getDailyCode(parsed.mode || "normal", parsed.selectedThemes?.[parsed.mode || "normal"] || "default"),
        };
    }
    return initialState;
};

const calculateFeedback = (attempt, secret) => {
    const feedback = { correct: 0, misplaced: 0 };
    const secretCopy = [...secret];
    const attemptCopy = [...attempt];

    attemptCopy.forEach((color, i) => {
        if (color === secretCopy[i]) {
            feedback.correct++;
            secretCopy[i] = null;
            attemptCopy[i] = null;
        }
    });

    attemptCopy.forEach((color) => {
        if (color !== null) {
            const idx = secretCopy.indexOf(color);
            if (idx !== -1) {
                feedback.misplaced++;
                secretCopy[idx] = null;
            }
        }
    });

    return feedback;
};

const gameReducer = (state, action) => {
    switch (action.type) {
        case "SELECT_COLOR": {
            const codeLength = state.mode === "hard" ? 6 : 4;
            if (state.currentAttempt.length >= codeLength) return state;
            return { ...state, currentAttempt: [...state.currentAttempt, action.color] };
        }
        case "REMOVE_LAST":
            return { ...state, currentAttempt: state.currentAttempt.slice(0, -1) };
        case "VALIDATE": {
            const codeLength = state.mode === "hard" ? 6 : 4;
            if (state.currentAttempt.length !== codeLength) return state;

            const feedback = calculateFeedback(state.currentAttempt, state.secretCode);
            const newAttempts = [...state.attempts, { colors: state.currentAttempt, feedback }];
            const won = feedback.correct === codeLength;
            const lost = !won && newAttempts.length >= state.maxAttempts;

            let newStats = state.stats;
            if (won || lost) {
                const modeStats = { ...state.stats[state.mode] };
                modeStats.played++;
                if (won) {
                    modeStats.won++;
                    modeStats.streak++;
                    modeStats.maxStreak = Math.max(modeStats.streak, modeStats.maxStreak);
                } else {
                    modeStats.streak = 0;
                }
                newStats = { ...state.stats, [state.mode]: modeStats };
            }

            return {
                ...state,
                attempts: newAttempts,
                currentAttempt: [],
                gameStatus: won ? "won" : lost ? "lost" : "playing",
                stats: newStats,
                lastPlayed: new Date().toISOString().split("T")[0],
            };
        }
        case "SET_MODE": {
            const newMode = action.mode;
            if (newMode === state.mode) return state;

            const savedGames = {
                ...state.savedGames,
                [state.mode]: {
                    attempts: state.attempts,
                    currentAttempt: state.currentAttempt,
                    gameStatus: state.gameStatus,
                }
            };

            const savedGame = savedGames[newMode];
            const newSecretCode = getDailyCode(newMode, state.selectedThemes[newMode]);

            return {
                ...state,
                mode: newMode,
                savedGames,
                attempts: savedGame?.attempts || [],
                currentAttempt: savedGame?.currentAttempt || [],
                gameStatus: savedGame?.gameStatus || "playing",
                secretCode: newSecretCode,
            };
        }
        case "SELECT_THEME": {
            const newSelectedThemes = {
                ...state.selectedThemes,
                [action.mode]: action.themeId,
            };

            // Convertir les couleurs existantes vers le nouveau thème
            const oldThemeId = state.selectedThemes[action.mode];
            const newThemeId = action.themeId;

            const convertColor = (color) => {
                if (!color) return color;

                // Si c'est une couleur de thème, extraire l'index et recréer avec le nouveau thème
                if (color.startsWith("theme-")) {
                    const parts = color.split("-");
                    const index = parseInt(parts[2]);
                    return newThemeId === "default"
                        ? (action.mode === "hard" ? COLORS_HARD : COLORS_NORMAL)[index]
                        : `theme-${newThemeId}-${index}`;
                }

                // Si c'est une couleur par défaut, trouver son index et convertir
                const defaultColors = action.mode === "hard" ? COLORS_HARD : COLORS_NORMAL;
                const index = defaultColors.indexOf(color);
                if (index !== -1 && newThemeId !== "default") {
                    return `theme-${newThemeId}-${index}`;
                }

                return color;
            };

            const convertAttempt = (attempt) => ({
                ...attempt,
                colors: attempt.colors.map(convertColor),
            });

            // Ne convertir que si on est sur le mode concerné
            const newAttempts = action.mode === state.mode
                ? state.attempts.map(convertAttempt)
                : state.attempts;

            const newCurrentAttempt = action.mode === state.mode
                ? state.currentAttempt.map(convertColor)
                : state.currentAttempt;

            const newSecretCode = action.mode === state.mode
                ? state.secretCode.map(convertColor)
                : state.secretCode;

            // Mettre à jour aussi les parties sauvegardées
            const newSavedGames = { ...state.savedGames };
            if (newSavedGames[action.mode]) {
                newSavedGames[action.mode] = {
                    ...newSavedGames[action.mode],
                    attempts: newSavedGames[action.mode].attempts.map(convertAttempt),
                    currentAttempt: newSavedGames[action.mode].currentAttempt.map(convertColor),
                };
            }

            return {
                ...state,
                selectedThemes: newSelectedThemes,
                attempts: newAttempts,
                currentAttempt: newCurrentAttempt,
                secretCode: newSecretCode,
                savedGames: newSavedGames,
            };
        }


        case "UPDATE_SETTINGS":
            return { ...state, settings: { ...state.settings, ...action.settings } };
        default:
            return state;
    }
};

export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, null, loadState);

    useEffect(() => {
        localStorage.setItem("mastermind-state", JSON.stringify(state));
    }, [state]);

    useEffect(() => {
        document.body.classList.toggle("dark", state.settings.darkMode);
        document.body.classList.toggle("high-contrast", state.settings.highContrast);
    }, [state.settings]);

    return (
        <GameContext.Provider value={{ state, dispatch, getTimeUntilReset, COLORS_NORMAL, COLORS_HARD, getThemeColors }}>
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => useContext(GameContext);
