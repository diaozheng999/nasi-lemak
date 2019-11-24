
/**
 * DomMutatingSideEffect.ts
 * @author Diao Zheng
 * @file A Side Effect that mutates the React DOM
 */

import { Unique } from "nasi";
import { act } from "react-test-renderer";
import { SideEffect } from "./SideEffect";

const Generator = new Unique("DomMutatingSideEffect");

export class DomMutatingSideEffect extends SideEffect {
  constructor(action: () => void, generator?: Unique) {
    super(act.bind(undefined, action), generator ?? Generator);
  }

  public toString() {
    if (this.done) {
      return `<DomMutatingSideEffect ${this.id} (completed)>`;
    }
    return `<DomMutatingSideEffect ${this.id}>`;
  }
}
