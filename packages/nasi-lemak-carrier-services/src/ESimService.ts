/**
 * ESimService.ts
 * @author Diao Zheng
 * @file ESim installation result
 */

// @barrel export all

import { merge, Observable, zip } from "rxjs";
import { InstallationAction } from "./ESim";
import { ESimBridge } from "./Native";

import { flatMap, map, mergeMap, share } from "rxjs/operators";

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

export function install(
  input: Observable<InstallationAction.Install>,
): Observable<InstallationAction.OutcomeActions> {

  const capability$ = input.pipe(
    flatMap(ESimBridge.deviceSupportsESimInstallation),
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
}
