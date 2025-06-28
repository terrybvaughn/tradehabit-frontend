import { useState, useEffect, type FC } from "react";
import styles from "./ScreenSizeWarning.module.css";

const MIN_WIDTH = 1200; // Minimum supported width

export const ScreenSizeWarning: FC = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setShowWarning(window.innerWidth < MIN_WIDTH);
    };

    // Check on initial load
    checkScreenSize();

    // Check on resize
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!showWarning) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.content}>
          <h2 className={styles.title}>Get a bigger screen!</h2>
          
          <div className={styles.message}>
            <p>
              TradeHabit is designed for desktop and laptop computers with larger screens. 
              For the best experience, please use a device with a screen width of at least 1200px.
            </p>
            
            <div className={styles.specs}>
              <div className={styles.specItem}>
                <strong>Your screen:</strong> {window.innerWidth}px wide
              </div>
              <div className={styles.specItem}>
                <strong>Minimum required:</strong> {MIN_WIDTH}px wide
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button 
              className={styles.continueBtn}
              onClick={() => setShowWarning(false)}
            >
              Continue, if you must...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 