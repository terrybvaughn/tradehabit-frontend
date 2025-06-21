// src/components/Layout/Layout.tsx
import type { FC, ReactNode } from "react";
import styles from "./Layout.module.css";
import { useState, useEffect } from "react";

import { Header } from "@/components/Header/Header";
import { Divider } from "@/components/Divider/Divider";
import { Body } from "@/components/Body/Body";
import { UploadModal } from "@/components/UploadModal/UploadModal";
import { useAnalysisStatus } from "@/AnalysisStatusContext";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const { ready } = useAnalysisStatus();

  // Upload modal is open when analysis not ready, or when manually toggled
  const [uploadOpen, setUploadOpen] = useState(!ready);

  // Automatically show when ready becomes false (e.g., on initial load)
  useEffect(() => {
    if (!ready) {
      setUploadOpen(true);
    }
  }, [ready]);

  const closeUploadModal = () => setUploadOpen(false);

  return (
    <div className={styles.shell}>
      <Header 
        setInsightsExpanded={setInsightsExpanded} 
        openUploadModal={() => setUploadOpen(true)} 
        showNav={!uploadOpen && ready}
      />
      <Divider />
      {/* Hide body until analysis ready and modal closed */}
      {ready && !uploadOpen && (
        <Body insightsExpanded={insightsExpanded} setInsightsExpanded={setInsightsExpanded}>
          {children}
        </Body>
      )}

      <UploadModal open={uploadOpen} onClose={closeUploadModal} />
    </div>
  );
};
