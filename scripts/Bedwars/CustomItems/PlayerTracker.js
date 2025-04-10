import { system, world } from "@minecraft/server";
import { VectorFunctions } from "staticScripts/vectorFunctions";
const playerTrackerNames = new Set();
playerTrackerNames.add("minecraft:compass");
world.beforeEvents.itemUse.subscribe((eventData) => {
    system.run(() => {
        const item = eventData.itemStack;
        const player = eventData.source;
        if (playerTrackerNames.has(item.typeId)) {
            let location = player.location;
            let closestPlayer = getClosestPlayer(player, true);
            if (!closestPlayer) {
                player.onScreenDisplay.setActionBar("No players found");
                return;
            }
            player.onScreenDisplay.setActionBar(`Tracking §l${closestPlayer.nameTag}§r - Distance: §l${VectorFunctions.vectorLength(VectorFunctions.subtractVector(location, closestPlayer.location)).toFixed(1)}m`);
        }
    });
});
/**
 *
 * @param origin
 * @param excludeTeamColor this does nothing rn
 */
const getClosestPlayer = (originPlayer, excludeTeamColor) => {
    const origin = originPlayer.location;
    let closestPlayer = null;
    let distance = Infinity;
    for (const player of world.getPlayers()) {
        if (player == originPlayer)
            continue;
        if (excludeTeamColor) {
            // Check if the player has a color
            let selfColor = originPlayer.getDynamicProperty("color") ?? "noColor";
            let otherColor = player.getDynamicProperty("color") ?? "noColor2";
            if (selfColor == otherColor) {
                continue;
            }
        }
        let distanceToPlayer = VectorFunctions.vectorLength(VectorFunctions.subtractVector(origin, player.location));
        if (distanceToPlayer < distance) {
            distance = distanceToPlayer;
            closestPlayer = player;
        }
    }
    return closestPlayer;
};
