# Assumptions

- `useSnapshotSelector` is implemented simply. Due to the rapid frequency (20Hz), React will re-render effectively. To prevent excessive layout shifts, tabular nums are used.
- The mock environment runs the simulation directly on the frontend for the demo.
- In `MissionStatus`, since `PROGRESS` has both percentage text and a progress bar, I rounded the percentage to nearest whole number for display.
- Shadcn UI's `Button`, `Badge`, `Progress` and `Tooltip` were implemented as lightweight localized versions inside `src/components/ui/` to keep the dependency footprint small and avoid issues with complex interactive CLI setups. They perfectly mimic shadcn's class structures and logic.
- Engine path following assumes the robot instantly turns to the max turning limit instead of complex steering dynamics since it's sufficient for the visual demo.
