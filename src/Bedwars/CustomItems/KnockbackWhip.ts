import {
  EnchantmentType,
  EnchantmentTypes,
  EquipmentSlot,
  ItemStack,
  world,
} from "@minecraft/server";

export const knockbackWhip = new ItemStack("minecraft:lead");
knockbackWhip.nameTag = "§r§fKnockback Whip";
knockbackWhip.setLore(["§r§l§f5x Iron"]);

world.afterEvents.entityHurt.subscribe((eventData) => {
  if (eventData.damageSource.damagingEntity == null) return;

  const item = eventData.damageSource.damagingEntity
    .getComponent("equippable")
    .getEquipmentSlot(EquipmentSlot.Mainhand);

  if (item.typeId == knockbackWhip.typeId) {
    const attacker = eventData.damageSource.damagingEntity;
    const damagedEntity = eventData.hurtEntity;
    const playerRotation = attacker.getRotation();
    const kbForce = 1 + Math.random();
    damagedEntity.applyKnockback(
      Math.sin(playerRotation.y * (Math.PI / 180) * -1),
      Math.cos(playerRotation.y * (Math.PI / 180) * -1),
      kbForce,
      0.1
    );
    world.sendMessage("KB Force: " + kbForce.toFixed(2));
  }
});
