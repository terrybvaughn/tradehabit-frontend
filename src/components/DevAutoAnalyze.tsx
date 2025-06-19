import { useEffect } from "react";
import { useAnalyzeCsv } from "@/api/hooks";

/**
 * DevAutoAnalyze
 * ------------------------------------------------------------------
 * This helper component automatically fetches `/sample.csv` (or any
 * test CSV placed in the /public directory) when the Vite dev server
 * runs. The file is wrapped in a `File` object and sent to the backend
 * using the `useAnalyzeCsv` mutation. This avoids the need for a manual
 * upload while the real file-picker UI is still under development.
 *
 * The component is rendered only in development builds via
 * `import.meta.env.DEV`. When you remove this condition, don't forget
 * to delete the component import from App.tsx.
 */
const DevAutoAnalyze = () => {
  const { mutate: analyze, error, isPending } = useAnalyzeCsv();

  useEffect(() => {
    if (!import.meta.env.DEV) return; // guard – should never run in prod

    // Fetch the CSV from the dev server's static assets
    fetch("/NT Orders Web 2024-12.csv")
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], "NT Orders Web 2024-12.csv", { type: "text/csv" });
        analyze(file);
      })
      .catch((err) => {
        console.error("Failed to auto-analyze sample CSV", err);
      });
  }, [analyze]);

  if (isPending) return <p>Analyzing sample CSV…</p>;
  if (error) return <p style={{ color: "red" }}>{error.message}</p>;
  return null; // no UI once done
};

export default DevAutoAnalyze; 