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

export type OutcomeActions =
  | HasCapability
  | Complete
;

export type InstallActions =
  | Install
  | Query
;

export type AllActions =
  | Install
  | Query
  | HasCapability
  | Complete
;

export function isInstall(action: AllActions): action is Install {
  return action.action === "ESim/INSTALL";
}

export function isQuery(action: AllActions): action is Query {
  return action.action === "ESim/QUERY_DEVICE_CAPABILITIES";
}

export function isHasCapability(action: AllActions): action is HasCapability {
  return action.action === "ESim/INSTALLATION_HAS_CAPABILITY";
}

export function isComplete(action: AllActions): action is Complete {
  return action.action === "ESim/INSTALLATION_COMPLETE";
}
