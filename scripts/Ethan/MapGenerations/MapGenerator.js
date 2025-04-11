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
    generateConnectors();
};
const generateConnectors = () => {
    for (const connector of openConnectors) {
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
            break;
        }
    }
};
const generateStructures = () => {
    for (const room of rooms) {
        world.structureManager.delete(`ethan:${room.id}`);
        const struct = world.structureManager.createFromWorld(`ethan:${room.id}`, dimension, room.startPosition, room.endPosition, { saveMode: StructureSaveMode.Memory });
        structures.set(room.index, struct);
    }
};
generateStructures();
generateRooms({ x: 0, y: -46, z: 50 });
