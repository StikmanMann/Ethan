import { world, system, Player } from "@minecraft/server";

const mainCmd = "!!";
const cpCmd = ";;";
world.sendMessage("Hypixel chat initialized!");
//hypixel chat
world.beforeEvents.chatSend.subscribe((eventData) => {
  eventData.cancel = true;
  const message = eventData.message;
  const player = eventData.sender;
  world.sendMessage(`${player.nameTag}§r§l » §r${message}`);
});
