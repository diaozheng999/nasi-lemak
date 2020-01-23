/**
 * MockCreateElement.ts
 * @author Diao Zheng
 * @file Mocking React.createElement for testing
 */

import { Types, Unique } from "nasi-lemak";
import { Attributes, FunctionComponent, ReactElement, ReactNode } from "react";
import { ConcurrentSideEffectChain } from "../EffectChains";
import { ReactActual } from "../Utils";
import {
  __internal_getCurrentExecutor,
  __internal_setCurrentExecutor,
} from "./SpawnHook";

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

      ReactActual.useLayoutEffect(() => () => executor.deactivate(), []);

      const previousExecutor = __internal_setCurrentExecutor(executor);

      const returnValue = type(...args);

      __internal_setCurrentExecutor(previousExecutor);

      return returnValue;

    }, props, ...children);
  } else {
    return ReactActual.createElement(type, props, ...children);
  }
}
