/**
 * SideEffectChain.ts
 * @author Diao Zheng
 * @file Describes a chain of side effects
 */

import { Option, Unique, UniqueValue } from "nasi";
import { SideEffect } from "../Effects";
import { IDescribable, Duration } from "../Interfaces";

const Generator = new Unique("SideEffectChain");

interface ISideEffectComplete {
  type: "COMPLETE";
}

interface ISideEffectExecuting {
  type: "EXECUTING";
  current: SideEffect;
}

interface ISideEffectExecutingChain {
  type: "EXECUTING_CHAIN";
  current: SideEffectChain;
}

interface ISideEffectPending {
  type: "PENDING";
}

type State =
  | ISideEffectComplete
  | ISideEffectExecuting
  | ISideEffectExecutingChain
  | ISideEffectPending
;

export abstract class SideEffectChain implements IDescribable {

  protected id: UniqueValue;

  protected abstract chain: Iterable<SideEffect | SideEffectChain>;
  protected state: State = { type: "PENDING" };

  private spawnedBy: IDescribable;

  constructor(spawnedBy: IDescribable, generator?: Unique) {
    this.spawnedBy = spawnedBy;
    this.id = (generator ?? Generator).opaque;
  }

  public currentEffect(): Option.Type<SideEffect> {
    switch (this.state.type) {
      case "EXECUTING":
        return this.state.current;
      case "EXECUTING_CHAIN":
        return this.state.current.currentEffect();

      default:
        return;
    }
  }

  public isCompleted(): boolean {
    return this.state.type === "COMPLETE";
  }

  public abstract enqueue(effect: SideEffect | SideEffectChain): void;

  public execute(): Duration.Type {
    switch (this.state.type) {
      case "PENDING":
        this.advance(Duration.INSTANT);
    }
    const duration = this.step();
    return this.advance(duration);
  }

  public printCurrent() {
    // tslint:disable-next-line: no-console
    console.log(this.describeCurrent(""));
  }

  public describe(linePrefix: string) {
    const newPrefix = `${linePrefix}${this.id}: `;
    const blankPrefix = newPrefix.replace(/./, " ");

    let result = this.describeCurrent(linePrefix);
    for (const item of this.chain) {
      result += item.describe(blankPrefix);
    }

    return result;
  }

  public executeOrNoop(): Duration.Type {
    switch (this.state.type) {
      case "COMPLETE":
        return Duration.INSTANT;

      default:
        return this.execute();
    }
  }

  protected abstract advance(duration: Duration.Type): Duration.Type;

  protected step(): Duration.Type {
    switch (this.state.type) {
      case "COMPLETE":
        throw new Error(
          `Cannot step into completed effect chain ${this.id}.`,
        );

      case "EXECUTING_CHAIN":
        return this.state.current.step();

      case "EXECUTING":
        return this.state.current.execute();

      default:
        return Duration.INSTANT;
    }
  }

  private describeCurrent(linePrefix: string): string {

    const newPrefix = `${linePrefix}${this.id}: `;
    const spacePrefix = newPrefix.replace(/./, " ") + "  ";

    let result = newPrefix;

    switch (this.state.type) {
      case "PENDING":
        result += `${newPrefix}<pending>\n`;
        break;
      case "EXECUTING":
      case "EXECUTING_CHAIN":
        result += this.state.current.describe(newPrefix);
        break;
      case "COMPLETE":
        result += `${newPrefix}<completed>\n`;
        break;
    }

    result += spacePrefix + "spawned by:\n";
    result += this.spawnedBy.describe(spacePrefix);

    return result;
  }

}
