import useGame from "../context/GameContext";
import { THEMES } from "./Shop";
import { useEffect, useState, useRef } from "react";

export default function Row({ colors = [], feedback, slots, inactive, isCurrent }) {
    const { state } = useGame();
    const isHard = state.mode === "hard";
    const isExtreme = state.mode === "extreme";
    const isEasy = state.mode === "easy";
    const themeId = state.selectedThemes?.[state.mode] || "default";

    const [revealedCount, setRevealedCount] = useState(0);
    const timersRef = useRef([]);
    const audioRef = useRef(null);

    const getAudioContext = () => {
        if (!audioRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) audioRef.current = new AudioContext();
        }
        return audioRef.current;
    };

    const playFeedbackSound = (type) => {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const freqs = {
            correct: 880,    // vert -> aigu
            misplaced: 520,  // rouge -> medium
            wrong: 260       // wrong -> grave
        };
        const freq = freqs[type] || 440;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
    };

    useEffect(() => {
        const feedbackDots = [];
        if (feedback) {
            for (let i = 0; i < feedback.correct; i++) feedbackDots.push("correct");
            for (let i = 0; i < feedback.misplaced; i++) feedbackDots.push("misplaced");
            while (feedbackDots.length < slots) feedbackDots.push("wrong");
        } else {
            for (let i = 0; i < slots; i++) feedbackDots.push("empty");
        }

        timersRef.current.forEach((id) => clearTimeout(id));
        timersRef.current = [];

        if (feedback) {
            const baseDelay = 100;
            const step = 140;
            setRevealedCount(0);
            feedbackDots.forEach((dotType, i) => {
                const id = setTimeout(() => {
                    setRevealedCount((c) => Math.max(c, i + 1));
                    // joue le son que si activé dans les settings
                    if (dotType !== "empty" && state.settings?.playSounds) {
                        playFeedbackSound(dotType);
                    }
                }, baseDelay + i * step);
                timersRef.current.push(id);
            });
            const finalId = setTimeout(() => {
                setRevealedCount(feedbackDots.length);
            }, baseDelay + feedbackDots.length * step + 50);
            timersRef.current.push(finalId);
        } else {
            setRevealedCount(0);
        }

        return () => {
            timersRef.current.forEach((id) => clearTimeout(id));
            timersRef.current = [];
        };
    }, [feedback, slots, state.settings?.playSounds]);

    const getColorStyle = (color) => {
        if (!color) return {};
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
                        className={`dot ${isExtreme ? "dot-small" : ""} dot-${dot} ${revealedCount > i ? "revealed" : ""}`}
                    />
                ))}
            </div>
        </div>
    );
}