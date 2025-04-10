import { BlockVolume, BlockVolumeBase, world } from "@minecraft/server";
import { GlobalVars } from "globalVars";

import { octavePerlin, perlin2D } from "../NoiseGenerator/PerlinNoise";
import { TickFunctions } from "staticScripts/tickFunctions";
import { cellularNoise } from "../NoiseGenerator/CellNoise";

// Block Type Mapping
const getBlock = (num) => {
  if (num < 0.1) {
    return "wool";
  } else if (num < 0.2) {
    return "light_gray_wool";
  } else if (num < 0.3) {
    return "gray_wool";
  } else if (num < 0.4) {
    return "red_wool";
  } else if (num < 0.5) {
    return "green_wool";
  } else if (num < 0.6) {
    return "blue_wool";
  } else if (num < 0.7) {
    return "yellow_wool";
  } else if (num < 0.8) {
    return "cyan_wool";
  } else if (num < 0.9) {
    return "pink_wool";
  } else {
    return "oak_planks";
  }
};

// Generate Blocks Around Player
const generateAroundPlayer = (seed) => {
  for (const player of GlobalVars.players) {
    let posX = Math.floor(player.location.x);
    let posY = Math.floor(player.location.y);
    let posZ = Math.floor(player.location.z);

    for (let x = -64 + posX; x < 64 + posX; x++) {
      for (let z = -64 + posZ; z < 64 + posZ; z++) {
        // Check if (x, z) is inside a room or corridor

        // Assign block type
        let block;

        block = getBlock(octavePerlin(x / 10, z / 10, 0.5, 0.2)); // Random block for rooms

        // Set block in the world
        GlobalVars.overworld.setBlockType({ x, y: -60, z }, block);

        // Fill below the surface
        if (block === "light_gray_wool") {
          GlobalVars.overworld.fillBlocks(
            new BlockVolume({ x, y: -50, z }, { x, y: -59, z }),
            "oak_planks"
          );
        } else {
          GlobalVars.overworld.fillBlocks(
            new BlockVolume({ x, y: -50, z }, { x, y: -59, z }),
            "air"
          );
        }
      }
    }
  }
};
/* TickFunctions.addFunction(() => {
  generateAroundPlayer(20);
}, 20); *x*/
