
/**
 * Action.ts
 * @author Diao Zheng
 * @file Action constructors and matchers
 * @barrel export all
 */

import { P } from "nasi";

interface IAction<TAction> {
  readonly action: TAction;
  readonly trace?: string[];
}

interface IActionWithPayload<TAction, TPayload>
extends IAction<TAction> {
  readonly payload: TPayload;
}

export const LegacyAction = Symbol.for("NLLegacyAction");

export type Type<TAction, TPayload> =
  | IActionWithPayload<TAction, TPayload>;
export type Only<TAction> =
  | IAction<TAction>;

export type Scoped<TScope, T> = T & { readonly scope: TScope };

export type Rescoped<TScope, T> =
  T extends Scoped<any, infer TAction> ?
    Scoped<TScope, TAction>
  :
    Scoped<TScope, T>
;

export function create<TAction, TPayload>(
  action: TAction,
  payload: TPayload,
): IActionWithPayload<TAction, TPayload> {
  return { action, payload };
}

export function labelOnly<TAction>(action: TAction): IAction<TAction> {
  return { action };
}

export function wrapString<T extends string>(
  action: T,
): Scoped<typeof LegacyAction, IAction<T>> {
  return { action, scope: LegacyAction };
}

export function rescope<TScope, T extends Scoped<any, IAction<any>>>(
  action: T,
  scope: TScope,
): Rescoped<TScope, T>;
export function rescope<TScope, T extends IAction<any>>(
  action: T,
  scope: TScope,
): Scoped<TScope, T>;
export function rescope<TScope, T extends IAction<any>>(
  action: T,
  scope: TScope,
): Scoped<TScope, T> {
  return { ...action, scope };
}

export function isType<T extends IAction<any>>(
  type: T["action"],
): P.Typed<IAction<any>, T> {
  return (action: IAction<any>): action is T => action.action === type;
}

export function isScope<TScope, TAction extends Scoped<TScope, IAction<any>>>(
  scope: TScope,
): P.Typed<IAction<any>, TAction> {
  return (action: IAction<any>): action is TAction =>
    action.hasOwnProperty("scope") && (action as any).scope === scope;
}
