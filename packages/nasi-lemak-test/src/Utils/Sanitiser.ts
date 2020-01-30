/**
 * Sanitiser.ts
 * @author Diao Zheng
 * @file Runtime utilities
 */

// @barrel export all
// @barrel export sanitise

import _ from "lodash";

/**
 * An internal type that represents a simple union of sanitised values. This
 * is done to make TypeScript happy as it cannot infer conditional types easily.
 */
type __RUINTERNAL_Sanitised<T> =
  | SanitisedFunction<any>
  | SanitisedCircularReference
  | SanitisedObject<T>
  | SanitisedReactElement
  | Array<Sanitised<ArrayElementOf<T>>>
  | T
;

/**
 * An internal type that represents an object undergoing a sanitisation process.
 */
type PartialSanitisedObject<T extends {}> = {
  [K in keyof T]?: Sanitised<T[K]>
};

/**
 * A recursive conditional type (requires TypeScript 3.7) that represents a
 * fully sanitised object.
 */
export type Sanitised<T> =
  T extends (...args: any[]) => any ?
    SanitisedFunction<T>
  : T extends Array<infer TElement> ?
    Array<Sanitised<TElement>>
  : T extends {} ?
    | { [K in keyof T]: Sanitised<T[K]> }
    | SanitisedObject<T>
    | SanitisedCircularReference
    | SanitisedReactElement
  :
    T | SanitisedCircularReference
;

/**
 * infer the type of array element
 */
type ArrayElementOf<T> =
  T extends Array<infer ArrayElement> ?
    ArrayElement
  : T extends ArrayLike<infer ArrayLikeElement> ?
    ArrayLikeElement
  : T extends { [n: number]: infer BestGuess } ?
    BestGuess
  :
    never
;

/**
 * An approximate to React Fiber's internal representation. Note that this
 * can change at any moment when React changes.
 */
interface IReactFiberApproximant {
  _reactInternalFiber: any;
  props: any;
}

/**
 * Removes circular references.
 */
function filterLastSeen<T>(
  obj: T,
  seen: Map<unknown, string[]>,
  continuation: (obj: T) => Sanitised<T>,
  ignoreLastSeen?: boolean,
): Sanitised<T> {
  if (!seen.has(obj) || !_.isObjectLike(obj)) {
    return continuation(obj);
  }

  const path = seen.get(obj);

  if (!ignoreLastSeen && path) {
    return __ruinternal_unsafe_cast<T>(new SanitisedCircularReference({
      lastSeenAt: path.join("/"),
    }));
  }

  return __ruinternal_unsafe_cast<T>(new SanitisedCircularReference(null));
}

function isReactFiber(element: object): element is IReactFiberApproximant {
  return element.hasOwnProperty("_reactInternalInstance");
}

function isArrayLike<T>(array: unknown): array is ArrayLike<ArrayElementOf<T>> {
  return _.isArrayLike(array);
}

/**
 * We use this function to assert the fact that our sanitised output (whatever
 * it might be) is DEFINITELY correctly sanitised.
 *
 * This breaks the TypeScript inference system, however, because we're dealing
 * with many different (possibly recurring) types here, it's very hard to
 * generalise a proper typing for this.
 *
 * @param sanitised The output of a previous sanitisation function.
 */
function __ruinternal_unsafe_cast<T>(
  sanitised: __RUINTERNAL_Sanitised<T>,
): Sanitised<T> {
  return sanitised as Sanitised<T>;
}

function __ruinternal_unsafe_finalise<T extends {}>(
  sanitised: PartialSanitisedObject<T>,
): Sanitised<T> {
  return sanitised as Sanitised<T>;
}

function __ruinternal_sanitiseFunction<T extends (...args: any[]) => any>(
  fn: T,
): Sanitised<T> {
  return __ruinternal_unsafe_cast<T>(
    new SanitisedFunction<T>({ functionName: fn.name }),
  );
}

