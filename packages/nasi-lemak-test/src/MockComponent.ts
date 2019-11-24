/**
 * MockComponent.ts
 * @author Diao Zheng
 * @file A Mock Component that uses the effect chain.
 */

import _ from "lodash";
import { Dev, Option, Unique, UniqueValue } from "nasi";
import React from "react";
import { CommitEffect } from "./CommitEffect";
import { Dispatcher } from "./Dispatcher";
import * as Intent from "./Intent";
import * as Stable from "./Stable";

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
  public static DO_NOT_SET__USE_CONTEXT: boolean = true;

  public generator: Unique;

  public id: UniqueValue;

}