import {
  Block,
  BlockPermutation,
  Dimension,
  EntityDamageCause,
  system,
  Vector3,
  world,
} from "@minecraft/server";
import { GlobalVars } from "globalVars";

let explosionResitantGlassBlocks: Array<[Vector3, string]> = [];

/* world.afterEvents.blockExplode.subscribe((eventData) => {
  const explodedBlock = eventData.explodedBlockPermutation;
  //world.sendMessage("Exploded block: " + explodedBlock.type.id);
  if (explodedBlock.type.id.includes("glass")) {
    eventData.dimension.setBlockPermutation(
      eventData.block.location,
      explodedBlock
    );
  }
}); */

let firstBoom = true;

world.beforeEvents.explosion.subscribe((eventData) => {
  if (firstBoom) {
    let impactedBlocks = eventData.getImpactedBlocks();
    let tnt = GlobalVars.getAllEntities({
      location: impactedBlocks[0].location,
      type: "minecraft:tnt",
      closest: 1,
    })[0];
    if (!tnt) {
      //world.sendMessage("No TNT found");
      return;
    }
    let location = tnt.location;
    eventData.cancel = true;
    firstBoom = false;
    system.run(() => {
      for (const block of impactedBlocks) {
        if (block.typeId.includes("glass")) {
          explosionResitantGlassBlocks.push([block.location, block.typeId]);
          block.dimension.setBlockType(block.location, "minecraft:obsidian");
        }
      }

      let closePlayers = GlobalVars.getAllEntities({
        location: location,
        maxDistance: 7,
        type: "minecraft:player",
      });

      for (const player of closePlayers) {
        player.applyDamage(6, {
          cause: EntityDamageCause.entityExplosion,
        });
        world.sendMessage("Giving resistance to " + player.nameTag);
        player.addEffect("resistance", 1, {
          showParticles: false,
          amplifier: 4,
        });
      }
      //eventData.dimension.setBlockType(location, "minecraft:obsidian");
      eventData.dimension.createExplosion(location, 5, {
        breaksBlocks: true,
        source: tnt,
      });

      //give resitance so players take less tnt dmg
    });

    return;
  }

  eventData.setImpactedBlocks(
    eventData.getImpactedBlocks().filter((block) => {
      return !(block.typeId.includes("bed") || block.typeId.includes("glass"));
    })
  );

  firstBoom = true;
});

world.afterEvents.explosion.subscribe((eventData) => {
  //if (!firstBoom) return;
  system.run(() => {
    for (const block of explosionResitantGlassBlocks) {
      eventData.dimension.setBlockType(block[0], block[1]);
    }
    explosionResitantGlassBlocks = [];
  });
});
