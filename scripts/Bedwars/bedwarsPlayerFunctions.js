import { Player } from "@minecraft/server";
// Define properties on hypixelValues object
//#region Functions
Player.prototype.upgradePickaxe = function () {
    const currentLevel = this.getPickaxeLevel();
};
Player.prototype.getPickaxeLevel = function () {
    if (this.getDynamicProperty("pickaxeLevel") === undefined) {
        this.setDynamicProperty("pickaxeLevel", 0);
    }
    return this.getDynamicProperty("pickaxeLevel");
};
