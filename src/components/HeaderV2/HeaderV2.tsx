import type { FC } from "react";
import styles from "./HeaderV2.module.css";
import logo from "@/assets/images/th-mark.svg";
import settingsIcon from "@/assets/images/icon-settings.svg";
import uploadIcon from "@/assets/images/icon-upload.svg";
import { useAnalysisStatus } from "@/AnalysisStatusContext";

interface HeaderV2Props {
  openUploadModal: () => void;
  openSettingsModal: () => void;
  currentView: 'insights' | 'trades' | 'goals';
  setCurrentView: (view: 'insights' | 'trades' | 'goals') => void;
  showNav: boolean;
}

export const HeaderV2: FC<HeaderV2Props> = ({ openUploadModal, openSettingsModal, currentView, setCurrentView, showNav }) => {
  const { ready } = useAnalysisStatus();

  return (
    <header className={styles.wrapper}>
      {/* ------------ left side ------------- */}
      <div className={styles.left}>
        <img src={logo} alt="TradeHabit logo" height={24} />
        <span className={styles.brand}>TradeHabit</span>
      </div>

      {/* ------------ right side ------------- */}
      {showNav && ready && (
      <nav className={styles.nav} aria-label="Primary">
        <a
          className={`${styles.link} ${currentView === 'insights' ? styles.active : ''}`}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCurrentView('insights');
          }}
        >
          Insights
        </a>
        <a
          className={`${styles.link} ${currentView === 'trades' ? styles.active : ''}`}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCurrentView('trades');
          }}
        >
          Trades
        </a>
        <a
          className={`${styles.link} ${currentView === 'goals' ? styles.active : ''}`}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCurrentView('goals');
          }}
        >
          Goals
        </a>

        <div className={styles.buttonGroup}>
          <button
            className={styles.buttonBlue}
            type="button"
            onClick={openUploadModal}
          >
            <img
              src={uploadIcon}
              alt=""
              height={20}
              className={styles.uploadIcon}
            />
            Upload
          </button>
          <button
            className={styles.buttonGray}
            type="button"
            aria-label="Settings"
            onClick={openSettingsModal}
          >
            <img
              src={settingsIcon}
              alt="Settings"
              height={20}
            />
          </button>
        </div>
      </nav>
      )}
    </header>
  );
};
