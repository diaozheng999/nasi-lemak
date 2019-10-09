
/**
 * Localisation.ts
 * @author Diao Zheng
 * @file Mock implementation for Localisation to remove randomness
 */
import { Localisation } from "..";

declare const module: any;

const actual: typeof Localisation = jest.requireActual("../Localisation");

actual.getRandomStringFromLanguage = actual.getStringFromLanguage;

module.exports = actual;
