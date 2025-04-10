import {
  EnchantmentType,
  EnchantmentTypes,
  Entity,
  ItemStack,
  Player,
  world,
} from "@minecraft/server";
import { UpgradableItem } from "./UpgradableItem";
import {
  addPriceToItem,
  buyItem,
  checkForPrice,
} from "Bedwars/ChestShop/BuyFunctions/StandardBuyFunction";
import { Price, ShopItem } from "Bedwars/ChestShop/Categories/Catergorie";
import { addCommand } from "staticScripts/commandFunctions";

const efficiencyEnchantment = new EnchantmentType("minecraft:efficiency");
const sharpnessEnchantment = new EnchantmentType("minecraft:sharpness");

//Level 1
const levelOne = new ItemStack("minecraft:wooden_pickaxe");
levelOne.nameTag = "§rLevel 1 Pickaxe";

levelOne.getComponent("enchantable").addEnchantment({
  level: 1,
  type: efficiencyEnchantment,
});

const levelOneShop = levelOne.clone();
levelOneShop.setLore(levelOneShop.getLore().concat(["§r§l§n10x Copper"]));

//Level 2
const levelTwo = new ItemStack("minecraft:iron_pickaxe");
levelTwo.nameTag = "§rLevel 2 Pickaxe";
levelTwo.getComponent("enchantable").addEnchantment({
  level: 3,
  type: efficiencyEnchantment,
});
const levelTwoShop = levelTwo.clone();
levelTwoShop.setLore(levelTwoShop.getLore().concat(["§r§l§n10x Copper"]));

//Level 3
const levelThree = new ItemStack("minecraft:golden_pickaxe");
levelThree.nameTag = "§rLevel 3 Pickaxe";
levelThree.getComponent("enchantable").addEnchantments([
  {
    level: 3,
    type: efficiencyEnchantment,
  },
]);
const levelThreeShop = levelThree.clone();
levelThreeShop.setLore(levelThreeShop.getLore().concat(["§r§l§73x Iron"]));

//Level 4
const levelFour = new ItemStack("minecraft:diamond_pickaxe");
levelFour.nameTag = "§rLevel 4 Pickaxe";
levelFour.getComponent("enchantable").addEnchantment({
  level: 3,
  type: efficiencyEnchantment,
});

const levelFourShop = levelFour.clone();
levelFourShop.setLore(levelFourShop.getLore().concat(["§r§l§76x Iron"]));

export const pickaxeLevels: ItemStack[] = [
  null,
  levelOne,
  levelTwo,
  levelThree,
  levelFour,
];

//Null at start so you dont have any items when you start
const pickaxeShopItems: ItemStack[] = [
  null,
  levelOneShop,
  levelTwoShop,
  levelThreeShop,
  levelFourShop,
];

const pickaxePrices: Price[] = [
  null,
  { priceAmount: 10, priceTypeId: "minecraft:copper_ingot" },
  { priceAmount: 10, priceTypeId: "minecraft:copper_ingot" },
  { priceAmount: 3, priceTypeId: "minecraft:iron_ingot" },
  { priceAmount: 6, priceTypeId: "minecraft:iron_ingot" },
];

export const getPickaxe = (player: Player): ItemStack => {
  const level = player.getPickaxeLevel();
  if (level >= pickaxeShopItems.length - 1) {
    return pickaxeShopItems[pickaxeLevels.length - 1];
  }
  return pickaxeShopItems[level + 1];
};

export const getPickaxePrice = (player: Player): Price => {
  const level = player.getPickaxeLevel();
  if (level >= pickaxePrices.length - 1) {
    return pickaxePrices[pickaxePrices.length - 1];
  }
  return pickaxePrices[level + 1];
};

export const buyPickaxe = (
  shopEntity: Entity,
  buyer: Player,
  missingItem: ItemStack,
  price: Price
) => {
  const level = buyer.getPickaxeLevel();
  if (level >= pickaxeLevels.length - 1) {
    world.sendMessage("Max pickaxe level reached");
    return;
  }

  const priceTypeId = price.priceTypeId;
  const priceAmount = price.priceAmount;
  world.sendMessage("Buy pickaxe");
  if (!checkForPrice(priceAmount, priceTypeId, buyer, false)) {
    buyItem(shopEntity, buyer, missingItem, price);
    return;
  }

  const inventory = buyer.getComponent("minecraft:inventory").container;
  for (let i = 0; i < inventory.size; i++) {
    const item = inventory.getItem(i);
    if (item == undefined) {
      continue;
    }
    if (item.typeId.includes("pickaxe")) {
      inventory.setItem(i, null);
      break;
    }
  }

  buyer.setPickaxeLevel(level + 1);

  buyItem(shopEntity, buyer, missingItem, price);
};

addCommand({
  commandName: "setPickaxeLevel",
  commandPrefix: ";;",
  directory: "Bedwars",
  chatFunction: (chatSendEvent) => {
    const level = parseInt(chatSendEvent.message.split(" ")[1]);
    world.sendMessage("AGSAGHF");
    chatSendEvent.sender.setPickaxeLevel(level);
  },
});

world.afterEvents.entityDie.subscribe((eventData) => {
  if (eventData.deadEntity.typeId == "minecraft:player") {
    const player = eventData.deadEntity as Player;
    const level = player.getPickaxeLevel();
    if (level <= 1) {
      return;
    }
    player.setPickaxeLevel(level - 1);
  }
});
