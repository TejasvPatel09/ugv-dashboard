import { useState, useEffect, useCallback } from 'react';
import { useProvider } from './ProviderContext';
import { MissionSnapshot } from '../domain/types';

export function useSnapshotSelector<T>(
  selector: (snapshot: MissionSnapshot) => T,
  isEqual: (a: T, b: T) => boolean = Object.is
): T {
  const provider = useProvider();
  const [, setTick] = useState(0);

  useEffect(() => {
    return provider.subscribe(() => {
      setTick(t => t + 1);
    });
  }, [provider]);

  return selector(provider.getSnapshot());
}

// Selectors
export const getRobotState = (s: MissionSnapshot) => s.robot;
export const getMissionState = (s: MissionSnapshot) => s.mission;
export const getPerceptionState = (s: MissionSnapshot) => s.perception;
export const getSystemStatus = (s: MissionSnapshot) => s.system;
export const getTelemetry = (s: MissionSnapshot) => s.telemetry;
export const getMapState = (s: MissionSnapshot) => s.map;
export const getEvents = (s: MissionSnapshot) => s.events;
export const getCameraState = (s: MissionSnapshot) => s.camera;
export const getMissionSummary = (s: MissionSnapshot) => s.summary;
export const getRootSnapshot = (s: MissionSnapshot) => s;
