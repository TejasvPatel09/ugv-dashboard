import { MissionSnapshot, MissionMode } from '../domain/types';

export type Unsubscribe = () => void;
export interface CommandResult { ok: boolean; message?: string }

export interface DataProvider {
  getSnapshot(): MissionSnapshot;                       // latest snapshot, synchronous
  subscribe(listener: (s: MissionSnapshot) => void): Unsubscribe;

  startMission(): Promise<CommandResult>;               // IDLE -> start; STOPPED -> resume
  stopMission(): Promise<CommandResult>;
  resetMission(): Promise<CommandResult>;               // back to IDLE with fresh scenario
  setMode(mode: MissionMode): Promise<CommandResult>;

  readonly capabilities: {
    manualControl: boolean;      // mock: false
    speedControl: boolean;       // mock: false
    simulationSpeedControl: boolean; // mock: true (dev/recording only)
  };
}
