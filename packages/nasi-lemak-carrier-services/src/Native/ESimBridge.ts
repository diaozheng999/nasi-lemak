/**
 * ESimBridge.ts
 * @author Diao Zheng
 * @file Bridge for ESim installation and management features
 */

import { NativeModules } from "react-native";
import { IESimBridge } from "./IESimBridge";
import { MockESimBridge } from "./MockESimBridge";

export const ESimBridge: IESimBridge = (
  NativeModules.MY1ESimBridge ||
  NativeModules.NLMESimBridge ||
  new MockESimBridge()
);
