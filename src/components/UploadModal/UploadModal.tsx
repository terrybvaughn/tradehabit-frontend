import { useRef, useState, type FC, type DragEvent, type ChangeEvent, type MouseEvent, useEffect } from "react";
import styles from "./UploadModal.module.css";
import { useAnalyzeCsv } from "@/api/hooks";
import { useAnalysisStatus } from "@/AnalysisStatusContext";

interface UploadModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Callback for when the modal should be dismissed */
  onClose: () => void;
}

export const UploadModal: FC<UploadModalProps> = ({ open, onClose }) => {
  const { setReady } = useAnalysisStatus();
  const ANIMATION_MS = 1800;          // duration of progress-to-100 animation
  const CLOSE_DELAY  = 1000;           // small pause after animation finishes

  const { mutate: analyzeCsv, isPending, isSuccess, isError, error, reset } = useAnalyzeCsv({
    onSuccess: () => {
      setReady(true);
      // wait until animation is finished before closing the modal
      setTimeout(onClose, ANIMATION_MS + CLOSE_DELAY);
    },
  });

  // Local progress state (0-100). We fake upload progress because fetch API lacks native progress.
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadStartRef = useRef<number>(0);

  // When analyzeCsv starts (isPending true) set progress to 10 and animate towards 90 over time
  useEffect(() => {
    if (isPending) {
      setProgress(10);
      uploadStartRef.current = Date.now();
      const id = setInterval(() => {
        setProgress((p) => (p < 90 ? p + 5 : p));
      }, 250);
      return () => clearInterval(id);
    }
  }, [isPending]);

  // Animate to 100% when finished, ensure total display ≥2s
  useEffect(() => {
    if (isSuccess) {
      const duration = ANIMATION_MS; // ms
      const start = performance.now();
      const initial = progress;

      const tick = (now: number) => {
        const pct = Math.min(1, (now - start) / duration);
        setProgress(Math.round(initial + (100 - initial) * pct));
        if (pct < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  // Reset progress when modal reopens
  useEffect(() => {
    if (open) {
      setProgress(0);
      reset();
    }
  }, [open, reset]);

  const handleFile = (file: File) => {
    setFileName(file.name);
    analyzeCsv(file);
  };

  const handleBrowseChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const preventDefaults = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const busy = (isPending || isSuccess) && !isError;

  // ────────────────────────────────────────────────────────────
  // Demo-data support
  // File shipped in /public will be served from the site root at runtime.
  const DEMO_CSV_PATH = "/314_synthetic_trades-FINAL.csv";

  const handleDemoClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (busy) return; // Ignore if something else is uploading

    try {
      const resp = await fetch(DEMO_CSV_PATH);
      if (!resp.ok) throw new Error("Failed to fetch demo data");

      const blob = await resp.blob();
      // Wrap into a File object so we can reuse the existing upload flow
      const demoFile = new File([blob], "demo_trades.csv", { type: "text/csv" });
      handleFile(demoFile);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };
  // ────────────────────────────────────────────────────────────

  if (!open) return null;

  return (
    <div className={styles.backdrop /* though backdrop hidden we keep for positioning */}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.intro}>
          <div>
            <h2 className={styles.title}>Upload your NinjaTrader trade order data</h2>
            <p className={styles.bodyText}>TradeHabit only supports NinjaTrader orders data in .csv format.</p>
          </div>
          <div className={styles.logoWrapper} aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 259" width="90" height="54" fill="#ff4b00" aria-hidden="true">
              <polygon points="345.6,259 345.6,86.4 432,86.4 432,0 172.8,0 172.8,86.4 259.3,86.4 259.3,172.6 259.3,172.6 86.4,0 0,0 0,86.4 86.4,172.7 0,172.7 0,259 86.4,259 86.4,172.7 172.7,259 " />
            </svg>
          </div>
        </div>

        <div className={styles.box}>
          <div className={styles.columns}> 
            {/* Instructions */}
            <div>
              <h3 className={styles.subheading}>Instructions</h3>
              <ol className={styles.instructions}>
                <li>Log in to the NinjaTrader Account Dashboard.</li>
                <li>Select <strong>Statements</strong> from the User Profile menu at the top-right.</li>
                <li>Choose <strong>Orders</strong> from the Report Type dropdown.</li>
                <li>Select a <strong>date range</strong> from the Date dropdown.</li>
                <li><strong>Do not add any filters</strong> in the Filter dropdown.</li>
                <li>Click the <strong>Download CSV</strong> button.</li>
                <li>Use that file to upload to TradeHabit.</li>
              </ol>
            </div>

            {/* Upload area */}
            <div className={styles.uploadArea}>
              <h3 className={styles.subheading}>File Upload</h3>
              <div
                className={styles.dropZone}
                onDragEnter={preventDefaults}
                onDragOver={preventDefaults}
                onDrop={handleDrop}
                aria-label="Drag and drop CSV file"
              >
                <span>Drag &amp; drop your CSV file here</span>
                <button
                  type="button"
                  className={`${styles.browseButton} ${busy ? styles.browseButtonBusy : ""}`}
                  disabled={busy}
                  onClick={() => !busy && fileInputRef.current?.click()}
                >
                  {busy ? "Loading..." : "Browse..."}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  style={{ display: "none" }}
                  onChange={handleBrowseChange}
                />
                {/* Demo-data link inside drop zone */}
                <p className={styles.demoLink}>
                  No data? Try it out with some{" "}
                  <a href="#" onClick={handleDemoClick}>demo data</a> instead.
                </p>
              </div>

              {/* Progress bar shown during upload and finalising animation */}
              {(isPending || isSuccess) && (
                <div className={styles.progressBlock}>
                  <div className={styles.progressHeader}>
                    <span className={styles.fileName}>{fileName || "Uploading…"}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className={styles.progressBarWrapper}>
                    <div className={styles.progressBar} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {isError && error && (
                <div className={styles.errorBlock} role="alert">
                  <p className={styles.errorMessage}>{error.message}</p>
                  {error.details && error.details.length > 0 && (
                    <ul className={styles.errorDetails}>
                      {error.details.slice(0, 5).map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 