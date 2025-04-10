import { system, world } from "@minecraft/server";
import { VectorFunctions } from "staticScripts/vectorFunctions";
const tntNames = new Set();
tntNames.add("minecraft:tnt");
world.afterEvents.playerPlaceBlock.subscribe((eventData) => {
    const block = eventData.block;
    //world.sendMessage("Placing block: " + block.typeId);
    if (tntNames.has(block.typeId)) {
        system.run(async () => {
            block.dimension.setBlockType(block.location, "minecraft:air");
            let tnt = eventData.player.dimension.spawnEntity("minecraft:tnt", VectorFunctions.addVector({ x: 0.5, y: 0.1, z: 0.5 }, eventData.block.location));
            eventData.player.dimension.playSound("random.fuse", tnt.location);
        });
    }
});
/* world.beforeEvents.explosion.subscribe((eventData) => {
  system.run(() => {
    const location = eventData.;
    GlobalVars.getAllEntities({ location: location, maxDistance: 5 }).forEach(
      (entity) => {
        entity.applyDamage(2, {
          cause: EntityDamageCause.blockExplosion,
          damagingEntity: eventData.source,
        });
        const vector = VectorFunctions.subtractVector(
          eventData.source.location,
          entity.location
        );
        const rotation = VectorFunctions.getYRotation(vector);
        entity.applyKnockback(
          Math.sin(rotation * (Math.PI / 180) * -1),
          Math.cos(rotation * (Math.PI / 180) * -1),
          2,
          0.1
        );
      }
    );

    world.sendMessage("Explosion!");
  });
}); */
