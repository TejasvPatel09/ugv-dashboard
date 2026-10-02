import React, { useEffect, useState } from 'react';
import { useSnapshotSelector } from '../../state/useSnapshot';
import { getRootSnapshot } from '../../state/useSnapshot';
import { Badge } from '../ui/badge';
import { DataSource, ConnectionState } from '../../domain/types';

const CONNECTION_UI: Record<ConnectionState, { text: string, colorClass: string, isPulsing?: boolean }> = {
  CONNECTED: { text: 'SYSTEM ONLINE', colorClass: 'bg-[var(--ok)] text-[var(--bg)]' },
  CONNECTING: { text: 'CONNECTING', colorClass: 'bg-[var(--info)] text-[var(--bg)]', isPulsing: true },
  DISCONNECTED: { text: 'SYSTEM OFFLINE', colorClass: 'bg-[var(--idle)] text-[var(--text)]' },
  STALE: { text: 'DATA STALE', colorClass: 'bg-[var(--warn)] text-[var(--bg)]' }
};

export function Header() {
  const snapshot = useSnapshotSelector(getRootSnapshot);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString('en-GB', { hour12: false }));
    };
    updateTime();
    const intv = setInterval(updateTime, 1000);
    return () => clearInterval(intv);
  }, []);

  const sourceConfig = snapshot.source === 'SIMULATION'
    ? { text: 'SIMULATION MODE', variant: 'sim' as const }
    : { text: 'REAL ROBOT', variant: 'real' as const };
    
  const connUi = CONNECTION_UI[snapshot.connection];

  return (
    <header className="h-16 shrink-0 bg-[var(--panel-raised)] border-b border-[var(--border)] px-6 flex items-center justify-between">
      <div className="flex flex-col justify-center">
        <h1 className="text-lg font-bold tracking-widest text-[var(--text)] leading-tight m-0">UGV MISSION CONTROL</h1>
        <div className="text-[10px] uppercase tracking-widest text-[var(--text-dim)]">VISION-BASED AUTONOMOUS NAVIGATION FOR UGV</div>
      </div>
      
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="h-6">SIH PROTOTYPE</Badge>
        
        <Badge variant={sourceConfig.variant} className="h-6 gap-1.5 flex items-center">
          {snapshot.source === 'SIMULATION' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--info)] block" />}
          {sourceConfig.text}
        </Badge>
        
        <Badge variant="default" className={`h-6 gap-1.5 ${connUi.colorClass} border-transparent flex items-center`}>
          {connUi.isPulsing && <span className="w-1.5 h-1.5 rounded-full bg-[var(--bg)] animate-pulse block" />}
          {connUi.text}
        </Badge>

        <div className="mono-value text-[20px] ml-4 min-w-[100px] text-right">
          {timeStr}
        </div>
      </div>
    </header>
  );
}
