/**
 * IESimBridge.ts
 * @author Diao Zheng
 * @file Defines the native module specifications
 */

// @barrel export ESimInstallationOutcome

import { Option } from "nasi-lemak";

export type ESimInstallationOutcome =
  | "success"
  | "fail"
  | "unknown"
;

export interface IESimBridge {
  /**
   * Any native implementation should return true IFF the current device
   * supports installation of an eSIM profile.
   *
   * Refer to the following for device capabilities check:
   *
   * Android:
   *   https://source.android.com/devices/tech/connect/esim-overview
   *
   * iOS:
   *   https://developer.apple.com/documentation/coretelephony
   *
   */
  deviceSupportsESimInstallation(): Promise<boolean>;

  /**
   * Attempt to install the eSIM profile in into the system, and return the
   * output status. Note that the function should always resolve to unknown
   * if the device does not support eSIM profile installation.
   *
   * The return state follows the specifications set out by
   * CTCellularPlanProvisioning.addPlanWith message on iOS, which will resolve
   * to an enum with "success", "fail" or "unknown". Note that when this
   * resolves to "success", the server should always respond with a "installed"
   * for this particular eSIM profile.
   *
   * This function call contains both inputs to Android and iOS, since for iOS
   * we require all the individual values, but on Android we require the encoded
   * activation code.
   *
   * @param address The SM-DP+ address (iOS only)
   * @param confirmationCode (iOS only)
   * @param eid Device EID (iOS only)
   * @param iccid SIM Card ICCID (iOS only)
   * @param matchingId Matching ID (iOS only)
   * @param oid (iOS only)
   * @param profile The encoded activation code (Android only)
   */
  installESimProfile(
    address: string,
    confirmationCode: Option.Nullable<string>,
    eid: Option.Nullable<string>,
    iccid: Option.Nullable<string>,
    matchingId: string,
    oid: Option.Nullable<string>,
    profile: string,
  ): Promise<ESimInstallationOutcome>;
}
