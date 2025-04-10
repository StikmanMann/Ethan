var _a;
import { BlockVolume, InvalidStructureError, StructureSaveMode, world, } from "@minecraft/server";
import { bridgeStart, } from "Bridge/bridge";
import { GlobalVars } from "globalVars";
import { Logger } from "staticScripts/Logger";
import { AwaitFunctions } from "staticScripts/awaitFunctions";
import { TickFunctions } from "staticScripts/tickFunctions";
import { VectorFunctions } from "staticScripts/vectorFunctions";
import { bedwarsStart } from "./BedwarsMaps/BedwarsMapsFunctions";
function deepCopy(obj) {
    // Check if the value is an object or function, otherwise return it directly
    if (obj === null || typeof obj !== "object") {
        return obj;
    }
    // Handle Date
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    // Handle Array
    if (Array.isArray(obj)) {
        const arrCopy = [];
        obj.forEach((_, i) => {
            arrCopy[i] = deepCopy(obj[i]);
        });
        return arrCopy;
    }
    // Handle Object
    const objCopy = {};
    Object.keys(obj).forEach((key) => {
        objCopy[key] = deepCopy(obj[key]);
    });
    return objCopy;
}
export var EGameMode;
(function (EGameMode) {
    EGameMode[EGameMode["BRIDGE"] = 0] = "BRIDGE";
    EGameMode[EGameMode["BEDWARS"] = 1] = "BEDWARS";
})(EGameMode || (EGameMode = {}));
world.structureManager.delete("mapparser:airStruct");
const airStruct = world.structureManager.createEmpty("mapparser:airStruct", {
    x: 64,
    y: 64,
    z: 64,
});
export class MapParser {
}
_a = MapParser;
MapParser.currentMaps = new Map();
//#region Loading Functions
MapParser.loadMapById = async (mapId, offset, Players) => { };
MapParser.loadMap = async (mapData, offset, players) => {
    Logger.warn(`Loading Map: ${mapData.name}`, "MapParser");
    const dimension = world.getDimension("overworld");
    // Logger.warn(`getting dimension Map: ${mapData.name}`);
    const mapDataCopy = deepCopy(mapData);
    //Logger.warn(`deep copying  Map: ${mapData.name}`);
    for (const player of players) {
        _a.removePlayerFromAllMaps(player);
    }
    //Logger.warn(JSON.stringify(world.structureManager.getWorldStructureIds()))
    //find free index
    let findIndex = 0;
    while (_a.currentMaps.has(findIndex)) {
        findIndex++;
    }
    //Manage Players
    if (mapData.minimumPlayerAmount > players.length) {
        for (const player of players) {
            player.sendMessage(`Not enough players to start the map! MapID: ${findIndex} Map Name: ${mapData.name}`);
        }
        Logger.log(`Not enough players to start the map! MapID: ${findIndex} Map Name: ${mapData.name}`, "MapParser");
        return;
    }
    mapDataCopy.players = players;
    //load blocks
    mapDataCopy.offsetEndLocation = VectorFunctions.addVector(VectorFunctions.subtractVector(mapDataCopy.startLocation, mapDataCopy.endLocation), offset);
    mapDataCopy.offsetStartLocation = offset;
    //Logger.warn(JSON.stringify(world.structureManager.getIds()))
    try {
        await _a.placeStructureArray(mapDataCopy.structures, dimension, offset, players);
        world.sendMessage(`Placed ${mapDataCopy.structures.length} structures`);
    }
    catch (e) {
        if (e instanceof InvalidStructureError) {
            Logger.warn(`Invalid Structure ID: ${mapDataCopy.structureId}`, "MapParser");
            return;
        }
        Logger.warn(e, "MapParser");
    }
    for (const player of players) {
        player.setSpawnFunction(mapDataCopy.playerSpawnFunction(mapDataCopy));
        player.setHypixelValue("currentMatchID", findIndex);
    }
    //load entities (Implementing later since no map will use this yet)
    //load game mode data
    switch (mapDataCopy.gameMode) {
        case EGameMode.BRIDGE:
            bridgeStart(mapDataCopy, offset);
            break;
        case EGameMode.BEDWARS:
            bedwarsStart(mapDataCopy, offset);
            break;
    }
    mapDataCopy.mapId = findIndex;
    //Save the map
    _a.currentMaps.set(findIndex, mapDataCopy);
};
//#endregion
//#region Structures
/**
 * THIS IS ALSO USELESS SINCE WE PRELOADED THE STRUCTURES
 *
 * */
