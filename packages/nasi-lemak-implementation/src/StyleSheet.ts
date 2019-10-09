
/**
 * StyleSheet.ts
 * @author Diao Zheng
 * @file Definition and utility methods for a style sheet, i.e. a collection
 *       of styles.
 * @barrel export all
 */

import _ from "lodash";
import { Option } from "nasi";

export interface IComposeable<T extends {}> {
  value: T;
  compose(styles: Partial<T>, override?: boolean, base?: T): IComposeable<T>;
  flatten(): IComposeable<T>;
}

/**
 * Makes a dropdown style sheet by compositing a subset of the styles from
 * the base style.
 * @param styles A subset of styles to compose.
 *
 * @param base The base style to composite child styles with.
 *
 * @param override Determine whether to override the style entry of the base
 *                 style, or to composite the style over the base style.
 *                 Defaults to `false`.
 *
 * @returns `styles` Note that `styles` is mutated with the existing elements.
 */
export function compose<T>(
  styles: Partial<T>,
  base: T,
  override: boolean = false,
): T {
  return _.mergeWith(
    styles,
    base,
    <U>(style: Option.Type<U>, defaultStyle: U) =>
      Option.isNone(style) ?
        defaultStyle
      : override ?
        style
      :
        [defaultStyle, style],
  );
}

type Falsy = null | undefined | false;

function flattenOne<T extends {}>(
  styles: T | T[] | Falsy,
): T | Falsy
{
  if (!styles) {
    return null;
  }
  if (_.isArray(styles)) {
    const flattened: any = {};

    for (const style of styles.map(flattenOne)) {
      if (!style) {
        continue;
      }
      for (const [ key, value ] of _.toPairs(style)) {
        flattened[key] = value;
      }
    }
    return flattened;
  }
  return styles;
}

export function flatten<T extends {}>(stylesheet: T): T {

  const flattened: { [key: string]: {} } = {};

  for (const key of _.keys(stylesheet)) {
    flattened[key] = flattenOne((stylesheet as any)[key]);
  }

  return flattened as any;
}

/**
 * Makes an object with a chainable composition function, which allows for
 * style compositions such as:
 *
 *   `composable(style).compose(A).compose(B).value`
 *
 * @param value A stylesheet to be made composable
 */
export function composable<T>(value: T): IComposeable<T> {
  const doCompose = (
    styles: Partial<T>,
    override?: boolean,
    base: T = value,
  ) => composable(compose(styles, base, override));

  const doFlatten = () => composable(flatten(value));
  return { value, compose: doCompose, flatten: doFlatten };
}
