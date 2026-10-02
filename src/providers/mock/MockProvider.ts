import { DataProvider, CommandResult, Unsubscribe } from '../DataProvider';
import { MissionSnapshot, MissionMode } from '../../domain/types';
import { SimulationEngine } from '../../sim/engine';

export class MockProvider implements DataProvider {
  engine: SimulationEngine;

  capabilities = {
    manualControl: true,
    speedControl: false,
    simulationSpeedControl: true,
  };

  constructor() {
    this.engine = new SimulationEngine();
    // Start engine if autostart query param is present
    const urlParams = new URLSearchParams(window.location.search);
    const timeScale = urlParams.has('speed') ? parseFloat(urlParams.get('speed')!) : 1;
    this.engine.startEngine(timeScale);
    if (urlParams.has('autostart')) {
      setTimeout(() => this.engine.startMission(), 500); // small delay to let UI mount
    }
  }

  getSnapshot(): MissionSnapshot {
    return this.engine.getSnapshot();
  }

  subscribe(listener: (s: MissionSnapshot) => void): Unsubscribe {
    return this.engine.subscribe(listener);
  }

  startMission(): Promise<CommandResult> {
    return this.engine.startMission();
  }

  stopMission(): Promise<CommandResult> {
    return this.engine.stopMission();
  }

  resetMission(): Promise<CommandResult> {
    return this.engine.resetMission();
  }

  setMode(mode: MissionMode): Promise<CommandResult> {
    return this.engine.setMode(mode);
  }
}
