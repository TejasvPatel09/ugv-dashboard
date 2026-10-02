import { ComponentStatus, MissionStateName, GoalStatus, EventSeverity } from '../domain/types';

export const COMPONENT_STATUS_UI: Record<ComponentStatus, { text: string, colorClass: string, isPulsing?: boolean }> = {
  OFFLINE: { text: 'OFFLINE', colorClass: 'text-idle bg-idle' },
  INITIALIZING: { text: 'INITIALIZING', colorClass: 'text-info bg-info', isPulsing: true },
  READY: { text: 'READY', colorClass: 'text-ok bg-ok' },
  ACTIVE: { text: 'ACTIVE', colorClass: 'text-info bg-info' },
  WARNING: { text: 'WARNING', colorClass: 'text-warn bg-warn' },
  ERROR: { text: 'ERROR', colorClass: 'text-crit bg-crit' },
};

export const MISSION_STATE_UI: Record<MissionStateName, { text: string, colorClass: string }> = {
  IDLE: { text: 'IDLE', colorClass: 'text-idle bg-idle' },
  INITIALIZING: { text: 'INITIALIZING', colorClass: 'text-info bg-info' },
  FOLLOWING_PATH: { text: 'FOLLOWING PATH', colorClass: 'text-info bg-info' },
  OBSTACLE_DETECTED: { text: 'OBSTACLE DETECTED', colorClass: 'text-crit bg-crit' },
  REPLANNING: { text: 'REPLANNING', colorClass: 'text-warn bg-warn' },
  GOAL_REACHED: { text: 'GOAL REACHED', colorClass: 'text-ok bg-ok' },
  STOPPED: { text: 'STOPPED', colorClass: 'text-idle bg-idle' },
  ERROR: { text: 'ERROR', colorClass: 'text-crit bg-crit' },
};

export const GOAL_STATUS_UI: Record<GoalStatus, { text: string, colorClass: string }> = {
  PENDING: { text: 'PENDING', colorClass: 'text-idle' },
  ACTIVE: { text: 'ACTIVE', colorClass: 'text-info' },
  BLOCKED: { text: 'BLOCKED', colorClass: 'text-warn' },
  REACHED: { text: 'REACHED', colorClass: 'text-ok' },
};

export const SEVERITY_UI: Record<EventSeverity, { colorClass: string }> = {
  INFO: { colorClass: 'text-text' },
  SUCCESS: { colorClass: 'text-ok' },
  WARNING: { colorClass: 'text-warn' },
  ERROR: { colorClass: 'text-crit' },
};
