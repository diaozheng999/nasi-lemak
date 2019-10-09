/**
 * WithContext.tsx
 * @author Diao Zheng
 * @file WithContext HOC
 */
import _ from "lodash";
import React from "react";

export function WithContext<K extends string, T>(
  key: K,
  Context: React.Context<T>,
) {
  return function WithContextHOC<P>(
    Component: React.ComponentType<P & { [value in K]: T }>,
  ) {
    const RealisedComponent = React.forwardRef((
      props: React.Props<P>,
      ref: React.Ref<typeof Component>,
    ) => {
      function contextConsumer(value: T) {
        const { children, ...rest } = props;
        const newProps: any = rest;
        newProps[key] = value;
        return <Component {...newProps} ref={ref}>{children}</Component>;
      }
      return (
        <Context.Consumer>
          {contextConsumer}
        </Context.Consumer>
      );
    });

    if (Component.displayName) {
      RealisedComponent.displayName =
        `${Component.displayName}+${key}:${Context.displayName}`;
    }

    return RealisedComponent;
  };
}
