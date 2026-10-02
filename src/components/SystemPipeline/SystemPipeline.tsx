import React from 'react';
import { useSnapshotSelector, getSystemStatus } from '../../state/useSnapshot';
import { COMPONENT_STATUS_UI } from '../../constants/labels';
import { Badge } from '../ui/badge';

export function SystemPipeline() {
  const system = useSnapshotSelector(getSystemStatus);
  // hide freq unless flag on
  const showFrequencies = system.frequenciesHz !== undefined;

  const components = [
    { name: 'CAMERA', status: system.camera, freq: system.frequenciesHz?.camera },
    { name: 'PERCEPTION', status: system.perception, freq: system.frequenciesHz?.perception },
    { name: 'LOCALIZATION', status: system.localization, freq: system.frequenciesHz?.localization },
    { name: 'PLANNER', status: system.planner, freq: system.frequenciesHz?.planner },
    { name: 'CONTROLLER', status: system.controller, freq: system.frequenciesHz?.controller },
  ];

  return (
    <div className="panel h-full">
      <div className="panel-header">
        <span className="panel-title">SYSTEM PIPELINE</span>
      </div>
      <div className="panel-content flex flex-col justify-between py-4">
        {components.map((comp, i) => {
          const ui = COMPONENT_STATUS_UI[comp.status];
          return (
            <div key={comp.name} className="flex flex-col relative group">
              <div className="flex justify-between items-center z-10 relative">
                <div className="flex items-center gap-3 bg-[var(--panel)] pr-2">
                  <div className="relative flex items-center justify-center w-3 h-3">
                     <span className={`w-3 h-3 rounded-full absolute ${ui.colorClass.split(' ')[1]}`} />
                     {ui.isPulsing && <span className={`w-3 h-3 rounded-full absolute ${ui.colorClass.split(' ')[1]} animate-ping`} />}
                  </div>
                  <span className="mono-label tracking-widest">{comp.name}</span>
                </div>
                
                <div className="flex items-center gap-3 bg-[var(--panel)] pl-2">
                  <span className={`mono-text text-[11px] ${ui.colorClass.split(' ')[0]}`}>{ui.text}</span>
                  {showFrequencies && comp.freq && (
                    <div className="flex items-center gap-1 opacity-70">
                      <span className="mono-value text-[14px]">{comp.freq.toFixed(1)}</span>
                      <span className="mono-label">Hz</span>
                      <Badge variant="sim" className="h-4 text-[9px] px-1 ml-1">SIM</Badge>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Connector line */}
              {i < components.length - 1 && (
                <div className="absolute left-1.5 top-3 w-px h-6 bg-[var(--border)] -z-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
