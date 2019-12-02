/**
 * MockComponent.ts
 * @author Diao Zheng
 * @file A Mock Component that uses the effect chain.
 */

import _ from "lodash";
import { Intent, Unique } from "nasi-lemak";
import React from "react";
import { Reducer } from "./EffectChains";
import { Action } from "./Effects";
import { IDescribable } from "./Interfaces";

const generator = new Unique();

export abstract class Component<
  TProps = {},
  TState = {},
  TAction = never,
  TPublicAction extends TAction = never,
> extends React.Component<TProps, TState> implements IDescribable {

  // tslint:disable: variable-name

  /**
   * This is a convenience prop that's only used in Component to allow legacy
   * test cases to pass by setting
   * ```
   * Component.DO_NOT_SET__USE_CONTEXT = false;
   * ```
   * This will allow us to still use the legacy `Theme.setTheme()`-style tests.
   * Update the tests to use Contexts to be future-proof.
   */
  public static DO_NOT_SET__USE_CONTEXT: boolean = true;

  public static __rdinternal_isMocked = true;
  public _reactInternalFiber!: any;

  // tslint:enable: variable-name

  public instanceId: string;

  public reducerExecutor: Reducer<TState, TAction>;

  public mock = {
    componentWillMount: jest.fn(),
    componentWillUnmount: jest.fn(),
    send: jest.fn(),
    sendAction: jest.fn(),
    setState: jest.fn(),
  };

  private mounted = true;

  public constructor(props: TProps) {
    super(props);
    this.instanceId = generator.number.toString(16);
    this.reducerExecutor = new Reducer(
      this.reducer,
      () => this.state,
      (partialState) => super.setState(partialState as any),
      this,
      this.getDebugName(),
    );
  }

  public componentWillUnmount() {
    this.mock.componentWillUnmount();
    this.reducerExecutor.deactivate();
  }

  public describe = (linePrefix: string) => {
    return `${linePrefix}Component ${this.getDebugName()}`;
  }

  public sendAction = (action: TPublicAction) => {
    this.mock.sendAction(action);
    this.send(action);
  }

  protected send = (action: TAction) => {
    this.mock.send(action);
    if (this.mounted) {
      this.reducerExecutor.enqueue(new Action(action));
    }
  }

  protected isMounted_() {
    return this.mounted;
  }

  protected reducer(__: TState, ___: TAction): Intent.Type<TState> {
    return Intent.NoUpdate();
  }

  private getDebugName(): string {
    return `${this._reactInternalFiber.elementType.name}@${this.instanceId}`;
  }

}
