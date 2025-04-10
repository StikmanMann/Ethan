import { EquipmentSlot, ItemLockMode, ItemStack, world, } from "@minecraft/server";
import { armorLevels } from "Bedwars/ChestShop/LevelableItems/ArmorLevels";
import { axeLevels } from "Bedwars/ChestShop/LevelableItems/AxeLevels";
import { pickaxeLevels } from "Bedwars/PickaxeLevels";
import { getColoredArmor } from "Bedwars/Teams/ColoredArmor";
import { addCommand } from "staticScripts/commandFunctions";
/* for (let player of world.getAllPlayers()) {
  const item = player
    .getComponent("equippable")
    .getEquipment(EquipmentSlot.Mainhand);

  world.sendMessage(JSON.stringify(item.getComponents()));
  Logger.warn(JSON.stringify(item));
} */
//leatherChestplate.getComponent("dyeable").color = { blue: 0, green: 0, red: 0 };
const leatherHelmet = new ItemStack("minecraft:leather_helmet");
const leatherChestplate = new ItemStack("minecraft:leather_chestplate");
const leatherLeggings = new ItemStack("minecraft:leather_leggings");
const leatherBoots = new ItemStack("minecraft:leather_boots");
const giveKitFunction = (player) => {
    const inventory = player.getComponent("minecraft:inventory").container;
    inventory.clearAll();
    inventory.addItem(new ItemStack("minecraft:wooden_sword"));
    let axeLevel = player.getAxeLevel();
    if (axeLevel != 0) {
        inventory.addItem(axeLevels[axeLevel]);
    }
    let pickaxeLevel = player.getPickaxeLevel();
    if (pickaxeLevel != 0) {
        inventory.addItem(pickaxeLevels[pickaxeLevel]);
    }
    let shearsLevel = player.getShearsStautus();
    if (shearsLevel != 0) {
        inventory.addItem(new ItemStack("minecraft:shears"));
    }
    //Colored Armor
    let armorLevel = player.getArmorLevel();
    let coloredArmor = getColoredArmor(player);
    const equipment = player.getComponent("minecraft:equippable");
    const helmet = coloredArmor.helmet ?? armorLevels[armorLevel].helmet() ?? leatherHelmet;
    helmet.lockMode = ItemLockMode.slot;
    equipment.setEquipment(EquipmentSlot.Head, helmet);
    const chestplate = coloredArmor.chestplate ??
        armorLevels[armorLevel].chestplate() ??
        leatherChestplate;
    chestplate.lockMode = ItemLockMode.slot;
    equipment.setEquipment(EquipmentSlot.Chest, chestplate);
    const leggings = coloredArmor.leggings ?? leatherLeggings;
    leggings.lockMode = ItemLockMode.slot;
    equipment.setEquipment(EquipmentSlot.Legs, leggings);
    const boots = coloredArmor.boots ?? leatherBoots;
    boots.lockMode = ItemLockMode.slot;
    equipment.setEquipment(EquipmentSlot.Feet, boots);
    //Bought Armor
    /*
    if (armorLevel != 0) {
      const armor = armorLevels[armorLevel];
  
      if (armor.helmet != null) {
        equipment.setEquipment(EquipmentSlot.Head, armor.helmet());
      }
      if (armor.chestplate != null) {
        equipment.setEquipment(EquipmentSlot.Chest, armor.chestplate());
      }
    } */
};
export const standardKit = {
    name: "Standard Kit",
    giveKitFunction: giveKitFunction,
};
addCommand({
    commandName: "kit",
    commandPrefix: ";;",
    directory: "Bedwars",
    chatFunction: (chatSendEvent) => {
        world.sendMessage("§l§e» §r§eYou have received the §l§eStandard Kit");
        chatSendEvent.sender.givePlayerKit();
    },
});
world.afterEvents.playerSpawn.subscribe((eventData) => {
    eventData.player.givePlayerKit();
});
