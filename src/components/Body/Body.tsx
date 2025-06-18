import type { FC, ReactNode } from "react";
import styles from "./Body.module.css";
import { DonutChart } from "./DonutChart";

interface BodyProps {
  children: ReactNode;
}

export const Body: FC<BodyProps> = ({ children }) => (
  <div className={styles.body}>
    <div className={styles.leftColumn}>
      <DonutChart value={92} label="Clean Trade Rate" />
      <div className={styles.section}>
        <h3 className={styles.sectionHeading}>Performance</h3>
        <ul className={styles.metrics}>
          <li>Total Trades <span>100</span></li>
          <li>Clean Trades <span>92</span></li>
          <li>Flagged Trades <span>8</span></li>
          <li>Clean Trade Rate <span>92%</span></li>
          <li className={styles.spacer}></li>
          <li>Winning Trades <span>51</span></li>
          <li>Losing Trades <span>49</span></li>
          <li>Win Rate <span>51%</span></li>
          <li className={styles.spacer}></li>
          <li>Average Profit <span>21.08</span></li>
          <li>Average Loss <span>19.24</span></li>
          <li>Payoff Ratio <span>1.10</span></li>
        </ul>
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionHeading}>Mistakes</h3>
        <ul className={styles.metrics}>
          <li>Excessive Risk <span>4</span></li>
          <li>Outsized Loss <span>2</span></li>
          <li>Revenge Trade <span>1</span></li>
          <li>No Stop-Loss <span>1</span></li>
        </ul>
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionHeading}>Streaks</h3>
        <ul className={styles.metrics}>
          <li>Current Clean Streak <span>22</span></li>
          <li>Record Clean Streak <span>15</span></li>
        </ul>
      </div>
    </div>
    <div className={styles.centerColumn}>{children}</div>
    <div className={styles.rightColumn}></div>
  </div>
); 