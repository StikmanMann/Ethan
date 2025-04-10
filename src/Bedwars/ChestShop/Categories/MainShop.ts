import { ItemStack, Player } from "@minecraft/server";
import { Category, ShopItem } from "./Catergorie";
import { addPriceToItem, buyItem } from "../BuyFunctions/StandardBuyFunction";
import { buySword } from "../BuyFunctions/SwordBuyFunctions";
import {
  getColoredTerracotta,
  getColoredGlass,
  getColoredWool,
} from "../ColoredBlocks";
import { buyPickaxe, getPickaxe, getPickaxePrice } from "Bedwars/PickaxeLevels";
import {
  buyAxe,
  getAxe,
  getAxePrice,
} from "Bedwars/ChestShop/LevelableItems/AxeLevels";
import {
  buyArmor,
  getArmor,
  getArmorPrice,
} from "Bedwars/ChestShop/LevelableItems/ArmorLevels";
import { knockbackWhip } from "Bedwars/CustomItems/KnockbackWhip";
import { buyShears, getShears } from "../LevelableItems/ShearLevel";

const items: Array<ShopItem> = new Array<ShopItem>(27);

const stoneSword = new ItemStack("minecraft:stone_sword");
stoneSword.nameTag = "§r§7Stone Sword";
stoneSword.setLore(stoneSword.getLore().concat(["§r§l§n10x Copper"]));
items[0] = addPriceToItem(
  (any) => stoneSword,
  (any) => {
    return {
      priceAmount: 10,
      priceTypeId: "minecraft:copper_ingot",
    };
  },
  buySword
);

items[1] = addPriceToItem(getPickaxe, getPickaxePrice, buyPickaxe);

items[2] = addPriceToItem(
  getColoredWool,
  () => {
    return {
      priceAmount: 4,
      priceTypeId: "minecraft:copper_ingot",
    };
  },
  buyItem
);

items[3] = addPriceToItem(
  getColoredGlass,
  () => {
    return {
      priceAmount: 12,
      priceTypeId: "minecraft:copper_ingot",
    };
  },
  buyItem
);

items[4] = addPriceToItem(
  () => getArmor(1),
  () => getArmorPrice(1),
  (_shop, player, _missingItem, _price) =>
    buyArmor(1, _shop, player, _missingItem, _price)
);

const ironGOlem = new ItemStack("minecraft:iron_golem_spawn_egg");
ironGOlem.nameTag = "§r§fIron Golem";
ironGOlem.setLore(ironGOlem.getLore().concat(["§r§l§n64x Copper"]));
items[5] = addPriceToItem(
  (any) => ironGOlem,
  (any) => {
    return {
      priceAmount: 64,
      priceTypeId: "minecraft:copper_ingot",
    };
  },
  buyItem
);

const windCharger = new ItemStack("minecraft:wind_charge");
windCharger.nameTag = "§r§fWind Charge";
windCharger.setLore(windCharger.getLore().concat(["§r§l§n40x Copper"]));
items[6] = addPriceToItem(
  (any) => windCharger,
  (any) => {
    return {
      priceAmount: 40,
      priceTypeId: "minecraft:copper_ingot",
    };
  },
  buyItem
);

const waterBucket = new ItemStack("minecraft:water_bucket");
waterBucket.nameTag = "§r§fWater";
waterBucket.setLore(waterBucket.getLore().concat(["§r§l§f2x Iron"]));
items[7] = addPriceToItem(
  (any) => waterBucket,
  (any) => {
    return {
      priceAmount: 2,
      priceTypeId: "minecraft:iron_ingot",
    };
  },
  buyItem
);

const ironSword = new ItemStack("minecraft:iron_sword");
ironSword.nameTag = "§r§fIron Sword";
ironSword.setLore(ironSword.getLore().concat(["§r§l§f7x Iron"]));
items[9] = addPriceToItem(
  (any) => ironSword,
  (any) => {
    return {
      priceAmount: 7,
      priceTypeId: "minecraft:iron_ingot",
    };
  },
  buySword
);

items[10] = addPriceToItem(getAxe, getAxePrice, buyAxe);

items[11] = addPriceToItem(
  getColoredTerracotta,
  () => {
    return {
      priceAmount: 12,
      priceTypeId: "minecraft:copper_ingot",
    };
  },
  buyItem
);

const planks = new ItemStack("minecraft:planks");
planks.nameTag = "§r§fWood";
planks.amount = 16;
planks.setLore(planks.getLore().concat(["§r§l§f4x Iron"]));
items[12] = addPriceToItem(
  (any) => planks,
  (any) => {
    return {
      priceAmount: 4,
      priceTypeId: "minecraft:iron_ingot",
    };
  },
  buyItem
);

items[13] = addPriceToItem(
  () => getArmor(2),
  () => getArmorPrice(2),
  (_shop, player, _missingItem, _price) =>
    buyArmor(2, _shop, player, _missingItem, _price)
);