MapParser.placeLargeStructure = async (structureId, dimension, startLocation, endLocation, offset) => {
    const maxBlockSize = 63;
    const startX = startLocation.x;
    const startY = startLocation.y;
    const startZ = startLocation.z;
    const endX = endLocation.x;
    const endY = endLocation.y;
    const endZ = endLocation.z;
    if (startX > endX || startY > endY || startZ > endZ) {
        Logger.warn("Invalid start and end location", "MapParser");
    }
    for (let x = 0; x < endX - startX; x += maxBlockSize) {
        // for (let y = 0; y < endY - startY; y += maxBlockSize) {
        for (let z = 0; z < endZ - startZ; z += maxBlockSize) {
            Logger.warn(`Placing ${structureId} at ${x} ${startY} ${z}`, "MapParser");
            try {
                const currentStart = {
                    x: x + startX,
                    y: startY,
                    z: z + startZ,
                };
                const currentEnd = {
                    x: Math.min(currentStart.x + maxBlockSize, endX),
                    y: endY,
                    z: Math.min(currentStart.z + maxBlockSize, endZ),
                };
                for (const player of world.getAllPlayers()) {
                    //  player.teleport(currentStart)
                }
                dimension.runCommandAsync(`tickingarea add ${currentStart.x} ${currentStart.y} ${currentStart.z} ${currentEnd.x} ${currentEnd.y} ${currentEnd.z} ${structureId} true`);
                await AwaitFunctions.waitTicks(20);
                Logger.warn(`Copying ${structureId} from ${currentStart.x} ${currentStart.y} ${currentStart.z} to ${currentEnd.x} ${currentEnd.y} ${currentEnd.z}`, "MapParser");
                world.structureManager.delete(structureId);
                const tempStructure = world.structureManager.createFromWorld(structureId, dimension, currentStart, currentEnd, { includeBlocks: true });
                for (const player of world.getAllPlayers()) {
                    player.teleport(offset);
                }
                await AwaitFunctions.waitTicks(20);
                dimension.runCommandAsync(`tickingarea remove ${structureId}`);
                world.structureManager.place(tempStructure, dimension, VectorFunctions.addVector({ x: x, y: startY, z: z }, offset));
            }
            catch (e) {
                if (e instanceof InvalidStructureError) {
                    Logger.warn(`Invalid Structure ID: ${structureId}`, "MapParser");
                    return;
                }
                Logger.warn(e, "MapParser");
            }
        }
        // }
    }
};
MapParser.placeStructureArray = async (structures, dimension, offset, players) => {
    let structureRoot = VectorFunctions.subtractVector(structures[0].startPosition, offset);
    let savedLocation = structures[structures.length - 1].startPosition;
    Logger.warn("Removing all entities", "MapParser");
    for (const entity of GlobalVars.getAllEntities({
        location: offset,
        excludeTypes: ["minecraft:player"],
        volume: {
            x: structures[structures.length - 1].startPosition.x + 63,
            y: structures[structures.length - 1].startPosition.y + 255,
            z: structures[structures.length - 1].startPosition.z + 63,
        },
    })) {
        entity.remove();
    }
    structures[structures.length - 1].startPosition = savedLocation;
    for (const structure of structures) {
        players[0].addEffect("blindness", 100);
        Logger.warn(`Placing Preloaded ${structure.structureSaveId} at ${structure.startPosition.x} ${structure.startPosition.y} ${structure.startPosition.z}`, "MapParser");
        //make sure it fits in world height
        structure.startPosition = VectorFunctions.subtractVector(structure.startPosition, structureRoot);
        let chunkLoaded = false;
        while (!chunkLoaded) {
            dimension.runCommandAsync(`tickingarea add circle ${structure.startPosition.x} ${structure.startPosition.y} ${structure.startPosition.z} 2 ${structure.structureSaveId} true`);
            //world.sendMessage("Teleporting");
            players[0].addEffect("blindness", 100);
            players[0].teleport(structure.startPosition);
            await AwaitFunctions.waitTicks(1);
            try {
                //To see if the chunks are loaded
                dimension.fillBlocks(new BlockVolume(structure.startPosition, structure.startPosition), "air");
                world.structureManager.place(structure.structureSaveId, dimension, structure.startPosition);
                dimension.runCommandAsync(`tickingarea remove ${structure.structureSaveId}`);
                chunkLoaded = true;
            }
            catch (e) {
                Logger.warn(e);
                Logger.warn("Failed to place structure trying again in 1 ticks", "MapParser");
            }
        }
    }
};
/**
 *
 * @returns
 *
 * @todo
 * I am scared this breaks for very large maps, but it works for bedwars sized maps for sure
 */
