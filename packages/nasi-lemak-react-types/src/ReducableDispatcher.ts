/**
 * Reducer.ts
 * @author Diao Zheng
 * @file A dispatcher for use in React Components
 */

import _ from "lodash";
import { assert, Disposable, invariant, LinkedList, Option } from "nasi";
import { Dispatcher } from "./Dispatcher";
import { Type as Intent } from "./Intent";

type BoundReducerFunction<S, A> = (state: S, action: A) => Intent<S>;

type ReducerFunction<S, A, D> =
  (dispatcher: React.Dispatch<D>) => BoundReducerFunction<S, A>;

export class ReducableDispatcher<
  TState,
  TAction,
  TDispatchAction
> extends Dispatcher<TAction>
{

  private sideEffectsQueue = new LinkedList<() => void>();

  private boundReducerFunction: BoundReducerFunction<TState, TAction>;
  private reducerFunction: ReducerFunction<TState, TAction, TDispatchAction>;

  private dispatchToParent: React.Dispatch<TDispatchAction>;

  private currentState: Readonly<TState>;

  private asynchronousEffectCounter = 0;

  constructor(
    reducer: ReducerFunction<TState, TAction, TDispatchAction>,
    initialState: TState,
    dispatchToParent?: React.Dispatch<TDispatchAction>,
    debugName?: string,
  ) {
    super(debugName);
    this.reducerFunction = reducer;
    this.dispatchToParent = dispatchToParent ?? _.identity;
    this.boundReducerFunction = this.reducerFunction(
      dispatchToParent ?? _.identity,
    );
    this.currentState = initialState;
  }

  public attachDispatcher = (
    dispatchToParent: React.Dispatch<TDispatchAction>,
  ) => {
    if (this.dispatchToParent !== dispatchToParent) {
      this.boundReducerFunction = this.reducerFunction(dispatchToParent);
    }
  }

  public reducer = (state: TState, action: TAction): Partial<TState> => {
    const intent = this.boundReducerFunction(state, action);

    if (!intent) {
      assert(Option.isSome, intent);
      return {};
    }

    this.executeOrQueueEffects(state, intent);

    if (intent.update) {
      return intent.update;
    }

    return {};
  }

  public dispatch = (action: TAction) => {
    this.reducer(this.currentState, action);
    super.dispatch(action);
  }

  public INTERNAL_reconcileAfterComponentUpdate(nextState: TState) {
    this.sideEffectsQueue.drain(this.executeEffect);
    this.currentState = nextState;
  }

  public UNSAFE_dispatchToParentDirectly(action: TDispatchAction) {
    this.dispatchToParent(action);
  }

  public [Disposable.Dispose] = () => {

    invariant(
      () => this.sideEffectsQueue.length === 0,
      "There are still pending effects in queue during willUnmount",
    );

    invariant(
      () => this.asynchronousEffectCounter === 0,
      `There are uncaught asynchronous calls in ${this.constructor.name}` +
      "during willUnmount.",
      false,
    );

    super[Disposable.Dispose]();
  }

  private executeEffect = async (effect: () => void | Promise<void>) => {
    const response = effect();
    if (response) {
      ++this.asynchronousEffectCounter;
      await response;
      --this.asynchronousEffectCounter;
    }
  }

  private executeOrQueueEffects(
    state: TState,
    intent: Option.NotNull<Intent<TState>>,
  ) {
    if (Option.isNone(intent.effect)) {
      return;
    }

    if (Option.isSome(intent.update)) {
      for (const effect of intent.effect) {
        this.sideEffectsQueue.push(effect.bind(undefined, state));
      }
    } else {
      for (const effect of intent.effect) {
        effect(state);
      }
    }
  }

}
