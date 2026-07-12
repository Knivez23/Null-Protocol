import type { ReactNode } from 'react';

interface InfoModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function InfoModal({ title, onClose, children }: InfoModalProps) {
  return (
    <div className="info-modal-backdrop" onClick={onClose}>
      <div className="info-modal" onClick={e => e.stopPropagation()}>
        <div className="info-modal-head">
          <span>{title}</span>
          <button className="info-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="info-modal-body">{children}</div>
      </div>
    </div>
  );
}