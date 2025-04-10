import { ItemStack, Player, world } from "@minecraft/server";
import { BedwarsTeam } from "Bedwars/Teams/TeamColor";

const specialWoolNameCase: Map<string, string> = new Map([
  ["light_blue", "§fBlue Wool"],
  ["lime", "§fGreen Wool"],
]);

export const getColoredWool = (player: Player): ItemStack => {
  let wool: ItemStack;
  if (!player) {
    wool = new ItemStack("minecraft:wool");
    wool.amount = 16;
    wool.setLore(wool.getLore().concat(["§r§l§n4x Copper"]));
    return wool;
  }
  let colorProperty = player.getDynamicProperty("color") as string;
  //world.sendMessage("" + colorProperty);

  let color = BedwarsTeam.getBlockColor(player);

  if (!color) {
    wool = new ItemStack("minecraft:wool");

    wool.amount = 16;
    wool.setLore(wool.getLore().concat(["§r§l§n4x Copper"]));

    return wool;
  }
  wool = new ItemStack(`minecraft:${color}_wool`);
  wool.nameTag = `§r§f${color[0].toLocaleUpperCase() + color.slice(1)} Wool`;
  wool.amount = 16;
  wool.setLore(wool.getLore().concat(["§r§l§n4x Copper"]));

  if (specialWoolNameCase.has(color)) {
    wool.nameTag = `§r${specialWoolNameCase.get(color)}`;
  }

  return wool;
};

const specialGlassNameCase: Map<string, string> = new Map([
  ["light_blue", "§fBlue Stained Glass"],
  ["lime", "§fGreen Stained Glass"],
]);

export const getColoredGlass = (player: Player): ItemStack => {
  let glass: ItemStack;
  if (!player) {
    glass = new ItemStack("minecraft:stained_glass");
    glass.amount = 4;
    glass.setLore(glass.getLore().concat(["§r§l§n12x Copper"]));
    return glass;
  }
  let colorProperty = player.getDynamicProperty("color") as string;
  //world.sendMessage("" + colorProperty);

  let color = BedwarsTeam.getBlockColor(player);

  if (!color) {
    glass = new ItemStack("minecraft:stained_glass");

    glass.amount = 4;
    glass.setLore(glass.getLore().concat(["§r§l§n12x Copper"]));

    return glass;
  }
  glass = new ItemStack(`minecraft:${color}_stained_glass`);
  glass.amount = 4;
  glass.setLore(glass.getLore().concat(["§r§l§n12x Copper"]));

  if (specialGlassNameCase.has(color)) {
    glass.nameTag = `§r${specialGlassNameCase.get(color)}`;
  }

  return glass;
};

const specialTerracottaNameCase: Map<string, string> = new Map([
  ["light_blue", "§fBlue Terracotta"],
  ["lime", "§fGreen Terracotta"],
]);

export const getColoredTerracotta = (player: Player): ItemStack => {
  let terracotta: ItemStack;
  if (!player) {
    terracotta = new ItemStack("minecraft:terracotta");
    terracotta.amount = 16;
    terracotta.setLore(terracotta.getLore().concat(["§r§l§n12x Copper"]));
    return terracotta;
  }
  let colorProperty = player.getDynamicProperty("color") as string;
  //world.sendMessage("" + colorProperty);

  let color = BedwarsTeam.getBlockColor(player);

  if (!color) {
    terracotta = new ItemStack("minecraft:terracotta");

    terracotta.amount = 16;
    terracotta.setLore(terracotta.getLore().concat(["§r§l§n12x Copper"]));

    return terracotta;
  }
  terracotta = new ItemStack(`minecraft:${color}_terracotta`);
  terracotta.amount = 16;
  terracotta.setLore(terracotta.getLore().concat(["§r§l§n12x Copper"]));

  if (specialTerracottaNameCase.has(color)) {
    terracotta.nameTag = `§r${specialTerracottaNameCase.get(color)}`;
  }

  return terracotta;
};
