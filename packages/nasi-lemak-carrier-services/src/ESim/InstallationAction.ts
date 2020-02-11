/**
 * InstallationAction.ts
 * @author Diao Zheng
 * @file Actions for ESim Installation
 */

// @barrel export all

import { Action } from "nasi-lemak";
import { ESimInstallationOutcome } from "../Native";
import { ActivationCode } from "./ActivationCode";

export const Scope = Symbol("carrier-services/ESIM/INSTALLATION");

export type Install = Action.Scoped<
  typeof Scope,
  Action.Type<"ESim/INSTALL", ActivationCode>
>;

export function Install(activationCode: ActivationCode): Install {
  return {
    action: "ESim/INSTALL",
    payload: activationCode,
    scope: Scope,
  };
}

export type HasCapability = Action.Scoped<
  typeof Scope,
  Action.Type<"ESim/INSTALLATION_HAS_CAPABILITY", boolean>
>;

export function HasCapability(hasCapability: boolean): HasCapability {
  return {
    action: "ESim/INSTALLATION_HAS_CAPABILITY",
    payload: hasCapability,
    scope: Scope,
  };
}

export type Complete = Action.Scoped<
  typeof Scope,
  Action.Type<"ESim/INSTALLATION_COMPLETE", ESimInstallationOutcome>
>;

export function Complete(outcome: ESimInstallationOutcome): Complete {
  return {
    action: "ESim/INSTALLATION_COMPLETE",
    payload: outcome,
    scope: Scope,
  };
}

export type OutcomeActions =
  | HasCapability
  | Complete
;

export type Query = Action.Scoped<
  typeof Scope,
  Action.Only<"ESim/QUERY_DEVICE_CAPABILITIES">
>;

export function Query(): Query {
  return {
    action: "ESim/QUERY_DEVICE_CAPABILITIES",
    scope: Scope,
  };
}
