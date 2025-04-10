import { buyItem, checkForPrice } from "./StandardBuyFunction";
export const buySword = (shopEntity, buyer, missingItem, price) => {
    const priceTypeId = price.priceTypeId;
    const priceAmount = price.priceAmount;
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
        if (item.typeId == "minecraft:wooden_sword") {
            inventory.setItem(i, null);
            break;
        }
    }
    buyItem(shopEntity, buyer, missingItem, price);
};
