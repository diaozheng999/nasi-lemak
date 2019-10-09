/**
 * Dispatcher.ts
 * @author Diao Zheng
 * @file A long-lived object that handles multiple incoming and outgoing
 * dispatch actions.
 */

import asap from "asap/raw";
import { Option, Unique, UniqueValue } from "nasi";

export class Dispatcher<T> {
  private idGenerator = new Unique("Dispatcher");

  private dispatchers: Map<UniqueValue, (action: T) => void> = new Map();

  constructor(debugName?: string) {
    if (Option.isSome(debugName)) {
      this.idGenerator = new Unique(debugName);
    }
  }

  public dispatch(action: T) {
    for (const dispatch of this.dispatchers.values()) {
      dispatch(action);
    }
  }

  public UNSAFE_dispatchToCurrentDispatchers() {
    const dispatchers = Array.from(this.dispatchers.values());
    return (action: T) => {
      for (const dispatch of dispatchers) {
        dispatch(action);
      }
    };
  }

  public dispatchAsync(action: T) {
    asap(() => this.dispatch(action));
  }

  public add(dispatch: (action: T) => void): UniqueValue {
    const key = this.idGenerator.opaque;
    this.dispatchers.set(key, dispatch);
    return key;
  }

  public remove(key: UniqueValue): void {
    if (this.dispatchers.has(key)) {
      this.dispatchers.delete(key);
    }
  }
}
