/**
 * MockCreateElement.ts
 * @author Diao Zheng
 * @file Mocking React.createElement for testing
 */

import { Disposable, Types, Unique } from "nasi-lemak";
import { Attributes, FunctionComponent, ReactElement, ReactNode } from "react";
import { ConcurrentSideEffectChain } from "../EffectChains";
import { ReactActual } from "../Utils";
import { CurrentExecutor } from "./CurrentExecutor";

export function MockCreateElement<P>(
  type: FunctionComponent<P>,
  props?: Attributes & P | null,
  ...children: ReactNode[]
): ReactElement<P> {
  if (typeof type === "function") {
    return ReactActual.createElement((
      ...args: Types.ArgumentTupleType<FunctionComponent<P>>
    ) => {

      const [ executor ] = ReactActual.useState(
        () => {
          const parentExecutor = CurrentExecutor.shared.value.valueOf();
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

      ReactActual.useLayoutEffect(() => () => Disposable.dispose(executor), []);

      const previousExecutor = CurrentExecutor.shared.value.update(executor);

      const returnValue = type(...args);

      CurrentExecutor.shared.value.update(previousExecutor);

      return returnValue;

    }, props, ...children);
  } else {
    return ReactActual.createElement(type, props, ...children);
  }
}
