import { system, world } from "@minecraft/server";
import { EGameMode, MapParser } from "./loadMap";
import { Logger } from "staticScripts/Logger";
import { AwaitFunctions } from "staticScripts/awaitFunctions";
import { largeMap } from "./BedwarsMaps/BedwarsMapsFunctions";
// mapDefinitions.ts
export var EMapList;
(function (EMapList) {
    EMapList[EMapList["TEST"] = 1] = "TEST";
    EMapList[EMapList["LARGEMAP"] = 2] = "LARGEMAP";
    // Add more maps as needed
})(EMapList || (EMapList = {}));
export const mapList = [
    /* {
      mapId: 1,
      mapName: "Test Map",
      gameMode: EGameMode.BRIDGE,
      mapData: testMap,
    }, */
    {
        mapId: 2,
        mapName: "Large Map",
        gameMode: EGameMode.BEDWARS,
        mapData: largeMap,
    },
];
const preloadMaps = async () => {
    for (const map of mapList) {
        Logger.warn(`Preloading Map: ${map.mapName}`);
        map.mapData.structures = await MapParser.createStructureArray(map.mapData, world.getDimension("overworld"));
        world.sendMessage(map.mapData.structureId);
    }
};
system.run(async () => {
    await preloadMaps();
    await AwaitFunctions.waitTicks(10);
    MapParser.loadMap(largeMap, { x: 1000, y: 0, z: 1000 }, world.getPlayers());
});
