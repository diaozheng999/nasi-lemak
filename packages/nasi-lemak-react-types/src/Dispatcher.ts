/**
 * Dispatcher.ts
 * @author Diao Zheng
 * @file A long-lived object that handles multiple incoming and outgoing
 * dispatch actions.
 */

import {
  Dev,
  Disposable,
  ICustomDisposable,
  invariant,
  Option,
  Unique,
  UniqueValue,
} from "nasi";
import { Observer } from "rxjs";
import { CommitEffect } from "./CommitEffect";
import * as Stable from "./Stable";
export class Dispatcher<T> implements ICustomDisposable, Observer<T> {

  public get [Disposable.IsDisposed]() {
    return this.closed;
  }

  public closed = false;

  public dispatch: Stable.Dispatch<T> = Stable.declareAsStable((action: T) => {
    for (const dispatch of this.dispatchers.values()) {
      dispatch(action);
    }
  });

  private idGenerator = new Unique("Dispatcher");

  private dispatchers: Map<UniqueValue, (action: T) => void> = new Map();

  constructor(debugName?: string) {
    if (Option.isSome(debugName)) {
      this.idGenerator = new Unique(debugName);
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
    CommitEffect(() => this.dispatch(action));
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

  public next = (value: T) => {
    this.dispatch(value);
  }

  public error = (value: any) => {
    Dev.devOnly(() => {
      // tslint:disable-next-line: no-console
      console.error(
        "A subscribed RxJS observable emitted an error",
        value,
      );
    });
  }

  public complete = () => {
    return;
  }

  public [Disposable.Dispose] = () => {

    invariant(
      () => !(this.dispatchers.size > 0),
      "Cannot dispose of a dispatcher which still has listeners. Remove all " +
      "listeners before disposing of the dispatcher.",
    );

    this.closed = true;
  }
}
