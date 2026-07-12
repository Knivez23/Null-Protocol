import type { SlotIcon } from '../../data/equipmentVisuals';

interface GearIconProps {
  icon: SlotIcon;
  size?: number;
}

export default function GearIcon({ icon, size = 20 }: GearIconProps) {
  if (icon.type === 'image') {
    return <img src={icon.value} alt="" style={{ width: size, height: size, objectFit: 'contain' }} />;
  }
  return <span style={{ fontSize: size }}>{icon.value}</span>;
}