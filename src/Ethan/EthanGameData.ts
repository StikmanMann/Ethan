import { Player } from "@minecraft/server";

interface IGameData {
  heroPlayer: Player;
}
let currentGameData: IGameData = {
  heroPlayer: null,
};

export default currentGameData;
