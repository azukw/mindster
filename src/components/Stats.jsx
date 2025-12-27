import { useGame } from "../context/GameContext";
import { useTranslation } from "../hooks/useTranslation";

export default function Stats() {
    const { state } = useGame();
    const { t } = useTranslation();

    const renderModeStats = (mode, title) => {
        const stats = state.stats[mode];
        const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;

        return (
            <div className="stats-section">
                <h3>{title}</h3>
                <div className="stats-grid">
                    <div className="stat-item">
                        <strong>{stats.played}</strong>
                        <span>{t("played")}</span>
                    </div>
                    <div className="stat-item">
                        <strong>{winRate}</strong>
                        <span>{t("winRate")}</span>
                    </div>
                    <div className="stat-item">
                        <strong>{stats.streak}</strong>
                        <span>{t("currentStreak")}</span>
                    </div>
                    <div className="stat-item">
                        <strong>{stats.maxStreak}</strong>
                        <span>{t("maxStreak")}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="modal-content stats-modal">
            <h2>{t("statistics")}</h2>
            {renderModeStats("normal", t("modeNormal"))}
            {renderModeStats("hard", t("modeHard"))}
            {renderModeStats("extreme", t("modeExtreme"))}
        </div>
    );
}
