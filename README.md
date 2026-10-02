# UGV Mission Control Dashboard

This is the Vision-Based Autonomous Navigation for UGV dashboard for the SIH prototype.

## Quick Start (Windows / Ubuntu Linux / macOS)

### Prerequisites
- **Node.js**: v18.0.0 or later (Node 20 LTS recommended)
- **npm**: v9.0.0 or later

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/TejasvPatel09/ugv-dashboard.git
cd ugv-dashboard

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open your browser at `http://localhost:5173`.

## URL Parameters
- `?autostart=1` - automatically starts the mission upon load.
- `?speed=2` - sets the simulation time scale (e.g. 2x, 4x) for faster testing and recording.
- `?dev=1` - reveals the simulation speed selector in the control panel (if capabilities allow).

## How to swap provider

The application connects to the simulation by default. To connect to a real robot (once the API is implemented):
1. Create a `.env` file in the root.
2. Set `VITE_DATA_SOURCE=api`.
3. Restart the dev server or rebuild.
The application will use the `ApiProvider` defined in `src/providers/api/ApiProvider.ts`.

## Scenario Overview
- The UGV starts at the bottom-left and navigates towards the goal.
- At around 60m, an obstacle is detected in its path.
- The UGV stops, a new path is generated (v2), and it maneuvers around the obstacle.
- The mission completes successfully.
