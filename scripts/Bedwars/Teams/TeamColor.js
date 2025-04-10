import { DisplaySlotId, system, world } from "@minecraft/server";
import { GlobalVars } from "globalVars";
import { addCommand } from "staticScripts/commandFunctions";
import { TickFunctions } from "staticScripts/tickFunctions";
const validColors = [
    "red",
    "blue",
    "green",
    "yellow",
    "pink",
    "purple",
    "black",
    "white",
];
const teamColorToBlock = new Map([
    ["red", "red"],
    ["blue", "light_blue"],
    ["green", "lime"],
    ["yellow", "yellow"],
    ["pink", "pink"],
    ["purple", "purple"],
    ["black", "black"],
    ["white", "white"],
]);
system.run(() => {
    for (const player of world.getPlayers()) {
        player.nameTag = player.name;
    }
});
export class BedwarsTeam {
    static setPlayerColor(player, color) {
        player.setDynamicProperty("color", color);
        this.setPlayerNameTag(player);
    }
    static setPlayerNameTag(player) {
        const color = player.getDynamicProperty("color");
        let name = player.nameTag;
        if (name.includes("§")) {
            let index = name.indexOf("§", 2);
            if (index > 5) {
                return;
            }
            name = name.slice(index + 2);
        }
        // Cast color to keyof TeamColorType to fix type error
        const newName = `§l${BedwarsTeam.teamColorNames.get(color)}${name}`;
        player.nameTag = newName;
        world.sendMessage("New Name: " + newName);
    }
    static getBlockColor(player) {
        const color = player.getDynamicProperty("color");
        // Check if the color is one of the valid keys in TeamColorType
        if (!color || !BedwarsTeam.isValidColor(color)) {
            return "white"; // Fallback to "white" if color is invalid
        }
        return teamColorToBlock.get(color);
    }
    static isValidColor(color) {
        return validColors.includes(color);
    }
}
BedwarsTeam.teamColorNames = new Map([
    ["red", "§c"],
    ["blue", "§9"],
    ["green", "§a"],
    ["yellow", "§e"],
    ["pink", "§d"],
    ["purple", "§5"],
    ["black", "§8"],
    ["white", "§f"],
]);
world.afterEvents.playerSpawn.subscribe((eventData) => {
    BedwarsTeam.setPlayerNameTag(eventData.player);
});
addCommand({
    commandName: "setTeamColor",
    commandPrefix: ";;",
    directory: "Bedwars",
    chatFunction: (chatSendEvent) => {
        const color = chatSendEvent.message.split(" ")[1];
        if (validColors.includes(color)) {
            BedwarsTeam.setPlayerColor(chatSendEvent.sender, color);
            world.sendMessage("§l§e» §r§eYou have set your team color to §l§e" + color);
        }
        else {
            world.sendMessage(`§l§e» §r§cInvalid color. Please use ${JSON.stringify(validColors)} `);
            return;
        }
    },
});
const healthUnderName = () => {
    system.run(() => {
        let scoreboard = world.scoreboard.getObjective("health");
        if (!scoreboard) {
            scoreboard = world.scoreboard.addObjective("health", "");
        }
        world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.BelowName, {
            objective: scoreboard,
        });
        for (const player of GlobalVars.players) {
            const health = player.getComponent("health");
            scoreboard.setScore(player, health.currentValue);
            /* onst nameTag = player.nameTag;
            if (nameTag.includes("\n")) {
              let slicedName = nameTag.slice(0, nameTag.indexOf("\n"));
              player.nameTag = slicedName + "\n" + health.currentValue;
            } else {
              player.nameTag = nameTag + "\n" + health.currentValue;
            } */
        }
    });
};
TickFunctions.addFunction(healthUnderName, 1);
