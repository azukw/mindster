// src/pages/Game.jsx
import { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import { useTranslation } from "../hooks/useTranslation";
import { THEMES } from "../components/Shop";
import Board from "../components/Board";
import Palette from "../components/Palette";
import Modal from "../components/Modal";
import Stats from "../components/Stats";
import Help from "../components/Help";
import Settings from "../components/Settings";
import Shop from "../components/Shop";

export default function Game() {
    const { state, dispatch, getTimeUntilReset } = useGame();
    const { t } = useTranslation();
    const [countdown, setCountdown] = useState("");
    const [showResultModal, setShowResultModal] = useState(false);
    const [openModal, setOpenModal] = useState(null);

    const isHard = state.mode === "hard";
    const themeId = state.selectedThemes?.[state.mode] || "default";

    const getColorStyle = (color) => {
        if (!color) return {};
        if (color.startsWith("theme-")) {
            const parts = color.split("-");
            const tId = parts[1];
            const index = parseInt(parts[2]);
            const themes = isHard ? THEMES.hard : THEMES.normal;
            const theme = themes.find(t => t.id === tId);
            return { background: theme?.colors?.[index] || "#ccc" };
        }
        return {};
    };

    useEffect(() => {
        const updateCountdown = () => {
            const ms = getTimeUntilReset();
            const hours = Math.floor(ms / 3600000);
            const minutes = Math.floor((ms % 3600000) / 60000);
            const seconds = Math.floor((ms % 60000) / 1000);
            setCountdown(
                `${hours.toString().padStart(2, "0")}:${minutes
                    .toString()
                    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
            );
        };
        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (state.gameStatus === "lost" || state.gameStatus === "won") {
            setShowResultModal(true);
        }
    }, [state.gameStatus]);

    const codeLength = state.mode === "hard" ? 6 : 4;
    const isComplete = state.currentAttempt.length === codeLength;
    const isWon = state.gameStatus === "won";

    return (
        <>
            <main className="game">
                <div className="mode-toggle">
                    <button
                        className={state.mode === "normal" ? "active" : ""}
                        onClick={() => dispatch({ type: "SET_MODE", mode: "normal" })}
                    >
                        {t("normal")}
                    </button>
                    <button
                        className={state.mode === "hard" ? "active" : ""}
                        onClick={() => dispatch({ type: "SET_MODE", mode: "hard" })}
                    >
                        {t("hard")}
                    </button>
                </div>

                <Board />
                <Palette />

                <div className="bottom-bar">
                    <div className="bottom-left">
                        <button className="icon-btn" onClick={() => setOpenModal("stats")} title={t("statistics")}>📊</button>
                        <button className="icon-btn" onClick={() => setOpenModal("help")} title={t("howToPlay")}>❓</button>
                    </div>
                    <button
                        className="validate"
                        disabled={!isComplete || state.gameStatus !== "playing"}
                        onClick={() => dispatch({ type: "VALIDATE" })}
                    >
                        {t("validate")}
                    </button>
                    <div className="bottom-right">
                        <button className="icon-btn" onClick={() => setOpenModal("shop")} title={t("shop")}>🛒</button>
                        <button className="icon-btn" onClick={() => setOpenModal("settings")} title={t("settings")}>⚙️</button>
                    </div>
                </div>

                <p className="daily">{t("dailyPuzzle")} {countdown}</p>
            </main>

            {openModal && (
                <Modal onClose={() => setOpenModal(null)}>
                    {openModal === "stats" && <Stats />}
                    {openModal === "help" && <Help />}
                    {openModal === "settings" && <Settings />}
                    {openModal === "shop" && <Shop />}
                </Modal>
            )}

            {showResultModal && (
                <Modal onClose={() => setShowResultModal(false)}>
                    <div className={`modal-content result-modal ${isWon ? "won" : "lost"}`}>
                        <h2>{isWon ? t("won") : t("lost")}</h2>
                        <p className="result-message">
                            {isWon ? t("wonMessage") : t("lostMessage")}
                        </p>
                        <div className="solution-display">
                            {state.secretCode.map((color, i) => {
                                const isThemeColor = color?.startsWith("theme-");
                                return (
                                    <div
                                        key={i}
                                        className={`solution-slot ${isThemeColor ? "" : color || ""}`}
                                        style={getColorStyle(color)}
                                    />
                                );
                            })}
                        </div>
                        {isWon && (
                            <p className="attempts-count">
                                {state.attempts.length > 1
                                    ? t("inAttemptsPlural", { count: state.attempts.length })
                                    : t("inAttempts", { count: state.attempts.length })}
                            </p>
                        )}
                        <p className="next-game">{t("nextPuzzle")} {countdown}</p>
                    </div>
                </Modal>
            )}
        </>
    );
}
