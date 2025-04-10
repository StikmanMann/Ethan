const checkForPrice = (priceAmount, priceTypeId, buyer) => {
    const buyerInventory = buyer.getComponent("minecraft:inventory").container;
    let found_slots = [];
    let added_amount = 0;
    for (let j = 0; j < buyerInventory.size; j++) {
        const item = buyerInventory.getItem(j);
        if (!item) {
            continue;
        }
        const lore = item.getLore();
        if (lore.length > 0) {
            buyerInventory.setItem(j, null);
            continue;
        }
        //If the first currency slot is enough to buy the item
        if (item.typeId === priceTypeId &&
            item.amount >= priceAmount &&
            found_slots.length === 0) {
            if (item.amount === priceAmount) {
                buyerInventory.setItem(j, null);
                buyer.playSound("note.pling", { pitch: 2, volume: 0.8 });
                return true;
            }
            const new_item = item.clone();
            new_item.amount = item.amount - priceAmount;
            buyerInventory.setItem(j, new_item);
            //buyerInventory.setItem(j, null);
            buyer.playSound("note.pling", { pitch: 2, volume: 0.8 });
            return true;
        }
        //If it needs to use 2 or more slots of currency to buy something
        if (item.typeId === priceTypeId) {
            found_slots.push(j);
            added_amount += item.amount;
            if (added_amount >= priceAmount) {
                let remaining_amount = priceAmount;
                for (let i = 0; i < found_slots.length; i++) {
                    if (i == found_slots.length - 1) {
                        const last_item = buyerInventory.getItem(found_slots[i]);
                        if (last_item.amount == remaining_amount) {
                            buyerInventory.setItem(j, null);
                            buyer.playSound("note.pling", { pitch: 2, volume: 0.8 });
                            return true;
                        }
                        const new_item = last_item.clone();
                        new_item.amount = last_item.amount - remaining_amount;
                        buyerInventory.setItem(found_slots[i], new_item);
                        buyer.playSound("note.pling", { pitch: 2, volume: 0.8 });
                        return true;
                    }
                    remaining_amount -= buyerInventory.getItem(found_slots[i]).amount;
                    buyerInventory.setItem(found_slots[i], null);
                }
            }
        }
    }
    buyer.playSound("note.bass", { pitch: 1, volume: 0.5 });
    buyer.sendMessage(`§l§c» §r§cYou cannot afford this item`);
    return false;
};
export const addPriceToItem = (item, paymentItemTypeId, paymentAmount, informationLore) => {
    item.setLore(item.getLore().concat(informationLore));
    item.setDynamicProperty("payment", `${paymentAmount} ${paymentItemTypeId}`);
    return {
        item: item,
        buyFunction: buyItem,
    };
};
export const buyItem = (shopEntity, buyer, missingItem) => {
    const priceTypeId = missingItem.getDynamicProperty("payment").split(" ")[1];
    const priceAmount = parseInt(missingItem.getDynamicProperty("payment").split(" ")[0]);
    if (checkForPrice(priceAmount, priceTypeId, buyer)) {
        const item = missingItem.clone();
        item.clearDynamicProperties();
        item.setLore(null);
        buyer.getComponent("minecraft:inventory").container.addItem(item);
        buyer.sendMessage(`§l§9» §r§eYou purchased §l§e${item.amount}x ${item.nameTag ?? "You forgot to add the nametag to the item stoopid"}`);
    }
};
