import { useState, useEffect, useCallback, useRef } from "react";
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
    const hasShownHelpRef = useRef(false);

    const isHard = state.mode === "hard";
    const isWon = state.gameStatus === "won";
    const isLost = state.gameStatus === "lost";
    const isGameOver = isWon || isLost;
    const codeLength = state.mode === "hard" ? 6 : 4;
    const isComplete = state.currentAttempt.length === codeLength;

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
    }, [getTimeUntilReset]);

    // Afficher l'aide au premier lancement
    useEffect(() => {
        if (!state.hasSeenHelp && !hasShownHelpRef.current) {
            hasShownHelpRef.current = true;
            const timer = setTimeout(() => setOpenModal("help"), 0);
            return () => clearTimeout(timer);
        }
    }, [state.hasSeenHelp]);

    // Afficher automatiquement la popup de résultat
    useEffect(() => {
        if (isGameOver) {
            const timer = setTimeout(() => setShowResultModal(true), 500);
            return () => clearTimeout(timer);
        }
    }, [isGameOver]);

    const handleCloseModal = useCallback(() => {
        if (openModal === "help" && !state.hasSeenHelp) {
            dispatch({ type: "MARK_HELP_SEEN" });
        }
        setOpenModal(null);
    }, [openModal, state.hasSeenHelp, dispatch]);

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
                    {isGameOver ? (
                        <button
                            className={`validate result-btn ${isWon ? "result-won" : "result-lost"}`}
                            onClick={() => setShowResultModal(true)}
                        >
                            {t("result")}
                        </button>
                    ) : (
                        <button
                            className="validate"
                            disabled={!isComplete}
                            onClick={() => dispatch({ type: "VALIDATE" })}
                        >
                            {t("validate")}
                        </button>
                    )}
                    <div className="bottom-right">
                        <button className="icon-btn" onClick={() => setOpenModal("shop")} title={t("shop")}>🛒</button>
                        <button className="icon-btn" onClick={() => setOpenModal("settings")} title={t("settings")}>⚙️</button>
                    </div>
                </div>

                <p className="daily">{t("dailyPuzzle")} {countdown}</p>
            </main>

            {openModal && (
                <Modal onClose={handleCloseModal}>
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

                        {/* Solution en premier */}
                        <div className="solution-display">
                            {state.secretCode.map((color, i) => (
                                <div
                                    key={i}
                                    className={`solution-slot ${color.startsWith("theme-") ? "" : color}`}
                                    style={getColorStyle(color)}
                                />
                            ))}
                        </div>

                        {isWon && (
                            <p className="attempts-count">
                                {state.attempts.length > 1
                                    ? t("inAttemptsPlural", { count: state.attempts.length })
                                    : t("inAttempts", { count: state.attempts.length })}
                            </p>
                        )}

                        {/* Résumé en dessous */}
                        <div className="game-summary">
                            <h3>{t("summary")}</h3>
                            <div className="summary-rows">
                                {state.attempts.map((attempt, i) => (
                                    <div key={i} className="summary-row">
                                        <div className="summary-dots">
                                            {Array.from({ length: codeLength }).map((_, j) => {
                                                const feedback = attempt.feedback;
                                                let dotClass = "summary-dot ";
                                                if (j < feedback.correct) {
                                                    dotClass += "dot-correct";
                                                } else if (j < feedback.correct + feedback.misplaced) {
                                                    dotClass += "dot-misplaced";
                                                } else {
                                                    dotClass += "dot-wrong";
                                                }
                                                return <span key={j} className={dotClass} />;
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                        <p className="next-game">{t("nextPuzzle")} {countdown}</p>
                    </div>
                </Modal>
            )}

        </>
    );
}
