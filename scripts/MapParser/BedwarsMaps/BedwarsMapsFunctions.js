import { ItemStack, world } from "@minecraft/server";
import { bedwarsBlockBreak, bedwarsBlockBreakAfter, bedwarsPlayerPlace, } from "Bedwars/BedwarsBlockBreak";
import { bedwarsSpawn } from "Bedwars/BedwarsSpawn";
import { drawBedwarsActionbar } from "Bedwars/BedwarsVisuals";
import { GeneratorLevels } from "Bedwars/Generators/GeneratorLevels";
import { BedwarsTeam } from "Bedwars/Teams/TeamColor";
import { LinkedList } from "dataTypes/linkedList";
import { GlobalVars } from "globalVars";
import { TickFunctions } from "staticScripts/tickFunctions";
import { VectorFunctions } from "staticScripts/vectorFunctions";
export const bedwarsStart = async (mapData, offset) => {
    let players = mapData.players;
    const bedwarsData = mapData.gameModeData;
    if (!bedwarsData.currentTick) {
        bedwarsData.currentTick = 0;
    }
    //Check if they got initialized correctly IDK HOW TO FIX THIS
    try {
        bedwarsData.lapisGeneratorLevel().itemSpawnRate.get("lapis_lazuli");
    }
    catch {
        world.sendMessage("No lapis generator level found!");
        bedwarsData.lapisGeneratorLevel = GeneratorLevels.level1lapis;
    }
    try {
        bedwarsData.diamondGeneratorLevel().itemSpawnRate.get("diamond");
    }
    catch {
        world.sendMessage("No diamond generator level found!");
        bedwarsData.diamondGeneratorLevel = GeneratorLevels.level1diamond;
    }
    bedwarsData.queuedLapisGenerators = new Array(bedwarsData.lapisGenerators.length).fill(new LinkedList());
    bedwarsData.queuedDiamondsGenerators = new Array(bedwarsData.diamondGenerators.length).fill(new LinkedList());
    // Adjust generator locations
    for (let i = 0; i < bedwarsData.lapisGenerators.length; i++) {
        bedwarsData.lapisGenerators[i] = VectorFunctions.subtractVector(VectorFunctions.addVector(bedwarsData.lapisGenerators[i], offset), mapData.startLocation);
    }
    for (let i = 0; i < bedwarsData.diamondGenerators.length; i++) {
        bedwarsData.diamondGenerators[i] = VectorFunctions.subtractVector(VectorFunctions.addVector(bedwarsData.diamondGenerators[i], offset), mapData.startLocation);
    }
    let currentPlayerIndex = 0;
    for (const team of bedwarsData.teams) {
        //Add generator
        team.generator = VectorFunctions.subtractVector(VectorFunctions.addVector(team.generator, offset), mapData.startLocation);
        // Add offset to spawn points
        for (let i = 0; i < team.spawnPoints.length; i++) {
            team.spawnPoints[i] = VectorFunctions.subtractVector(VectorFunctions.addVector(team.spawnPoints[i], offset), mapData.startLocation);
        }
        //Add offset to bed location
        team.bedLocation = VectorFunctions.subtractVector(VectorFunctions.addVector(team.bedLocation, offset), mapData.startLocation);
        team.status.bedDestroyed = false;
        for (let i = 0; i < team.playerAmount; i++) {
            if (currentPlayerIndex >= players.length) {
                break;
            }
            const player = players[currentPlayerIndex];
            currentPlayerIndex++;
            team.players.push(player);
            player.teleport(team.spawnPoints[i % team.spawnPoints.length]);
            BedwarsTeam.setPlayerColor(player, team.teamColor);
            player.setAxeLevel(0);
            player.setPickaxeLevel(0);
            player.setArmorLevel(0);
            player.setShearsStauts(0);
            player.givePlayerKit();
        }
        //If no players are in the team, remove the bed
        if (team.players.length === 0) {
            team.status.bedDestroyed = true;
        }
    }
    bedwarsData.playerPlacedBlockLocations = new Set();
    const playerPlaceFunction = bedwarsPlayerPlace(bedwarsData);
    world.beforeEvents.playerPlaceBlock.subscribe((eventData) => {
        playerPlaceFunction(eventData);
    });
    const boundFunction = bedwarsBlockBreak(mapData);
    world.beforeEvents.playerBreakBlock.subscribe((eventData) => {
        boundFunction(eventData);
    });
    //We need no tick function for bedwars
    if (bedwarsData.ticksPerSecond > 20) {
        world.sendMessage("Ticks per second is greater than 20, does not work!\n Defaulting to 20");
        bedwarsData.ticksPerSecond = 20;
    }
    mapData.tickFunctionId = TickFunctions.addFunction(bedwarsTick(mapData), Math.floor(20 / bedwarsData.ticksPerSecond));
    const boundBlockBreakAfter = bedwarsData.bedwarsBlockBreakAfter(mapData);
    world.afterEvents.playerBreakBlock.subscribe(boundBlockBreakAfter);
    //bridgeNextRound(mapData, "Round start!");
};
export const bedwarsUnload = async (mapData) => { };
const bedwarsTick = (mapData) => () => {
    let bedwarsData = mapData.gameModeData;
    bedwarsData.currentTick++;
    drawBedwarsActionbar(mapData);
    //world.sendMessage(`Current tick: ${bedwarsData.currentTick}`);
    //Map generators
    const lapisLevel = bedwarsData.lapisGeneratorLevel();
    for (const itemName of lapisLevel.itemNames) {
        //world.sendMessage(`${itemName} `);
        //const type = Object.prototype.toString.call(lapisLevel.itemSpawnRate);
        //world.sendMessage(`${type}`);
        //world.sendMessage(JSON.stringify((lapisLevel.itemSpawnRate.keys)))
        if (bedwarsData.currentTick % lapisLevel.itemSpawnRate.get(itemName) === 0) {
            for (let i = 0; i < bedwarsData.lapisGenerators.length; i++) {
                let lapisGenerator = bedwarsData.lapisGenerators[i];
                try {
                    GlobalVars.overworld.spawnItem(new ItemStack(itemName), lapisGenerator);
                }
                catch (error) {
                    bedwarsData.queuedLapisGenerators[i].append(itemName);
                    //world.sendMessage(`Lapis generator at ${lapisGenerator.x}, ${lapisGenerator.y}, ${lapisGenerator.z} added queued lapis! Now: ${bedwarsData.queuedLapisGenerators[i]}`);
                }
                //world.sendMessage(`Lapis generator at ${lapisGenerator.x}, ${lapisGenerator.y}, ${lapisGenerator.z} spawned lapis!`);
            }
        }
    }
    const diamondLevel = bedwarsData.diamondGeneratorLevel();
    for (const itemName of diamondLevel.itemNames) {
        if (bedwarsData.currentTick % diamondLevel.itemSpawnRate.get(itemName) === 0) {
            for (let i = 0; i < bedwarsData.diamondGenerators.length; i++) {
                try {
                    let diamondGenerator = bedwarsData.diamondGenerators[i];
                    GlobalVars.overworld.spawnItem(new ItemStack(itemName), diamondGenerator);
                }
                catch (error) {
                    bedwarsData.queuedDiamondsGenerators[i].append(itemName);
                }
            }
        }
    }
    //Queued generators
    for (let i = 0; i < bedwarsData.queuedLapisGenerators.length; i++) {
        //These both should be the same length
        let queuedLapis = bedwarsData.queuedLapisGenerators[i];
        if (queuedLapis.size === 0) {
            continue;
        }
        let lapisGenerator = bedwarsData.lapisGenerators[i];
        try {
            queuedLapis.forEach(itemName => {
                GlobalVars.overworld.spawnItem(new ItemStack(itemName), lapisGenerator);
            });
            bedwarsData.queuedLapisGenerators[i].clear();
        }
        catch { }
    }
    for (let i = 0; i < bedwarsData.queuedDiamondsGenerators.length; i++) {
        let queuedDiamonds = bedwarsData.queuedDiamondsGenerators[i];
        if (queuedDiamonds.size == 0) {
            continue;
        }
        let diamondGenerator = bedwarsData.diamondGenerators[i];
        try {
            queuedDiamonds.forEach(itemName => {
                GlobalVars.overworld.spawnItem(new ItemStack(itemName), diamondGenerator);
            });
            bedwarsData.queuedDiamondsGenerators[i].clear();
        }
        catch { }
    }
    //Team generators
    for (const team of bedwarsData.teams) {
        let generatorLevel = team.generatorLevels[team.generatorLevel];
        for (const itemName of generatorLevel().itemNames) {
            if (bedwarsData.currentTick % generatorLevel().itemSpawnRate.get(itemName) === 0) {
                try {
                    GlobalVars.overworld.spawnItem(new ItemStack(itemName), team.generator);
                }
                catch {
                }
            }
        }
        ;
    }
};
export const largeMap = {
    name: "largeMap",
    description: "largeMap",
    gameMode: 1,
    minimumPlayerAmount: 1,
    players: [],
    startLocation: { x: -100, y: 270, z: -100 },
    endLocation: { x: 100, y: 319, z: 100 },
    entities: [],
    structureId: "mystructure:large_map",
    playerSpawnFunction: bedwarsSpawn,
    tickFunctionId: -1,
    mapId: -1,
    structures: [],
    gameModeData: {
        bedwarsBlockBreakAfter: bedwarsBlockBreakAfter,
        ticksPerSecond: 5,
        lapisGenerators: [{
                x: 40,
                y: 280,
                z: 40
            }, {
                x: -40,
                y: 284,
                z: 40
            },
            {
                x: 40,
                y: 284,
                z: -40
            },
            {
                x: -40,
                y: 280,
                z: -40
            }
        ],
        lapisGeneratorLevel: GeneratorLevels.level1lapis,
        diamondGenerators: [{
                x: 12,
                y: 280,
                z: 12
            }, {
                x: -12,
                y: 284,
                z: 12
            },
            {
                x: 12,
                y: 284,
                z: -12
            },
            {
                x: -12,
                y: 280,
                z: -12
            }
        ],
        diamondGeneratorLevel: GeneratorLevels.level1diamond,
        playerPlacedBlockLocations: new Set(),
        teams: [
            {
                stats: {},
                status: {},
                generatorLevel: 0,
                generatorLevels: [GeneratorLevels.level1team],
                playerAmount: 1,
                players: [],
                spawnPoints: [{ x: 40, y: 272, z: 85 }],
                bedLocation: { x: 40, y: 272, z: 78 },
                teamName: "§5Purple",
                teamColor: "purple",
                generator: { x: 40, y: 274, z: 91 },
            },
            {
                stats: {},
                status: {},
                generatorLevel: 0,
                generatorLevels: [GeneratorLevels.level1team],
                playerAmount: 1,
                players: [],
                spawnPoints: [{ x: 85, y: 272, z: 40 }],
                bedLocation: { x: 78, y: 272, z: 40 },
                teamName: "§dPink",
                teamColor: "pink",
                generator: { x: 91, y: 274, z: 40 },
            },
            {
                stats: {},
                status: {},
                generatorLevel: 0,
                generatorLevels: [GeneratorLevels.level1team],
                playerAmount: 1,
                players: [],
                spawnPoints: [{ x: 85, y: 276, z: -40 }],
                bedLocation: { x: 78, y: 276, z: -40 },
                teamName: "§eYellow",
                teamColor: "yellow",
                generator: { x: 91, y: 278, z: -40 },
            },
            {
                stats: {},
                status: {},
                generatorLevel: 0,
                generatorLevels: [GeneratorLevels.level1team],
                playerAmount: 1,
                players: [],
                spawnPoints: [{ x: 40, y: 276, z: -85 }],
                bedLocation: { x: 40, y: 276, z: -78 },
                teamName: "§2Green",
                teamColor: "green",
                generator: { x: 40, y: 278, z: -91 },
            },
            {
                stats: {},
                status: {},
                generatorLevel: 0,
                generatorLevels: [GeneratorLevels.level1team],
                playerAmount: 1,
                players: [],
                spawnPoints: [{ x: -40, y: 272, z: -85 }],
                bedLocation: { x: -40, y: 272, z: -78 },
                teamName: "§4Red",
                teamColor: "red",
                generator: { x: -40, y: 274, z: -91 },
            },
            {
                stats: {},
                status: {},
                generatorLevel: 0,
                generatorLevels: [GeneratorLevels.level1team],
                playerAmount: 1,
                players: [],
                spawnPoints: [{ x: -85, y: 272, z: -40 }],
                bedLocation: { x: -78, y: 272, z: -40 },
                teamName: "§bBlue",
                teamColor: "blue",
                generator: { x: -91, y: 274, z: -40 },
            },
            {
                stats: {},
                status: {},
                generatorLevel: 0,
                generatorLevels: [GeneratorLevels.level1team],
                playerAmount: 1,
                players: [],
                spawnPoints: [{ x: -85, y: 276, z: 40 }],
                bedLocation: { x: -78, y: 276, z: 40 },
                teamName: "§fWhite",
                teamColor: "white",
                generator: { x: -91, y: 278, z: 40 },
            },
            {
                stats: {},
                status: {},
                generatorLevel: 0,
                generatorLevels: [GeneratorLevels.level1team],
                playerAmount: 1,
                players: [],
                spawnPoints: [{ x: -40, y: 276, z: 85 }],
                bedLocation: { x: -40, y: 276, z: 78 },
                teamName: "§0Black",
                teamColor: "black",
                generator: { x: -40, y: 278, z: 91 },
            }
        ],
    },
};
