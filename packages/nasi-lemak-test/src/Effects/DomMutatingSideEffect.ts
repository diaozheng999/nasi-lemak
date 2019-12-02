
/**
 * DomMutatingSideEffect.ts
 * @author Diao Zheng
 * @file A Side Effect that mutates the React DOM
 */

import { Unique } from "nasi";
import { act } from "react-test-renderer";
import { Duration } from "../Utils";
import { SideEffect } from "./SideEffect";

const Generator = new Unique("DomMutatingSideEffect");

export class DomMutatingSideEffect extends SideEffect {
  constructor(action: () => void, generator?: Unique) {
    super(
      act.bind(undefined, action),
      generator ?? Generator,
      Duration.NEXT_FRAME,
    );
  }

  protected describeEffect() {
    return `DomMutatingSideEffect ${this.id}`;
  }

}
