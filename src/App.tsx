import type { FC } from "react";
import { useBackendWakeUp } from "@/api/useBackendWakeUp";
import { Layout } from "@/components/Layout/Layout";
import { AnalysisStatusProvider } from "@/AnalysisStatusContext";

const App: FC = () => {
  useBackendWakeUp();

  return (
    <AnalysisStatusProvider>
      <Layout>
        {/* ───── Dashboard body placeholder ───── */}
        <div style={{ padding: "32px 0", flex: 1 }}>
          {/* Replace this with SummaryPanel, InsightPanel, etc. */}
        </div>
      </Layout>
    </AnalysisStatusProvider>
  );
};

export default App;
