/**
 * RxOperator.ts
 * @author Diao Zheng
 * @file A hook that provides input and output to an RxJS Operator
 */

// @barrel hook

import { Intent, Stable } from "nasi-lemak-react-types";
import { useEffect, useReducer } from "react";
import { OperatorFunction, Subject } from "rxjs";
import { useAsyncReducer } from "./AsyncReducer";
import { rxUpdateReducer } from "./RxShim";

export function useRxOperator<
  InputAction,
  OutputAction,
  State,
>(
  operator: OperatorFunction<InputAction, OutputAction>,
  reducer: (state: State, action: OutputAction) => Intent.Type<State>,
  initialState: State,
): [ State, Stable.Dispatch<InputAction> ]
{

  const [ state, dispatch ] = useAsyncReducer(reducer, initialState);

  const [ input$, updateInput ] = useReducer<
    React.Reducer<Subject<InputAction>, InputAction>,
    null
  >(rxUpdateReducer, null, () => new Subject<InputAction>());

  useEffect(() => {

    const subscription = input$.pipe(operator).subscribe({
      next: dispatch,
    });

    return () => {
      subscription.unsubscribe();
      input$.complete();
    };
  }, []);

  return [ state, updateInput ];

}
