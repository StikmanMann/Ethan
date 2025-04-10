import { Player } from "@minecraft/server";
import { standardKit } from "./Kits/StandardKit";

export interface Kit {
  name: string;
  giveKitFunction: (player: Player) => void;
}

export const givePlayerKit = (player: Player): void => {
  standardKit.giveKitFunction(player);
};
