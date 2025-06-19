// src/components/Layout/Layout.tsx
import type { FC, ReactNode } from "react";
import styles from "./Layout.module.css";
import { useState } from "react";

import { Header } from "@/components/Header/Header";
import { Divider } from "@/components/Divider/Divider";
import { Body } from "@/components/Body/Body";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  return (
    <div className={styles.shell}>
      <Header setInsightsExpanded={setInsightsExpanded} />
      <Divider />
      <Body insightsExpanded={insightsExpanded} setInsightsExpanded={setInsightsExpanded}>{children}</Body>
    </div>
  );
};
