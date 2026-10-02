import React from 'react';
import { useSnapshotSelector, getRobotState, getMissionState } from '../../state/useSnapshot';
import { GOAL_STATUS_UI } from '../../constants/labels';

export function RobotStatePanel() {
  const robot = useSnapshotSelector(getRobotState);
  const mission = useSnapshotSelector(getMissionState);

  const goalUi = GOAL_STATUS_UI[mission.goalStatus];

  return (
    <div className="panel h-full">
      <div className="panel-header">
        <span className="panel-title">ROBOT STATE</span>
      </div>
      <div className="panel-content flex flex-col gap-4 overflow-y-auto">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="mono-label">X</span>
            <div className="mono-value">{robot.x.toFixed(1)} <span className="text-sm text-[var(--text-dim)]">m</span></div>
          </div>
          <div className="flex flex-col">
            <span className="mono-label">Y</span>
            <div className="mono-value">{robot.y.toFixed(1)} <span className="text-sm text-[var(--text-dim)]">m</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="mono-label">HEADING</span>
            <div className="mono-value">{Math.round(robot.heading)}°</div>
          </div>
          <div className="flex flex-col">
            <span className="mono-label">SPEED</span>
            <div className="mono-value">{robot.speed.toFixed(1)} <span className="text-sm text-[var(--text-dim)]">m/s</span></div>
          </div>
        </div>

        <div className="flex justify-between items-center bg-[var(--panel-raised)] p-2 rounded">
          <span className="mono-label">LOCALIZATION</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${robot.localization === 'TRACKING' ? 'bg-[var(--ok)]' : 'bg-[var(--warn)]'}`} />
            <span className="mono-text text-sm">{robot.localization}</span>
          </div>
        </div>

        <div className="h-px bg-[var(--border)] my-1" />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="mono-label">GOAL</span>
            <div className="mono-value">{mission.goalName}</div>
          </div>
          <div className="flex flex-col">
            <span className="mono-label">GOAL RANGE</span>
            <div className="mono-value">{mission.goalRange.toFixed(0)} <span className="text-sm text-[var(--text-dim)]">m</span></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center bg-[var(--panel-raised)] p-2 rounded">
          <span className="mono-label">GOAL STATUS</span>
          <span className={`mono-text text-sm ${goalUi.colorClass}`}>{goalUi.text}</span>
        </div>

      </div>
    </div>
  );
}
