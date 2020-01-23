/**
 * CompositeSideEffectChain.ts
 * @author Diao Zheng
 * @file The basis of a side effect chain that combines 2 or more effects
 */

import _ from "lodash";
import { invariant, Unique } from "nasi-lemak";
import { IDescribable } from "../Interfaces";
import { Duration } from "../Utils";
import { SideEffectChain } from "./SideEffectChain";

export abstract class CompositeSideEffectChain<
  TChainNames extends string
>
extends SideEffectChain
{
  protected readonly executionOrder: Array<TChainNames | "main">;
  protected readonly indices: { [key in TChainNames | "main"]: number };
  protected readonly chain: SideEffectChain[];

  private readonly mainQueue: SideEffectChain;

  constructor(
    executionOrder: Array<TChainNames | "main">,
    types: {
      [key in TChainNames | "main"]:
      new (
        spawnedBy: IDescribable,
        generator?: Unique,
        persistent?: boolean,
      ) => SideEffectChain;
    },
    spawnedBy: IDescribable,
    generator?: Unique,
    id?: string,
  ) {
    super(spawnedBy, generator ?? new Unique("CompositeSideEffectChain"), true);

    const fixedId = id ?? this.id;

    this.executionOrder = executionOrder;

    this.chain = [];
    this.indices = {} as any;

    let i = 0;

    this.mainQueue = new types.main(
      this,
      new Unique(`${fixedId}_mainQueue`),
      true,
    );

    for (const key of this.executionOrder) {
      this.indices[key] = i++;
      if (key === "main") {
        this.chain.push(this.mainQueue);
      } else {
        this.chain.push(new types[key](
          this,
          new Unique(`${fixedId}_${_.camelCase(key)}Queue`),
          true,
        ));
      }
    }

    invariant(
      () => this.chain.indexOf(this.mainQueue) >= 0,
      "The key `main` must be present.",
    );
  }

  public setPersistence(__: boolean) {
    throw new Error("A CompositeSideEffect is always persistent.");
  }

  public deactivate = () => {
    for (const queue of this.chain) {
      queue.deactivate();
    }
  }

  protected step: () => Duration.Type = () => {
    switch (this.state.type) {
      case "EXECUTING_CHAIN":
        return this.chain
          .map((chain) => chain.execute())
          .reduce(Duration.reducer);

      default:
        return super.step();
    }
  }

  protected advance(duration: Duration.Type): Duration.Type {
    if (this.active) {
      this.incrementStepCount();
    } else if (
      _.filter(this.chain, (chain) => !chain.isCompleted()).length > 0
    ) {
      this.incrementStepCount();
    } else {
      this.state = { type: "COMPLETE" };
    }
    return duration;
  }

  protected getQueue(queueName: TChainNames | "main"): SideEffectChain {
    return this.chain[this.indices[queueName]];
  }

  protected describeStatus(
    prefix: string,
    blanks: string,
  ) {
    switch (this.state.type) {
      case "EXECUTING":
        return `${this.id}    [!! UNREACHABLE ERROR STATE !!]`;

      case "EXECUTING_CHAIN":
        let str = "";
        for (let i = 0; i < this.chain.length; ++i) {
          const pref = this.executionOrder[i] + ": ";
          const newBlanks = blanks + this.blankify(pref);
          str += i === 0 ? prefix : blanks;
          str += `${pref}${this.chain[i].describe(newBlanks, true)}\n`;
        }
        return str;

      default:
        return super.describeStatus(prefix, blanks);
    }
  }

  private incrementStepCount() {
    if (this.state.type === "EXECUTING_CHAIN") {
      ++this.state.stepCount;
    } else {
      this.state = {
        current: this,
        stepCount: 0,
        type: "EXECUTING_CHAIN",
      };
    }
  }

}
