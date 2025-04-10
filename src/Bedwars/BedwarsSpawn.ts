import { GameMode, Player } from "@minecraft/server";
import { IMapData } from "MapParser/loadMap";
import { IBedwarsData } from "./BedwarsMain";

export const bedwarsSpawn = (mapData: IMapData) => (player: Player) => {
  player.setGameMode(GameMode.spectator);
  const bedwarsData = mapData.gameModeData as IBedwarsData;
  player.setGameMode(GameMode.survival);
  for (const team of bedwarsData.teams) {
    if (team.players.includes(player)) {
      player.teleport(
        team.spawnPoints[Math.floor(Math.random() * team.spawnPoints.length)]
      );
      player.addEffect("regeneration", 200);
      player.addEffect("instant_health", 20);
      player.addEffect("saturation", 2000, { showParticles: false });
      player.givePlayerKit();
    }
  }
};

export const bedwarsBedlessSpawn = (mapData: IMapData) => (player: Player) => {


  player.awardLoss();
  player.sendToHub();
}
