import type { FC } from "react";
import { useState, useEffect } from "react";
import { HeaderV2 } from "@/components/HeaderV2/HeaderV2";
import { TemplateV2 } from "@/components/TemplateV2/TemplateV2";
import { Divider } from "@/components/Divider/Divider";
import { UploadModal } from "@/components/UploadModal/UploadModal";
import { SettingsModal } from "@/components/SettingsModal/SettingsModal";
import { useAnalysisStatus } from "@/AnalysisStatusContext";
import { useSettingsStore } from "@/state/settingsStore";

const DashboardV2: FC = () => {
  const { ready } = useAnalysisStatus();

  // Upload modal is open when analysis not ready, or when manually toggled
  const [uploadOpen, setUploadOpen] = useState(!ready);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Navigation state for center column content
  const [currentView, setCurrentView] = useState<'insights' | 'trades' | 'goals'>('insights');

  // Automatically show when ready becomes false (e.g., on initial load)
  useEffect(() => {
    if (!ready) {
      setUploadOpen(true);
    }
  }, [ready]);

  const closeUploadModal = () => setUploadOpen(false);

  return (
    <>
      <HeaderV2
        openUploadModal={() => setUploadOpen(true)}
        openSettingsModal={() => setSettingsOpen(true)}
        currentView={currentView}
        setCurrentView={setCurrentView}
        showNav={!uploadOpen && ready}
      />
      <Divider />
      {ready && !uploadOpen && (
        <TemplateV2 currentView={currentView} />
      )}

      {/* Modals overlay the full screen */}
      <UploadModal open={uploadOpen} onClose={closeUploadModal} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default DashboardV2;
