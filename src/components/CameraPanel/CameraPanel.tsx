import React, { useRef, useEffect } from 'react';
import { useSnapshotSelector, getCameraState, getRobotState, getPerceptionState, getRootSnapshot } from '../../state/useSnapshot';
import { Badge } from '../ui/badge';
import { COMPONENT_STATUS_UI } from '../../constants/labels';

function drawSimulatedCamera(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  speed: number,
  obstaclesDetected: number,
  nearestM: number | null,
  time: number
) {
  // Clear
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  // Horizon
  const horizonY = height * 0.45;

  // Sky
  ctx.fillStyle = '#0E141C'; // dark panel color
  ctx.fillRect(0, 0, width, horizonY);

  // Ground
  ctx.fillStyle = '#121A24';
  ctx.fillRect(0, horizonY, width, height - horizonY);

  // Perspective lines scrolling
  ctx.strokeStyle = '#1F2A38';
  ctx.lineWidth = 1;
  const numLines = 8;
  const offset = (time * speed * 20) % (width / numLines);

  ctx.beginPath();
  for (let i = -numLines; i <= numLines * 2; i++) {
    const xBottom = (i * (width / numLines)) - offset;
    const xTop = width / 2;
    ctx.moveTo(xTop, horizonY);
    ctx.lineTo(xBottom, height);
  }
  
  // Horizontal lines scrolling
  const hOffset = (time * speed * 0.1) % 1;
  for (let i = 1; i <= 5; i++) {
    const y = horizonY + (Math.pow((i + hOffset)/5, 2) * (height - horizonY));
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  // Draw obstacle if detected
  if (obstaclesDetected > 0 && nearestM !== null) {
    // Simple block growing
    // nearestM goes from detectionRange (e.g. 16) down to stop distance
    const distFactor = Math.max(0.1, 1 - (nearestM / 16));
    const obsW = width * 0.1 * (distFactor * 4);
    const obsH = height * 0.2 * (distFactor * 4);
    const obsX = width / 2 - obsW / 2;
    const obsY = horizonY + (height - horizonY) * (distFactor * 0.8) - obsH;
    
    ctx.fillStyle = '#F87171'; // --crit
    ctx.globalAlpha = 0.8;
    ctx.fillRect(obsX, obsY, obsW, obsH);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(obsX, obsY, obsW, obsH);
    ctx.globalAlpha = 1.0;
  }

  // Watermark
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.font = '24px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('SIMULATED VIEW', width / 2, horizonY - 30);
}

export function CameraPanel({ source = 'simulated' }: { source?: 'simulated' | 'stream' }) {
  const camera = useSnapshotSelector(getCameraState);
  const robot = useSnapshotSelector(getRobotState);
  const perception = useSnapshotSelector(getPerceptionState);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (camera.status !== 'READY') return;
    
    let animationId: number;
    const start = performance.now();

    const render = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) {
        const { width, height } = canvasRef.current;
        const time = (performance.now() - start) / 1000;
        drawSimulatedCamera(ctx, width, height, robot.speed, perception.obstaclesDetected, perception.nearestObstacleM, time);
      }
      animationId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animationId);
  }, [camera.status, robot.speed, perception.obstaclesDetected, perception.nearestObstacleM]);

  const ui = COMPONENT_STATUS_UI[camera.status];
  
  // Fake timestamp
  const ts = new Date().toISOString().split('T')[1].substring(0, 12);

  return (
    <div className="panel h-full flex flex-col relative overflow-hidden">
      <div className="panel-header absolute top-0 left-0 right-0 z-10 bg-[var(--panel-raised)]/80 backdrop-blur-sm border-b-0">
        <span className="panel-title">LIVE CAMERA</span>
        {camera.source === 'SIMULATED' && <Badge variant="sim" className="h-4 text-[9px] px-1">SIMULATION</Badge>}
      </div>
      
      <div className="flex-1 relative bg-black">
        {camera.status === 'READY' ? (
          <>
            <canvas 
              ref={canvasRef} 
              width={640} 
              height={480} 
              className="w-full h-full object-cover opacity-80"
            />
            {/* Overlays */}
            <div className="absolute bottom-2 left-2 flex flex-col gap-1 font-mono text-[10px] text-white/80">
              <div className="flex items-center gap-2">
                <span>CAMERA: READY</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ok)]" />
              </div>
              <div>FPS: {camera.fps} · SIM</div>
              <div>{camera.resolution} · SIM</div>
              <div>{ts}</div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-dim)] font-mono text-sm tracking-widest bg-[var(--bg)]">
            <div className={`mb-2 ${ui.colorClass.split(' ')[0]}`}>{ui.text}</div>
            {ui.isPulsing ? (
              <span className="animate-pulse">AWAITING SIGNAL...</span>
            ) : (
              <span>NO SIGNAL</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
