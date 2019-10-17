/**
 * Intent.ts
 * @author Diao Zheng
 * @file Intent
 * @barrel export all
 */
import _ from "lodash";
import { Dev, Option } from "nasi";

interface IIntent<T> {
  effect?: Array<(oldState: T) => void | Promise<void>>;
  /**
   * Here we assert that update is a non-empty subtype of T with no
   * nullable values.
   */
  update?: Partial<T>;
}

export type Type<T> = Option.Nullable<IIntent<T>>;

export function NoUpdate<T>(): Type<T> {
  return null;
}

/**
 * Update, subset of keys in a element of a discrimminated union.
 * @template T state, here, a discrimminated union
 * @template E a type in the union
 * @template K a subset of keys in the type E.
 */
export function Update<T extends {}, E extends T, K extends keyof E>(
  update: Pick<E, K>,
): Type<T>;
/**
 * Update, subset of keys in state.
 * @template T state, here, an object.
 * @template K a subset of keys to update.
 */
export function Update<T extends {}, K extends keyof T>(
  update: Pick<T, K>,
): Type<T>;
/**
 * Update, element in a union.
 * @template T state, here, a discrimminated union
 * @template E a type in the union
 */
export function Update<T extends {}, E extends T>(update: E): Type<T>;
/**
 * Update, entire state.
 * @template T state
 */
export function Update<T extends {}>(update: Partial<T>): Type<T>;
export function Update<T>(update: any): Type<T> {
  // implicitly converting a Pick to a Partial
  return { update } as any;
}

export function SideEffects<T>(
  ...effect: Array<(oldState: T) => void | Promise<void>>): Type<T> {

  return { effect };
}

export function UpdateWithSideEffects<T, E extends T, K extends keyof E>(
  update: Pick<E, K>, ...effect: Array<(oldState: T) => void | Promise<void>>
): Type<T>;
export function UpdateWithSideEffects<T, K extends keyof T>(
  update: Pick<T, K>, ...effect: Array<(oldState: T) => void | Promise<void>>
): Type<T>;
export function UpdateWithSideEffects<T>(
  update: Partial<T>, ...effect: Array<(oldState: T) => void | Promise<void>>
): Type<T>;
export function UpdateWithSideEffects<T>(
  update: Partial<T>, ...effect: Array<(oldState: T) => void | Promise<void>>
): Type<T> {
  return { update, effect } as any;
}

export function Reduce<T>(left: Type<T>, right: Type<T>): Type<T> {
  const lhs = Option.wrapNotNull(left);
  const rhs = Option.wrapNotNull(right);
  if (Option.isNone(lhs)) {
    return right;
  }
  if (Option.isNone(rhs)) {
    return left;
  }
  const update =
    lhs.update ?
      _.merge(lhs.update, rhs.update)
    :
      rhs.update
  ;

  const effect =
    lhs.effect ?
      rhs.effect ?
        _.concat(lhs.effect, rhs.effect)
      :
        lhs.effect
    :
      rhs.effect
  ;

  return { update, effect };
}

/**
 * Returns a side effect that prints the following message if compareValue is
 * oldAction (=== comparison).
 *
 * >  Action "{oldAction}" is deprecated in {component}. Use "{replaceWith}"
 * >  instead.
 *
 * @param compareValue the value to compare to (usually action.action)
 * @param oldAction the old action string to deprecate.
 * @param component the component name, for yellow box.
 * @param replaceWith the new action which should be used.
 */
export function printDeprecationMessage(
  compareValue: any,
  oldAction: string,
  component: string,
  replaceWith?: string,
) {
  return Dev.select(
    () => async () => {
      if (compareValue === oldAction) {
        // tslint:disable-next-line:no-console
        console.warn(
          `Action "${oldAction}" is deprecated in ${component}.` +
          (
            replaceWith ?
              ` Use "${replaceWith}" instead.`
            :
              ""
          ),
        );
      }
    },
    () => () => Promise.resolve<void>(undefined),
  );
}
