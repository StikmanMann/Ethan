import {
  world,
  Player,
  Dimension,
  Vector3,
  Entity,
  EntityQueryOptions,
} from "@minecraft/server";
export { GlobalVars };
class GlobalVars {
  static players = world.getAllPlayers();

  /**
   * @type {Dimension}
   */
  static overworld = world.getDimension("overworld");

  static nether = world.getDimension("nether");

  static theEnd = world.getDimension("the_end");

  static getAllEntities(options?: EntityQueryOptions): Entity[] {
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

  static spawn = { x: 15, y: 300, z: 15 } as Vector3;
}

world.afterEvents.playerSpawn.subscribe((eventData) => {
  GlobalVars.getPlayers();
});

world.afterEvents.playerLeave.subscribe((eventData) => {
  GlobalVars.getPlayers();
});
