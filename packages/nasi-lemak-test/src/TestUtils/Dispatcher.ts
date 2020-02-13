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
  Stable,
  Unique,
  UniqueValue,
} from "nasi-lemak";
import { Observer } from "rxjs";
import {
  RootEffectChain,
  SerialSideEffectChain,
  SideEffectChain,
} from "../EffectChains";
import { Dispatch, SideEffect } from "../Effects";
import { IDescribable } from "../Interfaces";

export class Dispatcher<T>
implements ICustomDisposable, Observer<T>, IDescribable {

  public get [Disposable.IsDisposed]() {
    return this.closed;
  }

  public closed = false;

  public dispatch: Stable.Dispatch<T> = Stable.declareAsStable((action: T) => {
    for (const [ id, dispatch ] of this.dispatchers.entries()) {
      this.chain.enqueue(new Dispatch(action, id, dispatch));
    }
  });

  public chain: SideEffectChain;

  private idGenerator = new Unique("Dispatcher");

  private dispatchers: Map<UniqueValue, (action: T) => void> = new Map();

  private debugInfo: string | IDescribable;

  constructor(debugName?: string | React.ReactType) {
    if (Option.isSome(debugName)) {
      this.idGenerator = new Unique(debugName.toString());
    }
    this.debugInfo = (debugName as any) ?? this.idGenerator.string;
    this.chain = new SerialSideEffectChain(this, this.idGenerator, true);
    RootEffectChain.current.enqueue(this.chain);
  }

  public getId() {
    if (typeof this.debugInfo === "string") {
      return this.debugInfo;
    }
    return this.debugInfo.getId();
  }

  public describe(linePrefix: string, abbreviate: boolean) {
    const name = "Dispatcher " + this.getId();
    if (abbreviate || typeof this.debugInfo === "string") {
      return name;
    }

    return (
      name +
      `\n${linePrefix}` +
      this.debugInfo.describe(linePrefix + "    ", abbreviate)
    );
  }

  public owner() {
    if (typeof this.debugInfo === "string") {
      return undefined;
    }
    return this.debugInfo;
  }

  public UNSAFE_dispatchToCurrentDispatchers() {
    const dispatchers = Array.from(this.dispatchers.entries());
    return (action: T) => {
      for (const [ id, dispatch ] of dispatchers) {
        this.chain.enqueue(new Dispatch(action, id, dispatch));
      }
    };
  }

  public dispatchAsync(action: T) {
    this.chain.enqueue(new SideEffect(() => this.dispatch(action)));
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

    Disposable.dispose(this.chain);
    this.closed = true;
  }
}
