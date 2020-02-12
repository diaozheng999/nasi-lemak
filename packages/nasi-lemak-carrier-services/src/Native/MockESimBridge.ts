/**
 * MockESimBridge.ts
 * @author Diao Zheng
 * @file A default implementation
 */

import { IESimBridge } from "./IESimBridge";

/**
 * A Mock ESim bridge to use when native modules are not available.
 */
export class MockESimBridge implements IESimBridge {
  public async deviceSupportsESimInstallation() {
    return false;
  }

  public async installESimProfile(...__: any[]) {
    return "unknown" as const;
  }
}
