/**
 * DONOTUSEInternalLocalisation.ts
 * @author Diao Zheng
 * @file A specific version of Localisation registry used for internal purposes.
 * @barrel export all
 */

import { Option } from "nasi";
import React from "react";
import * as Localisation from "./Localisation";

export type Language = "en-US" | "zh";

const ENGLISH = Localisation.DEFAULT_LANGUAGE;
Localisation.addLanguage("zh", undefined, ENGLISH);

export const DEFAULT_LANGUAGE = "en-US";

let currentLanguage = ENGLISH;

function internalLanguageMapping(language: Language): Localisation.Language {
  return language as Localisation.Language;
}

function externalLanguageMapping(f: Localisation.Language): Language {
  return f as Language;
}

type Resource = {
  [key in string]: string | string[] | Resource;
};

export function updateResource(language: Language, resource: Resource) {
  Localisation.updateResource(
    internalLanguageMapping(language),
    resource,
  );
}

export function setLanguage(language: Language) {
  currentLanguage = internalLanguageMapping(language);
}

export function l(
  key: string,
  ...replacements: Array<string | [ string, string[] ]>
) {
  return Localisation.getStringFromLanguage(
    currentLanguage,
    key,
    ...replacements,
  );
}

export function getStringFromLanguage(
  language: Language,
  key: string,
  ...replacements: Array<string | [ string, string[] ]>
) {
  return Localisation.getStringFromLanguage(
    internalLanguageMapping(language),
    key,
    ...replacements,
  );
}

export function getRandomString(key: string): string {
  return Localisation.getRandomStringFromLanguage(currentLanguage, key);
}

export function convertDate(
  date: Date,
  format?: Localisation.ConvertDateType,
) {
  return convertDateWithLanguage(
    externalLanguageMapping(currentLanguage),
    date,
    format,
  );
}

export function convertDateWithLanguage(
  language: Language,
  date: Date,
  format?: Localisation.ConvertDateType,
) {
  switch (language) {
    case "en-US":
    case "zh":
      return Localisation.convertDateWithLanguage(
        internalLanguageMapping(language),
        date,
        format,
      );
    default:
      return "Invalid Date";
  }
}

export function localisedDefault(
  value: Option.Type<string>,
  fallbackKey: string,
  ...fallbackReplacements: Array<string | [ string, string[] ]>
) {
  Localisation.localisedDefault(
    currentLanguage,
    value,
    fallbackKey,
    ...fallbackReplacements,
  );
}

export const Context: React.Context<Localisation.Language> =
  Localisation.Context;

export function l_(
  key: string,
  ...replacements: Array<string | [string, string[]]>
): React.FunctionComponentElement<React.ConsumerProps<Localisation.Language>> {
  return React.createElement(
    Context.Consumer,
    null,
    (language: Language) => {
      return getStringFromLanguage(language, key, ...replacements);
    },
  );
}

export function *getAllBundledLanguage(): IterableIterator<Language> {
  for (const internalLanguage of Localisation.getAllBundledLanguage()) {
    yield externalLanguageMapping(internalLanguage);
  }
}

export function registeredLanguage(language: Language): Localisation.Language {
  return internalLanguageMapping(language);
}
