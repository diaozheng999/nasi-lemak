
/**
 * UseEffect.ts
 * @author Diao Zheng
 * @file useEffect compatible hook
 */

import { Unique } from "nasi";
import { IDescribable } from "../Interfaces";
import { Duration } from "../Utils";
import { SerialSideEffectChain } from "./SerialSideEffectChain";
import { SideEffectChain } from "./SideEffectChain";

export class UseEffect extends SideEffectChain {

  private mainQueue: SideEffectChain;
  private cleanupQueue: SideEffectChain;

  protected get chain() {
    return [
      this.cleanupQueue,
      this.mainQueue,
    ];
  }

  constructor(
    spawnedBy: IDescribable,
    id?: string,
  ) {
    super(spawnedBy, new Unique("UseEffect"), true);

    const fixedId = id ?? this.id;

    this.mainQueue = new SerialSideEffectChain(
      this,
      new Unique(`${fixedId}_MainQueue`),
      true,
    );

    this.cleanupQueue = new SerialSideEffectChain(
      this,
      new Unique(`${fixedId}_CleanupQueue`),
      true,
    );
  }

  public setPersistence(__: boolean) {
    throw new Error("A UseEffect chain is always persistent.");
  }

  public deactivate = () => {
    this.mainQueue.deactivate();
    this.cleanupQueue.deactivate();
  }

  protected step: () => Duration.Type = () => {
    switch (this.state.type) {
      case "EXECUTING_CHAIN":
        const duration: Duration.Type[] = [
          this.cleanupQueue.execute(),
          this.mainQueue.execute(),
        ];
        return duration.reduce(Duration.reducer);

      default:
        return super.step();
    }
  }

  protected advance(duration: Duration.Type): Duration.Type {

    if (this.active) {
      this.incrementStepCount();
    } else if (
      !this.mainQueue.isCompleted() ||
      !this.updateQueue.isCompleted() ||
      !this.sideEffectQueue.isCompleted()
    ) {
      this.incrementStepCount();
    } else {
      this.state = { type: "COMPLETE" };
    }
    return duration;
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
