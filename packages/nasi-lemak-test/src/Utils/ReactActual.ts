/**
 * ReactActual.ts
 * @author Diao Zheng
 * @file A wrapper to require the ACTUAL react
 */

import React from "react";

export const ReactActual: typeof React = (
  (
    typeof jest !== "undefined" &&
    process?.env?.JEST_WORKER_ID &&
    (React as any).__nlinternal_registeredMocks
  ) ?
    jest.requireActual("react")
  :
    require("react")
);
