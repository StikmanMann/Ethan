import { Player, Vector3, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { getColoredWool } from "Bedwars/ChestShop/ColoredBlocks";
import { addCommand, showHUD } from "staticScripts/commandFunctions";

import { Logger } from "staticScripts/Logger";
import { setPlayerToEdit } from "./RoomEditor";
import { askForConfirmation } from "hud";

export enum EDirection {
  north = "+x",
  south = "-x",
  east = "+z",
  west = "-z",
}

export interface IRoom {
  index: number;
  id: string;
  startPosition: Vector3;
  endPosition: Vector3;
  roomConnectors: {
    location: Vector3;
    direction: EDirection;
  }[];
}

export const pushRoomToWorld = (room: IRoom) => {
  for (const savedRooms of rooms) {
    if (savedRooms.index == room.index) {
      world.sendMessage(
        "Room with that index already exists! Trying higher index"
      );
      room.index++;
      pushRoomToWorld(room);
      return;
    }
  }

  world.setDynamicProperty(room.index.toString(), JSON.stringify(room));
  world.sendMessage("Pushed room to world!");
  rooms = getAllRooms();
};

const removeRoomFromWorld = (room: IRoom) => {
  world.setDynamicProperty(room.index.toString());
  world.sendMessage("Removed room from world!");
  rooms = getAllRooms();
};

const printRoomInfo = (room: IRoom | string, player?: Player | Player[]) => {
  if (typeof room == "string") {
    room = getRoomWithID(room);
  }
  room as IRoom;

  let infoString = "";
  infoString += `Room ID: §3${room.id}\n§r`;
  infoString += `Room Index: §3${room.index}\n§r`;
  infoString += `Room Start Position: §3${JSON.stringify(
    room.startPosition
  )}\n§r`;
  infoString += `Room End Position: §3${JSON.stringify(room.endPosition)}\n§r`;
  infoString += `Room Connectors: §3${JSON.stringify(room.roomConnectors)}\n§r`;

  if (!player) {
    world.sendMessage(infoString);
    return;
  }

  if (player instanceof Player) {
    player.sendMessage(infoString);
  } else {
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

const getAllRooms = (): IRoom[] => {
  const allDynamicProperties = world.getDynamicPropertyIds();
  const rooms: IRoom[] = [];
  for (const dynamicProperty of allDynamicProperties) {
    if (isNaN(parseInt(dynamicProperty))) {
      continue;
    }
    const value = world.getDynamicProperty(dynamicProperty);
    if (typeof value != "string") {
      Logger.warn(
        "Dynamic property with number id is not a string",
        "Get All Rooms"
      );
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

const getRoomWithID = (id: string): IRoom => {
  const rooms = getAllRooms();
  for (const room of rooms) {
    if (room.id == id) {
      return room;
    }
  }
};

const showRoomGui = async (player: Player) => {
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

const roomOptionsGUI = async (player: Player, room: IRoom) => {
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
        askForConfirmation(
          player,
          "Are you sure you want to delete this room?"
        ).then((result) => {
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
