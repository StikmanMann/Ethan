import { ItemStack, ItemType, Player, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { MapParser } from "MapParser/loadMap";
import { GlobalVars } from "globalVars";
import { Logger, LoggerClass } from "staticScripts/Logger";
import { addCommand, showHUD } from "staticScripts/commandFunctions";
import { givePlayerKit } from "./Kit";
import { pickaxeLevels } from "./PickaxeLevels";
import { axeLevels } from "Bedwars/ChestShop/LevelableItems/AxeLevels";
import { armorLevels } from "./ChestShop/LevelableItems/ArmorLevels";
// Define the PlayerValues type

// Ensure that hypixelValues is initialized as an object on Player.prototype
// Extend the Player interface to include hypixelValues
declare module "@minecraft/server" {
  interface Player {
    givePlayerKit(): void;

    getPickaxeLevel(): number;
    setPickaxeLevel(level: number): void;

    getAxeLevel(): number;
    setAxeLevel(level: number): void;

    setArmorLevel(level: number): void;
    getArmorLevel(): number;

    getShearsStautus(): number;
    setShearsStauts(status: number): void;
  }
}

// Define properties on hypixelValues object
//#region Functions

Player.prototype.givePlayerKit = function () {
  givePlayerKit(this);
};

Player.prototype.getPickaxeLevel = function () {
  if (this.getDynamicProperty("pickaxeLevel") === undefined) {
    this.setDynamicProperty("pickaxeLevel", 0);
  }
  return this.getDynamicProperty("pickaxeLevel");
};

Player.prototype.setPickaxeLevel = function (level: number) {
  world.sendMessage("Setting pickaxe level to " + level);
  if (level < 0) {
    world.sendMessage("Pickaxe level cannot be negative");
    return;
  }
  if (level > pickaxeLevels.length - 1) {
    world.sendMessage("Max pickaxe level reached");
    return;
  }
  this.setDynamicProperty("pickaxeLevel", level);
};

Player.prototype.getAxeLevel = function () {
  if (this.getDynamicProperty("axeLevel") === undefined) {
    this.setDynamicProperty("axeLevel", 0);
  }
  return this.getDynamicProperty("axeLevel");
};

Player.prototype.setAxeLevel = function (level: number) {
  world.sendMessage("Setting axe level to " + level);
  if (level < 0) {
    world.sendMessage("Axe level cannot be negative");
    return;
  }
  if (level > axeLevels.length - 1) {
    world.sendMessage("Max axe level reached");
    return;
  }
  this.setDynamicProperty("axeLevel", level);
};

Player.prototype.setArmorLevel = function (level: number) {
  world.sendMessage("Setting armor level to " + level);
  if (level < 0) {
    world.sendMessage("Armor level cannot be negative");
    return;
  }
  if (level > armorLevels.length - 1) {
    world.sendMessage("Max armor level reached");
    return;
  }
  this.setDynamicProperty("armorLevel", level);
};

Player.prototype.getArmorLevel = function () {
  if (this.getDynamicProperty("armorLevel") === undefined) {
    this.setDynamicProperty("armorLevel", 0);
  }
  return this.getDynamicProperty("armorLevel");
};

Player.prototype.getShearsStautus = function () {
  if (this.getDynamicProperty("shearsStatus") === undefined) {
    this.setDynamicProperty("shearsStatus", 0);
  }
  return this.getDynamicProperty("shearsStatus");
};

Player.prototype.setShearsStauts = function (status: number) {
  let num = Math.min(Math.max(status, 0), 1);
  this.setDynamicProperty("shearsStatus", num);
};

//#endregion
