import { Entity, ItemStack, Player, world } from "@minecraft/server";
import { Price } from "../Categories/Catergorie";
import { buyItem, checkForPrice } from "../BuyFunctions/StandardBuyFunction";
import { addCommand } from "staticScripts/commandFunctions";

const shears = new ItemStack("minecraft:shears");
shears.nameTag = "§r§fShears";
shears.setLore(shears.getLore().concat(["§r§l§n20x Copper"]));

export const getShears = (player: Player): ItemStack => {
  return shears;
};

export const buyShears = (
  shopEntity: Entity,
  buyer: Player,
  missingItem: ItemStack,
  price: Price
): void => {
  const hasShears = buyer.getShearsStautus();

  if (hasShears) {
    buyer.sendMessage("You already have shears");
    return;
  }

  const priceTypeId = price.priceTypeId;
  const priceAmount = price.priceAmount;

  if (!checkForPrice(priceAmount, priceTypeId, buyer, false)) {
    buyItem(shopEntity, buyer, missingItem, price);
    return;
  }

  buyer.setShearsStauts(1);

  buyItem(shopEntity, buyer, missingItem, price);
};

addCommand({
  commandName: "setShearsStatus",
  commandPrefix: ";;",
  directory: "Bedwars",
  chatFunction: (chatSendEvent) => {
    const level = parseInt(chatSendEvent.message.split(" ")[1]);
    if (isNaN(level)) {
      chatSendEvent.sender.sendMessage(
        "Please enter a number 0 false / 1 true"
      );
    }
    chatSendEvent.sender.setShearsStauts(level);
  },
});
