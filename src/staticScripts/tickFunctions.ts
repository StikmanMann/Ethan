import { system, world, Player, MolangVariableMap } from "@minecraft/server";
import { Logger } from "./Logger";
import { SprintClass } from "playerMovement/sprint";
export { TickFunctions };
class TickFunction {
  tickFunction: () => void;
  tick: number;

  constructor(tickFunction, tick) {
    this.tickFunction = tickFunction;
    if (typeof tick == "undefined") {
      this.tick = 1;
    } else {
      this.tick = tick;
    }
  }
}

class TickFunctions {
  static tickFunctions: TickFunction[] = [];

  static tick() {
    system.runInterval(() => {
      for (const func of this.tickFunctions) {
        if (system.currentTick % func.tick == 0) {
          func.tickFunction();
        }
      }
    }, 1);
  }

  /**
   *
   * @param newFunction
   * @param tick How many ticks before the function is called
   * @returns Tick function id if you want to remove it later
   *
   */
  static addFunction = (newFunction: () => void, tick: number): number => {
    if (tick < 1) {
      Logger.warn(
        "Tick must be greater than 0. Defaulting to 1",
        "TickFunction"
      );
    }

    this.tickFunctions.push(new TickFunction(newFunction, tick));
    return this.tickFunctions.length - 1;
  };

  static removeFunction(functionId: number) {
    this.tickFunctions.splice(functionId, 1);
  }
}

TickFunctions.tick();
