/**
 * ReducerComponent.ts
 * @author Diao Zheng
 * @file A Reducer component. Note that this component doesn't have legacy
 *       onBlah event handler handling.
 */

import {
  Disposable,
  Types,
} from "nasi";
import React from "react";
import * as Action from "./Action";
import { IDispatchable } from "./DispatchComponent";
import * as Intent from "./Intent";
import { ReducableDispatcher } from "./ReducableDispatcher";

export abstract class ReducerComponent<
  TProps extends IDispatchable<TDispatchAction>,
  TState = {},
  TAction extends Action.Only<any> = never,
  TDispatchAction extends {} = TAction
> extends React.Component<TProps, TState> {
  protected readonly dispatcher: ReducableDispatcher<
    TState,
    TAction,
    TDispatchAction
  >;

  protected readonly disposables: Set<
    Types.ArgumentType<typeof Disposable.dispose>
  >;

  constructor(props: TProps) {
    super(props);
    this.dispatcher = new ReducableDispatcher(
      this.doReduce,
      this.state,
      props.dispatch,
      this.constructor.name,
    );
    this.disposables = new Set();
  }

  public componentWillUnmount() {
    for (const disposable of this.disposables) {
      Disposable.dispose(disposable);
    }
    Disposable.dispose(this.dispatcher);
  }

  public componentDidUpdate(prevProps: TProps) {
    if (prevProps.dispatch !== this.props.dispatch) {
      this.dispatcher.attachDispatcher(this.props.dispatch);
    }
    this.dispatcher.INTERNAL_reconcileAfterComponentUpdate(this.state);
  }

  protected abstract reducer?(
    state: TState,
    action: TAction,
    dispatch: React.Dispatch<TDispatchAction>,
  ): Intent.Type<TState>;

  protected abstract actionOnlyReducer?(
    action: TAction,
    dispatch: React.Dispatch<TDispatchAction>,
  ): Intent.Type<TState>;

  private doReduce =
    (dispatch: React.Dispatch<TDispatchAction>) =>
    (state: TState, action: TAction): Intent.Type<TState> =>
  {
    if (this.reducer) {
      return this.reducer(state, action, dispatch);
    } else if (this.actionOnlyReducer) {
      return this.actionOnlyReducer(action, dispatch);
    }
    return Intent.NoUpdate();
  }
}
