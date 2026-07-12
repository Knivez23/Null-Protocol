import type { NullState, ResourceBank as ResourceBankType, ResourceBankUpgrades, NullUpgradeTrackId } from '../../types';
import { nodes } from '../../data/nodes';
import {
  deployToNode,
  redeployToNode,
  recallAndUnload,
  upgradeTrack,
  upgradeResourceBank,
} from '../../engine/nullScavenger';
import NullStatusPanel from './NullStatusPanel';
import NullUpgradesPanel from './NullUpgradesPanel';
import NodeCard from './NodeCard';
import ResourceBankPanel from './ResourceBankPanel';
import ResourceBankUpgradesPanel from './ResourceBankUpgradesPanel';

interface IdleScreenProps {
  nullState: NullState;
  setNullState: React.Dispatch<React.SetStateAction<NullState>>;
  bank: ResourceBankType;
  setBank: React.Dispatch<React.SetStateAction<ResourceBankType>>;
  bankUpgrades: ResourceBankUpgrades;
  setBankUpgrades: React.Dispatch<React.SetStateAction<ResourceBankUpgrades>>;
}

export default function IdleScreen({ nullState, setNullState, bank, setBank, bankUpgrades, setBankUpgrades }: IdleScreenProps) {
  // NOTE: the tick loop that actually advances Null lives in App.tsx now, not
  // here — this component unmounts whenever the player navigates to a
  // different section, which used to kill the setInterval along with it.
  // App.tsx never unmounts while in the 'game' screen, so the loop survives
  // navigation. This component is display + actions only.

  const handleDeploy = (nodeId: string) => {
    if (nullState.status === 'idle') {
      setNullState(deployToNode(nullState, nodeId));
    } else {
      // Switching nodes while already farming/cargoFull auto-recalls first —
      // matches the locked "instant and free" redeploy design.
      const result = redeployToNode(nullState, nodeId, bank, bankUpgrades);
      setNullState(result.nullState);
      setBank(result.bank);
    }
  };

  const handleRecall = () => {
    const result = recallAndUnload(nullState, bank, bankUpgrades);
    setNullState(result.nullState);
    setBank(result.bank);
  };

  const handleUpgrade = (track: NullUpgradeTrackId) => {
    // TODO: deduct real Credits/Components once upgrade costs are enforced,
    // not just displayed — currently rank-only.
    setNullState(upgradeTrack(nullState, track));
  };

  const handleBankUpgrade = (componentId: string) => {
    // TODO: deduct real Credits once the Credits economy is designed —
    // currently rank-only, cost is flat 0 and display-only.
    setBankUpgrades(prev => upgradeResourceBank(prev, componentId));
  };

  return (
    <div className="maps-screen">
      <div className="maps-screen-head">
        <div className="panel-head" style={{ border: 'none', padding: 0 }}>// Null Scavenger</div>
      </div>
      <div className="app-3col-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <NullStatusPanel nullState={nullState} onRecall={handleRecall} />
          <NullUpgradesPanel nullState={nullState} onUpgrade={handleUpgrade} />
        </div>

        <div className="map-card-grid">
          {nodes.map(node => (
            <NodeCard key={node.id} node={node} nullState={nullState} onDeploy={handleDeploy} />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ResourceBankPanel bank={bank} bankUpgrades={bankUpgrades} />
          <ResourceBankUpgradesPanel bankUpgrades={bankUpgrades} onUpgrade={handleBankUpgrade} />
        </div>
      </div>
    </div>
  );
}