MapParser.createStructureArray = async (mapData, dimension) => {
    //  mapData.structureId = "LMAO";
    let structureId = mapData.structureId;
    let startLocation = mapData.startLocation;
    let endLocation = mapData.endLocation;
    world.sendMessage("Creating structure array");
    return new Promise(async (resolve, reject) => {
        const structureArray = [];
        let savedStructures = 0;
        const maxBlockSize = 63;
        const xSizePreload = 300;
        const startX = startLocation.x;
        const startY = startLocation.y;
        const startZ = startLocation.z;
        const endX = endLocation.x;
        const endY = endLocation.y;
        const endZ = endLocation.z;
        dimension.runCommandAsync(`tickingarea add circle  ${(startX + endX) / 2} ${startY} ${(startZ + endZ) / 2} 4 center${structureId} true`);
        try {
            for (let z = 0; z < endZ - startZ; z += maxBlockSize) {
                for (let x = 0; x < endX - startX; x += maxBlockSize) {
                    //world.sendMessage(`Adding ${structureId} at ${x} ${startY} ${z}`);
                    const currentStart = {
                        x: x + startX,
                        y: startY,
                        z: z + startZ,
                    };
                    const currentEnd = {
                        x: Math.min(currentStart.x + maxBlockSize, endX),
                        y: endY,
                        z: Math.min(currentStart.z + maxBlockSize, endZ),
                    };
                    let chunkLoaded = false;
                    let tempStructure;
                    dimension.runCommandAsync(`tickingarea remove first${structureId}`);
                    await AwaitFunctions.waitTicks(1);
                    dimension.runCommandAsync(`tickingarea add  ${currentStart.x} ${currentStart.y} ${currentStart.z} ${currentStart.x + maxBlockSize} ${currentEnd.y} ${currentEnd.z} first${structureId} true`);
                    while (!chunkLoaded) {
                        await AwaitFunctions.waitTicks(1);
                        world.structureManager.delete(`${structureId}${x}${startY}${z}`);
                        try {
                            //Test if the structure is fully loaded by filling air block
                            dimension.fillBlocks(new BlockVolume(currentStart, currentStart), "air");
                            if (currentEnd.y >= 320) {
                                currentEnd.y = 319;
                            }
                            tempStructure = world.structureManager.createFromWorld(`${structureId}${x}${startY}${z}`, dimension, currentStart, currentEnd, {
                                includeBlocks: true,
                                includeEntities: true,
                                saveMode: StructureSaveMode.Memory,
                            });
                            chunkLoaded = true;
                        }
                        catch (e) {
                            Logger.warn(e);
                            /* dimension.runCommandAsync(
                              `tickingarea remove first${structureId}`
                            );
                            dimension.runCommandAsync(
                              `tickingarea remove second${structureId}`
                            );
              
                            dimension.runCommandAsync(
                              `tickingarea add  ${currentStart.x} ${currentStart.y} ${
                                currentStart.z
                              } ${currentStart.x + xSizePreload} ${currentEnd.y} ${
                                currentEnd.z
                              } first${structureId} true`
                            );
                            dimension.runCommandAsync(
                              `tickingarea add  ${currentStart.x + xSizePreload} ${
                                currentStart.y
                              } ${currentStart.z} ${currentStart.x + xSizePreload * 2} ${
                                currentEnd.y
                              } ${currentEnd.z} second${structureId} true`
                            ); */
                            Logger.warn("Tickingarea not loaded in fully, waiting another 1 ticks and hoping for the best :)", "Preloading Maps");
                        }
                    }
                    Logger.warn(`Saving ${structureId} at ${x} ${startY} ${z}`, "MapParser");
                    structureArray.push({
                        structureSaveId: tempStructure.id,
                        startPosition: { x: x, y: startY, z: z },
                    });
                    savedStructures++;
                }
                dimension.runCommandAsync(`tickingarea remove first${structureId}`);
                dimension.runCommandAsync(`tickingarea remove second${structureId}`);
            }
            dimension.runCommandAsync(`tickingarea remove center${structureId}`);
            resolve(structureArray);
        }
        catch (e) {
            if (e instanceof InvalidStructureError) {
                Logger.warn(`Invalid Structure ID: ${structureId}`, "MapParser");
                reject(`Invalid Structure ID: ${structureId}`);
            }
            else {
                Logger.warn(e, "MapParser");
                reject(e);
            }
        }
    });
};
//#endregion
//#region Unloading Functions
MapParser.unlaodMap = (mapID) => {
    Logger.warn("UN LOADING MAP", "MapParser");
    const overworld = world.getDimension("overworld");
    if (!_a.currentMaps.has(mapID)) {
        Logger.warn(`Map ${mapID} not found`, "MapParser");
        return;
    }
    const currentMap = _a.currentMaps.get(mapID);
    for (const player of currentMap.players) {
        player.sendToHub();
        player.setHypixelValue("winsCurrency", -1);
    }
    switch (currentMap.gameMode) {
        case EGameMode.BRIDGE:
            const bridgeData = currentMap.gameModeData;
            TickFunctions.removeFunction(currentMap.tickFunctionId);
            break;
        case EGameMode.BEDWARS:
    }
    for (const structure of currentMap.structures) {
        Logger.warn(`Placing Preloaded ${structure.structureSaveId} at ${structure.startPosition.x} ${structure.startPosition.y} ${structure.startPosition.z}`, "MapParser");
        for (let y = -32; y < 32; y++) {
            overworld.fillBlocks(new BlockVolume(VectorFunctions.addVector(structure.startPosition, {
                x: 0,
                y: y,
                z: 0,
            }), VectorFunctions.addVector(structure.startPosition, {
                x: 63,
                y: y,
                z: 63,
            })), "air");
        }
    }
    //THIS DOESNT WORK SINC EFILL BLOCK LIMIT IS 32000 OR SMTHN
    //overworld.fillBlocks(currentMap.startLocation, currentMap.endLocation, "air");
    _a.currentMaps.delete(mapID);
};
MapParser.removePlayerFromAllMaps = (player) => {
    Logger.log(`Removing Player ${player.name} from all maps`, "MapParser");
    for (const map of _a.currentMaps.values()) {
        _a.removePlayerFromMap(map.mapId, player);
    }
};
MapParser.removePlayerFromMap = (mapID, player) => {
    Logger.log(`Removing Player ${player.name} from Map ${mapID}`, "MapParser");
    const currentMap = _a.currentMaps.get(mapID);
    currentMap.players = currentMap.players.filter((p) => p !== player);
    if (currentMap.players.length <= 1) {
        for (const player of currentMap.players) {
            player.setHypixelValue("Wins", player.getHypixelValue("Wins") + 1);
            player.setHypixelValue("winsCurrency", player.getHypixelValue("winsCurrency") + 1);
        }
        _a.unlaodMap(mapID);
    }
};
//#endregion
//#region Unused Functions
/**
 * THIS IS USELESS SINCE WE SWITCHED TO STRUCTURE MANAGER
 * Print out a log of the map
 * @param
 * @param
 */
