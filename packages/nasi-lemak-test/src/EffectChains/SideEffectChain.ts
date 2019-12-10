/**
 * SideEffectChain.ts
 * @author Diao Zheng
 * @file Describes a chain of side effects
 */

import { Option, requires, Unique, UniqueValue } from "nasi";
import { SideEffect } from "../Effects";
import { IDescribable } from "../Interfaces";
import { Duration } from "../Utils";

const ABBREV_DESC_CHAIN_LENGTH = 3;

const MAX_EXECUTE_STEP_COUNT = 100000;

interface ISideEffectComplete {
  type: "COMPLETE";
}

interface ISideEffectExecuting {
  type: "EXECUTING";
  current: SideEffect;
}

interface ISideEffectExecutingChain {
  type: "EXECUTING_CHAIN";
  stepCount: number;
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

  private stepCount = 0;

  private ignoreCompleteStateForFirstLoop: boolean = false;

  constructor(
    spawnedBy: IDescribable,
    generator?: Unique,
    persistent?: boolean,
  ) {
    this.spawnedBy = spawnedBy;
    this.id = (generator ?? new Unique("SideEffectChain")).opaque;
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

  public deactivate = () => {
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

  public isStarted(): boolean {
    return this.state.type !== "PENDING";
  }

  @requires(function(this: SideEffectChain) {
    return !this.isCompleted();
  })
  public enqueue(...effects: Array<SideEffect | SideEffectChain>) {
    for (const effect of effects) {
      this.push(effect);
    }
  }

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

  public isPersistent = () => {
    return this.persistent;
  }

  public execute: () => Duration.Type = () => {

    if (++this.stepCount > MAX_EXECUTE_STEP_COUNT) {
      throw new Error(
        `Executed more than ${MAX_EXECUTE_STEP_COUNT} steps in effect chain ` +
        `${this.getId()}. Assuming some kind of infinite loop and bailing ` +
        `out.\n${this.describe("")}`,
      );
    }

    switch (this.state.type) {
      case "PENDING":
        this.ignoreCompleteStateForFirstLoop = true;
        this.advance(Duration.INSTANT);
    }
    const duration = this.advance(this.step());
    this.ignoreCompleteStateForFirstLoop = false;
    return duration;
  }

  public printCurrent() {
    // tslint:disable-next-line: no-console
    console.log(this.describe(""));
  }

  public getId() {
    return `${this.id}`;
  }

  public describe(linePrefix: string, abbreviate: boolean = false) {

    const prefix = `${this.id} >> `;
    const blanks = this.blankify(linePrefix + prefix);

    // const newPrefix = `${linePrefix}${this.id}: `;
    // const blankPrefix = this.blankify(newPrefix);

    let status = this.describeStatus(prefix, blanks);
    status += this.describeChain(blanks, abbreviate);

    if (!abbreviate) {
      status += "\n" + this.describeSource(linePrefix + "  ");
    }
    return status;
  }

  protected abstract advance(duration: Duration.Type): Duration.Type;
  protected abstract push(effect: SideEffect | SideEffectChain): void;

  protected step: () => Duration.Type = () => {
    switch (this.state.type) {
      case "COMPLETE":
        if (
          (this.persistent && this.active) ||
          this.ignoreCompleteStateForFirstLoop
        ) {
          return Duration.INSTANT;
        }
        throw new Error(
          `Cannot step into completed effect chain ${this.id}.`,
        );

      case "EXECUTING_CHAIN":
      case "EXECUTING":
        return this.state.current.execute();

      default:
        return Duration.INSTANT;
    }
  }

  protected describeChain(prefix: string, abbreviate?: boolean) {
    const maxCount = abbreviate ? ABBREV_DESC_CHAIN_LENGTH : Infinity;

    let i = 0;
    let result = "";
    for (const item of this.chain) {
      if (++i > maxCount) {
        return result + `\n${prefix}...`;
      }
      result += `\n${prefix}${item.describe(prefix, true)}`;
    }

    return result || `\n${prefix}<empty chain>`;
  }

  protected describeStatus(
    prefix: string,
    blanks: string,
  ): string {

    switch (this.state.type) {
      case "PENDING":
        return `${this.id}    <pending>`;
      case "EXECUTING":
      case "EXECUTING_CHAIN":
        return prefix + this.state.current.describe(blanks, true);
      case "COMPLETE":
        return `${this.id}    <complete>`;
    }
  }

  protected blankify(str: string): string {
    let result = "";
    for (const _ of str) {
      result += " ";
    }
    return result;
  }

  private describeSource(linePrefix: string): string {

    let result = `${this.id} is spawned by:\n`;

    const actualPrefix = linePrefix + "- ";
    const prefix = linePrefix + "  ";

    for (
      let describable: Option.Type<IDescribable> = this.spawnedBy;
      Option.isSome(describable);
      describable = describable.owner()
    ) {
      result += actualPrefix + describable.describe(prefix, true) + "\n";
    }

    return result;
  }

}
