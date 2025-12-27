import { useState, useEffect, useCallback, useRef } from "react";
import useGame from "../context/GameContext";
import { useTranslation } from "../hooks/useTranslation";
import { THEMES } from "../components/Shop";
import Board from "../components/Board";
import Palette from "../components/Palette";
import Modal from "../components/Modal";
import Stats from "../components/Stats";
import Help from "../components/Help";
import Settings from "../components/Settings";
import Shop from "../components/Shop";
import VersusPage from "../pages/Versus";


export default function Game() {
    const { state, dispatch, getTimeUntilReset } = useGame();
    const { t } = useTranslation();
    const [countdown, setCountdown] = useState("");
    const [showResultModal, setShowResultModal] = useState(false);
    const [openModal, setOpenModal] = useState(null);
    const [copied, setCopied] = useState(false);
    const hasShownHelpRef = useRef(false);

    const isEasy = state.mode === "easy";
    const isHard = state.mode === "hard";
    const isExtreme = state.mode === "extreme";
    const isWon = state.gameStatus === "won";
    const isLost = state.gameStatus === "lost";
    const isGameOver = isWon || isLost;
    const codeLength = isExtreme ? 8 : isHard ? 6 : isEasy ? 3 : 4;
    const isComplete = state.currentAttempt.length === codeLength;

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

    const handleShare = () => {
        const modeText = isExtreme ? "💀 Extreme" : isHard ? "🔥 Hard" : isEasy ? "✨ Easy" : "🧠 Normal";
        const date = new Date().toLocaleDateString();

        let result = `Mindster ${modeText} - ${date}\n\n`;

        state.attempts.forEach((attempt) => {
            const feedback = attempt.feedback;
            for (let j = 0; j < codeLength; j++) {
                if (j < feedback.correct) {
                    result += "🟢";
                } else if (j < feedback.correct + feedback.misplaced) {
                    result += "🔴";
                } else {
                    result += "⚫";
                }
            }
            result += "\n";
        });

        result += `\n${isWon ? `✅ ${state.attempts.length}/${state.maxAttempts}` : "❌"}\n`;
        result += "https://azukw.github.io/mindster/";

        navigator.clipboard.writeText(result).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
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

    useEffect(() => {
        if (!state.hasSeenHelp && !hasShownHelpRef.current) {
            hasShownHelpRef.current = true;
            const timer = setTimeout(() => setOpenModal("help"), 0);
            return () => clearTimeout(timer);
        }
    }, [state.hasSeenHelp]);

    useEffect(() => {
        if (isGameOver) {
            const timer = setTimeout(() => setShowResultModal(true), 500);
            return () => clearTimeout(timer);
        }
    }, [isGameOver]);

    const closeHelpModal = useCallback(() => {
        setOpenModal(null);
        if (!state.hasSeenHelp) {
            dispatch({ type: "MARK_HELP_SEEN" });
        }
    }, [state.hasSeenHelp, dispatch]);

    return (
        <main className="game">
            <div className="mode-toggle">
                <button
                    className={`easy ${state.mode === "easy" ? "active" : ""}`}
                    onClick={() => dispatch({ type: "SET_MODE", mode: "easy" })}
                >
                    {t("easy")}
                </button>
                <button
                    className={`normal ${state.mode === "normal" ? "active" : ""}`}
                    onClick={() => dispatch({ type: "SET_MODE", mode: "normal" })}
                >
                    {t("normal")}
                </button>
                <button
                    className={`hard ${state.mode === "hard" ? "active" : ""}`}
                    onClick={() => dispatch({ type: "SET_MODE", mode: "hard" })}
                >
                    {t("hard")}
                </button>
                <button
                    className={`extreme ${state.mode === "extreme" ? "active" : ""}`}
                    onClick={() => dispatch({ type: "SET_MODE", mode: "extreme" })}
                >
                    {t("extreme")}
                </button>

            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                <button className="icon-btn" onClick={() => setOpenModal("versus")}>⚔️ Versus</button>
            </div>

            <Board />
            <Palette />

            <div className="bottom-bar">
                <div className="bottom-left">
                    <button className="icon-btn" onClick={() => setOpenModal("help")}>❓</button>
                    <button className="icon-btn" onClick={() => setOpenModal("stats")}>📊</button>
                </div>

                <button
                    className={`validate ${isGameOver ? `result-btn result-${isWon ? "won" : "lost"}` : ""}`}
                    disabled={!isComplete && !isGameOver}
                    onClick={() => {
                        if (isGameOver) {
                            setShowResultModal(true);
                        } else {
                            dispatch({ type: "VALIDATE" });
                        }
                    }}
                >
                    {isGameOver ? t("result") : t("validate")}
                </button>

                <div className="bottom-right">
                    <button className="icon-btn" onClick={() => setOpenModal("shop")}>🎨</button>
                    <button className="icon-btn" onClick={() => setOpenModal("settings")}>⚙️</button>
                </div>
            </div>

            <p className="daily">{t("nextPuzzle")} {countdown}</p>

            {showResultModal && (
                <Modal onClose={() => setShowResultModal(false)}>
                    <div className={`modal-content result-modal ${isWon ? "won" : "lost"}`}>
                        <h2>{isWon ? t("won") : t("lost")}</h2>
                        <p className="result-message">
                            {isWon ? t("wonMessage") : t("lostMessage")}
                        </p>

                        <div className={`solution-display ${isExtreme ? "solution-extreme" : isHard ? "solution-hard" : ""}`}>
                            {state.secretCode.map((color, i) => (
                                <div
                                    key={i}
                                    className={`solution-slot ${isExtreme ? "slot-extreme" : isHard ? "slot-hard" : ""} ${color.startsWith("theme-") ? "" : color}`}
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

                        <div className="game-summary">
                            <h3>{t("summary")}</h3>
                            <div className="summary-rows">
                                {state.attempts.map((attempt, i) => (
                                    <div key={i} className="summary-row">
                                        <div className="summary-dots">
                                            {Array.from({ length: codeLength }).map((_, j) => {
                                                const feedback = attempt.feedback;
                                                let dotClass = `summary-dot ${isExtreme ? "dot-small" : ""} `;
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

                        <button className="share-btn" onClick={handleShare}>
                            {copied ? t("copied") : t("share")}
                        </button>

                        <p className="next-game">{t("nextPuzzle")} {countdown}</p>
                    </div>
                </Modal>
            )}

            {openModal === "help" && (
                <Modal onClose={closeHelpModal}>
                    <Help />
                </Modal>
            )}

            {openModal === "stats" && (
                <Modal onClose={() => setOpenModal(null)}>
                    <Stats />
                </Modal>
            )}

            {openModal === "settings" && (
                <Modal onClose={() => setOpenModal(null)}>
                    <Settings />
                </Modal>
            )}

            {openModal === "shop" && (
                <Modal onClose={() => setOpenModal(null)}>
                    <Shop />
                </Modal>
            )}

            {openModal === "versus" && (
                <Modal onClose={() => setOpenModal(null)}>
                    <VersusPage />
                </Modal>
            )}
        </main>
    );
}