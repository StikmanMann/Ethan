import { GlobalVars } from "globalVars";
import currentGameData from "./EthanGameData";
const startGame = () => {
    let allPlayers = GlobalVars.players;
    currentGameData.heroPlayer =
        allPlayers[Math.floor(Math.random() * allPlayers.length)];
};
