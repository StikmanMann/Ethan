import { StructureSaveMode, world, } from "@minecraft/server";
import { rooms } from "./Room/Rooms";
import { VectorFunctions } from "staticScripts/vectorFunctions";
let dimension = world.getDimension("overworld");
let structures;
let openConnectors = [];
/* bedwarsData.lapisGenerators[i] = VectorFunctions.subtractVector(
  VectorFunctions.addVector(bedwarsData.lapisGenerators[i], offset),
  mapData.startLocation
); */
const generateRooms = (startingPosition) => {
    //First room
    let room = rooms[0];
    world.structureManager.place(structures[0], dimension, startingPosition);
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
    }
};
const generateStructures = () => {
    let structures = [];
    for (const room of rooms) {
        world.structureManager.delete(`ethan:${room.id}`);
        const struct = world.structureManager.createFromWorld(`ethan:${room.id}`, dimension, room.startPosition, room.endPosition, { saveMode: StructureSaveMode.Memory });
        structures.push(struct);
    }
    return structures;
};
structures = generateStructures();
generateRooms({ x: 0, y: -46, z: 0 });
