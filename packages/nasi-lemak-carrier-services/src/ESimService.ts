/**
 * ESimService.ts
 * @author Diao Zheng
 * @file ESim installation result
 */

// @barrel export all

import { merge, Observable, zip } from "rxjs";
import { InstallationAction } from "./ESim";
import { ESimBridge } from "./Native";

import { Platform, PlatformOSType } from "react-native";
import { flatMap, map, mergeMap, share } from "rxjs/operators";

export interface IESimServiceContext {
  disabledPlatforms?: PlatformOSType | Iterable<PlatformOSType>;
}

async function queryCapability(context: IESimServiceContext) {
  if (context.disabledPlatforms) {
    if (typeof context.disabledPlatforms === "string") {
      if (Platform.OS === context.disabledPlatforms) {
        return false;
      }
    } else {
      for (const item of context.disabledPlatforms) {
        if (Platform.OS === item) {
          return false;
        }
      }
    }
  }
  return ESimBridge.deviceSupportsESimInstallation();
}

async function installOne(
  [ profile, capability ]: [ InstallationAction.Install, boolean ],
): Promise<InstallationAction.OutcomeActions> {
  if (capability) {
    return InstallationAction.Complete(await ESimBridge.installESimProfile(
      profile.payload.smdpAddress,
      profile.payload.confirmationCode ?? null,
      profile.payload.eid ?? null,
      profile.payload.iccid ?? null,
      profile.payload.matchingId,
      profile.payload.oid ?? null,
      profile.payload.activationCode,
    ));
  } else {
    return InstallationAction.Complete("unknown");
  }
}

export const install =
  (context: IESimServiceContext) =>
  (
    input: Observable<InstallationAction.Install>,
  ): Observable<InstallationAction.OutcomeActions> =>
{

  const capability$ = input.pipe(
    flatMap(queryCapability.bind(undefined, context)),
    share(),
  );

  const installation$ = zip(
    input,
    capability$,
  ).pipe(mergeMap(installOne));

  return merge(
    capability$.pipe(map(InstallationAction.HasCapability)),
    installation$,
  );
};

export const query =
  (context: IESimServiceContext) =>
  (
    input: Observable<InstallationAction.Query>,
  ): Observable<InstallationAction.HasCapability> =>
{
  return input.pipe(
    flatMap(queryCapability.bind(undefined, context)),
    map(InstallationAction.HasCapability),
  );
};
