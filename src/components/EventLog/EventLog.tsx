import React, { useRef, useEffect } from 'react';
import { useSnapshotSelector, getEvents } from '../../state/useSnapshot';
import { SEVERITY_UI } from '../../constants/labels';

function formatHHMMSS(epochMs: number) {
  const d = new Date(epochMs);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

export function EventLog() {
  const events = useSnapshotSelector(getEvents);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom.
    // Spec: "auto-scrolls unless the user scrolled up"
    const el = containerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    if (isAtBottom || events.length < 5) {
      el.scrollTop = el.scrollHeight;
    }
  }, [events]);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <span className="panel-title">EVENT LOG</span>
      </div>
      <div className="panel-content overflow-y-auto font-mono text-[11px] p-2" ref={containerRef}>
        <div className="flex flex-col gap-1 w-full">
          {events.map((ev) => {
            const ui = SEVERITY_UI[ev.severity];
            const isWarn = ev.severity === 'WARNING';
            return (
              <div key={ev.id} className={`flex items-start gap-3 py-1 animate-fade-in ${isWarn ? 'bg-[var(--warn)]/10 px-1 rounded' : 'px-1'}`}>
                <div className="text-[var(--text-dim)] shrink-0 w-[55px]">
                  {formatHHMMSS(ev.ts)}
                </div>
                <div className="shrink-0 w-3 pt-[2px]">
                   <span className={`block w-1.5 h-1.5 rounded-full ${ui.colorClass.replace('text', 'bg')}`} />
                </div>
                <div className={`${ui.colorClass} break-words leading-tight flex-1`}>
                  {ev.message}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
