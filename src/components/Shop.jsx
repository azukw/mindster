import useGame from "../context/GameContext";
import { useTranslation } from "../hooks/useTranslation";

const THEMES = {

    easy: [
        { id: "default", name: "Classique", cost: 0 },
        { id: "pastel", name: "Pastel", cost: 2, colors: ["#ffd6e0", "#f6e7d7", "#b5ead7", "#c7ceea", "#ffdac1"] },
        { id: "sunset", name: "Coucher", cost: 4, colors: ["#e1da8c", "#ff6a88", "#b6dec8", "#c4ff94", "#f6e7d7"] },
        { id : "douceur", name: "Douceur", cost: 5, colors: ["#dc8bd2", "#b36ec9", "#7e5ba9", "#f8c5ff", "#FA3EAFFF"] },
    ],
    normal: [
        { id: "default", name: "Classique", cost: 0 },
        { id: "bubblegum", name: "Bubblegum", cost: 3, colors: ["#ffb3ba", "#ffdfba", "#ffffba", "#baffc9", "#bae1ff", "#d5baff"] },
        { id: "retro", name: "Rétro", cost: 5, colors: ["#f67280", "#c06c84", "#6c5b7b", "#355c7d", "#99b898", "#f8b195"] },
        { id: "citrus", name: "Agrumes", cost: 10, colors: ["#ffe156", "#ffb25b", "#ff6f59", "#254441", "#43aa8b", "#b2b09b"] },
        { id: "icecream", name: "Glace", cost: 15, colors: ["#f7cac9", "#92a8d1", "#f7786b", "#b5ead7", "#ffdac1", "#e2f0cb"] },
        { id: "matrix", name: "Matrix", cost: 20, colors: ["#0f0", "#222", "#393", "#0c0", "#060", "#333"] },
    ],
    hard: [
        { id: "default", name: "Classique", cost: 0 },
        { id: "sunrise", name: "Lever du soleil", cost: 3, colors: ["#ff9a8b", "#ff6a88", "#ff99ac", "#fad0c4", "#ffd6e0", "#fcb69f", "#ffe29f", "#f6e7d7"] },
        { id: "aurora", name: "Aurore", cost: 5, colors: ["#00c3ff", "#ffff1c", "#ff61a6", "#a890fe", "#00ffb3", "#ffb347", "#ff6f91", "#6a89cc"] },
        { id: "jungle", name: "Jungle", cost: 10, colors: ["#355c7d", "#6c5b7b", "#c06c84", "#99b898", "#2a9d8f", "#264653", "#e9c46a", "#f4a261"] },
        { id: "pastelpop", name: "Pastel Pop", cost: 15, colors: ["#ffd6e0", "#f6e7d7", "#b5ead7", "#c7ceea", "#ffdac1", "#e2f0cb", "#f7cac9", "#92a8d1"] },
        { id: "lava", name: "Lave", cost: 20, colors: ["#ff4500", "#ff6347", "#ffb347", "#ffd700", "#ff6f00", "#b22222", "#800000", "#a0522d"] },
    ],
    extreme: [
        { id: "default", name: "Classique", cost: 0 },
        { id: "cyberpunk", name: "Cyberpunk", cost: 5, colors: ["#ff00c8", "#00fff7", "#fffb00", "#ff0054", "#00ff85", "#ff7b00", "#2d00f7", "#8f00ff", "#ff1b6b", "#00bfae", "#ff61a6", "#1a1a2e"] },
        { id: "pixel", name: "Pixel Art", cost: 10, colors: ["#29adff", "#83769c", "#ff77a8", "#ffccaa", "#ff0040", "#ffb300", "#fff700", "#00e436", "#1d2b53", "#7e2553", "#008751", "#ab5236"] },
        { id: "royal", name: "Royal", cost: 15, colors: ["#ffd700", "#4169e1", "#800080", "#fffafa", "#b76e79", "#c0c0c0", "#003366", "#e5c100", "#a020f0", "#d4af37", "#1c1c1c", "#f5e6ca"] },
    ],
};


export default function Shop() {
    const { state, dispatch } = useGame();
    const { t } = useTranslation();
    const easyWins = state.stats.easy.won;
    const normalWins = state.stats.normal.won;
    const hardWins = state.stats.hard.won;
    const extremeWins = state.stats.extreme.won;

    const isUnlocked = (mode, cost) => {
        const wins = mode === "easy" ? easyWins : mode === "normal" ? normalWins : mode === "hard" ? hardWins : extremeWins;
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
                <h3>{t("modeEasy")} <span className="wins-count">({easyWins} {t("victories")})</span></h3>
                <div className="themes-grid">
                    {THEMES.easy.map((theme) => renderThemeCard("easy", theme))}
                </div>
            </div>

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

            <div className="shop-section">
                <h3>{t("modeExtreme")} <span className="wins-count">({extremeWins} {t("victories")})</span></h3>
                <div className="themes-grid">
                    {THEMES.extreme.map((theme) => renderThemeCard("extreme", theme))}
                </div>
            </div>
        </div>
    );
}

export { THEMES };
