/**
 * Theme.ts
 * @author Diao Zheng
 * @file Theme handler
 * @barrel export all
 * @barrel export useTemplate
 */
import _ from "lodash";
import { Dev, Option, Registry, Types } from "nasi";
import React, { useContext, useMemo } from "react";
import * as StyleSheet from "./StyleSheet";

const ThemeType = Symbol();

type Theme = Types.Opaque<string, typeof ThemeType>;

export type Type = Theme;

export interface ITypedTemplate<TThemeType, TemplateType> {
  key: string;
  default: StyleSheet.IComposeable<TemplateType>;
  getStyleFrom(theme: TThemeType): StyleSheet.IComposeable<TemplateType>;
  register(theme: TThemeType, style?: Partial<TemplateType>, override?: boolean)
    : boolean;
}

export interface ITemplate<T> extends ITypedTemplate<Theme, T> {
}

export const registry = new Registry<
  Theme,
  Record<string, StyleSheet.IComposeable<any>>
>("DEFAULT" as Theme);

export const DEFAULT_THEME = registry.DEFAULT_VALUE;

/** guard against duplicate keys */
const registeredTemplateKeys: Set<string> = new Set();

class Template<T> implements ITemplate<T> {
  public readonly key: string;
  public readonly default: StyleSheet.IComposeable<T>;

  constructor(key: string, defaultStyles: StyleSheet.IComposeable<T>) {
    this.key = key;
    this.default = defaultStyles;
  }

  public getStyleFrom(theme: Theme) {
    const style = getStyleFrom<T>(theme, this.key);
    if (Option.isNone(style)) {
      throw new TypeError(
        `Stylesheet ${this.key} cannot be found for theme ${theme} or ` +
        `any of its fallbacks`,
      );
    }
    return style;
  }

  public register(theme: Theme, style?: Partial<T>, override?: boolean) {
    if (style) {
      return register(theme, this.key, this.default.compose(style, override));
    } else {
      return register(theme, this.key, this.default);
    }
  }
}

/**
 * Registers a stylesheet to be set to a theme. This overwrites any existing
 * settings.
 *
 * @param label the label (theme) to be set to.
 * @param key a dot-separated path to place the themes. Although it's possible
 * to refer to the actual font with something like `button.text.fontFamily`,
 * that might break when getting a style. It is recommended to always treat
 * the registered styles as stylesheets, and retrieve them from the styles when
 * necessary.
 * @param stylesheet The stylesheet to register
 */
export function register<T>(
  label: Theme,
  key: string,
  stylesheet: StyleSheet.IComposeable<T>,
) {

  if (Option.isNone(registry.getValue(label))) {
    registry.updateValue(label, {});
  }

  return registry.mutateValue(label, (registeredThemes) => {
    _.set(registeredThemes, `${key}`, stylesheet.flatten());
  });
}

export function getStyleFrom<T>(
  theme: Theme,
  key: string,
): Option.Type<StyleSheet.IComposeable<T>> {
  return registry.mapValueRecursive(theme, (styles) => _.get(styles, key));
}

export function UNSAFE_clearRegisteredTemplateKeys() {
  registeredTemplateKeys.clear();
}

/**
 * A shortcut function to create a template from a composable style
 * @param key the key that's mapped to createTemplate
 * @param defaultStyle the base style to composite with
 */
export function createTemplateFromComposable<T>(
  key: string,
  defaultStyle: StyleSheet.IComposeable<T>,
): ITemplate<T> {
  Dev.devOnly(() => {
    if (registeredTemplateKeys.has(key)) {
      throw new TypeError(
        `Template property "${key}" has already been declared.`,
      );
    } else {
      registeredTemplateKeys.add(key);
    }
  });

  return new Template<T>(key, defaultStyle);
}

/**
 * A shortcut function to create a template
 * @param key the key that's mapped to createTemplate
 * @param defaultStyle the base style to composite with
 */
export function createTemplate<T>(
  key: string,
  defaultStyle: T,
): ITemplate<T> {
  return createTemplateFromComposable(key, StyleSheet.composable(defaultStyle));
}

export const Context = React.createContext<Theme>(DEFAULT_THEME);

export function addTheme(
  theme: string,
  resource?: any,
  fallback?: Theme,
): Theme {
  registry.addKey(theme as Theme, fallback);
  if (Option.isSome(resource)) {
    registry.updateValue(theme as Theme, resource);
  }
  return theme as Theme;
}

export function useTemplate<T>(template: ITemplate<T>) {
  const theme = useContext(Context);

  const memoisedValue = useMemo(
    () => template.getStyleFrom(theme).value,
    [ theme ],
  );

  return memoisedValue;
}
