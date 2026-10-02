import React from 'react';
import { useSnapshotSelector, getMissionState, getRootSnapshot } from '../../state/useSnapshot';
import { useProvider } from '../../state/ProviderContext';
import { Button } from '../ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/tooltip';

export function ControlPanel() {
  const provider = useProvider();
  const snapshot = useSnapshotSelector(getRootSnapshot);
  const mission = snapshot.mission;
  const capabilities = provider.capabilities;

  const handleStart = () => {
    if (mission.state === 'GOAL_REACHED' || mission.state === 'ERROR') {
      provider.resetMission().then(() => provider.startMission());
    } else {
      provider.startMission();
    }
  };

  const handleStop = () => provider.stopMission();
  const handleReset = () => provider.resetMission();

  const isRunning = mission.state !== 'IDLE' && mission.state !== 'STOPPED' && mission.state !== 'ERROR' && mission.state !== 'GOAL_REACHED';
  const startLabel = (mission.state === 'GOAL_REACHED' || mission.state === 'ERROR') ? 'RESTART' : 'START';

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input (not that we have any, but good practice)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        isRunning ? handleStop() : handleStart();
      }
      if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isRunning, mission.state]);

  const showDevSpeed = new URLSearchParams(window.location.search).has('dev') && capabilities.simulationSpeedControl;

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <span className="panel-title">CONTROL</span>
      </div>
      <div className="panel-content flex flex-col gap-4 overflow-y-auto">
        
        {/* Mode selector */}
        <div className="flex bg-[var(--panel-raised)] p-1 rounded">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-1">
                  <Button 
                    variant={mission.mode === 'MANUAL' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="w-full text-xs" 
                    disabled={!capabilities.manualControl}
                    onClick={() => provider.setMode('MANUAL')}
                  >
                    MANUAL
                  </Button>
                </div>
              </TooltipTrigger>
              {!capabilities.manualControl && (
                <TooltipContent>Requires backend connection</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <Button 
            variant={mission.mode === 'AUTONOMOUS' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="flex-1 text-xs bg-[var(--border)]"
            onClick={() => provider.setMode('AUTONOMOUS')}
          >
            AUTONOMOUS
          </Button>
        </div>

        {/* Start / Stop */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="ok" 
            disabled={isRunning}
            onClick={handleStart}
            className="font-bold tracking-wider"
          >
            {startLabel}
          </Button>
          <Button 
            variant="destructive"
            disabled={!isRunning}
            onClick={handleStop}
            className="font-bold tracking-wider"
          >
            STOP
          </Button>
        </div>

        {/* D-Pad Placeholder */}
        <div className="flex-1 bg-[var(--panel-raised)] rounded flex flex-col items-center justify-center p-4 opacity-50 relative">
          <div className="absolute top-2 left-2 right-2 text-center text-[10px] text-[var(--text-dim)] font-bold">
            MANUAL CONTROL: REQUIRES BACKEND
          </div>
          <div className="grid grid-cols-3 grid-rows-3 gap-1 w-24 h-24 mt-4">
             <div/>
             <Button variant="outline" size="icon" disabled className="w-full h-full">↑</Button>
             <div/>
             <Button variant="outline" size="icon" disabled className="w-full h-full">←</Button>
             <Button variant="destructive" size="icon" disabled className="w-full h-full text-[10px]">STOP</Button>
             <Button variant="outline" size="icon" disabled className="w-full h-full">→</Button>
             <div/>
             <Button variant="outline" size="icon" disabled className="w-full h-full">↓</Button>
             <div/>
          </div>
        </div>

        {/* Bottom hints */}
        <div className="text-[10px] text-[var(--text-dim)] flex flex-col gap-1">
          {snapshot.source === 'SIMULATION' && <div>COMMANDS ACT ON SIMULATION</div>}
        </div>
      </div>
    </div>
  );
}
