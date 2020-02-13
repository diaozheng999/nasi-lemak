/**
 * ReactActual.ts
 * @author Diao Zheng
 * @file A wrapper to require the ACTUAL react
 */

// FIXME: in TypeScript 3.8:
// import type React from "react";

export const ReactActual: any = (
  (
    typeof jest !== "undefined" &&
    process?.env?.JEST_WORKER_ID
  ) ?
    jest.requireActual("react")
  :
    require("react")
);
