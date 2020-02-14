/**
 * MockCreateElement.ts
 * @author Diao Zheng
 * @file Mocking React.createElement for testing
 */

import { Disposable, Types, Unique } from "nasi-lemak";
import { Attributes, FunctionComponent, ReactElement, ReactNode } from "react";
import { ConcurrentSideEffectChain } from "../EffectChains";
import {
  __internal_getCurrentExecutor,
  __internal_resetCurrentHookCount,
  __internal_setCurrentExecutor,
} from "./CurrentExecutor";

export function MockCreateElement(ReactActual: any) {
  return <P>(
    type: FunctionComponent<P>,
    props?: Attributes & P | null,
    ...children: ReactNode[]
  ): ReactElement<P> => {
    // in JavaScript a class constructor is typeof function. So, we need to
    // keep in mind both class components as well as function components
    if (typeof type === "function") {
      // checks if it's a class component.
      if (type.prototype.isReactComponent) {
        return ReactActual.createElement(type, props, ...children);
      }

      // it's not a class component. Here we assume that it's a
      // function component
      return ReactActual.createElement((
        ...args: Types.ArgumentTupleType<FunctionComponent<P>>
      ) => {

        // we hijack useState to create a memoised executor chain. This executor
        // will exist for every element.
        const [ executor ] = ReactActual.useState(
          () => {
            const parentExecutor = __internal_getCurrentExecutor();
            const currentExecutor = new ConcurrentSideEffectChain(
              parentExecutor,
              new Unique(
                (type.displayName ?? type.name ?? "FunctionComponent") +
                "_Hook",
              ),
              true,
            );
            parentExecutor.enqueue(currentExecutor);
            return currentExecutor;
          },
        );

        const previousExecutor = __internal_setCurrentExecutor(executor);
        __internal_resetCurrentHookCount();

        // execute the real FunctionComponent constructor
        const returnValue = type(...args);

        // we will immediate remove the child hook if none of the
        // SideEffectChain hooks have been committed.
        ReactActual.useLayoutEffect(() => {
          const count = __internal_resetCurrentHookCount();

          if (count) {
            return () => Disposable.dispose(executor);
          } else {
            Disposable.dispose(executor);
            return;
          }
        }, []);

        __internal_setCurrentExecutor(previousExecutor);

        return returnValue;

      }, props, ...children);
    } else {
      // here, it's a built-in or exotic component (i.e. symbols with $$typeof)
      return ReactActual.createElement(type, props, ...children);
    }
  };

}
