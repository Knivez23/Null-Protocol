import { useState, useEffect } from 'react';
import type { PlaythroughMeta, PlaythroughSaveData } from '../../types';
import { saveStorage } from '../../engine/saveStorage';
import { createNewPlaythrough } from '../../engine/playthrough';
import NewPlaythroughModal from './NewPlaythroughModal';
import ConfirmModal from './ConfirmModal';

interface LandingScreenProps {
  onEnterGame: (save: PlaythroughSaveData) => void;
}

function formatLastPlayed(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function LandingScreen({ onEnterGame }: LandingScreenProps) {
  const [playthroughs, setPlaythroughs] = useState<PlaythroughMeta[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setPlaythroughs(saveStorage.listPlaythroughs());
  }, []);

  const handleContinue = (id: string) => {
    const save = saveStorage.loadPlaythrough(id);
    if (!save) return; // corrupted/missing entry — silently ignore rather than crash
    save.meta.lastPlayedAt = Date.now();
    saveStorage.savePlaythrough(save);
    onEnterGame(save);
  };

  const handleCreate = (characterName: string) => {
    const save = createNewPlaythrough(characterName);
    saveStorage.savePlaythrough(save);
    setShowNewModal(false);
    onEnterGame(save);
  };

  const handleDelete = (id: string) => {
    saveStorage.deletePlaythrough(id);
    setPlaythroughs(saveStorage.listPlaythroughs());
    setConfirmDeleteId(null);
  };

  const deleteTarget = playthroughs.find(p => p.id === confirmDeleteId);

  return (
    <div className="landing-screen">
      <div className="landing-brand">
        <div className="brand-mark" style={{ width: 56, height: 56, margin: '0 auto 16px' }} />
        <div className="landing-title">NULL // PROTOCOL</div>
        <div className="landing-subtitle">Select a playthrough, or jack in fresh.</div>
      </div>

      <div className="landing-list">
        {playthroughs.length === 0 && (
          <div className="landing-empty">No playthroughs yet. Create one to get started.</div>
        )}

        {playthroughs.map(p => (
          <div className="landing-card" key={p.id}>
            <div className="landing-card-info">
              <div className="landing-card-name">{p.characterName}</div>
              <div className="landing-card-meta">PL {p.powerLevel} &nbsp;•&nbsp; Last played {formatLastPlayed(p.lastPlayedAt)}</div>
            </div>
            <div className="landing-card-actions">
              <button className="end-turn-btn" onClick={() => handleContinue(p.id)}>Continue</button>
              <button
                className="landing-delete-btn"
                onClick={() => setConfirmDeleteId(p.id)}
                aria-label={`Delete ${p.characterName}`}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="landing-new-btn" onClick={() => setShowNewModal(true)}>+ New Playthrough</button>

      {showNewModal && (
        <NewPlaythroughModal onCreate={handleCreate} onCancel={() => setShowNewModal(false)} />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Playthrough"
          message={`Permanently delete "${deleteTarget.characterName}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}