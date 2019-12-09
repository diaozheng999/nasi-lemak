/**
 * Localisation.ts
 * @author Diao Zheng
 * @file Provide replacement for strings.
 * @barrel export all
 * @barrel export l_
 * @barrel export useLocalisation
 */
import _ from "lodash";
import moment from "moment";
import { Option, Registry, Types } from "nasi";
import React, { useContext, useMemo } from "react";

export const registry = new Registry<Language, Resource>("en-US" as Language);

const LanguageType = Symbol();

export type LocalisationReplacement =
  | string
  | [string, LocalisationReplacement[]]
;

/** Supported languages. */
export type Language = Types.Opaque<string, typeof LanguageType>;
export type ConvertDateType = "format.date.long" | "format.date.short";
export type LocalisationFunction = (
  key: string,
  ...replacements: LocalisationReplacement[]
) => string;
export type ConvertDateFunction = (
  date: Date,
  format?: ConvertDateType,
) => string;
export type LocalisationPayload = [
  LocalisationFunction,
  ConvertDateFunction,
  Language
];
type Resource = {
  [key in string]: string | string[] | Resource;
};

export const DEFAULT_LANGUAGE = registry.DEFAULT_VALUE;

/**
 * Replaces a template (specified in mini-language) with replacement strings
 * @param template template string
 * @param replacements list of replacement strings
 */
function replace(
  template: string,
  replacements: string[],
): Option.Type<string> {

  if (_.isEmpty(replacements)) {
    return template;
  }

  const pattern = /\$(\$|\d+)/g;

  let buffer = "";
  let startIdx = 0;

  let matches: Option.Type<RegExpExecArray>;

  do {
    matches = Option.truthy(pattern.exec(template));

    if (Option.isNone(matches)) {
      break;
    }

    buffer += template.substring(startIdx, matches.index);

    if (matches[1] === "$") {
      buffer += "$";
    } else {
      const item = replacements[parseInt(matches[1], 10)];
      if (Option.isNone(item)) {
        return undefined;
      }
      buffer += item;
    }
    startIdx = matches.index + matches[0].length;
  } while (Option.isSome(matches));

  buffer += template.substr(startIdx);
  return buffer;
}

/**
 * Gets a property key in an hierarchical structure using an array of keys.
 * Returns undefined if not found, or the template replacement process errors.
 * @param obj the object in question
 * @param key the list of keys (if empty, then obj should be the return
 *            variable)
 * @param replacements the replacement strings to pass, treating the specified
 * value as a template
 * @invariant
 *   getProperty(obj[a_0][a_1]...[a_i], [a_j, ..., a_n])
 *      === getProperty(obj, [a_0, ..., a_n])
 *   forall 0 <= i, j <= n
 */
function getProperty(
  key: string[], replacements: string[], obj: any,
): Option.Type<string | string[]> {

  if (_.has(obj, key)) {
    return replace(_.get(obj, key), replacements);
  }
  return undefined;
}

/**
 * Gets a property in the specified language. Will fallback to another language
 * if defined in fallbacks. Returns undefined if none of the languages contain
 * the specified key.
 * @param language the language to look for.
 * @param key the list of keys.
 * @param replacements the replacement list. If not empty, will treat the
 *                     resource string as template.
 * @requires key.length > 0
 */
function getPropertyInLanguage(
  language: Language, key: string[], replacements: string[],
): Option.Type<string | string[]> {
  return registry.mapValueRecursive(
    language,
    getProperty.bind(undefined, key, replacements),
  );
}

const getLocalisedString = (
  language: Language,
  key: string,
  ...replacements: LocalisationReplacement[]
): string | string[] => {
  const localisedReplacements = replacements.map((value) => {
    if (_.isString(value)) {
      return getStringFromLanguage(language, value);
    }
    const [nkey, nreplacements] = value;
    return getStringFromLanguage(language, nkey, ...nreplacements);
  });

  return Option.value_(
    getPropertyInLanguage(
      language,
      key.split("."),
      localisedReplacements,
    ),
    () => {
      if (_.isEmpty(localisedReplacements)) {
        return `${key}`;
      }
      return Option.value(
        replace(key, localisedReplacements),
        `{${key}: ${localisedReplacements.join(", ")}}`,
      );
    },
  );
};

/**
 * Produces a localised string based on a specified language. Will utilise
 * fallbacks if key is not found in a specified language. If none of the
 * languages in the fallback chain contains the specified key, will return the
 * key itself.
 * @param language The language to get key from
 * @param key A key in a dot-separated hierarchy
 * @param replacements
 *   A list of replacement keys. If present, will treat `key` as a template
 *   string, regardless of whether there is a language resource or not. The
 *   keys will also undergo localisation using the currently defined language,
 *   and also support templated replacements by giving in the format:
 *      `[template_key, [replacement1, replacement2, ...]]`
 */
