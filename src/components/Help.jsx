import { useTranslation } from "../hooks/useTranslation";

export default function Help() {
    const { t } = useTranslation();

    return (
        <div className="modal-content help-modal">
            <h2>{t("howToPlay")}</h2>

            <p className="help-intro">{t("helpIntro")}</p>

            <div className="help-section">
                <h3>{t("rules")}</h3>
                <ul className="help-rules">
                    <li>{t("rule1")}</li>
                    <li>{t("rule2")}</li>
                    <li>{t("rule3")}</li>
                </ul>
            </div>

            <div className="help-section">
                <h3>{t("hints")}</h3>
                <div className="help-feedback">
                    <div className="feedback-example">
                        <span className="dot-example dot-correct-example"></span>
                        <span>{t("hintCorrect")}</span>
                    </div>
                    <div className="feedback-example">
                        <span className="dot-example dot-misplaced-example"></span>
                        <span>{t("hintMisplaced")}</span>
                    </div>
                    <div className="feedback-example">
                        <span className="dot-example dot-wrong-example"></span>
                        <span>{t("hintWrong")}</span>
                    </div>
                </div>
            </div>

            <div className="help-section">
                <h3>{t("modes")}</h3>
                <div className="help-modes">
                    <div className="mode-info">
                        <strong>{t("easy")}</strong>
                        <span>{t("easyDesc")}</span>
                    </div>
                    <div className="mode-info">
                        <strong>{t("normal")}</strong>
                        <span>{t("normalDesc")}</span>
                    </div>
                    <div className="mode-info">
                        <strong>{t("hard")}</strong>
                        <span>{t("hardDesc")}</span>
                    </div>
                    <div className="mode-info">
                        <strong>{t("extreme")}</strong>
                        <span>{t("extremeDesc")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}