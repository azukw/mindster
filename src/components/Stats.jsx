// src/components/Stats.jsx
import { useGame } from "../context/GameContext";
import { useTranslation } from "../hooks/useTranslation";

export default function Stats() {
    const { state } = useGame();
    const { t } = useTranslation();

    const getWinRate = (stats) => {
        if (stats.played === 0) return 0;
        return Math.round((stats.won / stats.played) * 100);
    };

    return (
        <div className="modal-content stats-modal">
            <h2>{t("statistics")}</h2>

            <div className="stats-section">
                <h3>{t("modeNormal")}</h3>
                <div className="stats-grid">
                    <div className="stat-item">
                        <strong>{state.stats.normal.played}</strong>
                        <span>{t("played")}</span>
                    </div>
                    <div className="stat-item">
                        <strong>{getWinRate(state.stats.normal)}</strong>
                        <span>{t("winRate")}</span>
                    </div>
                    <div className="stat-item">
                        <strong>{state.stats.normal.streak}</strong>
                        <span>{t("currentStreak")}</span>
                    </div>
                    <div className="stat-item">
                        <strong>{state.stats.normal.maxStreak}</strong>
                        <span>{t("maxStreak")}</span>
                    </div>
                </div>
            </div>

            <div className="stats-section">
                <h3>{t("modeHard")}</h3>
                <div className="stats-grid">
                    <div className="stat-item">
                        <strong>{state.stats.hard.played}</strong>
                        <span>{t("played")}</span>
                    </div>
                    <div className="stat-item">
                        <strong>{getWinRate(state.stats.hard)}</strong>
                        <span>{t("winRate")}</span>
                    </div>
                    <div className="stat-item">
                        <strong>{state.stats.hard.streak}</strong>
                        <span>{t("currentStreak")}</span>
                    </div>
                    <div className="stat-item">
                        <strong>{state.stats.hard.maxStreak}</strong>
                        <span>{t("maxStreak")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
