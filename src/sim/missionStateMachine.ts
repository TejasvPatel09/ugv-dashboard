import { SCENARIO } from './scenario.config';
import { 
  MissionSnapshot, 
  ComponentStatus, 
  EventSeverity, 
  MissionStateName,
  PlannedPath
} from '../domain/types';
import { getPointAtDistance, polylineLength, distance, angleDiff, normalizeHeading } from '../domain/geometry';
import { mulberry32 } from './prng';

export function createInitialSnapshot(): MissionSnapshot {
  return {
    seq: 0,
    timestamp: Date.now(),
    source: 'SIMULATION',
    connection: 'CONNECTED',
    robot: {
      x: SCENARIO.start.x, y: SCENARIO.start.y,
      heading: 0,
      speed: 0,
      localization: 'UNKNOWN'
    },
    mission: {
      mode: 'AUTONOMOUS',
      state: 'IDLE',
      progress: 0,
      distanceToGoal: 0,
      goalRange: distance(SCENARIO.start, SCENARIO.goal),
      goalName: SCENARIO.goalName,
      goalStatus: 'PENDING',
      elapsedSec: 0,
    },
    perception: {
      obstaclesDetected: 0,
      nearestObstacleM: null,
      terrain: SCENARIO.terrain,
      status: 'OFFLINE'
    },
    system: {
      camera: 'OFFLINE',
      perception: 'OFFLINE',
      localization: 'OFFLINE',
      planner: 'OFFLINE',
      controller: 'OFFLINE',
    },
    camera: {
      status: 'OFFLINE',
      source: 'SIMULATED',
      fps: null,
      resolution: null,
      lastFrameTs: null,
    },
    telemetry: {
      cpuPct: 0, ramPct: 0, batteryPct: SCENARIO.telemetry.batteryStart,
      uptimeSec: 0,
      simulated: true
    },
    map: {
      worldWidth: SCENARIO.world.width,
      worldHeight: SCENARIO.world.height,
      start: SCENARIO.start,
      goal: SCENARIO.goal,
      plannedPath: null,
      supersededPath: null,
      travelledPath: [SCENARIO.start],
      obstacles: [],
      detectionRangeM: SCENARIO.detectionRangeM
    },
    events: [],
    summary: null
  };
}

export class MissionStateMachine {
  snapshot: MissionSnapshot;
  prng: () => number;
  
  // internal state
  private stateTimeSec: number = 0;
  private pathDistanceTraveled: number = 0;
  private internalEvents: any[] = [];
  private totalDistance: number = 0;
  private obstaclesEncounteredCount = 0;
  private replansCount = 0;
  private goalReachedFlag = false;
  
  private initTriggered = {
    camera: false, perception: false, localization: false, planner: false, controller: false,
    allReady: false, pathGen: false, navStart: false
  };

  private obstacleClearedTriggered = false;

  constructor() {
    this.snapshot = createInitialSnapshot();
    this.prng = mulberry32(SCENARIO.seed);
  }

  reset() {
    this.snapshot = createInitialSnapshot();
    this.stateTimeSec = 0;
    this.pathDistanceTraveled = 0;
    this.totalDistance = 0;
    this.obstaclesEncounteredCount = 0;
    this.replansCount = 0;
    this.goalReachedFlag = false;
    this.obstacleClearedTriggered = false;
    this.initTriggered = {
      camera: false, perception: false, localization: false, planner: false, controller: false,
      allReady: false, pathGen: false, navStart: false
    };
    this.prng = mulberry32(SCENARIO.seed);
  }

  logEvent(message: string, severity: EventSeverity = 'INFO') {
    const id = Math.random().toString(36).substring(2, 9);
    this.snapshot.events.push({
      id,
      ts: Date.now(), // Real time of the event
      missionTimeSec: this.snapshot.mission.elapsedSec,
      severity,
      message
    });
    if (this.snapshot.events.length > SCENARIO.eventLogMax) {
      this.snapshot.events.shift();
    }
  }

  start() {
    if (this.snapshot.mission.state === 'IDLE' || this.snapshot.mission.state === 'STOPPED') {
      if (this.snapshot.mission.state === 'IDLE') {
        this.snapshot.mission.state = 'INITIALIZING';
        this.snapshot.mission.goalStatus = 'PENDING';
        this.logEvent('Mission started');
        this.logEvent('Subsystem initialization started');
        this.stateTimeSec = 0;
        
        // Setup initial statuses to INITIALIZING
        this.snapshot.system.camera = 'INITIALIZING';
        this.snapshot.system.perception = 'INITIALIZING';
        this.snapshot.system.localization = 'INITIALIZING';
        this.snapshot.system.planner = 'INITIALIZING';
        this.snapshot.system.controller = 'INITIALIZING';
        this.snapshot.camera.status = 'INITIALIZING';
      } else {
         this.logEvent('Mission resumed');
         // state transition handled externally or logic resumes
         // we don't have a history state stored, we can just assume it goes back to previous state based on progress
         // For mock we can derive from goal/obstacle etc.
         // Wait, the spec says "STOPPED --start--> resumes previous behaviour (no replan needed)"
         // Actually, if we just keep the internal state string and update it, wait, state was changed to STOPPED.
         // Let's store previous state.
      }
    }
  }

