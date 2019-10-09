/**
 * DispatchComponent.ts
 * @author Diao Zheng
 * @file Component that handles dispatchers
 * @barrel export IDispatchable
 * @barrel export IDispatchableWithLegacyEventHandlers
 * @barrel export RestrictDispatch
 * @barrel export ExcludeDispatch
 */

import {
  invariant,
  Option,
  Types,
  UniqueValue,
} from "nasi";
import React from "react";
import * as Action from "./Action";
import { Dispatcher } from "./Dispatcher";
import * as Intent from "./Intent";

export interface IDispatchable<T> {
  dispatch: React.Dispatch<T>;
}

/**
 * Narrows the `dispatch` prop from `TProps` to have prop
 * `dispatch: React.Dispatch<TActions>`.
 */
export type RestrictDispatch<TProps, TActions> =
  TProps extends IDispatchable<TActions> ?
    TProps
  : TProps extends IDispatchable<unknown> ?
    Types.ExcludeKeys<TProps, "dispatch"> & IDispatchable<TActions>
  :
    never
;

/**
 * Narrows the `dispatch` prop from `TProps` to have prop
 * `dispatch: React.Dispatch<!TActions>` instead. In case `Not<TActions, A>`
 * is `never` (assuming `TProps extends IDispatchable<A>`),
 * i.e. `TActions == A`, simply do not include `dispatch` prop.
 *
 * @example
 * type T = ExcludeDispatch<
 *   { dispatch: React.Dispatch<1 | 2 | 3>, p: 2 },
 *   1 | 2
 * >; // T: { dispatch: React.Dispatch<3>, p: 2 }
 *
 * @example
 * type U = ExcludeDispatch<
 *   { dispatch: React.Dispatch<1 | 2 | 3>, p: 2 },
 *   1 | 2 | 3,
 * >; // U: { p: 2 }
 */
export type ExcludeDispatch<T extends {}, TActions> =
  T extends IDispatchable<TActions> ?
    Types.ExcludeKeys<T, "dispatch">
  : T extends IDispatchable<infer A> ?
    TActions extends A ?
      Types.ExcludeKeys<T, "dispatch"> & IDispatchable<Types.Not<A, TActions>>
    :
      never
  :
    never
;

export interface IDispatchableWithLegacyEventHandlers<T> {
  dispatch?: React.Dispatch<T>;
}

export type DispatchComponentLifecycleActions<P, S, SS> =
  | Action.Only<"WILL_UNMOUNT">
  | Action.Type<"DID_UPDATE", {
      prevProps: P;
      prevState: S;
      snapshot: SS;
    }>
;

function isLifecycleAction<P, S, SS>(
  action: any,
): action is DispatchComponentLifecycleActions<P, S, SS>
{
  return (
    action &&
    typeof action === "object" &&
    (action.action === "WILL_MOUNT" || action.action === "DID_UPDATE")
  );
}

export abstract class DispatchComponent<
  TAction extends Action.Only<any>,
  // TODO: type this back to IDispatchable when no more event handlers are
  // being set.
  TProp extends IDispatchableWithLegacyEventHandlers<TDispatchAction>,
  TState = {},
  TDispatchAction extends {} = TAction,
  TSnapshot = any,