function __ruinternal_sanitiseObject<T extends {}>(
  obj: T,
  seen: Map<unknown, string[]>,
  path: string[],
  ignoreLastSeen?: boolean,
): Sanitised<T> {

  const keys = new Set<keyof T>(_.keys(obj) as any);
  const sanitisedResult: PartialSanitisedObject<T> = {};

  if (isReactFiber(obj)) {
    return __ruinternal_unsafe_cast<T>(new SanitisedReactElement({
      elementType: __ruinternal_sanitise(
        obj._reactInternalFiber.elementType,
        seen,
        [...path, "_reactInternalFiber", "elementType"],
        ignoreLastSeen,
      ),
      props: __ruinternal_sanitise(
        obj.props,
        seen,
        [...path, "props"],
        ignoreLastSeen,
      ),
      type: __ruinternal_sanitise(
        obj._reactInternalFiber.type,
        seen,
        [...path, "_reactInternalFiber", "type"],
        ignoreLastSeen,
      ),
    }));
  }

  for (const key of keys) {
    sanitisedResult[key] = filterLastSeen(obj[key], seen, (value) => {
      const newPath = [...path, `${key}`];
      seen.set(value, newPath);
      return __ruinternal_sanitise(value, seen, newPath, ignoreLastSeen);
    }, ignoreLastSeen);
  }

  return __ruinternal_unsafe_finalise(sanitisedResult);
}

function __ruinternal_unsafe_sanitiseArray<T>(
  array: ArrayLike<T>,
  seen: Map<unknown, string[]>,
  path: string[],
  ignoreLastSeen?: boolean,
): Sanitised<T[]> {
  return _.map(array, (item, index) => filterLastSeen(item, seen, (item2) => {
    const newPath = [...path, `${index}`];
    seen.set(item2, newPath);
    return __ruinternal_sanitise(item2, seen, newPath, ignoreLastSeen);
  }, ignoreLastSeen));
}

function __ruinternal_sanitise<T>(
  obj: T,
  seen: Map<unknown, string[]>,
  path: string[],
  ignoreLastSeen?: boolean,
): Sanitised<T>
{

  if (_.isFunction(obj)) {
    return __ruinternal_sanitiseFunction(obj);
  }

  if (!_.isObjectLike(obj)) {
    return obj as Sanitised<T>;
  }

  seen.set(obj, path);

  if (isArrayLike<T>(obj)) {
    return __ruinternal_unsafe_cast(
      __ruinternal_unsafe_sanitiseArray(obj, seen, path, ignoreLastSeen),
    );
  }

  // assume is object

  return __ruinternal_sanitiseObject(obj, seen, path, ignoreLastSeen);
}

/**
 * A function that sanitises an object for snapshotting. This will remove all
 * circular references and react-test-renderer instances (along with its
 * internal fibers) so that we don't run into infinite loops when snapshotting
 * something that contains fibers.
 *
 * In cases where react elements are part of the object structure, their props
 * will be exposed for snapshots as well.
 *
 * Note that this abuses the fact that jest snapshots also exposes the object
 * prototype name (i.e. class name). As such, sanitised value types are
 * encapsulated in `SanitisedFunction`, `SanitisedCircularReference` or
 * `SanitisedReactElement` classes as they will be printed to snapshot.
 * @param obj the object ot sanitise
 * @returns the sanitised object
 */
export function sanitise<T>(obj: T, ignoreLastSeen?: boolean): Sanitised<T> {
  return __ruinternal_sanitise(obj, new Map(), ["/"], ignoreLastSeen);
}

// tslint:disable:max-classes-per-file

class SanitisedObject<Type, TPayload = Type> {
  // tslint:disable-next-line:variable-name
  public __ruinternal_payload: TPayload;
  constructor(payload: TPayload) {
    this.__ruinternal_payload = payload;
  }
}

class SanitisedReactElement extends SanitisedObject<any> {}

class SanitisedCircularReference extends SanitisedObject<any> {}

class SanitisedFunction<T extends (...args: any[]) => any>
extends SanitisedObject<T, { functionName: string }> {}
