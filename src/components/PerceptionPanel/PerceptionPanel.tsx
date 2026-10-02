import React, { useEffect, useState } from 'react';
import { useSnapshotSelector, getPerceptionState } from '../../state/useSnapshot';
import { COMPONENT_STATUS_UI } from '../../constants/labels';
import { Badge } from '../ui/badge';

export function PerceptionPanel() {
  const perception = useSnapshotSelector(getPerceptionState);
  const ui = COMPONENT_STATUS_UI[perception.status];
  const [flash, setFlash] = useState(false);
  const [prevObs, setPrevObs] = useState(perception.obstaclesDetected);

  useEffect(() => {
    if (perception.obstaclesDetected > prevObs) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 800);
      return () => clearTimeout(timer);
    }
    setPrevObs(perception.obstaclesDetected);
  }, [perception.obstaclesDetected, prevObs]);

  return (
    <div className="panel h-full">
      <div className="panel-header">
        <span className="panel-title">PERCEPTION</span>
      </div>
      <div className="panel-content flex flex-col justify-between">
        
        <div className={`flex justify-between items-center p-2 rounded transition-colors ${flash ? 'bg-[var(--crit)]/20' : 'bg-[var(--panel-raised)]'}`}>
          <span className="mono-label">OBSTACLES DETECTED</span>
          <span className={`mono-value ${perception.obstaclesDetected > 0 ? 'text-[var(--crit)]' : 'text-[var(--ok)]'}`}>
            {perception.obstaclesDetected}
          </span>
        </div>

        <div className="flex justify-between items-center p-2 border-b border-[var(--border)]">
          <span className="mono-label">NEAREST OBSTACLE</span>
          <span className="mono-value">
            {perception.nearestObstacleM !== null ? `${perception.nearestObstacleM.toFixed(1)} m` : '—'}
          </span>
        </div>

        <div className="flex justify-between items-center p-2 border-b border-[var(--border)]">
          <span className="mono-label flex items-center gap-2">
            TERRAIN
            <Badge variant="sim" className="h-4 text-[9px] px-1">SIM</Badge>
          </span>
          <span className="mono-value text-sm">{perception.terrain}</span>
        </div>

        <div className="flex justify-between items-center p-2">
          <span className="mono-label">STATUS</span>
          <span className={`mono-text text-sm ${ui.colorClass.split(' ')[0]}`}>{ui.text}</span>
        </div>

      </div>
    </div>
  );
}