>
extends React.Component<TProp, TState, TSnapshot>
{
  protected readonly dispatcher: Dispatcher<TDispatchAction>;
  private readonly internalDispatcher: Dispatcher<
    | TAction
    | DispatchComponentLifecycleActions<TProp, TState, TSnapshot>
  >;

  private readonly currentInternalDispatchIdentifier: UniqueValue;
  private currentExternalDispatchIdentifier: UniqueValue;

  private currentSideEffectQueue: Array<
    (oldState: TState) => void | Promise<void>
  > = [];

  constructor(props: TProp) {
    super(props);
    this.dispatcher = new Dispatcher(this.constructor.name);
    this.internalDispatcher = new Dispatcher(
      this.constructor.name + "_internalDispatcher",
    );
    this.currentInternalDispatchIdentifier = this.internalDispatcher.add(
      this.doReduce,
    );
    this.currentExternalDispatchIdentifier = this.dispatcher.add(
      Option.value(props.dispatch, this.fireLegacyEventListeners.bind(this)),
    );
  }

  public componentWillUnmount() {
    this.dispatcher.remove(this.currentExternalDispatchIdentifier);
    this.internalDispatcher.dispatch({ action: "WILL_UNMOUNT" });
  }

  public componentDidUpdate(
    prevProps: TProp,
    prevState: TState,
    snapshot: TSnapshot,
  ) {
    this.internalDispatcher.dispatch({
      action: "DID_UPDATE",
      payload: {
        prevProps,
        prevState,
        snapshot,
      },
    });
  }

  protected ignoreLifecycleActions(
    action:
      | TAction
      | DispatchComponentLifecycleActions<TProp, TState, TSnapshot>,
  ): Intent.Type<TState> {
    switch (action.action) {
      case "WILL_UNMOUNT":
        return Intent.NoUpdate();
      case "DID_UPDATE":
        return Intent.NoUpdate();
      default:
        invariant(
          () => false,
          "`DispatchAction.ignoreLifecycleActions` should be placed in the " +
          "`default` case in a switch statement in your reducer, and your " +
          "reducer should be exhaustive.",
        );
        return Intent.NoUpdate();
    }
  }

  // tslint:disable:variable-name
  protected reducer?(
    _state: TState,
    _action:
      | TAction
      | DispatchComponentLifecycleActions<TProp, TState, TSnapshot>,
  ): Intent.Type<TState>;
  protected actionOnlyReducer?(
    _action:
      | TAction
      | DispatchComponentLifecycleActions<TProp, TState, TSnapshot>,
  ): Intent.Type<TState>;
  // tslint:enable:variable-name

  protected send = (action: TAction) => {
    this.internalDispatcher.dispatch(action);
  }

  protected fireLegacyEventListeners(_: TDispatchAction) {
    return;
  }

  protected dispatch(action: TDispatchAction) {
    return this.dispatcher.dispatch.bind(this.dispatcher, action);
  }

  private internalLifecycleHandler(
    action: TAction | DispatchComponentLifecycleActions<
      TProp, TState, TSnapshot
    >,
  )
  {
    if (!isLifecycleAction(action)) {
      return;
    }
    switch (action.action) {
      case "DID_UPDATE":
        if (action.payload.prevProps.dispatch !== this.props.dispatch) {
          this.dispatcher.remove(this.currentExternalDispatchIdentifier);
          this.currentExternalDispatchIdentifier = this.dispatcher.add(
            Option.value(
              this.props.dispatch as React.Dispatch<TDispatchAction>,
              this.fireLegacyEventListeners.bind(this),
            ),
          );
        }
        this.flushSideEffects(
          this.currentSideEffectQueue,
          action.payload.prevState,
        );
        break;
      case "WILL_UNMOUNT":
        this.internalDispatcher.remove(this.currentInternalDispatchIdentifier);
        break;
    }
  }

  private flushSideEffects(
    effectQueue: Array<(oldState: TState) => void | Promise<void>>,
    state: TState,
  ) {
    while (effectQueue.length) {
      const effect = effectQueue.shift();
      if (effect) {
        effect(state);
      }
    }
  }

  private doReduce = (
    action: TAction | DispatchComponentLifecycleActions<
      TProp, TState, TSnapshot
    >,
  ) => {
    const intent = (
      this.reducer ?
        this.reducer(this.state, action)
      : this.actionOnlyReducer ?
        this.actionOnlyReducer(action)
      :
        null
    );

    invariant(
      () => intent !== undefined,
      "Reducer should not return `undefined`. Is your reducer total?",
      false,
    );

    invariant(
      () => !(this.reducer && this.actionOnlyReducer),
      "Should both `reducer` and `actionOnlyReducer` be defined for " +
      "DispatchComponent, we will only use `reducer`. `actionOnlyReducer` " +
      "will never be called.",
      false,
    );

    if (intent) {
      if (intent.update) {
        this.setState(intent.update as any);
        if (intent.effect) {
          this.currentSideEffectQueue.push(...intent.effect);
        }
      } else if (intent.effect) {
        return this.flushSideEffects(intent.effect, this.state);
      }
    }

    this.internalLifecycleHandler(action);
  }
}
