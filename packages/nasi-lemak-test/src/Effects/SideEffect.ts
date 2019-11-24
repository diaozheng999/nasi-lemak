/**
 * SideEffect.ts
 * @author Diao Zheng
 * @file A Side Effect that's been spawned
 */

import { requires, Unique, UniqueValue } from "nasi";
import { IDescribable } from "../Interfaces/IDescribable";

const Generator = new Unique("SideEffect");

export class SideEffect implements IDescribable {

  protected id: UniqueValue;
  protected done: boolean = false;

  private action: () => void;

  constructor(action: () => void, generator?: Unique) {
    this.action = action;
    this.id = (generator ?? Generator).opaque;
  }

  @requires(function(this: SideEffect) { return !this.done; })
  public execute() {
    this.action();
    this.done = true;
  }

  public toString() {
    if (this.done) {
      return `<${this.describeEffect()} (completed)>`;
    }
    return `<${this.describeEffect()}>`;
  }

  public isCompleted() {
    return this.done;
  }

  public describe(linePrefix: string) {
    return `${linePrefix}${this.toString()}\n`;
  }

  protected describeEffect() {
    return `SideEffect ${this.id}`;
  }

}
