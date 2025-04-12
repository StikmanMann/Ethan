import {
  world,
  Player,
  Dimension,
  Vector3,
  Entity,
  EntityQueryOptions,
  system,
} from "@minecraft/server";

export { GlobalVars };

class GlobalVars {
  /**
   * @type {Player[]}
   */
  static players: Player[] = [];

  /**
   * @type {Dimension}
   */
  static overworld: Dimension;

  static nether: Dimension;

  static theEnd: Dimension;

  static spawn: Vector3 = { x: 15, y: 300, z: 15 };

  static structureManager;

  static initialize() {
    system.run(() => {
      this.players = world.getAllPlayers();
      this.overworld = world.getDimension("overworld");
      this.nether = world.getDimension("nether");
      this.theEnd = world.getDimension("the_end");
      this.structureManager = world.structureManager;
    });
  }

  static getAllEntities(options?: EntityQueryOptions): Entity[] {
    let entities: Entity[] = [];
    system.run(() => {
      entities = options
        ? this.overworld
            .getEntities(options)
            .concat(this.nether.getEntities(options))
            .concat(this.theEnd.getEntities(options))
        : this.overworld
            .getEntities()
            .concat(this.nether.getEntities())
            .concat(this.theEnd.getEntities());
    });
    return entities;
  }

  static updatePlayers() {
    system.run(() => {
      this.players = world.getAllPlayers();
    });
  }
}

// Initialize on first tick
system.run(() => {
  GlobalVars.initialize();
});

world.afterEvents.playerSpawn.subscribe(() => {
  GlobalVars.updatePlayers();
});

world.afterEvents.playerLeave.subscribe(() => {
  GlobalVars.updatePlayers();
});
