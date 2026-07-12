import { useState } from 'react';

interface NewPlaythroughModalProps {
  onCreate: (characterName: string) => void;
  onCancel: () => void;
}

const MAX_NAME_LENGTH = 20;

export default function NewPlaythroughModal({ onCreate, onCancel }: NewPlaythroughModalProps) {
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
  };

  return (
    <div className="info-modal-backdrop" onClick={onCancel}>
      <div className="info-modal" onClick={e => e.stopPropagation()}>
        <div className="info-modal-head">
          <span>New Playthrough</span>
          <button className="info-modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="info-modal-body">
          <p style={{ marginBottom: '10px', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Character Name
          </p>
          <input
            type="text"
            className="playthrough-name-input"
            value={name}
            maxLength={MAX_NAME_LENGTH}
            autoFocus
            placeholder="VOIDSTRIDER"
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button className="end-turn-btn" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
            <button
              className="end-turn-btn"
              style={{ flex: 1, borderColor: 'var(--amber)', color: 'var(--amber-bright)' }}
              onClick={handleCreate}
              disabled={!name.trim()}
            >
              Jack In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}