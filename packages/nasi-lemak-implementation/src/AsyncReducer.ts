/**
 * AsyncReducer.ts
 * @author Diao Zheng
 * @file A Hook to approximate Redux.component.reducer
 * @barrel hook
 */

import asap from "asap/raw";
import _ from "lodash";
import { Dev } from "nasi";
import { Intent } from "nasi-lemak-react-types";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { useIsMounted } from "./IsMounted";

/**
 * A hook similar to useReducer that supports asynchronous side-effects.
 *
 * This is present as a crossover function to port from `Redux.Component`'s
 * `reducer` method. It aims to provide a 1-for-1 mapping of `Redux.Component`'s
 * behaviour in a functional component. Therefore, if one uses
 * ```
 * const [ state, send, sendAction ] = useAsyncReducer(reducer, initialState);
 * ```
 * The `send` function should behave exactly like `this.send` in
 * `Redux.Component`, and `sendAction` function should behave exactly like
 * `this.sendAction` in `Redux.Component`, in a sense that at compile-time, you
 * can limit the amount of actions that `sendAction` can see. The only
 * difference would be that any use of `sendAction` must be explicitly passed
 * to the caller instead of just a `ref`.
 *
 * @note If the reducer returns `Intent.Update({})`, a rerender is called with
 * no state update, i.e. `forceUpdate`.
 *
 * @param reducer The reducer that returns a `Redux.Intent.Type`.
 * @param initialState The synchronous initial state. As of now we do not yet
 * support lazy initialisation of initialState.
 * @returns A tuple with 3 things:
 *   1. the state variable, c.f. `this.state` in `Redux.Component`
 *   2. the unrestricted dispatch, c.f. `this.send` in `Redux.Component`
 *   3. the restricted dispatch, c.f. `this.sendAction` in `Redux.Component`
 */
export function useAsyncReducer<
  State,
  Action,
  PublicAction extends Action = never
>(
  reducer: (state: State, action: Action) => Intent.Type<State>,
  initialState: State,
): [ State, React.Dispatch<Action>, React.Dispatch<PublicAction> ]
{
  const isMounted = useIsMounted();

  const effectQueue = useRef<
    Array<[State, (oldState: State) => void | Promise<void>]>
  >([]);

  const [ state, dispatch ] = useReducer(
    (asyncState: State, action: Action) => {
      const intent = reducer(asyncState, action);
      if (!intent) {
        Dev.devOnly(() => {
          if (intent !== null) {
            // tslint:disable-next-line:no-console
            console.warn(
              "The reducer received an \"undefined\". Is your reducer total?",
            );
          }
        });
        return asyncState;
      }
      if (intent.update && !_.isEqual({}, intent.update)) {
        if (intent.effect) {
          // this will be executed twice. once to trigger rerender, and a
          // second time to actually queue the effect. Therefore, we cannot
          // use `setImmediate` to execute the side effect.
          effectQueue.current = intent.effect.map((f) => [asyncState, f]);
        }
        // return a complete dup. This means that for this reducer,
        // Intent.Update({}) will trigger a rerender.
        return {
          ...asyncState,
          ...intent.update,
        };
      } else if (intent.effect) {
        // this will not result in a rerender. So we have to use other means
        // to execute the side effect.
        const effects = intent.effect;
        asap(() => {
          Promise.all(effects.map((f) => f(asyncState)));
        });
      }
      return asyncState;
    },
    initialState,
  );

  useEffect(() => {
    asap(() => {
      Promise.all(effectQueue.current.map(([s, f]) => f(s)));
      effectQueue.current = [];
    });
  }, [ effectQueue.current ]);

  const persist = useCallback((action: Action) => {
    if (isMounted()) {
      dispatch(action);
    }
  }, [ dispatch ]);

  return [ state, persist, persist ];
}
