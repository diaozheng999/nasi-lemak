/**
 * WithContext.tsx
 * @author Diao Zheng
 * @file WithContext HOC
 */
import _ from "lodash";
import { Option } from "nasi";
import React from "react";

type RealisedContext<TContext extends { [key: string]: React.Context<any> }> =
  { [context in keyof TContext]: React.ContextType<TContext[context]>}
;

export type WithContext<
  TProps,
  TContext extends { [key: string]: React.Context<any> }
> = TProps & { context: RealisedContext<TContext> };

export function WithContext<
  TProps,
  TContext extends { [key: string]: React.Context<any> },
>(
  contextDefinitions: TContext,
  Component: React.ComponentType<WithContext<TProps, TContext>>,
): React.ExoticComponent<TProps> {

  function copyAssign(
    other: RealisedContext<TContext>,
    key: string,
    inner: (context: RealisedContext<TContext>) => JSX.Element,
    value: any,
  ) {
    const context: any = {...other};
    context[key] = value;
    return inner(context);
  }

  const RealisedComponent = React.forwardRef((
    props: React.Props<TProps>,
    forwardedRef: React.Ref<typeof Component>,
  ) => {

    function renderActual(context: RealisedContext<TContext>) {
      const { children, ref, ...otherProps } = props as any;
      return (
        <Component {...otherProps} context={context} ref={forwardedRef}>
          {children}
        </Component>
      );
    }

    const currentWrappedRenderFunction = _.reduce(
      contextDefinitions,
      (inner, Context, contextKey) => {
        return (other) => (
          <Context.Consumer>
            {copyAssign.bind(undefined, other, contextKey, inner)}
          </Context.Consumer>
        );
      },
      renderActual,
    );

    return currentWrappedRenderFunction({} as any);
  });

  RealisedComponent.displayName = Option.str`${Component.displayName}+Context`;

  return RealisedComponent;
}
