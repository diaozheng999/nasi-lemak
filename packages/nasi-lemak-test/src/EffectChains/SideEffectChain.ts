/**
 * SideEffectChain.ts
 * @author Diao Zheng
 * @file Describes a chain of side effects
 */

import { Option, requires, Unique, UniqueValue } from "nasi";
import { SideEffect } from "../Effects";
import { IDescribable } from "../Interfaces";
import { Duration } from "../Utils";

import { matcherErrorMessage, MatcherHintOptions, matcherHint, RECEIVED_COLOR, printWithType, printReceived } from "jest-matcher-utils";

const ABBREV_DESC_CHAIN_LENGTH = 3;

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

  private describeSource(linePrefix: string): string {
    return (
      `${this.id} is spawned by:\n` +
      linePrefix + this.spawnedBy.describe(linePrefix, true) +
      "\n"
    );
  }

  private blankify(str: string): string {
    let result = "";
    for (const _ of str) {
      result += " ";
    }
    return result;
  }

}

function ensureIsSideEffectChain(
  received: SideEffectChain,
  matcherName: string,
  options?: MatcherHintOptions,
) {
  if (!(received instanceof SideEffectChain)) {
    throw new Error(
      matcherErrorMessage(
        matcherHint(matcherName, undefined, "", options),
        RECEIVED_COLOR("received") +
        " value must be an instance of SideEffectChain",
        printWithType("Received", received, printReceived),
      ),
    );
  }
}

expect.extend({
  toBeCompleted: (received: SideEffectChain) => {
    ensureIsSideEffectChain(received, "toBeCompleted");
    if (received.isCompleted()) {
      return {
        message: () => `expected ${received.getId()} not to be completed.`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received.getId()} to be completed.`,
        pass: false,
      };
    }
  },
});

declare global {
  namespace jest {
    interface ISideEffectChainMatchers extends Matchers<void, SideEffectChain> {
      toBeCompleted(): void;
    }

    interface Matchers<R, T> {
      toBeCompleted(): R;
    }

    // tslint:disable-next-line: interface-name
    interface Expect {
      // tslint:disable-next-line: callable-types
      (actual: SideEffectChain): ISideEffectChainMatchers;
    }
  }
}
