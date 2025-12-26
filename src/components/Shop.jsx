// src/components/Shop.jsx
import { useGame } from "../context/GameContext";
import { useTranslation } from "../hooks/useTranslation";

const THEMES = {
    normal: [
        { id: "default", name: "Classique", cost: 0 },
        { id: "ocean", name: "Océan", cost: 3, colors: ["#0077b6", "#00b4d8", "#90e0ef", "#caf0f8", "#03045e", "#023e8a"] },
        { id: "forest", name: "Forêt", cost: 5, colors: ["#2d6a4f", "#40916c", "#52b788", "#74c69d", "#95d5b2", "#b7e4c7"] },
        { id: "sunset", name: "Coucher de soleil", cost: 10, colors: ["#ff6b6b", "#ee6c4d", "#f4a261", "#e9c46a", "#e76f51", "#d62828"] },
        { id: "candy", name: "Bonbon", cost: 15, colors: ["#ff85a1", "#fbb1bd", "#a2d2ff", "#bde0fe", "#cdb4db", "#ffc8dd"] },
        { id: "neon", name: "Néon", cost: 20, colors: ["#ff00ff", "#00ffff", "#ff0080", "#80ff00", "#8000ff", "#ffff00"] },
    ],
    hard: [
        { id: "default", name: "Classique", cost: 0 },
        { id: "galaxy", name: "Galaxie", cost: 3, colors: ["#7400b8", "#6930c3", "#5e60ce", "#5390d9", "#4ea8de", "#48bfe3", "#56cfe1", "#64dfdf"] },
        { id: "autumn", name: "Automne", cost: 5, colors: ["#9b2226", "#ae2012", "#bb3e03", "#ca6702", "#ee9b00", "#e9d8a6", "#94d2bd", "#0a9396"] },
        { id: "pastel", name: "Pastel", cost: 10, colors: ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff"] },
        { id: "midnight", name: "Minuit", cost: 15, colors: ["#22223b", "#4a4e69", "#9a8c98", "#c9ada7", "#f2e9e4", "#023047", "#219ebc", "#8ecae6"] },
        { id: "rainbow", name: "Arc-en-ciel", cost: 25, colors: ["#ff0000", "#ff8000", "#ffff00", "#00ff00", "#00ffff", "#0080ff", "#8000ff", "#ff0080"] },
    ],
};

export default function Shop() {
    const { state, dispatch } = useGame();
    const { t } = useTranslation();
    const normalWins = state.stats.normal.won;
    const hardWins = state.stats.hard.won;

    const isUnlocked = (mode, cost) => {
        const wins = mode === "normal" ? normalWins : hardWins;
        return wins >= cost;
    };

    const isSelected = (mode, themeId) => {
        return state.selectedThemes?.[mode] === themeId;
    };

    const selectTheme = (mode, themeId) => {
        dispatch({ type: "SELECT_THEME", mode, themeId });
    };

    const renderThemeCard = (mode, theme) => {
        const unlocked = isUnlocked(mode, theme.cost);
        const selected = isSelected(mode, theme.id);

        return (
            <button
                key={theme.id}
                className={`theme-card ${unlocked ? "unlocked" : "locked"} ${selected ? "selected" : ""}`}
                onClick={() => unlocked && selectTheme(mode, theme.id)}
                disabled={!unlocked}
            >
                {selected && <span className="theme-check">✓</span>}
                <div className="theme-preview">
                    {(theme.colors || ["#e74c3c", "#3498db", "#f1c40f", "#2ecc71"]).slice(0, 4).map((color, i) => (
                        <div key={i} className="theme-dot" style={{ background: color }} />
                    ))}
                </div>
                <span className="theme-name">{theme.name}</span>
                {unlocked ? (
                    <span className="theme-unlocked-text">{t("unlocked")}</span>
                ) : (
                    <span className="theme-cost">
                        {theme.cost > 1
                            ? t("costPlural", { count: theme.cost })
                            : t("cost", { count: theme.cost })}
                    </span>
                )}
            </button>
        );
    };

    return (
        <div className="modal-content shop-modal">
            <h2>{t("shop")}</h2>

            <div className="shop-section">
                <h3>{t("modeNormal")} <span className="wins-count">({normalWins} {t("victories")})</span></h3>
                <div className="themes-grid">
                    {THEMES.normal.map((theme) => renderThemeCard("normal", theme))}
                </div>
            </div>

            <div className="shop-section">
                <h3>{t("modeHard")} <span className="wins-count">({hardWins} {t("victories")})</span></h3>
                <div className="themes-grid">
                    {THEMES.hard.map((theme) => renderThemeCard("hard", theme))}
                </div>
            </div>
        </div>
    );
}

export { THEMES };
