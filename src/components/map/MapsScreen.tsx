import { useState } from 'react';
import type { MapListing } from '../../types';
import { generateMapList, replaceListing } from '../../engine/mapListings';
import MapListingCard from './MapListingCard';

// TODO: replace with real player progression state once it exists.
// Placeholder assumption: player currently has Tiers 1-2 unlocked.
const PLACEHOLDER_UNLOCKED_TIERS = [1, 2];

export default function MapsScreen() {
  const [listings, setListings] = useState<MapListing[]>(() => generateMapList(PLACEHOLDER_UNLOCKED_TIERS));

  const handleSelect = (listing: MapListing) => {
    // TODO: this should launch the actual room-tree run once map generation
    // exists. For now: log the selection and backfill the slot with a fresh
    // listing, per the "replace-on-select" model (see engine/mapListings.ts).
    console.log(`[MAP SELECTED] seed=${listing.seed} tier=${listing.tier} — room tree generation not yet implemented`);
    setListings(prev => prev.map(l => (l.id === listing.id ? replaceListing(l) : l)));
  };

  return (
    <div className="maps-screen">
      <div className="maps-screen-head">
        <div className="panel-head" style={{ border: 'none', padding: 0 }}>// Available Maps</div>
      </div>
      <div className="map-card-grid">
        {listings.map(listing => (
          <MapListingCard key={listing.id} listing={listing} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}