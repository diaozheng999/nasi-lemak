/**
 * ContextDispatcher.tsx
 * @author Diao Zheng
 * @file A context dispatcher that can be used to inform the reducer about
 *       potential changes in contexts. This can be used as an adaptor value
 *       in class components. See BillPayment for example.
 * @barrel component dispatch
 */

import { Action } from "nasi-lemak-react-types";
import React, { useContext, useEffect } from "react";

export type ContextDispatcherDispatchAction<TScope, TContext> =
  | Action.Scoped<TScope, Action.Type<"SET_CONTEXT", TContext>>
;

export interface IContextDispatcherProps<TScope, TContext> {
  context: React.Context<TContext>;
  scope: TScope;
  dispatch: React.Dispatch<ContextDispatcherDispatchAction<TScope, TContext>>;
}

export function ContextDispatcher<S, T>(props: IContextDispatcherProps<S, T>) {
  const payload = useContext(props.context);
  useEffect(() => {
    props.dispatch({
      action: "SET_CONTEXT",
      payload,
      scope: props.scope,
    });
  }, [ payload, props.context, props.scope, props.dispatch ]);
  return <></>;
}
