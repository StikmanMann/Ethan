import { EGameMode, IMapData } from "MapParser/loadMap";
import { BedwarsTeam } from "./Teams/TeamColor";

export const drawBedwarsActionbar = (data: IMapData<EGameMode.BEDWARS>) => {
    let actionbarString = ""
    for (const team of data.gameModeData.teams) {
        actionbarString += `${BedwarsTeam.teamColorNames.get(team.teamColor)} §l${team.status.bedDestroyed ? team.players.length == 0 ? "X" : team.players.length : ":)"
            } `
    }
    actionbarString = actionbarString.trim();
    for (const player of data.players) {

        player.onScreenDisplay.setActionBar(actionbarString);
    }
}