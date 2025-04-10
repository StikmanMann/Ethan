import { EnchantmentType, ItemStack, world, } from "@minecraft/server";
import { buyItem, checkForPrice, } from "./ChestShop/BuyFunctions/StandardBuyFunction";
import { addCommand } from "staticScripts/commandFunctions";
const efficiencyEnchantment = new EnchantmentType("minecraft:efficiency");
const sharpnessEnchantment = new EnchantmentType("minecraft:sharpness");
//Level 1
const levelOne = new ItemStack("minecraft:wooden_axe");
levelOne.nameTag = "§rLevel 1 Axe";
levelOne.getComponent("enchantable").addEnchantment({
    level: 1,
    type: efficiencyEnchantment,
});
const levelOneShop = levelOne.clone();
levelOneShop.setLore(levelOneShop.getLore().concat(["§r§l§n10x Copper"]));
//Level 2
const levelTwo = new ItemStack("minecraft:stone_axe");
levelTwo.nameTag = "§rLevel 2 Axe";
levelTwo.getComponent("enchantable").addEnchantment({
    level: 1,
    type: efficiencyEnchantment,
});
const levelTwoShop = levelTwo.clone();
levelTwoShop.setLore(levelTwoShop.getLore().concat(["§r§l§n10x Copper"]));
//Level 3
const levelThree = new ItemStack("minecraft:iron_axe");
levelThree.nameTag = "§rLevel 3 Axe";
levelThree.getComponent("enchantable").addEnchantments([
    {
        level: 2,
        type: efficiencyEnchantment,
    },
]);
const levelThreeShop = levelThree.clone();
levelThreeShop.setLore(levelThreeShop.getLore().concat(["§r§l§73x Iron"]));
//Level 4
const levelFour = new ItemStack("minecraft:diamond_axe");
levelFour.nameTag = "§rLevel 4 Axe";
levelFour.getComponent("enchantable").addEnchantment({
    level: 3,
    type: efficiencyEnchantment,
});
const levelFourShop = levelFour.clone();
levelFourShop.setLore(levelFourShop.getLore().concat(["§r§l§76x Iron"]));
export const axeLevels = [
    null,
    levelOne,
    levelTwo,
    levelThree,
    levelFour,
];
//Null at start so you dont have any items when you start
const axeShopItems = [
    null,
    levelOneShop,
    levelTwoShop,
    levelThreeShop,
    levelFourShop,
];
const axePrices = [
    null,
    { priceAmount: 10, priceTypeId: "minecraft:copper_ingot" },
    { priceAmount: 10, priceTypeId: "minecraft:copper_ingot" },
    { priceAmount: 3, priceTypeId: "minecraft:iron_ingot" },
    { priceAmount: 6, priceTypeId: "minecraft:iron_ingot" },
];
export const getAxe = (player) => {
    const level = player.getAxeLevel();
    if (level >= axeShopItems.length - 1) {
        return axeShopItems[axeLevels.length - 1];
    }
    return axeShopItems[level + 1];
};
export const getAxePrice = (player) => {
    const level = player.getAxeLevel();
    if (level >= axePrices.length - 1) {
        return axePrices[axePrices.length - 1];
    }
    return axePrices[level + 1];
};
export const buyAxe = (shopEntity, buyer, missingItem, price) => {
    const level = buyer.getAxeLevel();
    if (level >= axeLevels.length - 1) {
        world.sendMessage("Max Axe level reached");
        return;
    }
    const priceTypeId = price.priceTypeId;
    const priceAmount = price.priceAmount;
    world.sendMessage("Buy Axe");
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
        if (item.typeId.includes("axe")) {
            inventory.setItem(i, null);
            break;
        }
    }
    buyer.setAxeLevel(level + 1);
    buyItem(shopEntity, buyer, missingItem, price);
};
addCommand({
    commandName: "setAxeLevel",
    commandPrefix: ";;",
    directory: "Bedwars",
    chatFunction: (chatSendEvent) => {
        const level = parseInt(chatSendEvent.message.split(" ")[1]);
        world.sendMessage("AGSAGHF");
        chatSendEvent.sender.setAxeLevel(level);
    },
});
world.afterEvents.entityDie.subscribe((eventData) => {
    if (eventData.deadEntity.typeId == "minecraft:player") {
        const player = eventData.deadEntity;
        const level = player.getAxeLevel();
        if (level <= 1) {
            return;
        }
        player.setAxeLevel(level - 1);
    }
});
