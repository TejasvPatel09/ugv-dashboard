import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../src/sim/engine';

describe('Simulation Engine', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();
  });

  it('runs scenario to completion in correct order', async () => {
    const states: string[] = [];
    const events: string[] = [];

    // Subscribe to record state transitions
    let lastState = '';
    engine.subscribe((s) => {
      if (s.mission.state !== lastState) {
        states.push(s.mission.state);
        lastState = s.mission.state;
      }
    });

    // Start mission
    await engine.startMission();
    
    // Fast forward by calling update manually until goal is reached or max ticks
    let ticks = 0;
    while (engine.machine.snapshot.mission.state !== 'GOAL_REACHED' && ticks < 3000) {
      engine.machine.update(0.05);
      // Manually push state transitions since we bypassed setInterval
      const currentState = engine.machine.snapshot.mission.state;
      if (currentState !== lastState) {
        states.push(currentState);
        lastState = currentState;
      }
      ticks++;
    }
    
    // Give it a bit more time to trigger the summary overlay delay
    let summaryTicks = 0;
    while (!engine.machine.snapshot.summary && summaryTicks < 100) {
      engine.machine.update(0.05);
      summaryTicks++;
    }

    const s = engine.machine.snapshot;

    // Check states
    expect(states).toEqual([
      'IDLE', 
      'INITIALIZING', 
      'FOLLOWING_PATH', 
      'OBSTACLE_DETECTED', 
      'REPLANNING', 
      'FOLLOWING_PATH', 
      'GOAL_REACHED'
    ]);

    // Check obstacles
    expect(s.map.obstacles.length).toBeGreaterThan(0);
    // Obstacle should be cleared at the end
    expect(s.perception.obstaclesDetected).toBe(0);

    // Check summary
    expect(s.summary).not.toBeNull();
    expect(s.summary?.replans).toBe(1);
    expect(s.summary?.obstaclesEncountered).toBe(1);
    expect(s.summary?.goalReached).toBe(true);
    // distance roughly 113m
    expect(s.summary?.distanceTravelledM).toBeGreaterThan(110);
    expect(s.summary?.distanceTravelledM).toBeLessThan(116);
    expect(s.mission.progress).toBeGreaterThan(0.98);

    // Reset works
    await engine.resetMission();
    expect(engine.machine.snapshot.mission.state).toBe('IDLE');
    expect(engine.machine.snapshot.mission.elapsedSec).toBe(0);
  });
});
