import React from 'react';
import { Header } from './components/Header/Header';
import { CameraPanel } from './components/CameraPanel/CameraPanel';
import { NavigationMap } from './components/NavigationMap/NavigationMap';
import { RobotStatePanel } from './components/RobotStatePanel/RobotStatePanel';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { MissionStatus } from './components/MissionStatus/MissionStatus';
import { SystemPipeline } from './components/SystemPipeline/SystemPipeline';
import { PerceptionPanel } from './components/PerceptionPanel/PerceptionPanel';
import { TelemetryPanel } from './components/TelemetryPanel/TelemetryPanel';
import { EventLog } from './components/EventLog/EventLog';
import { MissionSummaryOverlay } from './components/MissionSummaryOverlay/MissionSummaryOverlay';

export default function App() {
  return (
    <div className="h-screen w-screen bg-[var(--bg)] flex flex-col overflow-x-hidden overflow-y-auto text-[var(--text)]">
      <Header />
      
      {/* 
        Layout Grid 
        Using flex for main rows since grid might be tricky for exact percentages without hardcoding heights.
        Spec says: top row about 55%, mission strip 96px, bottom row the rest.
      */}
      <div className="flex-1 p-3 grid grid-cols-12 gap-3 items-start">
        
        {/* Left Column (Sticky Camera) */}
        <div className="col-span-4 sticky top-3 h-[calc(100vh-6rem)]">
          <CameraPanel />
        </div>

        {/* Right Column (Scrolling Content) */}
        <div className="col-span-8 flex flex-col gap-3">
          
          {/* Top Section */}
          <div className="grid grid-cols-8 gap-3 min-h-[500px]">
            <div className="col-span-5 h-full">
              <NavigationMap />
            </div>
            <div className="col-span-3 flex flex-col gap-3">
               <div className="flex-none h-[220px]">
                 <RobotStatePanel />
               </div>
               <div className="flex-1 min-h-[350px]">
                 <ControlPanel />
               </div>
            </div>
          </div>

          {/* Middle Row (Mission Strip) */}
          <div className="h-[96px] shrink-0 rounded-md overflow-hidden border border-[var(--border)]">
            <MissionStatus />
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-8 gap-3 min-h-[300px]">
            <div className="col-span-2 h-full">
              <SystemPipeline />
            </div>
            <div className="col-span-2 h-full">
              <PerceptionPanel />
            </div>
            <div className="col-span-2 h-full">
              <TelemetryPanel />
            </div>
            <div className="col-span-2 h-full">
              <EventLog />
            </div>
          </div>
        </div>
      </div>

      <MissionSummaryOverlay />
    </div>
  );
}
