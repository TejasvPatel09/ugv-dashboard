import React from 'react';
import { useSnapshotSelector, getTelemetry } from '../../state/useSnapshot';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

function formatMMSS(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TelemetryPanel() {
  const telemetry = useSnapshotSelector(getTelemetry);

  const getBatteryColor = (pct: number) => {
    if (pct > 30) return 'bg-[var(--ok)]';
    if (pct > 15) return 'bg-[var(--warn)]';
    return 'bg-[var(--crit)]';
  };

  return (
    <div className="panel h-full">
      <div className="panel-header">
        <span className="panel-title">TELEMETRY</span>
        {telemetry.simulated && <Badge variant="sim" className="h-4 text-[9px] px-1">SIM</Badge>}
      </div>
      <div className="panel-content flex flex-col justify-between py-4">
        
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="mono-label">CPU</span>
            <span className="mono-value text-sm">{Math.round(telemetry.cpuPct)}%</span>
          </div>
          <Progress value={telemetry.cpuPct} indicatorColor="bg-[var(--ok)]" className="h-1.5" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="mono-label">RAM</span>
            <span className="mono-value text-sm">{Math.round(telemetry.ramPct)}%</span>
          </div>
          <Progress value={telemetry.ramPct} indicatorColor="bg-[var(--ok)]" className="h-1.5" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="mono-label">BATTERY</span>
            <span className="mono-value text-sm">{Math.round(telemetry.batteryPct)}%</span>
          </div>
          <Progress value={telemetry.batteryPct} indicatorColor={getBatteryColor(telemetry.batteryPct)} className="h-1.5" />
        </div>

        <div className="flex justify-between items-center bg-[var(--panel-raised)] p-2 rounded mt-2">
          <span className="mono-label">UPTIME</span>
          <span className="mono-value text-sm">{formatMMSS(telemetry.uptimeSec)}</span>
        </div>

      </div>
    </div>
  );
}
