import type { FC } from "react";
import { createPortal } from "react-dom";
import styles from "./ConfirmDeleteModal.module.css";
import base from "@/components/Modal/ModalBase.module.css";

interface Props {
  open: boolean;
  onCancel: () => void;
  onDelete: () => Promise<void> | void;
}

export const ConfirmDeleteModal: FC<Props> = ({ open, onCancel, onDelete }) => {
  if (!open) return null;
  return createPortal(
    <div className={base.backdrop}>
      <div className={`${base.modal} ${styles.modal}`} role="dialog" aria-modal="true">
        <h2 className={base.title}>Delete</h2>
        <p className={base.bodyText}>Are you sure you want to delete this goal?</p>
        <div className={base.footer}>
          <button type="button" className={base.btnOutline} onClick={onCancel}>Cancel</button>
          <button type="button" className={base.btnDanger} onClick={() => { onDelete(); onCancel(); }}>Delete</button>
        </div>
      </div>
    </div>,
    document.body
  );
}; 