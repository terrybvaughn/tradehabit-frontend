// src/components/Header/Header.tsx
import type { FC } from "react";
import { useState } from "react";
import styles from "./Header.module.css";
import logo from "@/assets/images/th-mark.svg"; // aliased path
import settingsIcon from "@/assets/images/icon-settings.svg"; // aliased path
import uploadIcon from "@/assets/images/icon-upload.svg"; // aliased path
import { useAnalysisStatus } from "@/AnalysisStatusContext";

interface HeaderProps {
  setInsightsExpanded: (expanded: boolean) => void;
  openUploadModal: () => void;
  showNav: boolean;
}

export const Header: FC<HeaderProps> = ({ setInsightsExpanded, openUploadModal, showNav }) => {
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
        <a className={styles.link} href="#" onClick={() => setInsightsExpanded(false)}>Dashboard</a>
        <a
          className={styles.link}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setInsightsExpanded(true);
          }}
        >
          Insights
        </a>
        <a className={styles.link} href="#">Goals</a>

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
