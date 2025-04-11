import { StructureSaveMode, world, } from "@minecraft/server";
import { EDirection, rooms } from "./Room/Rooms";
import { VectorFunctions } from "staticScripts/vectorFunctions";
let dimension = world.getDimension("overworld");
let structures = new Map();
let openConnectors = [];
/* bedwarsData.lapisGenerators[i] = VectorFunctions.subtractVector(
  VectorFunctions.addVector(bedwarsData.lapisGenerators[i], offset),
  mapData.startLocation
); */
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
const generateRooms = (startingPosition) => {
    //First room
    let room = rooms[Math.floor(Math.random() * rooms.length)];
    world.structureManager.place(structures.get(room.index), dimension, startingPosition);
    for (const connector of room.roomConnectors) {
        openConnectors.push({
            direction: connector.direction,
            location: VectorFunctions.subtractVector(VectorFunctions.addVector(connector.location, startingPosition), VectorFunctions.smallestOnly(room.startPosition, room.endPosition)),
        });
    }
    generateConnectors(0);
};
const generateConnectors = (depth) => {
    let temporaryConnectors = [];
    let copiedConnectors = deepCopy(openConnectors);
    for (const connector of copiedConnectors) {
        dimension.setBlockType(connector.location, "minecraft:glowstone");
        while (true) {
            const viabelRooms = rooms.filter((room) => {
                let hasViableConnector = false;
                for (const c of room.roomConnectors) {
                    if (c.direction == EDirection.east &&
                        connector.direction == EDirection.west) {
                        hasViableConnector = true;
                        break;
                    }
                    if (c.direction == EDirection.west &&
                        connector.direction == EDirection.east) {
                        hasViableConnector = true;
                        break;
                    }
                    if (c.direction == EDirection.north &&
                        connector.direction == EDirection.south) {
                        hasViableConnector = true;
                        break;
                    }
                    if (c.direction == EDirection.south &&
                        connector.direction == EDirection.north) {
                        hasViableConnector = true;
                        break;
                    }
                }
                if (!hasViableConnector) {
                    world.sendMessage(`
          I DID NOT FIND A CONNECTOR FOR: ${room.id} and direction: ${connector.direction}}`);
                    return false;
                }
                else {
                    return true;
                }
            });
            const randomRoom = viabelRooms[Math.floor(Math.random() * viabelRooms.length)];
            const viableConnectors = randomRoom.roomConnectors.filter((c) => {
                if (c.direction == EDirection.east &&
                    connector.direction == EDirection.west) {
                    return true;
                }
                if (c.direction == EDirection.west &&
                    connector.direction == EDirection.east) {
                    return true;
                }
                if (c.direction == EDirection.north &&
                    connector.direction == EDirection.south) {
                    return true;
                }
                if (c.direction == EDirection.south &&
                    connector.direction == EDirection.north) {
                    return true;
                }
                return false;
            });
            const randomConnector = viableConnectors[Math.floor(Math.random() * viableConnectors.length)];
            world.structureManager.place(structures.get(randomRoom.index), dimension, VectorFunctions.addVector(VectorFunctions.addVector(connector.location, VectorFunctions.subtractVector(VectorFunctions.smallestOnly(randomRoom.startPosition, randomRoom.endPosition), randomConnector.location)), VectorFunctions.getVectorFromDirection(connector.direction)));
            for (const randomRoomConnector of randomRoom.roomConnectors) {
                if (VectorFunctions.vectorToString(randomRoomConnector.location) == VectorFunctions.vectorToString(randomConnector.location)) {
                    continue;
                }
                temporaryConnectors.push({
                    direction: connector.direction,
                    location: VectorFunctions.addVector(VectorFunctions.addVector(VectorFunctions.addVector(connector.location, VectorFunctions.subtractVector(VectorFunctions.smallestOnly(randomRoom.startPosition, randomRoom.endPosition), randomConnector.location)), VectorFunctions.getVectorFromDirection(connector.direction)), VectorFunctions.subtractVector(randomConnector.location, VectorFunctions.smallestOnly(randomRoom.startPosition, randomRoom.endPosition)))
                });
            }
            openConnectors = [];
            break;
        }
    }
    openConnectors = openConnectors.concat(temporaryConnectors);
    for (const connector of openConnectors) {
        dimension.setBlockType(connector.location, "minecraft:sea_lantern");
    }
    if (depth <= 0) {
        return;
    }
    generateConnectors(depth - 1);
};
const generateStructures = () => {
    for (const room of rooms) {
        world.structureManager.delete(`ethan:${room.id}`);
        const struct = world.structureManager.createFromWorld(`ethan:${room.id}`, dimension, room.startPosition, room.endPosition, { saveMode: StructureSaveMode.Memory });
        structures.set(room.index, struct);
    }
};
generateStructures();
generateRooms({ x: 50, y: -40, z: -50 });
