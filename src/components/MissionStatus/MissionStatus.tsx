import React, { useEffect, useState } from 'react';
import { useSnapshotSelector, getMissionState } from '../../state/useSnapshot';
import { MISSION_STATE_UI } from '../../constants/labels';
import { Progress } from '../ui/progress';

function formatMMSS(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function MissionStatus() {
  const mission = useSnapshotSelector(getMissionState);
  const uiState = MISSION_STATE_UI[mission.state];

  // Flash on state change
  const [flash, setFlash] = useState(false);
  const [prevState, setPrevState] = useState(mission.state);

  useEffect(() => {
    if (mission.state !== prevState) {
      setFlash(true);
      setPrevState(mission.state);
      const timer = setTimeout(() => setFlash(false), 500);
      return () => clearTimeout(timer);
    }
  }, [mission.state, prevState]);

  return (
    <div className="h-24 bg-[var(--panel)] border-y border-[var(--border)] flex">
      <div className="flex-1 border-r border-[var(--border)] p-4 flex flex-col justify-center">
        <div className="panel-title mb-1">MODE</div>
        <div className="mono-value text-[var(--text)]">{mission.mode}</div>
      </div>
      
      <div className={`flex-[1.5] border-r border-[var(--border)] p-4 flex flex-col justify-center transition-colors ${flash ? 'bg-white/10' : ''}`}>
        <div className="panel-title mb-1">STATE</div>
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${uiState.colorClass.split(' ')[1]}`} />
          <div className={`text-sm md:text-base font-bold font-mono tracking-wider ${uiState.colorClass.split(' ')[0]}`}>{uiState.text}</div>
        </div>
      </div>

      <div className="flex-1 border-r border-[var(--border)] p-4 flex flex-col justify-center relative">
        <div className="panel-title mb-1">PROGRESS</div>
        <div className="mono-value text-[var(--text)]">{Math.round(mission.progress * 100)}%</div>
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
           <Progress value={mission.progress * 100} indicatorColor="bg-[var(--info)]" className="h-1" />
        </div>
      </div>

      <div className="flex-[1.2] border-r border-[var(--border)] p-4 flex flex-col justify-center">
        <div className="panel-title mb-1">DISTANCE TO GOAL (PATH)</div>
        <div className="mono-value text-[var(--text)]">{mission.distanceToGoal.toFixed(1)} <span className="mono-label">m</span></div>
      </div>

      <div className="flex-1 p-4 flex flex-col justify-center">
        <div className="panel-title mb-1">ELAPSED</div>
        <div className="mono-value text-[var(--text)]">{formatMMSS(mission.elapsedSec)}</div>
      </div>
    </div>
  );
}
