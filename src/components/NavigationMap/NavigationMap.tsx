import React, { useRef, useEffect, useState } from 'react';
import { useSnapshotSelector, getMapState, getRobotState, getMissionState } from '../../state/useSnapshot';
import { MISSION_STATE_UI } from '../../constants/labels';

export function NavigationMap() {
  const mapState = useSnapshotSelector(getMapState);
  const robot = useSnapshotSelector(getRobotState);
  const mission = useSnapshotSelector(getMissionState);

  const svgRef = useRef<SVGSVGElement>(null);

  // Smooth interpolation for robot marker
  const [visualPose, setVisualPose] = useState({ x: robot.x, y: robot.y, heading: robot.heading });

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();
    
    // We linearly interpolate visual pose towards robot pose
    const render = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      
      setVisualPose(prev => {
         // Simple lerp to smooth out 20Hz updates
         const lerpFactor = Math.min(1, dt * 15); 
         let newX = prev.x + (robot.x - prev.x) * lerpFactor;
         let newY = prev.y + (robot.y - prev.y) * lerpFactor;
         
         // Heading interpolation (shortest path)
         let diff = robot.heading - prev.heading;
         diff = (diff + 180) % 360 - 180;
         if (diff < -180) diff += 360;
         
         let newH = prev.heading + diff * lerpFactor;
         return { x: newX, y: newY, heading: newH };
      });
      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [robot.x, robot.y, robot.heading]);

  const { worldWidth: W, worldHeight: H } = mapState;
  
  // Transform helpers:
  // spec: svgX = x * scale, svgY = (H - y) * scale
  // But viewBox takes care of scale. We can just set viewBox to "0 0 W H".
  // Then internally: render x at x, and render y at H - y.
  const toX = (x: number) => x;
  const toY = (y: number) => H - y;

  const plannedPolyline = mapState.plannedPath?.points.map(p => `${toX(p.x)},${toY(p.y)}`).join(' ');
  const supersededPolyline = mapState.supersededPath?.points.map(p => `${toX(p.x)},${toY(p.y)}`).join(' ');
  const travelledPolyline = mapState.travelledPath.map(p => `${toX(p.x)},${toY(p.y)}`).join(' ');

  const showBanner = mission.state === 'OBSTACLE_DETECTED' || mission.state === 'REPLANNING';
  const bannerUi = MISSION_STATE_UI[mission.state];

  // Grid lines
  const gridLines = [];
  for (let x = 0; x <= W; x += 10) gridLines.push(<line key={`gx${x}`} x1={x} y1={0} x2={x} y2={H} stroke="var(--grid)" strokeWidth={x % 50 === 0 ? 0.5 : 0.2} />);
  for (let y = 0; y <= H; y += 10) gridLines.push(<line key={`gy${y}`} x1={0} y1={y} x2={W} y2={y} stroke="var(--grid)" strokeWidth={y % 50 === 0 ? 0.5 : 0.2} />);

  // Robot color
  let robotColor = 'var(--idle)';
  if (robot.speed > 0 || mission.state === 'FOLLOWING_PATH') robotColor = 'var(--ok)';
  
  let robotOutlineClass = '';
  if (mission.state === 'OBSTACLE_DETECTED') robotOutlineClass = 'animate-pulse-warn';
  if (mission.state === 'REPLANNING') robotColor = 'var(--info)';

  return (
    <div className="panel h-full flex flex-col relative overflow-hidden">
      <div className="panel-header border-b-0 absolute top-0 left-0 right-0 z-10 bg-transparent">
        {/* We can hide title or put it on top */}
      </div>

      <div className="flex-1 bg-[var(--bg)] relative overflow-hidden flex items-center justify-center p-4">
        {/* Banner overlay */}
        {showBanner && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 shadow-lg">
            <div className={`px-4 py-2 font-mono text-sm tracking-widest rounded text-center border-2
              ${mission.state === 'OBSTACLE_DETECTED' ? 'bg-[var(--crit)]/20 border-[var(--crit)] text-[var(--crit)]' : 'bg-[var(--warn)]/20 border-[var(--warn)] text-[var(--warn)]'}`}
            >
              {bannerUi.text}
            </div>
          </div>
        )}

        <svg 
          ref={svgRef}
          viewBox={`-5 -5 ${W + 10} ${H + 10}`} 
          className="w-full h-full max-h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <g className="grid-layer">
            {gridLines}
            {/* Axis labels */}
            {[0, 50, 100].map(x => <text key={`lx${x}`} x={x} y={H + 4} fontSize="3" fill="var(--text-dim)" textAnchor="middle">{x}</text>)}
            {[0, 50].map(y => <text key={`ly${y}`} x={-1} y={toY(y) + 1} fontSize="3" fill="var(--text-dim)" textAnchor="end">{y}</text>)}
          </g>

          {/* Travelled Path */}
          {travelledPolyline && (
            <polyline points={travelledPolyline} fill="none" stroke="var(--info)" strokeWidth="0.8" opacity="0.7" />
          )}

          {/* Superseded Path */}
          {supersededPolyline && (
            <polyline points={supersededPolyline} fill="none" stroke="var(--text-dim)" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.5" className="animate-fade-in" />
          )}

          {/* Planned Path */}
          {plannedPolyline && (
            <g className="animate-fade-in">
              <polyline points={plannedPolyline} fill="none" stroke="var(--info)" strokeWidth="0.8" strokeDasharray="1,1" />
              {mapState.plannedPath?.points.map((p, i) => i > 0 && i % 2 === 0 ? (
                <circle key={`w${i}`} cx={toX(p.x)} cy={toY(p.y)} r="0.5" fill="var(--info)" />
              ) : null)}
              {/* V2 Tag */}
              {mapState.plannedPath && mapState.plannedPath.version > 1 && (
                <text x={toX(mapState.plannedPath.points[1].x) + 2} y={toY(mapState.plannedPath.points[1].y) - 2} fontSize="3" fill="var(--info)">
                  v{mapState.plannedPath.version}
                </text>
              )}
            </g>
          )}

          {/* Start Marker */}
          <g transform={`translate(${toX(mapState.start.x)}, ${toY(mapState.start.y)})`}>
             <circle r="1" fill="none" stroke="var(--text-dim)" strokeWidth="0.4" />
             <text y="-2" fontSize="2.5" fill="var(--text-dim)" textAnchor="middle">START</text>
          </g>

          {/* Goal Marker */}
          <g transform={`translate(${toX(mapState.goal.x)}, ${toY(mapState.goal.y)})`}>
             <circle r="1.5" fill="none" stroke={mission.goalStatus === 'REACHED' ? 'var(--ok)' : 'var(--text)'} strokeWidth="0.5" />
             {/* Star shape for goal */}
             <polygon points="0,-1 0.25,-0.25 1,0 0.25,0.25 0,1 -0.25,0.25 -1,0 -0.25,-0.25" fill={mission.goalStatus === 'REACHED' ? 'var(--ok)' : 'var(--text)'} />
             <text y="-3" fontSize="2.5" fill={mission.goalStatus === 'REACHED' ? 'var(--ok)' : 'var(--text)'} textAnchor="middle">GOAL</text>
          </g>

          {/* Obstacles */}
          {mapState.obstacles.map(obs => (
            <g key={obs.id} transform={`translate(${toX(obs.x)}, ${toY(obs.y)})`} className="animate-fade-in">
              {/* Pulse ring for new obstacle */}
              <circle r={obs.radius} fill="none" stroke="var(--crit)" strokeWidth="0.2" className="pulse-dot" />
              {/* Safety radius */}
              <circle r={obs.safetyRadius} fill="none" stroke="var(--crit)" strokeWidth="0.3" strokeDasharray="1,1" opacity="0.6" />
              {/* Obstacle body */}
              <circle r={obs.radius} fill="url(#hatch)" stroke="var(--crit)" strokeWidth="0.5" />
            </g>
          ))}

          {/* Detection range (very faint) */}
          <circle cx={toX(visualPose.x)} cy={toY(visualPose.y)} r={mapState.detectionRangeM} fill="none" stroke="var(--text-dim)" strokeWidth="0.1" opacity="0.2" />

          {/* Robot */}
          <g 
            transform={`translate(${toX(visualPose.x)}, ${toY(visualPose.y)}) rotate(${-visualPose.heading})`}
          >
            {/* Outline pulse if warning */}
            {mission.state === 'OBSTACLE_DETECTED' && (
              <rect x="-2" y="-1.2" width="4" height="2.4" rx="0.5" fill="none" stroke="var(--crit)" strokeWidth="0.5" className="animate-ping" opacity="0.5" />
            )}
            
            {/* Vehicle body (elongated with arrow) */}
            <rect x="-1.5" y="-1" width="3" height="2" rx="0.3" fill="var(--panel-raised)" stroke={robotColor} strokeWidth="0.3" />
            {/* Front indicator arrow */}
            <polygon points="0.5,-0.5 1.5,0 0.5,0.5" fill={robotColor} />
          </g>

          {/* Hatch pattern def */}
          <defs>
            <pattern id="hatch" width="2" height="2" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="2" stroke="var(--crit)" strokeWidth="0.5" opacity="0.5" />
            </pattern>
          </defs>
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 right-4 bg-[var(--panel)]/90 border border-[var(--border)] p-2 rounded flex flex-col gap-1 text-[9px] font-mono text-[var(--text-dim)]">
          <div className="flex items-center gap-2"><span className="w-3 h-0.5 bg-[var(--info)] opacity-70"></span> Travelled</div>
          <div className="flex items-center gap-2"><span className="w-3 h-0.5 border-t border-dashed border-[var(--info)]"></span> Planned</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full border border-[var(--crit)] bg-[var(--crit)]/20"></span> Obstacle</div>
        </div>

        {/* Live Pose Overlay */}
        <div className="absolute bottom-4 left-4 bg-[var(--panel)]/90 border border-[var(--border)] px-3 py-1.5 rounded flex items-center gap-4 text-[11px] font-mono shadow">
           <div><span className="text-[var(--text-dim)] mr-1">X</span>{robot.x.toFixed(1)}</div>
           <div><span className="text-[var(--text-dim)] mr-1">Y</span>{robot.y.toFixed(1)}</div>
           <div><span className="text-[var(--text-dim)] mr-1">HDG</span>{Math.round(robot.heading)}</div>
        </div>
      </div>
    </div>
  );
}