  update(dt: number) {
    const s = this.snapshot;
    s.seq++;
    s.timestamp = Date.now();
    s.telemetry.uptimeSec += dt;

    if (s.mission.state === 'STOPPED' || s.mission.state === 'IDLE' || s.mission.state === 'ERROR') {
      return;
    }

    s.mission.elapsedSec += dt;
    this.stateTimeSec += dt;
    
    // Telemetry noise
    s.telemetry.cpuPct = SCENARIO.telemetry.cpuBase + (this.prng() * 2 - 1) * SCENARIO.telemetry.cpuNoise;
    s.telemetry.ramPct = SCENARIO.telemetry.ramBase + (this.prng() * 2 - 1) * SCENARIO.telemetry.ramNoise;
    s.telemetry.batteryPct -= (SCENARIO.telemetry.batteryDrainPerMin / 60) * dt;
    
    if (s.system.camera === 'READY') {
      s.camera.fps = 30 + Math.floor((this.prng() * 2 - 1) * 2);
      s.camera.resolution = '640x480';
      s.camera.lastFrameTs = s.timestamp;
    }

    const mState = s.mission.state;

    if (mState === 'INITIALIZING') {
      const e = s.mission.elapsedSec;
      
      if (e >= SCENARIO.init.camera && !this.initTriggered.camera) {
        this.initTriggered.camera = true;
        s.system.camera = 'READY'; s.camera.status = 'READY';
        this.logEvent('Camera ready');
      }
      if (e >= SCENARIO.init.perception && !this.initTriggered.perception) {
        this.initTriggered.perception = true;
        s.system.perception = 'READY'; s.perception.status = 'READY';
        this.logEvent('Perception ready');
      }
      if (e >= SCENARIO.init.localization && !this.initTriggered.localization) {
        this.initTriggered.localization = true;
        s.system.localization = 'READY';
        s.robot.localization = 'TRACKING';
        this.logEvent('Localization ready (tracking)');
      }
      if (e >= SCENARIO.init.planner && !this.initTriggered.planner) {
        this.initTriggered.planner = true;
        s.system.planner = 'READY';
        this.logEvent('Planner ready');
      }
      if (e >= SCENARIO.init.controller && !this.initTriggered.controller) {
        this.initTriggered.controller = true;
        s.system.controller = 'READY';
        this.logEvent('Controller ready');
      }
      if (e >= SCENARIO.init.controller && !this.initTriggered.allReady) {
         this.initTriggered.allReady = true;
         this.logEvent('All subsystems ready', 'SUCCESS');
      }

      if (e >= SCENARIO.init.pathGeneratedAt && !this.initTriggered.pathGen) {
        this.initTriggered.pathGen = true;
        s.map.plannedPath = { version: 1, points: SCENARIO.initialPath };
        this.logEvent('Global path generated (4 waypoints)');
      }

      if (e >= SCENARIO.init.navStartAt && !this.initTriggered.navStart) {
        this.initTriggered.navStart = true;
        s.mission.state = 'FOLLOWING_PATH';
        s.mission.goalStatus = 'ACTIVE';
        s.system.controller = 'ACTIVE';
        this.logEvent('Autonomous navigation started');
        this.stateTimeSec = 0;
      }
    } 
    else if (mState === 'FOLLOWING_PATH') {
      s.system.controller = 'ACTIVE';
      s.system.planner = 'READY';
      s.perception.status = 'READY';

      // Accelerate
      if (s.robot.speed < SCENARIO.cruiseSpeed) {
        s.robot.speed = Math.min(SCENARIO.cruiseSpeed, s.robot.speed + SCENARIO.accel * dt);
      }

      this.moveRobot(dt);

      // Check obstacle
      if (this.obstaclesEncounteredCount === 0) {
        const distToObs = distance({x: s.robot.x, y: s.robot.y}, {x: SCENARIO.obstacle.x, y: SCENARIO.obstacle.y});
        if (distToObs <= SCENARIO.detectionRangeM) {
          // Check if obstacle intersects path safety margin. In scenario, it's on path.
          // Add obstacle to map
          s.map.obstacles.push(SCENARIO.obstacle);
          s.perception.obstaclesDetected = 1;
          s.perception.nearestObstacleM = distToObs;
          this.obstaclesEncounteredCount = 1;
          s.mission.state = 'OBSTACLE_DETECTED';
          s.mission.goalStatus = 'BLOCKED';
          s.perception.status = 'ACTIVE';
          this.logEvent(`Obstacle detected ahead (${distToObs.toFixed(1)} m)`, 'WARNING');
          this.stateTimeSec = 0;
        }
      }

      // Check goal
      const distToGoal = distance({x: s.robot.x, y: s.robot.y}, SCENARIO.goal);
      if (distToGoal <= SCENARIO.goalReachedRadiusM) {
        s.mission.state = 'GOAL_REACHED';
        s.mission.goalStatus = 'REACHED';
        s.system.controller = 'READY';
        s.robot.speed = 0;
        this.goalReachedFlag = true;
        this.logEvent('Goal reached', 'SUCCESS');
        this.stateTimeSec = 0;
      }
      
      this.checkObstacleClearance();

    } 
    else if (mState === 'OBSTACLE_DETECTED') {
      s.perception.status = 'ACTIVE';
      s.system.controller = 'READY';
      // Decelerate
      if (s.robot.speed > 0) {
        s.robot.speed = Math.max(0, s.robot.speed - SCENARIO.brakeDecel * dt);
      } else if (s.robot.speed === 0) {
         if (this.stateTimeSec >= SCENARIO.obstacleHoldSec) {
             s.mission.state = 'REPLANNING';
             s.system.planner = 'ACTIVE';
             this.logEvent('Vehicle stopped');
             this.logEvent('Planner recalculating');
             this.stateTimeSec = 0;
         }
      }
      this.updateNearestObstacle();
    }
    else if (mState === 'REPLANNING') {
       s.perception.status = 'ACTIVE';
       s.system.planner = 'ACTIVE';
       s.robot.speed = 0;
       
       if (this.stateTimeSec >= SCENARIO.replanSec) {
         this.replansCount++;
         s.map.supersededPath = s.map.plannedPath;
         
         const newPoints = [...SCENARIO.detourWaypoints];
         newPoints[0] = { x: s.robot.x, y: s.robot.y }; // first point is robot pos
         
         s.map.plannedPath = { version: 2, points: newPoints };
         s.mission.state = 'FOLLOWING_PATH';
         s.mission.goalStatus = 'ACTIVE';
         s.system.planner = 'READY';
         this.pathDistanceTraveled = 0; // reset local path distance
         
         this.logEvent(`New path generated (v2, ${newPoints.length} waypoints)`, 'SUCCESS');
         this.logEvent('Navigation resumed on new path');
         this.stateTimeSec = 0;
       }
       this.updateNearestObstacle();
    }
    else if (mState === 'GOAL_REACHED') {
      if (this.stateTimeSec >= SCENARIO.goalSummaryDelaySec && !s.summary) {
        s.summary = {
          distanceTravelledM: this.totalDistance,
          durationSec: s.mission.elapsedSec,
          obstaclesEncountered: this.obstaclesEncounteredCount,
          replans: this.replansCount,
          goalReached: true
        };
        this.logEvent('Mission complete', 'SUCCESS');
      }
    }
  }

