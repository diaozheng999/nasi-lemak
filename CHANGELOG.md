# 1.2.0

- Updated `nasi` to `1.2.0`
- `nasi-lemak-react-types`
  - Added `ReducableDispatcher`
  - Added `ReducerComponent`
  - Added RxJS utility functions
  - Added `Stable` types to represent referentially-stable functions
- `nasi-lemak-implementation`
  - Fix bug with `Theme` where themes which are registered cannot be read.
  - Fix bug with `useAsyncLegacy` where promise gets called constantly every render.

# 1.1.2

- `nasi-lemak-implementation`
  - Uses `BehaviorSubject` instead of `ReplaySubject` in `useAsObservable` hook.

# 1.1.0 (1.1.1)

- Updated `nasi` to `1.1.3`
- Re-exported `Dev` from `nasi`
- `nasi-lemak-implementation`
  - Added hooks `useAsObservable`, `useFunctionAsObservable` and `useMemoAsObservable`.
  - `useAsyncReducer` now uses `asap` instead of `setImmediate`.

# 1.0.0

- Initial migration from internal repo

