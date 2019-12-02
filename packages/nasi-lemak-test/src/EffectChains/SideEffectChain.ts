/**
 * SideEffectChain.ts
 * @author Diao Zheng
 * @file Describes a chain of side effects
 */

import { Option, requires, Unique, UniqueValue } from "nasi";
import { SideEffect } from "../Effects";
import { IDescribable } from "../Interfaces";
import { Duration } from "../Utils";

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
  public static activePersistentChains: Set<SideEffectChain> = new Set();

  protected id: UniqueValue;

  protected abstract chain: Iterable<SideEffect | SideEffectChain>;
  protected state: State = { type: "PENDING" };
  protected active: boolean;

  private spawnedBy: IDescribable;
  private persistent: boolean;

  constructor(
    spawnedBy: IDescribable,
    generator?: Unique,
    persistent?: boolean,
  ) {
    this.spawnedBy = spawnedBy;
    this.id = (generator ?? Generator).opaque;
    this.active = true;
    this.persistent = persistent ?? false;
    if (this.persistent) {
      SideEffectChain.activePersistentChains.add(this);
    }
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

  public owner() {
    return this.spawnedBy;
  }

  public deactivate() {
    if (!this.persistent) {
      throw new Error("Can only deactivate a persistent side effect.");
    }
    this.active = false;
    SideEffectChain.activePersistentChains.delete(this);
  }

  public isCompleted(): boolean {
    if (this.persistent) {
      return !this.active && this.state.type === "COMPLETE";
    }
    return this.state.type === "COMPLETE";
  }

  public abstract enqueue(effect: SideEffect | SideEffectChain): void;

  @requires(function(this: SideEffectChain, __: boolean) {
    return !this.isCompleted();
  })
  public setPersistence(persistent: boolean) {
    if (persistent !== this.persistent) {
      this.persistent = persistent;
      if (this.persistent) {
        SideEffectChain.activePersistentChains.add(this);
      } else {
        SideEffectChain.activePersistentChains.delete(this);
      }
    }
  }

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
    console.log(this.describe(""));
  }

  public describe(linePrefix: string, abbreviate: boolean = false) {

    const blank = this.blankify(linePrefix);

    // const newPrefix = `${linePrefix}${this.id}: `;
    // const blankPrefix = this.blankify(newPrefix);

    let status = this.describeStatus(linePrefix, abbreviate);

    if (!abbreviate) {
      status += this.describeSource(blank);
    }
    return status;
  }

  protected abstract advance(duration: Duration.Type): Duration.Type;

  protected step(): Duration.Type {
    switch (this.state.type) {
      case "COMPLETE":
        if (this.persistent && this.active) {
          return Duration.INSTANT;
        }
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

  private describeSource(linePrefix: string): string {
    return (
      `${linePrefix}${this.id} is spawned by:\n` +
      this.spawnedBy.describe(linePrefix + "  ", true) +
      "\n"
    );
  }

  private describeStatus(linePrefix: string, abbreviate: boolean): string {

    if (abbreviate) {
      switch (this.state.type) {
        case "PENDING":
          return `${linePrefix} ${this.id} <pending>`;
        case "EXECUTING":
        case "EXECUTING_CHAIN":
          const prefix = `${linePrefix} ${this.id} >> `;
          const blanks = this.blankify(prefix);

          return prefix + this.state.current.describe(blanks, true);
        case "COMPLETE":
          return `${linePrefix} ${this.id} <complete>`;
      }
    }

    const newPrefix = `${linePrefix}${this.id}: `;
    // const spacePrefix = this.blankify(newPrefix);

    let result = "";

    switch (this.state.type) {
      case "PENDING":
        result += `${newPrefix}<pending>\n`;
        break;
      case "EXECUTING":
      case "EXECUTING_CHAIN":
        result += this.state.current.describe(newPrefix, true);
        break;
      case "COMPLETE":
        result += `${newPrefix}<completed>\n`;
        break;
    }

    result += `${linePrefix}spawned by:\n`;
    result += this.spawnedBy.describe(linePrefix + "  ");

    return result + "\n";
  }

  private blankify(str: string): string {
    let result = "";
    for (const _ of str) {
      result += " ";
    }
    return result;
  }

}
