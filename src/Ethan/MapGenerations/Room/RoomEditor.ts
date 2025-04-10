import { ItemStack, Player, system, world } from "@minecraft/server";
import { EDirection, IRoom, pushRoomToWorld, rooms } from "./Rooms";
import { VectorFunctions } from "staticScripts/vectorFunctions";
import { addCommand, showHUD } from "staticScripts/commandFunctions";
import { TickFunctions } from "staticScripts/tickFunctions";
import { DrawFunctions } from "staticScripts/drawFunctions";
import { ModalFormData } from "@minecraft/server-ui";

const roomConnectorSword = new ItemStack("minecraft:diamond_sword", 1);
roomConnectorSword.nameTag = "RoomConnectorSword";

const startPositionPickaxe = new ItemStack("minecraft:diamond_pickaxe", 1);
startPositionPickaxe.nameTag = "StartPositionPickaxe";

const endPositionAxe = new ItemStack("minecraft:diamond_axe", 1);
endPositionAxe.nameTag = "EndPositionAxe";

const saveRoomHoe = new ItemStack("minecraft:diamond_hoe", 1);
saveRoomHoe.nameTag = "SaveRoomHoe";

let editingPlayers: Set<Player> = new Set();

let currentRoom: IRoom | null = null;

function getFacingDirection(player: Player): EDirection {
  const rotation = player.getRotation();
  const yaw = rotation.y;
  world.sendMessage("yaw: " + yaw);
  if (yaw >= -45 && yaw < 45) return EDirection.east;
  if (yaw >= 45 && yaw < 135) return EDirection.south;
  if (yaw >= 135 || yaw < -135) return EDirection.west;
  return EDirection.north;
}

world.beforeEvents.itemUse.subscribe((event) => {
  world.sendMessage(event.source.name);
  if (!editingPlayers.has(event.source)) {
    return;
  }
  const block = event.source.getBlockFromViewDirection();

  const item = event.itemStack;
  if (item.nameTag == roomConnectorSword.nameTag) {
    let posExists = currentRoom.roomConnectors.find(
      (connector) =>
        connector.location.x == block.block.location.x &&
        connector.location.y == block.block.location.y &&
        connector.location.z == block.block.location.z
    );

    if (posExists) {
      world.sendMessage(
        "Removed Room Connector at §3" + JSON.stringify(posExists)
      );
      currentRoom.roomConnectors = currentRoom.roomConnectors.filter(
        (connector) => connector != posExists
      );
      return;
    } else {
      world.sendMessage(
        "Placed Room Connector at §3" + JSON.stringify(block.block.location)
      );

      let direction = getFacingDirection(event.source);
      world.sendMessage("Direction: " + direction);
      currentRoom.roomConnectors.push({
        location: block.block.location,
        direction: direction,
      });
    }
  }

  if (item.nameTag == startPositionPickaxe.nameTag) {
    world.sendMessage(
      "Placed Start Position at §3" + JSON.stringify(block.block.location)
    );
    currentRoom.startPosition = block.block.location;
  }

  if (item.nameTag == endPositionAxe.nameTag) {
    world.sendMessage(
      "Placed End Position at §3" + JSON.stringify(block.block.location)
    );
    currentRoom.endPosition = block.block.location;
  }

  if (item.nameTag == saveRoomHoe.nameTag) {
    saveRoom(event.source);
  }
});

const saveRoom = (player: Player) => {
  system.run(() => {
    const modalForm = new ModalFormData();
    modalForm.title("Save Room");

    modalForm.textField("Room Name", "My Room");

    showHUD(player, modalForm).then((result) => {
      if (result.canceled) {
        return;
      }
      const roomName = result.formValues[0] as string;

      currentRoom.id = roomName;
      if (rooms.find((room) => room.id == roomName)) {
        player.sendMessage("Room with that name already exists!");
        player.playSound("note.bass");
        return;
      }

      if (roomName == "") {
        player.sendMessage("Room cant be empty name!");
        player.playSound("note.bass");
        return;
      }

      pushRoomToWorld(currentRoom);
    });
  });
};

const visualizeRoom = (room: IRoom) => {
  room.roomConnectors.forEach((connector) => {
    DrawFunctions.drawCube(connector.location, connector.location);
    switch (connector.direction) {
      case EDirection.north:
        DrawFunctions.drawLine(
          5,
          VectorFunctions.addVector(connector.location, {
            x: 0.5,
            y: 0.5,
            z: 0.5,
          }),
          VectorFunctions.addVector(connector.location, {
            x: 1.5,
            y: 0.5,
            z: 0.5,
          })
        );
        break;
      case EDirection.south:
        DrawFunctions.drawLine(
          5,
          VectorFunctions.addVector(connector.location, {
            x: 0.5,
            y: 0.5,
            z: 0.5,
          }),
          VectorFunctions.addVector(connector.location, {
            x: -0.5,
            y: 0.5,
            z: 0.5,
          })
        );
        break;
      case EDirection.west:
        DrawFunctions.drawLine(
          5,
          VectorFunctions.addVector(connector.location, {
            x: 0.5,
            y: 0.5,
            z: 0.5,
          }),
          VectorFunctions.addVector(connector.location, {
            x: 0.5,
            y: 0.5,
            z: -0.5,
          })
        );
        break;
      case EDirection.east:
        DrawFunctions.drawLine(
          5,
          VectorFunctions.addVector(connector.location, {
            x: 0.5,
            y: 0.5,
            z: 0.5,
          }),
          VectorFunctions.addVector(connector.location, {
            x: 0.5,
            y: 0.5,
            z: 1.5,
          })
        );
        break;
    }
  });

  DrawFunctions.drawCube(
    room.startPosition,
    room.endPosition,
    "minecraft:basic_flame_particle",
    10
  );
};

TickFunctions.addFunction(() => {
  if (!currentRoom) {
    return;
  }
  visualizeRoom(currentRoom);
}, 3);

export const setPlayerToEdit = (player: Player, room?: IRoom) => {
  editingPlayers.add(player);
  const inventory = player.getComponent("inventory").container;
  if (room) {
    currentRoom = room;
  } else {
    currentRoom = {
      id: "New Room",
      index: 0,
      startPosition: { x: 0, y: 0, z: 0 },
      endPosition: { x: 0, y: 0, z: 0 },
      roomConnectors: [],
    };
  }

  player.teleport(
    VectorFunctions.addVector(
      currentRoom.startPosition,
      VectorFunctions.multiplyVector(
        VectorFunctions.subtractVector(
          currentRoom.endPosition,
          currentRoom.startPosition
        ),
        0.5
      )
    )
  );
  inventory.setItem(0, roomConnectorSword);
  inventory.setItem(1, startPositionPickaxe);
  inventory.setItem(2, endPositionAxe);
  inventory.setItem(3, saveRoomHoe);
};

addCommand({
  commandName: "edit",
  commandPrefix: ".",
  directory: "Ethan/",
  chatFunction(chatSendEvent) {
    const player = chatSendEvent.sender;
    setPlayerToEdit(player);
  },
});

//setPlayerToEdit(world.getAllPlayers()[0]);
