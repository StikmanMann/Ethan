import { world } from "@minecraft/server";
export class GeneratorLevels {
}
GeneratorLevels.level1diamond = () => {
    return {
        itemNames: ["diamond"],
        itemSpawnRate: new Map([["diamond", 45]]),
    };
};
GeneratorLevels.level1lapis = () => {
    return {
        itemNames: ["lapis_lazuli"],
        itemSpawnRate: new Map([["lapis_lazuli", 30]]),
    };
};
GeneratorLevels.level1team = () => {
    return {
        itemNames: ["copper_ingot", "iron_ingot"],
        itemSpawnRate: new Map([["copper_ingot", 5], ["iron_ingot", 20]]),
    };
};
world.sendMessage(`${GeneratorLevels.level1diamond().itemSpawnRate.get("diamond")}`);
