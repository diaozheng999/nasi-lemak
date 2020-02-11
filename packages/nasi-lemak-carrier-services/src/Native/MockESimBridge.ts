/**
 * MockESimBridge.ts
 * @author Diao Zheng
 * @file A default implementation
 */

import { IESimBridge } from "./IESimBridge";

export class MockESimBridge implements IESimBridge {
  public async deviceSupportsESimInstallation() {
    return false;
  }

  public async installESimProfile(...__: any[]) {
    return "unknown" as const;
  }
}
