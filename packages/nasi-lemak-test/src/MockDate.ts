/**
 * MockDate.ts
 * @author Diao Zheng
 * @file Test-time utility to generate mock dates
 * @barrel export all
 */

declare var global: any;

const initialTime = new Date().getTime();
const ActualDateConstructor: DateConstructor = Date;

const mock = {
  currentTime: initialTime,
  initialTime,
  isMocked: false,
};

/**
 * Mocks `Date` constructor with a consistent implementation.
 *
 * All subsequent `reset()` calls will revert to the time at which execution is
 * called. This will only affect the `new Date()` construct. That means,
 * suppose we call it at timestamp 123456, at time 123457, `new Date()` will
 * return date object that represents `123456`, but `newDate(123450)` will be
 * unaffected.
 *
 * This will also affect moment. I.e. `moment().format('DD-MM-YYYY')` will
 * return `01-01-1970` (if `resetTo(0)` has been called).
 */
export function useMockDate() {
  mock.initialTime = new ActualDateConstructor().getTime();
  mock.currentTime = mock.initialTime;
  mock.isMocked = true;
  global.Date = function mockDateContructor(value: any) {
    if (value === undefined) {
      return new ActualDateConstructor(mock.currentTime);
    } else {
      return new ActualDateConstructor(value);
    }
  };

  global.Date.now = () => {
    return mock.currentTime;
  };
}

/**
 * Resets to the timestamp at the latest `useMockDate` call.
 */
export function reset() {
  if (!mock.isMocked) {
    throw new Error(
      "MockDate.reset() will only work when useMockDate() has been called.",
    );
  }
  mock.currentTime = mock.initialTime;
}

/**
 * Increments the current time by `ms` milliseconds. Note that this does not
 * advance jest fake timers.
 * @param ms number of milliseconds to advance by. Can be negative. PLEASE DONT
 * PUT INFINITY OR NAN.
 */
export function advanceTimeBy(ms: number) {
  if (!mock.isMocked) {
    throw new Error(
      "MockDate.advanceTimeBy() will only work when useMockDate() has been " +
      "called.",
    );
  }
  mock.currentTime += ms;
  jest.advanceTimersByTime(ms);
}

/**
 * The "current" epoch in milliseconds.
 * - If mocked, will return the mocked current time
 * - If not mocked, will return `new Date().getTime()`
 */
export function now() {
  if (mock.isMocked) {
    return mock.currentTime;
  } else {
    return new ActualDateConstructor().getTime();
  }
}

/**
 * Reset the mocked date to a specific epoch.
 *
 * Calling `reset()` after this will still reset the date to the last
 * `useMockDate()` call.
 * @param epochInMs The epoch in milliseconds
 */
export function resetTo(epochInMs: number) {
  if (!mock.isMocked) {
    throw new Error(
      "MockDate.resetTo() will only work when useMockDate() has been called.",
    );
  }
  mock.currentTime = epochInMs;
}

/**
 * Restores the `Date` constructor.
 */
export function useRealDate() {
  mock.isMocked = false;
  global.Date = ActualDateConstructor;
}
