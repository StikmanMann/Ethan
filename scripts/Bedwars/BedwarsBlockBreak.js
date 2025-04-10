import { system, world, } from "@minecraft/server";
import { VectorFunctions } from "staticScripts/vectorFunctions";
import { AwaitFunctions } from "staticScripts/awaitFunctions";
import { bedwarsBedlessSpawn } from "./BedwarsSpawn";
export const bedwarsBlockBreak = (data) => (eventData) => {
    if (eventData.block.typeId.includes("bed")) {
        return;
    }
    if (!data.players.includes(eventData.player)) {
        return;
    }
    //world.sendMessage(JSON.stringify(data));
    const locationString = JSON.stringify(eventData.block.location);
    /*     world.sendMessage("Checking location:" + locationString);
    world.sendMessage(
      "Set contents:" +
        JSON.stringify(Array.from(data.playerPlacedBlockLocations))
    ); */
    // Check if location is in the Set
    if (!data.gameModeData.playerPlacedBlockLocations.has(locationString)) {
        eventData.player.sendMessage("§l§c» §r§cYou can only break blocks placed by players!");
        eventData.cancel = true;
        system.run(async () => {
            let playerLoc = eventData.player.location;
            let blockLoc = eventData.block.location;
            if (playerLoc.y > blockLoc.y) {
                if (playerLoc.x % 1 > 0.3 &&
                    playerLoc.x % 1 < 0.7 &&
                    playerLoc.z % 1 > 0.3 &&
                    playerLoc.z % 1 < 0.7) {
                    await AwaitFunctions.waitTicks(3);
                    world.sendMessage("Panicking due to palyer falling");
                    eventData.player.teleport(VectorFunctions.addVector(eventData.player.location, {
                        x: 0,
                        y: 0.25,
                        z: 0,
                    }));
                }
            }
        });
    }
};
export const bedwarsBlockBreakAfter = (data) => (eventdata) => {
    if (eventdata.brokenBlockPermutation.type.id.includes("bed")) {
        let brokenLocation = eventdata.block.location;
        let bedwarsData = data.gameModeData;
        for (const team of bedwarsData.teams) {
            if (VectorFunctions.vectorLengthXZ(VectorFunctions.subtractVector(brokenLocation, team.bedLocation)) < 2) {
                for (const player of data.players) {
                    player.sendMessage(`§l${team.teamName} » §r§cBed Destroyed!`);
                }
                for (const player of team.players) {
                    player.onScreenDisplay.setTitle(`§cBed Destroyed!`);
                    player.setSpawnFunction(bedwarsBedlessSpawn(data));
                }
                team.status.bedDestroyed = true;
            }
        }
        //await AwaitFunctions.waitTicks(5);
        let droppedItem = eventdata.block.dimension.getEntities({ type: "item", maxDistance: 5, location: eventdata.block.location });
        //world.sendMessage(`${droppedItem.length} items dropped`);
        for (const item of droppedItem) {
            //world.sendMessage(`Item: ${item.getComponent("item").itemStack.typeId}`);
            if (item.getComponent("item").itemStack.typeId.includes("bed")) {
                item.remove();
            }
        }
    }
};
export const bedwarsPlayerPlace = (data) => (eventData) => {
    data.playerPlacedBlockLocations.add(JSON.stringify(eventData.block.location));
    /*     for (const [key, value] of data.playerPlacedBlockLocations.entries()) {
      world.sendMessage(JSON.stringify(key));
    } */
};
