import { useGame } from "../context/GameContext";
import { THEMES } from "./Shop";
import { useEffect, useState } from "react";


export default function Row({ colors = [], feedback, slots, inactive, isCurrent }) {
    const { state } = useGame();
    const isHard = state.mode === "hard";
    const isExtreme = state.mode === "extreme";
    const themeId = state.selectedThemes?.[state.mode] || "default";
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        if (feedback) {
            setTimeout(() => setRevealed(true), 100);
        } else {
            setRevealed(false);
        }
    }, [feedback]);

    const getColorStyle = (color) => {
        if (!color) return {};
        if (color.startsWith("theme-")) {
            const parts = color.split("-");
            const tId = parts[1];
            const index = parseInt(parts[2]);
            const themes = isExtreme ? THEMES.extreme : isHard ? THEMES.hard : THEMES.normal;
            const theme = themes.find(t => t.id === tId);
            return { background: theme?.colors?.[index] || "#ccc" };
        }
        return {};
    };

    const feedbackDots = [];

    if (feedback) {
        for (let i = 0; i < feedback.correct; i++) feedbackDots.push("correct");
        for (let i = 0; i < feedback.misplaced; i++) feedbackDots.push("misplaced");
        while (feedbackDots.length < slots) feedbackDots.push("wrong");
    } else {
        for (let i = 0; i < slots; i++) feedbackDots.push("empty");
    }

    const slotSize = isExtreme ? "slot-extreme" : isHard ? "slot-hard" : "";

    return (
        <div className={`row ${inactive ? "inactive" : ""} ${isCurrent ? "current" : ""}`}>
            <div className="slots">
                {Array.from({ length: slots }).map((_, i) => {
                    const color = colors[i];
                    const isThemeColor = color?.startsWith("theme-");
                    return (
                        <div
                            key={i}
                            className={`slot ${slotSize} ${isThemeColor ? "" : color || ""}`}
                            style={getColorStyle(color)}
                        />
                    );
                })}
            </div>
            <div className="feedback" style={{ gridTemplateColumns: `repeat(${Math.ceil(slots / 2)}, 12px)` }}>
                {feedbackDots.map((dot, i) => (
                    <span
                        key={i}
                        className={`dot ${isExtreme ? "dot-small" : ""} dot-${dot} ${revealed ? "revealed" : ""}`}
                        style={{
                            animationDelay: revealed ? `${i * 120}ms` : "0ms"
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