const snowGolem = new ItemStack("minecraft:snow_golem_spawn_egg");
snowGolem.nameTag = "§r§fSnow Golem";
snowGolem.setLore(snowGolem.getLore().concat(["§r§l§n15x Copper"]));
items[14] = addPriceToItem(
  (any) => snowGolem,
  (any) => {
    return {
      priceAmount: 15,
      priceTypeId: "minecraft:copper_ingot",
    };
  },
  buyItem
);

const enderPearl = new ItemStack("minecraft:ender_pearl");
enderPearl.nameTag = "§r§fEnder Pearl";
enderPearl.setLore(enderPearl.getLore().concat(["§r§l§34x Diamond"]));
items[15] = addPriceToItem(
  (any) => enderPearl,
  (any) => {
    return {
      priceAmount: 4,
      priceTypeId: "minecraft:diamond",
    };
  },
  buyItem
);

const milkBucket = new ItemStack("minecraft:milk_bucket");
milkBucket.nameTag = "§r§fMilk";
milkBucket.setLore(milkBucket.getLore().concat(["§r§l§f4x Iron"]));
items[16] = addPriceToItem(
  (any) => milkBucket,
  (any) => {
    return {
      priceAmount: 4,
      priceTypeId: "minecraft:iron_ingot",
    };
  },
  buyItem
);

const tnt = new ItemStack("minecraft:tnt");
tnt.nameTag = "§r§fTNT";
tnt.setLore(tnt.getLore().concat(["§r§l§f4x Iron"]));
items[17] = addPriceToItem(
  (any) => tnt,
  (any) => {
    return {
      priceAmount: 4,
      priceTypeId: "minecraft:iron_ingot",
    };
  },
  buyItem
);

const diamondSword = new ItemStack("minecraft:diamond_sword");
diamondSword.nameTag = "§r§3Diamond Sword";
diamondSword.setLore(diamondSword.getLore().concat(["§r§l§36x Diamond"]));
items[18] = addPriceToItem(
  (any) => diamondSword,
  (any) => {
    return {
      priceAmount: 4,
      priceTypeId: "minecraft:diamond",
    };
  },
  buySword
);

items[19] = addPriceToItem(
  getShears,
  () => {
    return {
      priceAmount: 20,
      priceTypeId: "minecraft:copper_ingot",
    };
  },

  buyShears
);
const deepslate = new ItemStack("minecraft:deepslate");
deepslate.nameTag = "§r§fDeepslate";
deepslate.amount = 12;
deepslate.setLore(deepslate.getLore().concat(["§r§l§n24x Copper"]));
items[20] = addPriceToItem(
  (any) => deepslate,
  (any) => {
    return {
      priceAmount: 24,
      priceTypeId: "minecraft:copper_ingot",
    };
  },
  buyItem
);

const obsidian = new ItemStack("minecraft:obsidian");
obsidian.nameTag = "§r§fObsidian";
obsidian.amount = 4;
obsidian.setLore(obsidian.getLore().concat(["§r§l§34x Diamond"]));
items[21] = addPriceToItem(
  (any) => obsidian,
  (any) => {
    return {
      priceAmount: 4,
      priceTypeId: "minecraft:diamond",
    };
  },
  buyItem
);

items[22] = addPriceToItem(
  () => getArmor(3),
  () => getArmorPrice(3),
  (_shop, player, _missingItem, _price) =>
    buyArmor(3, _shop, player, _missingItem, _price)
);

const sponge = new ItemStack("minecraft:sponge");
sponge.nameTag = "§r§fSponge";
sponge.amount = 4;
sponge.setLore(sponge.getLore().concat(["§r§l§f2x Iron"]));
items[23] = addPriceToItem(
  (any) => sponge,
  (any) => {
    return {
      priceAmount: 2,
      priceTypeId: "minecraft:iron_ingot",
    };
  },
  buyItem
);

const enemyTracker = new ItemStack("minecraft:compass");
enemyTracker.nameTag = "§r§fEnemy Tracker";
enemyTracker.setLore(enemyTracker.getLore().concat(["§r§l§33x Diamonds"]));
items[24] = addPriceToItem(
  (any) => enemyTracker,
  (any) => {
    return {
      priceAmount: 3,
      priceTypeId: "minecraft:diamond",
    };
  },
  buyItem
);

items[25] = addPriceToItem(
  () => knockbackWhip,
  () => {
    return {
      priceAmount: 5,
      priceTypeId: "minecraft:iron_ingot",
    };
  },
  buyItem
);

const ladder = new ItemStack("minecraft:ladder");
ladder.nameTag = "§r§fLadder";
ladder.amount = 8;
ladder.setLore(ladder.getLore().concat(["§r§l§n4x Copper"]));
items[26] = addPriceToItem(
  (any) => ladder,
  (any) => {
    return {
      priceAmount: 4,
      priceTypeId: "minecraft:copper_ingot",
    };
  },
  buyItem
);

export const mainShop: Category = {
  name: "Main Shop",
  items: items,
};
