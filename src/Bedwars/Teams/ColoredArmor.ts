import {
  BlockInventoryComponent,
  Entity,
  EquipmentSlot,
  ItemLockMode,
  ItemStack,
  LocationInUnloadedChunkError,
  Player,
  world,
} from "@minecraft/server";
import { GlobalVars } from "globalVars";
import { VectorFunctions } from "staticScripts/vectorFunctions";

interface IColoredArmor {
  helmet: ItemStack;
  chestplate: ItemStack;
  leggings: ItemStack;
  boots: ItemStack;
}

export const getColoredArmor = (player: Player): IColoredArmor => {
  let colorProperty = player.getDynamicProperty("color") as string;
  const searchQuerey = `${colorProperty}${
    player.getArmorLevel() > 0 ? player.getArmorLevel() : ""
  }`;
  world.sendMessage("Search query: " + searchQuerey);
  let coloredArmorStand: Entity[] | Entity = GlobalVars.getAllEntities({
    type: "armor_stand",
    name: searchQuerey,
  });
  coloredArmorStand = coloredArmorStand.filter(
    (entity) => entity.nameTag == searchQuerey
  );
  let coloredArmor: IColoredArmor = {
    helmet: null,
    chestplate: null,
    leggings: null,
    boots: null,
  };
  if (coloredArmorStand.length == 0) {
    world.sendMessage(`No colored armor stand found for ${searchQuerey}`);
    return coloredArmor;
  }

  if (coloredArmorStand.length > 1) {
    world.sendMessage(
      `Multiple colored armor stands found for ${colorProperty}
      Imma jsut take the first one :)
      Armor stand lcoation: ${JSON.stringify(coloredArmorStand[0].location)}`
    );
  }

  coloredArmorStand = coloredArmorStand[0];
  let dimension = coloredArmorStand.dimension;
  try {
    var chest: BlockInventoryComponent =
      dimension
        .getBlock(coloredArmorStand.location)
        .below()
        .getComponent("inventory") ??
      dimension
        .getBlock(
          VectorFunctions.addVector(coloredArmorStand.location, {
            x: 1,
            y: 0,
            z: 0,
          })
        )
        .getComponent("inventory") ??
      dimension
        .getBlock(
          VectorFunctions.addVector(coloredArmorStand.location, {
            x: -1,
            y: 0,
            z: 0,
          })
        )
        .getComponent("inventory") ??
      dimension
        .getBlock(
          VectorFunctions.addVector(coloredArmorStand.location, {
            x: 0,
            y: 0,
            z: 1,
          })
        )
        .getComponent("inventory") ??
      dimension
        .getBlock(
          VectorFunctions.addVector(coloredArmorStand.location, {
            x: 0,
            y: 0,
            z: -1,
          })
        )
        .getComponent("inventory");
  } catch (e) {
    if (e instanceof LocationInUnloadedChunkError) {
      world.sendMessage("Location in unloaded chunk error");
    }
  }
  if (!chest) {
    world.sendMessage(
      "No chest found around armor stand \nDefaulting to colorless armor"
    );
    return coloredArmor;
  }
  for (let i = 0; i < chest.container.size; i++) {
    let item = chest.container.getItem(i);
    if (item == undefined) {
      continue;
    }
    if (item.typeId.includes("helmet")) {
      coloredArmor.helmet = item;
    }
    if (item.typeId.includes("chestplate")) {
      coloredArmor.chestplate = item;
    }
    if (item.typeId.includes("leggings")) {
      coloredArmor.leggings = item;
    }
    if (item.typeId.includes("boots")) {
      coloredArmor.boots = item;
    }
  }
  return coloredArmor;
};
