export const SCENARIO = {
  seed: 42,
  world: { width: 120, height: 70 },
  start: { x: 8, y: 35 },
  goal: { x: 112, y: 35 },
  goalName: 'GOAL',
  goalReachedRadiusM: 1.0,

  initialPath: [ {x:8,y:35}, {x:36,y:35}, {x:72,y:35}, {x:112,y:35} ],

  obstacle: { id: 'OBS-1', x: 60, y: 35, radius: 3.5, safetyRadius: 6.5 },
  detectionRangeM: 16,

  // Detour that clears the obstacle's safety radius. First point is replaced by the robot's stop position.
  detourWaypoints: [ {x:50,y:44}, {x:60,y:46}, {x:70,y:44}, {x:78,y:35}, {x:112,y:35} ],

  cruiseSpeed: 1.6,         // m/s
  accel: 1.0,               // m/s^2
  brakeDecel: 1.6,          // m/s^2
  maxTurnRateDegPerSec: 60,

  init: { // seconds after START; component goes INITIALIZING -> READY at these times
    camera: 1.0, perception: 2.0, localization: 3.0, planner: 4.0, controller: 5.0,
    pathGeneratedAt: 5.8, navStartAt: 6.5
  },
  obstacleHoldSec: 2.0,     // OBSTACLE_DETECTED state duration (robot stopped)
  replanSec: 2.5,           // REPLANNING duration
  obstacleClearedBehindM: 5, // obstacle counted as cleared this far past it
  goalSummaryDelaySec: 2.0, // GOAL_REACHED shown before summary overlay

  showFrequencies: false,
  eventLogMax: 50,
  telemetry: { cpuBase: 42, cpuNoise: 6, ramBase: 51, ramNoise: 2, batteryStart: 87, batteryDrainPerMin: 0.4 },
  terrain: 'ROUGH' as const,
};