  private moveRobot(dt: number) {
    const s = this.snapshot;
    const path = s.map.plannedPath;
    if (!path) return;
    
    const moveDist = s.robot.speed * dt;
    this.pathDistanceTraveled += moveDist;
    this.totalDistance += moveDist;

    const res = getPointAtDistance(path.points, this.pathDistanceTraveled);
    if (res) {
       s.robot.x = res.point.x;
       s.robot.y = res.point.y;
       // target heading
       const targetH = res.heading;
       const diff = angleDiff(targetH, s.robot.heading);
       const maxTurn = SCENARIO.maxTurnRateDegPerSec * dt;
       
       if (Math.abs(diff) <= maxTurn) {
         s.robot.heading = targetH;
       } else {
         s.robot.heading = normalizeHeading(s.robot.heading + Math.sign(diff) * maxTurn);
       }
    }
    
    // Update map travelled path every few meters or seconds, but for now just push if distance > 0.5m
    const lastP = s.map.travelledPath[s.map.travelledPath.length - 1];
    if (distance(lastP, {x: s.robot.x, y: s.robot.y}) > 0.5) {
       s.map.travelledPath.push({x: s.robot.x, y: s.robot.y});
    }

    // Update distances
    s.mission.goalRange = distance({x: s.robot.x, y: s.robot.y}, SCENARIO.goal);
    const totalLen = polylineLength(path.points);
    s.mission.distanceToGoal = Math.max(0, totalLen - this.pathDistanceTraveled);
    
    const prog = this.totalDistance / (this.totalDistance + s.mission.distanceToGoal);
    s.mission.progress = Math.max(s.mission.progress, prog);
  }
  
  private updateNearestObstacle() {
     const s = this.snapshot;
     if (s.map.obstacles.length > 0) {
        s.perception.nearestObstacleM = distance({x: s.robot.x, y: s.robot.y}, {x: SCENARIO.obstacle.x, y: SCENARIO.obstacle.y});
     }
  }
  
  private checkObstacleClearance() {
     const s = this.snapshot;
     if (this.obstaclesEncounteredCount > 0 && !this.obstacleClearedTriggered) {
        this.updateNearestObstacle();
        if (s.robot.x > SCENARIO.obstacle.x + SCENARIO.obstacleClearedBehindM) {
           s.perception.obstaclesDetected = 0;
           s.perception.nearestObstacleM = null;
           this.obstacleClearedTriggered = true;
           s.perception.status = 'READY';
           this.logEvent('Obstacle cleared');
        }
     }
  }
}
