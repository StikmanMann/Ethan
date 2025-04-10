import { system, world, } from "@minecraft/server";
import { Logger } from "staticScripts/Logger";
import { categories } from "./Categories/Catergorie";
import { VectorFunctions } from "staticScripts/vectorFunctions";
import { TickFunctions } from "staticScripts/tickFunctions";
import { GlobalVars } from "globalVars";
/**
 * POSSIBLE OPTIMIZATIONS
 *
 *
 *
 */
//remove all used shops on reload
system.run(() => {
    const usedShops = GlobalVars.getAllEntities({
        tags: ["used"],
    });
    for (const usedShop of usedShops) {
        usedShop.remove();
    }
});
let activeShops = [];
world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
    system.run(async () => {
        const shopEntity = event.target;
        //world.sendMessage(shopEntity.typeId);
        if (shopEntity.typeId !== "shop:villager_shop") {
            world.sendMessage("Not a shop!");
            return;
        }
        activeShops.push(shopEntity);
        const shopInventory = shopEntity.getComponent("minecraft:inventory").container;
        //world.sendMessage(`${categories.has(shopEntity.nameTag)}`);
        loadPage(shopInventory, categories.get(shopEntity.nameTag), event.player);
        world.sendMessage(`Opened ${shopEntity.nameTag} for ${event.player.name}`);
        const newShop = shopEntity.dimension.spawnEntity(shopEntity.typeId, shopEntity.location);
        newShop.nameTag = shopEntity.nameTag;
        newShop.addEffect("instant_health", 99999, {
            amplifier: 255,
            showParticles: false,
        });
        shopEntity.teleport(VectorFunctions.addVector(event.player.location, { x: 0, y: -3, z: 0 }));
        shopEntity.addEffect("invisibility", 99999, { showParticles: false });
        shopEntity.addEffect("instant_health", 99999, {
            amplifier: 255,
            showParticles: false,
        });
        //remove old used villagers by same player
        for (const entity of activeShops) {
            const usedBy = entity.getDynamicProperty("buyer");
            if (usedBy === event.player.nameTag) {
                Logger.log(`Removing old shop for ${usedBy}`);
                entity.remove();
            }
        }
        shopEntity.addTag("used");
        shopEntity.setDynamicProperty("buyer", event.player.name);
    });
});
world.afterEvents.entitySpawn.subscribe((event) => {
    if (event.entity.typeId === "shop:villager_shop") {
        //world.sendMessage("Spawned shop!");
        event.entity.addEffect("instant_health", 99999, {
            amplifier: 255,
            showParticles: false,
        });
    }
});
const loadPage = async (shopEntityInventory, category, buyer) => {
    for (let i = 0; i < shopEntityInventory.size; i++) {
        const shopItem = category.items[i];
        if (shopItem == undefined) {
            continue;
        }
        let item = category.items[i].getItem(buyer);
        if (item == undefined) {
            continue;
        }
        shopEntityInventory.setItem(i, category.items[i].getItem(buyer));
    }
    return Promise.resolve();
};
//Delete items with lore so player cant drop the itmes out of the shop
const deleteGroundItems = () => {
    for (const item of GlobalVars.getAllEntities({
        type: "item",
    })) {
        let lore = item.getComponent("item").itemStack.getLore();
        if (lore.length > 0) {
            item.remove();
        }
    }
};
TickFunctions.addFunction(deleteGroundItems, 2);
const checkShopsForBuy = () => {
    for (const shopEntity of activeShops) {
        if (!shopEntity.hasTag("used")) {
            continue;
        }
        if (shopEntity.getDynamicProperty("buyer") === undefined) {
            continue;
        }
        const buyer = world.getPlayers({
            name: shopEntity.getDynamicProperty("buyer"),
        })[0];
        if (Math.abs(buyer.location.x - shopEntity.location.x) > 5 ||
            Math.abs(buyer.location.z - shopEntity.location.z) > 5) {
            Logger.warn(`Removing Shop for ${shopEntity.getDynamicProperty("buyer")}`);
            shopEntity.remove();
            activeShops = activeShops.filter((shop) => shop !== shopEntity);
            continue;
        }
        const shopEntityInventory = shopEntity.getComponent("minecraft:inventory").container;
        const currentShop = categories.get(shopEntity.nameTag);
        for (let i = 0; i < shopEntityInventory.size; i++) {
            if (shopEntityInventory.getItem(i) !== undefined) {
                continue;
            }
            if (currentShop.items[i] == undefined) {
                continue;
            }
            shopEntityInventory.setItem(i, currentShop.items[i].getItem(buyer));
            const missingItem = currentShop.items[i];
            //If they normally selected the item
            if (buyer.getComponent("cursor_inventory").item) {
                const item = buyer.getComponent("cursor_inventory").item;
                if (item.getLore().length == missingItem.getItem(buyer).getLore().length) {
                    buyer.getComponent("cursor_inventory").clear();
                    missingItem.buyFunction(shopEntity, buyer, missingItem.getItem(buyer), missingItem.getPrice(buyer));
                    continue;
                }
            }
            //If they shift clicked the item
            const buyer_inventory = buyer.getComponent("minecraft:inventory").container;
            for (let j = 0; j < buyer_inventory.size; j++) {
                const item = buyer_inventory.getItem(j);
                if (item == undefined) {
                    continue;
                }
                const lore = item.getLore() ?? null;
                if (!lore) {
                    continue;
                }
                if (item.getLore().length == missingItem.getItem(buyer).getLore().length) {
                    buyer_inventory.setItem(j, null);
                    missingItem.buyFunction(shopEntity, buyer, missingItem.getItem(buyer), missingItem.getPrice(buyer));
                    break;
                }
                //world.sendMessage(`${buyer.nameTag} bought ${currentShop.items[i].typeId}`);
            }
        }
        /*  f*/
    }
};
TickFunctions.addFunction(checkShopsForBuy, 2);
