// src/components/Layout/Layout.tsx
import type { FC, ReactNode } from "react";
import styles from "./Layout.module.css";
import { useState, useEffect } from "react";

import { Header } from "@/components/Header/Header";
import { Divider } from "@/components/Divider/Divider";
import { Body } from "@/components/Body/Body";
import { UploadModal } from "@/components/UploadModal/UploadModal";
import { SettingsModal } from "@/components/SettingsModal/SettingsModal";
import { useAnalysisStatus } from "@/AnalysisStatusContext";
import { useSettingsStore } from "@/state/settingsStore";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const { ready } = useAnalysisStatus();

  // Upload modal is open when analysis not ready, or when manually toggled
  const [uploadOpen, setUploadOpen] = useState(!ready);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Automatically show when ready becomes false (e.g., on initial load)
  useEffect(() => {
    if (!ready) {
      setUploadOpen(true);
    }
  }, [ready]);

  // Reset thresholds whenever the upload modal is shown (fresh dataset expected)
  useEffect(() => {
    if (uploadOpen) {
      useSettingsStore.getState().reset();
    }
  }, [uploadOpen]);

  const closeUploadModal = () => setUploadOpen(false);

  return (
    <div className={styles.shell}>
      <Header 
        setInsightsExpanded={setInsightsExpanded} 
        openUploadModal={() => setUploadOpen(true)} 
        openSettingsModal={() => setSettingsOpen(true)}
        showNav={!uploadOpen && ready}
        setShowGoals={setShowGoals}
        showGoals={showGoals}
      />
      <Divider />
      {/* Hide body until analysis ready and modal closed */}
      {ready && !uploadOpen && (
        <Body
          insightsExpanded={insightsExpanded}
          setInsightsExpanded={setInsightsExpanded}
          showGoals={showGoals}
        >
          {children}
        </Body>
      )}

      <UploadModal open={uploadOpen} onClose={closeUploadModal} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};
