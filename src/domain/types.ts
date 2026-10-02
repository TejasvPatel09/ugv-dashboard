export type Vec2 = { x: number; y: number };

export type DataSource = 'SIMULATION' | 'REAL_ROBOT';
export type ConnectionState = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'STALE';

export type ComponentStatus = 'OFFLINE' | 'INITIALIZING' | 'READY' | 'ACTIVE' | 'WARNING' | 'ERROR';
export type LocalizationQuality = 'TRACKING' | 'DEGRADED' | 'LOST' | 'UNKNOWN';

export type MissionMode = 'MANUAL' | 'AUTONOMOUS' | 'STOPPED';
export type MissionStateName =
  | 'IDLE' | 'INITIALIZING' | 'FOLLOWING_PATH' | 'OBSTACLE_DETECTED'
  | 'REPLANNING' | 'GOAL_REACHED' | 'STOPPED' | 'ERROR';

export type GoalStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED' | 'REACHED';
export type Terrain = 'FLAT' | 'ROUGH' | 'UNKNOWN';
export type EventSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface RobotState {
  x: number; y: number;        // metres, local frame
  heading: number;             // degrees, 0-360, CCW from +x
  speed: number;               // m/s
  localization: LocalizationQuality;
}

export interface MissionState {
  mode: MissionMode;
  state: MissionStateName;
  progress: number;            // 0-1, never decreases within a mission
  distanceToGoal: number;      // metres along the CURRENT planned path
  goalRange: number;           // metres, straight-line to the goal
  goalName: string;            // 'GOAL'
  goalStatus: GoalStatus;
  elapsedSec: number;          // since START was pressed
}

export interface PerceptionState {
  obstaclesDetected: number;       // currently known obstacles in range
  nearestObstacleM: number | null;
  terrain: Terrain;
  status: ComponentStatus;
}

export interface SystemStatus {
  camera: ComponentStatus;
  perception: ComponentStatus;
  localization: ComponentStatus;
  planner: ComponentStatus;
  controller: ComponentStatus;
  frequenciesHz?: Partial<Record<keyof Omit<SystemStatus, 'frequenciesHz'>, number>>;
}

export interface CameraState {
  status: ComponentStatus;
  source: 'SIMULATED' | 'STREAM';
  fps: number | null;              // null = unknown/not applicable
  resolution: string | null;       // e.g. '640x480'
  lastFrameTs: number | null;
}

export interface TelemetryState {
  cpuPct: number; ramPct: number; batteryPct: number;
  uptimeSec: number;
  simulated: boolean;              // true -> UI shows SIM tag
}

export interface Obstacle { id: string; x: number; y: number; radius: number; safetyRadius: number; }

export interface PlannedPath { version: number; points: Vec2[]; }

export interface MapState {
  worldWidth: number; worldHeight: number;
  start: Vec2; goal: Vec2;
  plannedPath: PlannedPath | null;
  supersededPath: PlannedPath | null;   // previous path, shown faded briefly after a replan
  travelledPath: Vec2[];
  obstacles: Obstacle[];                // only obstacles currently KNOWN to the robot
  detectionRangeM: number;
}

export interface MissionEvent {
  id: string;
  ts: number;                      // epoch ms
  missionTimeSec: number;
  severity: EventSeverity;
  message: string;
}

export interface MissionSummary {
  distanceTravelledM: number;
  durationSec: number;
  obstaclesEncountered: number;
  replans: number;
  goalReached: boolean;
}

export interface MissionSnapshot {
  seq: number;                     // increments every snapshot
  timestamp: number;               // epoch ms when produced
  source: DataSource;
  connection: ConnectionState;
  robot: RobotState;
  mission: MissionState;
  perception: PerceptionState;
  system: SystemStatus;
  camera: CameraState;
  telemetry: TelemetryState;
  map: MapState;
  events: MissionEvent[];          // most recent N (config: 50), newest last
  summary: MissionSummary | null;  // non-null only after GOAL_REACHED
}
