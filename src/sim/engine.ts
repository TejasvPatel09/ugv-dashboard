import { MissionStateMachine } from './missionStateMachine';
import { MissionSnapshot, MissionMode } from '../domain/types';
import { CommandResult } from '../providers/DataProvider';

export class SimulationEngine {
  machine: MissionStateMachine;
  listeners: Set<(s: MissionSnapshot) => void> = new Set();
  
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private timeScale: number = 1;
  private readonly dt = 0.05; // 20 Hz
  private lastTime = 0;
  private previousState: MissionStateName = 'IDLE';

  constructor() {
    this.machine = new MissionStateMachine();
  }

  getSnapshot() {
    return this.machine.snapshot;
  }
  
  subscribe(listener: (s: MissionSnapshot) => void) {
    this.listeners.add(listener);
    // emit immediately
    listener(this.machine.snapshot);
    return () => this.listeners.delete(listener);
  }
  
  emit() {
    for (const l of this.listeners) {
      l(this.machine.snapshot);
    }
  }
  
  startEngine(timeScale: number = 1) {
    this.timeScale = timeScale;
    if (this.intervalId) return;
    
    // We run the interval at real time divided by timescale, 
    // but advance by dt in simulation time.
    // To ensure exact dt steps, we use a fixed interval of dt * 1000 / timescale.
    const intervalMs = (this.dt * 1000) / this.timeScale;
    this.intervalId = setInterval(() => {
      this.machine.update(this.dt);
      this.emit();
    }, intervalMs);
  }
  
  stopEngine() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async startMission(): Promise<CommandResult> {
    if (this.machine.snapshot.mission.state === 'IDLE' || this.machine.snapshot.mission.state === 'STOPPED') {
       const m = this.machine.snapshot.mission;
       if (m.state === 'STOPPED') {
          m.mode = 'AUTONOMOUS';
          m.state = (this.previousState && this.previousState !== 'STOPPED' && this.previousState !== 'IDLE') ? this.previousState : 'FOLLOWING_PATH';
          this.machine.logEvent('Mission resumed');
       } else {
         this.machine.start();
       }
       if (!this.intervalId) this.startEngine(this.timeScale);
       return { ok: true };
    }
    return { ok: false, message: 'Cannot start from current state' };
  }
  
  async stopMission(): Promise<CommandResult> {
    const s = this.machine.snapshot;
    if (s.mission.state !== 'IDLE' && s.mission.state !== 'STOPPED' && s.mission.state !== 'ERROR' && s.mission.state !== 'GOAL_REACHED') {
       this.previousState = s.mission.state;
       s.mission.mode = 'STOPPED';
       s.mission.state = 'STOPPED';
       s.robot.speed = 0; 
       this.machine.logEvent('Mission stopped by operator', 'WARNING');
       this.emit();
       return { ok: true };
    }
    return { ok: false, message: 'Already stopped or idle' };
  }
  
  async resetMission(): Promise<CommandResult> {
    this.stopEngine();
    this.machine.reset();
    this.emit();
    return { ok: true };
  }
  
  async setMode(mode: MissionMode): Promise<CommandResult> {
     if (mode === 'STOPPED') {
        return this.stopMission();
     } else if (mode === 'AUTONOMOUS') {
        if (this.machine.snapshot.mission.mode === 'STOPPED') return this.startMission();
        this.machine.snapshot.mission.mode = 'AUTONOMOUS';
        this.emit();
        return { ok: true };
     } else if (mode === 'MANUAL') {
        this.machine.snapshot.mission.mode = 'MANUAL';
        this.emit();
        return { ok: true };
     }
     return { ok: false, message: 'Mode not supported' };
  }
}
