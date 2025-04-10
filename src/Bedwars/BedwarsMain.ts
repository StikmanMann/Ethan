import "Bedwars/CustomItems/Tnt";
import "Bedwars/BedwarsPlayerFunctions";
import "Bedwars/CustomItems/PlayerTracker";
import "Bedwars/CustomItems/ExplosionResistantGlass";
import "Bedwars/Teams/TeamDamage";
import "Bedwars/ChestShop/Categories/Catergorie";
import {
  Player,
  PlayerBreakBlockAfterEvent,
  PlayerBreakBlockBeforeEventSignal,
  system,
  Vector3,
  world,
} from "@minecraft/server";
import { EGameMode, IMapData, MapParser } from "MapParser/loadMap";

import { TeamColorType } from "./Teams/TeamColor";
import { LinkedList } from "dataTypes/linkedList";

export interface IBedwarsData {
  playerPlacedBlockLocations: Set<string>;
  /**
   * @description Increasing this will make generators also faster!
   */
  ticksPerSecond: number;
  currentTick?: number;

  lapisGenerators: Vector3[];
  queuedLapisGenerators?: LinkedList<string>[];

  lapisGeneratorLevel: () => IGeneratorLevel<["lapis_lazuli"]>;

  diamondGenerators: Vector3[];
  queuedDiamondsGenerators?: LinkedList<string>[];

  diamondGeneratorLevel: () => IGeneratorLevel<["diamond"]>;

  bedwarsBlockBreakAfter: (data: IMapData<EGameMode.BEDWARS>) => (eventData: PlayerBreakBlockAfterEvent) => void;

  teams: {
    stats: {
      bedsDestroyed?: number;
    }
    status: {
      bedDestroyed?: boolean;
    }
    generatorLevel: number;
    generatorLevels: (() => IGeneratorLevel<any>)[];
    teamName: string;
    teamColor: keyof TeamColorType;
    playerAmount: number;
    players: Player[];
    spawnPoints: Vector3[];
    bedLocation: Vector3;
    generator: Vector3;
  }[];
}
/**
 * @description The level of a generator
 * @template T - The items that can be spawned
 */
export interface IGeneratorLevel<T extends string[]> {
  itemNames: T;
  /**
   * The amount of ticks for each item to spawn
   */
  itemSpawnRate: Map<T[any], number>;
}
