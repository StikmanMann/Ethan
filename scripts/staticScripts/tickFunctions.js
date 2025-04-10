var _a;
import { system } from "@minecraft/server";
import { Logger } from "./Logger";
export { TickFunctions };
class TickFunction {
    constructor(tickFunction, tick) {
        this.tickFunction = tickFunction;
        if (typeof tick == "undefined") {
            this.tick = 1;
        }
        else {
            this.tick = tick;
        }
    }
}
class TickFunctions {
    static tick() {
        system.runInterval(() => {
            for (const func of this.tickFunctions) {
                if (system.currentTick % func.tick == 0) {
                    func.tickFunction();
                }
            }
        }, 1);
    }
    static removeFunction(functionId) {
        this.tickFunctions.splice(functionId, 1);
    }
}
_a = TickFunctions;
TickFunctions.tickFunctions = [];
/**
 *
 * @param newFunction
 * @param tick How many ticks before the function is called
 * @returns Tick function id if you want to remove it later
 *
 */
TickFunctions.addFunction = (newFunction, tick) => {
    if (tick < 1) {
        Logger.warn("Tick must be greater than 0. Defaulting to 1", "TickFunction");
    }
    _a.tickFunctions.push(new TickFunction(newFunction, tick));
    return _a.tickFunctions.length - 1;
};
TickFunctions.tick();
