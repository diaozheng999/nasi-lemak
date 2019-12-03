/**
 * SideEffect.ts
 * @author Diao Zheng
 * @file A Side Effect that's been spawned
 */

import { requires, Unique, UniqueValue } from "nasi";
import { IDescribable } from "../Interfaces";
import { Duration } from "../Utils";

export class SideEffect implements IDescribable {

  protected id: UniqueValue;
  protected done: boolean = false;

  protected duration: Duration.Type;

  private action: () => void;

  constructor(
    action: () => void,
    generator?: Unique,
    duration?: Duration.Type,
  ) {
    this.action = action;
    this.id = (generator ?? new Unique("SideEffect")).opaque;
    this.duration = duration ?? Duration.INSTANT;
  }

  @requires(function(this: SideEffect) { return !this.done; })
  public execute(): Duration.Type {
    this.action();
    this.done = true;
    return this.duration;
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

  public getId() {
    return this.id;
  }

  public owner(): undefined {
    return;
  }

  public describe(_: string, __?: boolean) {
    return `${this.toString()}`;
  }

  public getDuration(): Duration.Type {
    return this.duration;
  }

  protected describeEffect() {
    return `SideEffect ${this.id}`;
  }

}
