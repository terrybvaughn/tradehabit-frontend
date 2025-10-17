import type { FC } from "react";
import { useBackendWakeUp } from "@/api/useBackendWakeUp";
import { Layout } from "@/components/Layout/Layout";
import { AnalysisStatusProvider } from "@/AnalysisStatusContext";
import { ScreenSizeWarning } from "@/components/ScreenSizeWarning/ScreenSizeWarning";
import DashboardV2 from "@/pages/DashboardV2";

const App: FC = () => {
  useBackendWakeUp();

  // Check for v2 query flag
  const searchParams = new URLSearchParams(window.location.search);
  const useV2 = searchParams.get('v2') === '1';

  return (
    <AnalysisStatusProvider>
      <ScreenSizeWarning />
      {useV2 ? (
        <DashboardV2 />
      ) : (
        <Layout>
          {/* ───── Dashboard body placeholder ───── */}
          <div style={{ padding: "32px 0", flex: 1 }}>
            {/* Replace this with SummaryPanel, InsightPanel, etc. */}
          </div>
        </Layout>
      )}
    </AnalysisStatusProvider>
  );
};

export default App;
