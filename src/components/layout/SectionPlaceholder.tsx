import type { SectionId } from '../../types';
import { sections } from '../../data/sections';

interface SectionPlaceholderProps {
  section: SectionId;
}

export default function SectionPlaceholder({ section }: SectionPlaceholderProps) {
  const meta = sections[section];
  return (
    <div className="panel" style={{ minHeight: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-mid)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '0.2em', color: 'var(--amber-bright)', marginBottom: '8px', textTransform: 'uppercase' }}>
          // {meta.label}
        </div>
        <div style={{ fontSize: '13px', letterSpacing: '0.05em' }}>System module not yet online.</div>
      </div>
    </div>
  );
}