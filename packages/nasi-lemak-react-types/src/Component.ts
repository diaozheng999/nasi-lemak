/**
 * Component.ts
 * @author Diao Zheng
 * @file Enforces a well-typed redux-like pattern for react components.
 */

import _ from "lodash";
import { Dev, Option } from "nasi";
import React from "react";
import { CommitEffect } from "./CommitEffect";
import { Dispatcher } from "./Dispatcher";
import * as Intent from "./Intent";

export abstract class Component<
  TProp = {},
  TState = {},
  TAction = never,
  TPublicAction extends TAction = never,
  TDispatchAction extends TAction = never,
> extends React.Component<TProp, TState> {

  /**
   * This is a convenience prop that's only used in Component to allow legacy
   * test cases to pass by setting
   * ```
   * Component.DO_NOT_SET__USE_CONTEXT = false;
   * ```
   * This will allow us to still use the legacy `Theme.setTheme()`-style tests.
   * Update the tests to use Contexts to be future-proof.
   */
  public static readonly DO_NOT_SET__USE_CONTEXT: boolean = true;

  protected readonly dispatcher: Dispatcher<TDispatchAction>;

  private mounted: boolean = true;

  constructor(props: TProp) {
    super(props);
    this.mounted = true;
    this.dispatcher = new Dispatcher(this.constructor.name);
  }

  public setState<K extends keyof TState>(__: TState | Pick<TState, K>) {
    throw new Error("setState is explicitly disabled.");
  }

  public componentWillUnmount() {
    this.mounted = false;
  }

  public sendAction = (action: TPublicAction) => {
    this.send(action);
  }

  protected send = (action: TAction) => {
    if (this.mounted) {
      this.doReduce(this.state, action);
    }
  }

  protected reducer(
    __: TState,
    ___: TAction,
  ): Intent.Type<TState> {
    return Intent.NoUpdate();
  }

  protected isMounted_() {
    return this.mounted;
  }

  private doReduce(state: TState, action: TAction) {
    const actualIntent = this.reducer(state, action);
    const intent = Option.wrapNotNull(actualIntent);

    if (!intent) {
      Dev.devOnly(() => {
        if (actualIntent !== null) {
          // tslint:disable-next-line:no-console
          console.warn(
            "The reducer received an \"undefined\". Is your reducer total?",
          );
        }
      });
    }

    if (Option.isSome(intent)) {
      if (Option.isSome(intent.effect)) {
        const effects = intent.effect;
        CommitEffect(() => effects.forEach((effect) => effect(state)));
      }
      if (Option.isSome(intent.update) && !_.isEqual({}, intent.update)) {
        // implicitly converting a Partial (boxed Pick) back to a Pick
        super.setState(intent.update as any);
      }
    }
  }

}
