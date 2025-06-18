// src/components/Header/Header.tsx
import type { FC } from "react";
import { useState } from "react";
import styles from "./Header.module.css";
import logo from "@/assets/images/th-mark.svg"; // aliased path
import settingsIcon from "@/assets/images/icon-settings.svg"; // aliased path
import settingsIconHover from "@/assets/images/icon-hover-settings.svg"; // aliased path
import uploadIcon from "@/assets/images/icon-upload.svg"; // aliased path
import uploadIconHover from "@/assets/images/icon-hover-upload.svg"; // aliased path

export const Header: FC = () => {
  const [isUploadHovered, setIsUploadHovered] = useState(false);
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);

  return (
    <header className={styles.wrapper}>
      {/* ------------ left side ------------- */}
      <div className={styles.left}>
        <img src={logo} alt="TradeHabit logo" height={24} />
        <span className={styles.brand}>TradeHabit</span>
      </div>

      {/* ------------ right side ------------- */}
      <nav className={styles.nav} aria-label="Primary">
        <a className={styles.link} href="#">Dashboard</a>
        <a className={styles.link} href="#">Insights</a>
        <a className={styles.link} href="#">Goals</a>

        <div className={styles.buttonGroup}>
          <button 
            className={styles.buttonBlue} 
            type="button"
            onMouseEnter={() => setIsUploadHovered(true)}
            onMouseLeave={() => setIsUploadHovered(false)}
          >
            <img 
              src={isUploadHovered ? uploadIconHover : uploadIcon} 
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
            onMouseEnter={() => setIsSettingsHovered(true)}
            onMouseLeave={() => setIsSettingsHovered(false)}
          >
            <img 
              src={isSettingsHovered ? settingsIconHover : settingsIcon} 
              alt="Settings" 
              height={20} 
            />
          </button>
        </div>
      </nav>
    </header>
  );
};
