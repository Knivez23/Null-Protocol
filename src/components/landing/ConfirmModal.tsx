interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="info-modal-backdrop" onClick={onCancel}>
      <div className="info-modal" onClick={e => e.stopPropagation()}>
        <div className="info-modal-head">
          <span>{title}</span>
          <button className="info-modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="info-modal-body">
          <p style={{ marginBottom: '16px' }}>{message}</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="end-turn-btn" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
            <button
              className="end-turn-btn"
              style={{ flex: 1, borderColor: 'var(--red)', color: 'var(--red)' }}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}