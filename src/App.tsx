import type { FC } from "react";
import { Layout } from "@/components/Layout/Layout";
import DevAutoAnalyze from "@/components/DevAutoAnalyze";

const App: FC = () => (
  <>
    {import.meta.env.DEV && <DevAutoAnalyze />}
    <Layout>
      {/* ───── Dashboard body placeholder ───── */}
      <div style={{ padding: "32px 0", flex: 1 }}>
        {/* Replace this with SummaryPanel, InsightPanel, etc. */}
      </div>
    </Layout>
  </>
);

export default App;
