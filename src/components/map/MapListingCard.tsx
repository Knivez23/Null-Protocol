import type { MapListing } from '../../types';
import { components } from '../../data/components';

interface MapListingCardProps {
  listing: MapListing;
  onSelect: (listing: MapListing) => void;
}

export default function MapListingCard({ listing, onSelect }: MapListingCardProps) {
  const componentIcons = listing.availableComponents
    .map(id => components.find(c => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="map-card">
      <div className="map-card-head">
        <div className="map-card-icon">T{listing.tier}</div>
        <div className="map-card-title-block">
          <div className="map-card-name">{listing.name}</div>
          <div className="map-card-pl">Required PL <b>{listing.requiredPL}</b></div>
          <div className="map-card-seed-debug">seed: {listing.seed}</div>{/* DEV ONLY — remove once map browsing is stable */}
        </div>
      </div>

      <div className="map-card-stats">
        <div className="map-card-stat"><span>Rooms</span><b>{listing.roomCount}</b></div>
      </div>

      <div className="map-card-section">
        <div className="map-card-section-label">Components</div>
        <div className="map-card-chip-row">
          {componentIcons.map(c => (
            <img key={c.id} src={c.icon} alt={c.name} title={c.name} className="map-card-component-icon" />
          ))}
        </div>
      </div>

      <div className="map-card-section">
        <div className="map-card-section-label">Schematics</div>
        <div className="map-card-tag-row">
          {listing.availableSchematics.map(s => (
            <span key={s.id} className="map-card-tag">{s.name}</span>
          ))}
        </div>
      </div>

      {listing.modifiers.length > 0 && (
        <div className="map-card-section">
          <div className="map-card-section-label">Map Modifiers</div>
          <div className="map-card-tag-row modifiers">
            {listing.modifiers.map(m => (
              <span key={m.id} className="map-card-tag modifier" title={m.description}>{m.name}</span>
            ))}
          </div>
        </div>
      )}

      <button className="map-card-select-btn" onClick={() => onSelect(listing)}>Jack In</button>
    </div>
  );
}