import { DataProvider, CommandResult, Unsubscribe } from '../DataProvider';
import { MissionSnapshot, MissionMode } from '../../domain/types';

// STUB ONLY
// Intended mapping:
// GET /api/robot/state
// GET /api/mission/status
// GET /api/system/status
// POST /api/mission/start
// POST /api/mission/stop
// POST /api/robot/mode
// WS /ws/robot

export class ApiProvider implements DataProvider {
  capabilities = {
    manualControl: true,
    speedControl: true,
    simulationSpeedControl: false,
  };

  getSnapshot(): MissionSnapshot {
    throw new Error('ApiProvider not implemented');
  }

  subscribe(listener: (s: MissionSnapshot) => void): Unsubscribe {
    throw new Error('ApiProvider not implemented');
  }

  async startMission(): Promise<CommandResult> {
    throw new Error('ApiProvider not implemented');
  }

  async stopMission(): Promise<CommandResult> {
    throw new Error('ApiProvider not implemented');
  }

  async resetMission(): Promise<CommandResult> {
    throw new Error('ApiProvider not implemented');
  }

  async setMode(mode: MissionMode): Promise<CommandResult> {
    throw new Error('ApiProvider not implemented');
  }
}
