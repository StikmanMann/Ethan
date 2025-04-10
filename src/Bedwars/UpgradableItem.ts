import { ItemStack } from "@minecraft/server";

export interface UpgradableItem {
  playerItems: Array<ItemStack>;
  shopItems: Array<ItemStack>;
}
