import React, { useState, useEffect } from 'react';
import { useSnapshotSelector, getMissionSummary } from '../../state/useSnapshot';
import { useProvider } from '../../state/ProviderContext';
import { Button } from '../ui/button';
import { CheckCircle2 } from 'lucide-react';

function formatMMSS(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function MissionSummaryOverlay() {
  const summary = useSnapshotSelector(getMissionSummary);
  const provider = useProvider();
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (summary && !closed) {
      setVisible(true);
    }
    if (!summary) {
      setClosed(false);
      setVisible(false);
    }
  }, [summary, closed]);

  if (!visible || !summary) return null;

  const handleReplay = () => {
    provider.resetMission().then(() => provider.startMission());
    setClosed(true);
  };
  
  const distStr = summary.distanceTravelledM >= 1000 
    ? `${(summary.distanceTravelledM / 1000).toFixed(2)} km` 
    : `${Math.round(summary.distanceTravelledM)} m`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]/80 backdrop-blur-sm animate-fade-in">
      <div className="panel w-[400px] shadow-2xl border-[var(--ok)] border-2">
        <div className="panel-header bg-[var(--ok)]/10 py-4 justify-center">
          <CheckCircle2 className="text-[var(--ok)] w-6 h-6 mr-2" />
          <span className="text-[var(--ok)] font-bold tracking-widest text-lg">MISSION COMPLETE</span>
        </div>
        
        <div className="panel-content p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
            <span className="mono-label">DISTANCE TRAVELLED</span>
            <span className="mono-value">{distStr}</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
            <span className="mono-label">MISSION DURATION</span>
            <span className="mono-value">{formatMMSS(summary.durationSec)}</span>
          </div>

          <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
            <span className="mono-label">OBSTACLES ENCOUNTERED</span>
            <span className="mono-value">{summary.obstaclesEncountered}</span>
          </div>

          <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
            <span className="mono-label">PATH REPLANS</span>
            <span className="mono-value">{summary.replans}</span>
          </div>

          <div className="flex justify-between items-center pb-2">
            <span className="mono-label">GOAL REACHED</span>
            <span className="mono-text text-[var(--ok)] font-bold">{summary.goalReached ? 'YES' : 'NO'}</span>
          </div>

          <div className="flex gap-4 mt-4">
             <Button variant="outline" className="flex-1" onClick={() => setClosed(true)}>CLOSE</Button>
             <Button variant="ok" className="flex-1 font-bold" onClick={handleReplay}>REPLAY MISSION</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
