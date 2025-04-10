import { system, world } from "@minecraft/server";
import { testMap } from "./Bridge Maps/brideMaps";
import { EGameMode, IMapData, MapParser } from "./loadMap";
import { Logger } from "staticScripts/Logger";
import { AwaitFunctions } from "staticScripts/awaitFunctions";
import { choosePlayer } from "hud";
import { largeMap } from "./BedwarsMaps/BedwarsMapsFunctions";

// mapDefinitions.ts
export enum EMapList {
  TEST = 1,
  LARGEMAP = 2,
  // Add more maps as needed
}

export interface IMapID {
  mapId: number;
  mapName: string;
  gameMode: EGameMode;
  mapData: IMapData;
}

export const mapList: IMapID[] = [
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
    map.mapData.structures = await MapParser.createStructureArray(
      map.mapData,
      world.getDimension("overworld")
    );
    world.sendMessage(map.mapData.structureId);
  }
};

system.run(async () => {
  await preloadMaps();
  await AwaitFunctions.waitTicks(10);

  MapParser.loadMap(largeMap, { x: 1000, y: 0, z: 1000 }, world.getPlayers());
});
