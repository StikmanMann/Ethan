import { Entity, EquipmentSlot, ItemStack, Player } from "@minecraft/server";
import { Price } from "../Categories/Catergorie";
import { addCommand } from "staticScripts/commandFunctions";
import { checkForPrice } from "../BuyFunctions/StandardBuyFunction";

interface ArmorLevel {
  helmet: () => ItemStack;
  chestplate: () => ItemStack;
}

const chainmailHelmet = new ItemStack("minecraft:chainmail_helmet");
const chainmailChestplate = new ItemStack("minecraft:chainmail_chestplate");
const shopChainChestplate = new ItemStack("minecraft:chainmail_chestplate");
shopChainChestplate.setLore(
  shopChainChestplate.getLore().concat(["§r§l§n24x Copper"])
);

const chainArmor: ArmorLevel = {
  helmet: () => chainmailHelmet,
  chestplate: () => chainmailChestplate,
};

const ironHelmet = new ItemStack("minecraft:iron_helmet");
const ironChestplate = new ItemStack("minecraft:iron_chestplate");
const shopIronChestplate = new ItemStack("minecraft:iron_chestplate");
shopIronChestplate.setLore(
  shopIronChestplate.getLore().concat(["§r§l§f12x Iron"])
);

const ironArmor: ArmorLevel = {
  helmet: () => ironHelmet,
  chestplate: () => ironChestplate,
};

const diamondHelmet = new ItemStack("minecraft:diamond_helmet");
const diamondChestplate = new ItemStack("minecraft:diamond_chestplate");
const shopDiamondChestplate = new ItemStack("minecraft:diamond_chestplate");
shopDiamondChestplate.setLore(
  shopDiamondChestplate.getLore().concat(["§r§l§36x Diamond"])
);

const diamondArmor: ArmorLevel = {
  helmet: () => diamondHelmet,
  chestplate: () => diamondChestplate,
};

const armorShopItems: ItemStack[] = [
  shopChainChestplate,
  shopIronChestplate,
  shopDiamondChestplate,
];

const armorPrices: Price[] = [
  { priceTypeId: null, priceAmount: null },
  { priceTypeId: "minecraft:copper_ingot", priceAmount: 24 },
  { priceTypeId: "minecraft:iron_ingot", priceAmount: 12 },
  { priceTypeId: "minecraft:diamond", priceAmount: 6 },
];

const shopArmorLevel = [
  null,
  shopChainChestplate,
  shopIronChestplate,
  shopDiamondChestplate,
];

export const armorLevels: ArmorLevel[] = [
  { chestplate: () => null, helmet: () => null },
  chainArmor,
  ironArmor,
  diamondArmor,
];

export const buyArmorLevel = (player: Player): ItemStack => {
  const level = player.getArmorLevel();
  if (level >= armorShopItems.length - 1) {
    return null;
  }
  return null;
};

addCommand({
  commandName: "setArmorLevel",
  commandPrefix: ";;",
  directory: "Bedwars",
  chatFunction: (chatSendEvent) => {
    const level = parseInt(chatSendEvent.message.split(" ")[1]);
    chatSendEvent.sender.setArmorLevel(level);
  },
});

export const getArmor = (level: number): ItemStack => {
  if (level > armorLevels.length - 1) {
    return null;
  }
  return shopArmorLevel[level];
};

export const getArmorPrice = (level: number): Price => {
  if (level > armorPrices.length - 1) {
    return armorPrices[armorPrices.length - 1];
  }
  return armorPrices[level];
};

export const buyArmor = (
  level: number,
  _shopEntity: Entity,
  buyer: Player,
  _missingItem: ItemStack,
  price: Price
): void => {
  price = getArmorPrice(level);
  if (level > armorLevels.length - 1) {
    return;
  }
  const playerArmorLevel = buyer.getArmorLevel();
  if (playerArmorLevel >= level) {
    buyer.sendMessage("You have already bought this armor level or better...");
    return;
  }
  if (!checkForPrice(price.priceAmount, price.priceTypeId, buyer, true)) {
    return;
  }
  buyer.setArmorLevel(level);
  const armor = armorLevels[level];
  const equipment = buyer.getComponent("minecraft:equippable");
  if (armor.helmet != null) {
    equipment.setEquipment(EquipmentSlot.Head, armor.helmet());
  }
  if (armor.chestplate != null) {
    equipment.setEquipment(EquipmentSlot.Chest, armor.chestplate());
  }
};
