/**
 * DONOTUSEInternalTheme.ts
 * @author Diao Zheng
 * @file A specific version of Theme registry used for internal purposes.
 * @barrel export all
 */
import { Option, UniqueValue } from "nasi";
import { Action, Dispatcher } from "nasi-lemak-react-types";
import * as StyleSheet from "./StyleSheet";
import * as Theme from "./Theme";

export type Theme = "DEFAULT" | "ELECTABUZZ";

export type Type = Theme;

export interface ITemplate<T> extends Theme.ITypedTemplate<Theme, T> {
  __thinternal_originalTemplate: Theme.ITemplate<T>;
  getStyle(): StyleSheet.IComposeable<T>;
}

const Default = Theme.DEFAULT_THEME;
const Electabuzz = Theme.addTheme("ELECTABUZZ", undefined, Default);

export const DEFAULT_THEME: Theme = "DEFAULT";

const internalThemeMapping = {
  DEFAULT: Default,
  ELECTABUZZ: Electabuzz,
};

let currentTheme: Theme.Type = Theme.DEFAULT_THEME;

function externalThemeMapping(t: Theme.Type): Theme {
  switch (t) {
    case Default:
      return "DEFAULT";
    case Electabuzz:
      return "ELECTABUZZ";
    default:
      return DEFAULT_THEME;
  }
}

let dispatcher = new Dispatcher<Action.Type<"THEME_CHANGE", Theme.Type>>(
  "ThemeDispatcher",
);

export function register<T>(
  label: Theme,
  key: string,
  stylesheet: StyleSheet.IComposeable<T>,
) {
  return Theme.register(internalThemeMapping[label], key, stylesheet);
}

export function setHandler(handler: () => void): UniqueValue {
  return dispatcher.add(handler);
}

export function removeHandler(handlerId: UniqueValue) {
  dispatcher.remove(handlerId);
}

/**
 * Returns the registered stylesheet. If the said path is not found in the
 * theme, it will travel the fallback graph to see if a fallback stylesheet is
 * present. If none can be found (either because there's no fallback, or the
 * entire chain of fallbacks do not possess a stylesheet on this path),
 * it will throw a `TypeError` indicating that the said stylesheet is not found.
 *
 * @param key the path to retrieve from as defined in `Theme.register`.
 */
export function getStyle<T>(key: string) {
  const result = Theme.getStyleFrom<T>(currentTheme, key);
  if (Option.isNone(result)) {
    throw new TypeError(
      `Stylesheet ${key} cannot be found for theme ${currentTheme} or ` +
      `any of its fallbacks`,
    );
  }
  return result;
}

/**
 * Issue a theme update, and sets the current selected theme to the new theme.
 * This will call all registered event handlers if the theme given is different
 * from the currently displayed theme.
 * @param theme the theme to update to.
 * @deprecated Use `Theme.Context.Provider` instead.
 */
export function setTheme(theme: Theme) {
  const prevTheme = currentTheme;
  currentTheme = internalThemeMapping[theme];

  if (prevTheme !== currentTheme) {
    dispatcher.dispatch({ action: "THEME_CHANGE", payload: currentTheme });
  }
}

/**
 * Returns the current theme label
 * @deprecated Use `Theme.Context.Consumer` instead.
 */
export function getCurrentTheme(): Theme {
  return externalThemeMapping(currentTheme);
}

/**
 * Clears and resets the handler and ID's.
 * @deprecated use React Context API instead
 */
export function resetHandlers() {
  dispatcher = new Dispatcher("ThemeDispatcher");
}

/**
 * Clears and resets then event handlers and running IDs. USE THIS FUNCTION WITH
 * CARE. It will also reset the internal counter. This means that any existing
 * handler references held may reference to a possibly new handler. Calling
 * `removeHandler` further down the line may unintentially remove a handler
 * that's not intended to be removed. Use `resetHandlers` if you want to clear
 * handlers.
 * @deprecated use React Context API instead
 */
export function UNSAFE_resetHandlers() {
  resetHandlers();
}

export function UNSAFE_clearRegisteredTemplateKeys() {
  Theme.UNSAFE_clearRegisteredTemplateKeys();
}

function addLegacySupport<T>(template: Theme.ITemplate<T>): ITemplate<T> {
  return {
    __thinternal_originalTemplate: template,
    default: template.default,
    getStyle: () => template.getStyleFrom(currentTheme),
    getStyleFrom: (theme: Theme) => template.getStyleFrom(
      internalThemeMapping[theme],
    ),
    key: template.key,
    register: (theme, style, override) => template.register(
      internalThemeMapping[theme],
      style,
      override,
    ),
  };
}

/**
 * A shortcut function to create a template from a composable style
 * @param key the key that's mapped to createTemplate
 * @param defaultStyle the base style to composite with
 */
export function createTemplateFromComposable<T>(
  key: string,
  defaultStyle: StyleSheet.IComposeable<T>,
) {
  return addLegacySupport(
    Theme.createTemplateFromComposable(key, defaultStyle),
  );
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
  return addLegacySupport(Theme.createTemplate(key, defaultStyle));
}

export const Context: typeof Theme.Context = Theme.Context;

export function useTemplate<T>(template: ITemplate<T>) {
  return Theme.useTemplate(template.__thinternal_originalTemplate);
}

export function registeredTheme(theme: Theme): Theme.Type {
  return internalThemeMapping[theme];
}

export function getLegacyThemeNameFromTheme(theme: Theme.Type) {
  return externalThemeMapping(theme);
}
