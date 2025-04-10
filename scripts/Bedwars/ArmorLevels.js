import { EquipmentSlot, ItemStack } from "@minecraft/server";
import { addCommand } from "staticScripts/commandFunctions";
import { checkForPrice } from "./ChestShop/BuyFunctions/StandardBuyFunction";
const chainmailHelmet = new ItemStack("minecraft:chainmail_helmet");
const chainmailChestplate = new ItemStack("minecraft:chainmail_chestplate");
const shopChainChestplate = new ItemStack("minecraft:chainmail_chestplate");
shopChainChestplate.setLore(shopChainChestplate.getLore().concat(["§r§l§n24x Copper"]));
const chainArmor = {
    helmet: () => chainmailHelmet,
    chestplate: () => chainmailChestplate,
};
const ironHelmet = new ItemStack("minecraft:iron_helmet");
const ironChestplate = new ItemStack("minecraft:iron_chestplate");
const shopIronChestplate = new ItemStack("minecraft:iron_chestplate");
shopIronChestplate.setLore(shopIronChestplate.getLore().concat(["§r§l§f12x Iron"]));
const ironArmor = {
    helmet: () => ironHelmet,
    chestplate: () => ironChestplate,
};
const diamondHelmet = new ItemStack("minecraft:diamond_helmet");
const diamondChestplate = new ItemStack("minecraft:diamond_chestplate");
const shopDiamondChestplate = new ItemStack("minecraft:diamond_chestplate");
shopDiamondChestplate.setLore(shopDiamondChestplate.getLore().concat(["§r§l§36x Diamond"]));
const diamondArmor = {
    helmet: () => diamondHelmet,
    chestplate: () => diamondChestplate,
};
const armorShopItems = [
    shopChainChestplate,
    shopIronChestplate,
    shopDiamondChestplate,
];
const armorPrices = [
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
export const armorLevels = [
    { chestplate: null, helmet: null },
    chainArmor,
    ironArmor,
    diamondArmor,
];
export const buyArmorLevel = (player) => {
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
export const getArmor = (level) => {
    if (level > armorLevels.length - 1) {
        return null;
    }
    return shopArmorLevel[level];
};
export const getArmorPrice = (level) => {
    if (level > armorPrices.length - 1) {
        return armorPrices[armorPrices.length - 1];
    }
    return armorPrices[level];
};
export const buyArmor = (level, _shopEntity, buyer, _missingItem, price) => {
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
