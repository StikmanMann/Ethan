import { world } from "@minecraft/server";
import { IGeneratorLevel } from "Bedwars/BedwarsMain";

export class GeneratorLevels {
    static readonly level1diamond = (): IGeneratorLevel<["diamond"]> => {
        return {
            itemNames: ["diamond"] as const,
            itemSpawnRate: new Map([["diamond", 45]]),
        };
    }

    static readonly level1lapis = (): IGeneratorLevel<["lapis_lazuli"]> => {
        return {
            itemNames: ["lapis_lazuli"] as const,
            itemSpawnRate: new Map([["lapis_lazuli", 30]]),
        };
    }

    static readonly level1team = (): IGeneratorLevel<["copper_ingot", "iron_ingot"]> => {
        return {
            itemNames: ["copper_ingot", "iron_ingot"] as const,
            itemSpawnRate: new Map([["copper_ingot", 5], ["iron_ingot", 20]]),
        };
    }
}

world.sendMessage(`${GeneratorLevels.level1diamond().itemSpawnRate.get("diamond")}`)
