import { world, } from "@minecraft/server";
export { GlobalVars };
class GlobalVars {
    static getAllEntities(options) {
        const entities = options
            ? GlobalVars.overworld
                .getEntities(options)
                .concat(GlobalVars.nether.getEntities(options))
                .concat(GlobalVars.theEnd.getEntities(options))
            : GlobalVars.overworld
                .getEntities()
                .concat(GlobalVars.nether.getEntities())
                .concat(GlobalVars.theEnd.getEntities());
        return entities;
    }
    static getPlayers() {
        this.players = world.getAllPlayers();
    }
}
GlobalVars.players = world.getAllPlayers();
/**
 * @type {Dimension}
 */
GlobalVars.overworld = world.getDimension("overworld");
GlobalVars.nether = world.getDimension("nether");
GlobalVars.theEnd = world.getDimension("the_end");
GlobalVars.spawn = { x: 15, y: 300, z: 15 };
world.afterEvents.playerSpawn.subscribe((eventData) => {
    GlobalVars.getPlayers();
});
world.afterEvents.playerLeave.subscribe((eventData) => {
    GlobalVars.getPlayers();
});