export function getStringFromLanguage(
  language: Language,
  key: string,
  ...replacements: LocalisationReplacement[]
): string {
  const str = getLocalisedString(language, key, ...replacements);
  if (_.isString(str)) {
    return str;
  }
  return str[0];
}

/**
 * Returns a random string in a list of strings based on the current language.
 * Will utilise fallbacks if key is not found in the specified language.
 * @param key A key in a dot-separated hierarchy
 */
export function getRandomStringFromLanguage(
  language: Language,
  key: string,
): string {
  const str = getLocalisedString(language, key);
  if (_.isString(str)) {
    return str;
  }
  const id = Math.floor(Math.random() * str.length);
  return str[id];
}

/**
 * Returns a date strings based on a specified language.
 * Translate date into according language.
 * @param language the specified language
 * @param date date
 * @param format the date type to convert (either long or short). Defaults to
 * "format.date.long"
 */
export function convertDateWithLanguage(
  language: Language,
  date: Date,
  format: ConvertDateType = "format.date.long",
): string {

  switch (language) {
    case "en-US":
    case "zh":
      return moment(date).format(getStringFromLanguage(language, format));
    default:
      return "Invalid Date";
  }

}

/**
 * Returns string value if value is defined, otherwise will perform lookup
 * on the fallback key.
 * @param language the current language
 * @param value the value to return if defined
 * @param fallbackKey the localisation key if undefined
 * @param fallbackReplacements any substitute strings to the localisation key
 */
export function localisedDefault(
  language: Language,
  value: Option.Type<string>,
  fallbackKey: string,
  // tslint:disable-next-line:trailing-comma
  ...fallbackReplacements: Array<string | [string, string[]]>
): string {
  if (Option.isSome(value)) {
    return value;
  } else {
    return getStringFromLanguage(
      language,
      fallbackKey,
      ...fallbackReplacements,
    );
  }
}

export const Context = React.createContext<Language>(DEFAULT_LANGUAGE);

/**
 * A wrapper function to enable the use of `l` and `convertDate` with React
 * Context API in class components.
 *
 * @example
 * ```
 * class MyComponent extends Redux.Component {
 *   public static contextType = Localisation.Context;
 *   public context!: React.ContextType<typeof Localisation.Context>;
 *   public render() {
 *     const [ l, convertDate ] = Localisation.ofContext(this.context);
 *     return (
 *       <View>
 *         <Text>{l("noun.tnc")}</Text>
 *         <Text>{convertDate(new Date())}</Text>
 *       </View>
 *     );
 *   }
 * }
 * ```
 * @param context the language that's returned from context
 */
export function ofContext(context: Language): LocalisationPayload {
  return [
    (key, ...replacements) =>
      getStringFromLanguage(context, key, ...replacements),
    (date, format) => convertDateWithLanguage(context, date, format),
    context,
  ];
}

/**
 * This is a context-based replacement to `l`, to be only used when
 * `l(key)` appears in JSX.
 *
 * @example
 * ```
 * return <Text>{l_("button.prop")}</Text>;
 * ```
 * @param key A key in a dot-separated hierarchy
 * @param replacements
 *   A list of replacement keys. If present, will treat `key` as a template
 *   string, regardless of whether there is a language resource or not. The
 *   keys will also undergo localisation using the currently defined language,
 *   and also support templated replacements by giving in the format:
 *      `[template_key, [replacement1, replacement2, ...]]`
 */
export function l_(
  key: string,
  ...replacements: LocalisationReplacement[]
) {
  return React.createElement(
    Context.Consumer,
    null,
    (language: Language) => {
      return getStringFromLanguage(language, key, ...replacements);
    },
  );
}

export function *getAllBundledLanguage(): IterableIterator<Language> {
  for (const language of registry.keys()) {
    yield language as Language;
  }
}

export function addLanguage(
  language: string,
  resource?: Resource,
  fallback?: Language,
): Language {
  registry.addKey(language as Language, fallback);
  if (Option.isSome(resource)) {
    registry.updateValue(language as Language, resource);
  }
  return language as Language;
}

export function updateResource(
  language: Language,
  resource: Resource,
) {
  registry.updateValue(language, resource);
}

export function useLocalisation(): LocalisationPayload {
  const currentLanguage = useContext(Context);

  const memoisedGetStringFromLanguage = useMemo<LocalisationFunction>(
    () => (key, ...replacements) =>
      getStringFromLanguage(currentLanguage, key, ...replacements),
    [ currentLanguage ],
  );

  const memoisedConvertDateWithLanguage = useMemo<ConvertDateFunction>(
    () => (date, format) =>
      convertDateWithLanguage(currentLanguage, date, format),
    [ currentLanguage ],
  );

  return [
    memoisedGetStringFromLanguage,
    memoisedConvertDateWithLanguage,
    currentLanguage,
  ];
}
