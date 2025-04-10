import { Player, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { addCommand, showHUD } from "staticScripts/commandFunctions";
import { Logger } from "staticScripts/Logger";
import { setPlayerToEdit } from "./RoomEditor";
import { askForConfirmation } from "hud";
export var EDirection;
(function (EDirection) {
    EDirection["north"] = "+x";
    EDirection["south"] = "-x";
    EDirection["east"] = "+z";
    EDirection["west"] = "-z";
})(EDirection || (EDirection = {}));
export const pushRoomToWorld = (room) => {
    for (const savedRooms of rooms) {
        if (savedRooms.index == room.index) {
            world.sendMessage("Room with that index already exists! Trying higher index");
            room.index++;
            pushRoomToWorld(room);
            return;
        }
    }
    world.setDynamicProperty(room.index.toString(), JSON.stringify(room));
    world.sendMessage("Pushed room to world!");
    rooms = getAllRooms();
};
const removeRoomFromWorld = (room) => {
    world.setDynamicProperty(room.index.toString());
    world.sendMessage("Removed room from world!");
    rooms = getAllRooms();
};
const printRoomInfo = (room, player) => {
    if (typeof room == "string") {
        room = getRoomWithID(room);
    }
    room;
    let infoString = "";
    infoString += `Room ID: §3${room.id}\n§r`;
    infoString += `Room Index: §3${room.index}\n§r`;
    infoString += `Room Start Position: §3${JSON.stringify(room.startPosition)}\n§r`;
    infoString += `Room End Position: §3${JSON.stringify(room.endPosition)}\n§r`;
    infoString += `Room Connectors: §3${JSON.stringify(room.roomConnectors)}\n§r`;
    if (!player) {
        world.sendMessage(infoString);
        return;
    }
    if (player instanceof Player) {
        player.sendMessage(infoString);
    }
    else {
        for (const playerSingular of player) {
            playerSingular.sendMessage(infoString);
        }
    }
};
const printAllRooms = () => {
    for (const room of rooms) {
        printRoomInfo(room);
    }
};
const getAllRooms = () => {
    const allDynamicProperties = world.getDynamicPropertyIds();
    const rooms = [];
    for (const dynamicProperty of allDynamicProperties) {
        if (isNaN(parseInt(dynamicProperty))) {
            continue;
        }
        const value = world.getDynamicProperty(dynamicProperty);
        if (typeof value != "string") {
            Logger.warn("Dynamic property with number id is not a string", "Get All Rooms");
            continue;
        }
        const data = JSON.parse(value);
        // if (data instanceof IRoom) {
        rooms.push(JSON.parse(value));
        // }
        continue;
    }
    return rooms;
};
export let rooms = getAllRooms();
const getRoomWithID = (id) => {
    const rooms = getAllRooms();
    for (const room of rooms) {
        if (room.id == id) {
            return room;
        }
    }
};
const showRoomGui = async (player) => {
    const form = new ActionFormData();
    const rooms = getAllRooms();
    form.title("Select Room");
    for (const room of rooms) {
        form.button(room.id);
    }
    await showHUD(player, form).then((result) => {
        world.sendMessage(result.selection.toString());
        if (!result.selection && result.selection != 0) {
            world.sendMessage("No room selected");
            return;
        }
        const room = rooms[result.selection];
        player.teleport(room.startPosition);
        roomOptionsGUI(player, room);
    });
};
addCommand({
    commandName: "rooms",
    commandPrefix: ".",
    directory: "Ethan/",
    chatFunction(chatSendEvent) {
        showRoomGui(chatSendEvent.sender);
    },
});
const roomOptionsGUI = async (player, room) => {
    const form = new ActionFormData();
    form.title(`Options for "${room.id}"`);
    form.button("Print Info");
    form.button("Edit");
    form.button("Delete");
    await showHUD(player, form).then((result) => {
        switch (result.selection) {
            case 0:
                printRoomInfo(room, player);
                break;
            case 1:
                setPlayerToEdit(player, room);
                break;
            case 2:
                askForConfirmation(player, "Are you sure you want to delete this room?").then((result) => {
                    if (result) {
                        removeRoomFromWorld(room);
                    }
                });
                break;
        }
    });
};
//world.clearDynamicProperties();
//pushRoomToWorld(testRoom);
printAllRooms();
//showRoomGui(world.getAllPlayers()[0]);
