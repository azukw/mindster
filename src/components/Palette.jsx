import useGame from "../context/GameContext";
import { THEMES } from "./Shop";

export default function Palette() {
    const { state, dispatch, COLORS_EASY, COLORS_NORMAL, COLORS_HARD, COLORS_EXTREME } = useGame();
    const isHard = state.mode === "hard";
    const isExtreme = state.mode === "extreme";
    const isEasy = state.mode === "easy";
    const themeId = state.selectedThemes?.[state.mode] || "default";

    const getColors = () => {
        if (themeId === "default") {
            if (isExtreme) return COLORS_EXTREME;
            if (isHard) return COLORS_HARD;
            if (isEasy) return COLORS_EASY;
            return COLORS_NORMAL;
        }
        const themes = isExtreme ? THEMES.extreme : isHard ? THEMES.hard : isEasy ? THEMES.easy : THEMES.normal;
        const theme = themes.find(t => t.id === themeId);
        if (theme?.colors) {
            return theme.colors.map((_, i) => `theme-${themeId}-${i}`);
        }
        return isHard ? COLORS_HARD : COLORS_NORMAL;
    };

    const getColorStyle = (color) => {
        if (color.startsWith("theme-")) {
            const parts = color.split("-");
            const tId = parts[1];
            const index = parseInt(parts[2]);
            const themes = isExtreme ? THEMES.extreme : isHard ? THEMES.hard : isEasy ? THEMES.easy : THEMES.normal;
            const theme = themes.find(t => t.id === tId);
            return { background: theme?.colors?.[index] || "#ccc" };
        }
        return {};
    };


    const colors = getColors();

    return (
        <section className={`palette ${isExtreme ? "palette-extreme" : isHard ? "palette-hard" : ""}`}>            <div className="palette-colors">
            {colors.map((color) => {
                const isUsed = state.currentAttempt.includes(color);
                return (
                    <button
                        key={color}
                        className={`color ${color.startsWith("theme-") ? "" : color} ${isUsed ? "used" : ""}`}
                        style={getColorStyle(color)}
                        onClick={() => dispatch({ type: "SELECT_COLOR", color })}
                        disabled={state.gameStatus !== "playing" || isUsed}
                    />
                );
            })}
        </div>
            <button
                className="backspace"
                onClick={() => dispatch({ type: "REMOVE_LAST" })}
                disabled={state.currentAttempt.length === 0}
            >
                ⌫
            </button>
        </section>
    );
}