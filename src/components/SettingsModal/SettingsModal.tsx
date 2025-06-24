import { useState, type FC, useEffect } from "react";
import base from "@/components/Modal/ModalBase.module.css";
import styles from "./SettingsModal.module.css";
import { useSettingsStore } from "@/state/settingsStore";
import { apiClient } from "@/api/client";
import { useQueryClient } from "@tanstack/react-query";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal: FC<SettingsModalProps> = ({ open, onClose }) => {
  const store = useSettingsStore();
  const [revengeK, setRevengeK] = useState(store.revengeK);
  const [lossSigma, setLossSigma] = useState(store.lossSigma);
  const [riskSigma, setRiskSigma] = useState(store.riskSigma);
  const [riskVR, setRiskVR] = useState(store.riskVR);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const qc = useQueryClient();

  // Sync local state with store whenever modal is opened
  useEffect(() => {
    if (open) {
      setRevengeK(store.revengeK);
      setLossSigma(store.lossSigma);
      setRiskSigma(store.riskSigma);
      setRiskVR(store.riskVR);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      // Send new thresholds to backend – it will recalculate in-memory analyses.
      await apiClient.post(`/api/settings`, {
        k: revengeK,
        sigma_loss: lossSigma,
        sigma_risk: riskSigma,
        vr: riskVR,
      });

      // Persist locally after successful save
      store.setMany({ revengeK, lossSigma, riskSigma, riskVR });

      // Invalidate caches so UI picks up new data
      qc.invalidateQueries(); // invalidate all; simplest
      onClose();
    } catch (err) {
      setError("Could not save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const Slider = ({ label, min, max, step, value, setValue }: {label: string; min:number; max:number; step:number; value:number; setValue:(n:number)=>void}) => (
    <div className={styles.sliderRow}>
      <div className={styles.headerRow}>
        <span className={styles.label}>{label}</span>
        <span className={styles.currentValue}>{value.toFixed(2)}</span>
      </div>
      <div className={styles.rangeWrapper}>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e)=>setValue(Number(e.target.value))} />
      </div>
      <div className={styles.rangeLabels}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );

  return (
    <div className={base.backdrop}>
      <div className={`${base.modal} ${styles.modal}`} role="dialog" aria-modal="true">
        <h2 className={base.title}>Settings</h2>

        <Slider label="Revenge-Trading Window Multiplier: " min={0.5} max={3.0} step={0.25} value={revengeK} setValue={setRevengeK} />
        <Slider label="Outsized-Loss Threshold: " min={0.75} max={1.5} step={0.25} value={lossSigma} setValue={setLossSigma} />
        <Slider label="Excessive-Risk Threshold: " min={1.0} max={2.0} step={0.25} value={riskSigma} setValue={setRiskSigma} />
        <Slider label="Risk-Sizing Consistency: " min={0.2} max={0.5} step={0.05} value={riskVR} setValue={setRiskVR} />

        {error && <div className={styles.errorMsg}>{error}</div>}

        <div className={base.footer}>
          <button type="button" className={base.btnOutline} onClick={onClose} disabled={saving}>Cancel</button>
          <button type="button" className={base.btnPrimary} onClick={handleSave} disabled={saving}>Save</button>
        </div>
      </div>
    </div>
  );
}; 