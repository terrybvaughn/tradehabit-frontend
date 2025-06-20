// src/components/Header/Header.tsx
import type { FC, ChangeEvent } from "react";
import { useRef, useState } from "react";
import styles from "./Header.module.css";
import logo from "@/assets/images/th-mark.svg"; // aliased path
import settingsIcon from "@/assets/images/icon-settings.svg"; // aliased path
import settingsIconHover from "@/assets/images/icon-hover-settings.svg"; // aliased path
import uploadIcon from "@/assets/images/icon-upload.svg"; // aliased path
import uploadIconHover from "@/assets/images/icon-hover-upload.svg"; // aliased path
import { useAnalyzeCsv } from "@/api/hooks";

interface HeaderProps {
  setInsightsExpanded: (expanded: boolean) => void;
}

export const Header: FC<HeaderProps> = ({ setInsightsExpanded }) => {
  const [isUploadHovered, setIsUploadHovered] = useState(false);
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);

  const { mutate: analyzeCsv } = useAnalyzeCsv();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) analyzeCsv(file);
    // reset so same file can be selected again if desired
    e.target.value = "";
  };

  return (
    <header className={styles.wrapper}>
      {/* ------------ left side ------------- */}
      <div className={styles.left}>
        <img src={logo} alt="TradeHabit logo" height={24} />
        <span className={styles.brand}>TradeHabit</span>
      </div>

      {/* ------------ right side ------------- */}
      <nav className={styles.nav} aria-label="Primary">
        <a className={styles.link} href="#" onClick={() => setInsightsExpanded(false)}>Dashboard</a>
        <a className={styles.link} href="#">Insights</a>
        <a className={styles.link} href="#">Goals</a>

        <div className={styles.buttonGroup}>
          <button
            className={styles.buttonBlue}
            type="button"
            onMouseEnter={() => setIsUploadHovered(true)}
            onMouseLeave={() => setIsUploadHovered(false)}
            onClick={() => fileInputRef.current?.click()}
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

      {/* Hidden file input for CSV upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </header>
  );
};