MapParser.saveMap = (bL1, bL2) => {
    const overworld = world.getDimension("overworld");
    let combinedString = "";
    const lenghtX = Math.abs(bL1.x - bL2.x) + 1;
    const lenghtY = Math.abs(bL1.y - bL2.y) + 1;
    const lenghtZ = Math.abs(bL1.z - bL2.z) + 1;
    const blockLocation = {
        x: Math.max(bL1.x, bL2.x),
        y: Math.max(bL1.y, bL2.y),
        z: Math.max(bL1.z, bL2.z),
    };
    for (var xOffset = 0; xOffset < lenghtX; xOffset++) {
        // player.sendMessage(`xOffset ${xOffset}`)
        for (var yOffset = 0; yOffset < lenghtY; yOffset++) {
            //   player.sendMessage(`yOffset ${yOffset}`)
            for (var zOffset = 0; zOffset < lenghtZ; zOffset++) {
                const currentBlock = overworld.getBlock({
                    x: blockLocation.x - xOffset,
                    y: blockLocation.y - yOffset,
                    z: blockLocation.z - zOffset,
                });
                if (currentBlock.typeId == "minecraft:air") {
                    continue;
                }
                combinedString += `{ `;
                combinedString += `\t"blockLcoation": { x: ${xOffset}, y: ${yOffset}, z: ${zOffset} },`;
                //IDK HOW STATES WORK SO THIS IS A PLACEHOLDER
                combinedString += `\t"blockState": ${1},"`;
                combinedString += `\t"blockTags": [],`;
                combinedString += `\t"blockType": "${currentBlock.typeId}"`;
                combinedString += `},\n`;
            }
        }
    }
    console.warn(combinedString);
};
