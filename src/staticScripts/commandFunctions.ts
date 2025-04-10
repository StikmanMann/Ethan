import { ChatSendBeforeEvent, Player, system, world } from "@minecraft/server";
import {
  ActionFormData,
  ActionFormResponse,
  ModalFormData,
  ModalFormResponse,
} from "@minecraft/server-ui";
import { Logger } from "./Logger";
import { AwaitFunctions } from "./awaitFunctions";
import { playerJoin } from "scoreboard";

export interface CommandValues {
  /**
   * The prefix of the command
   * @example ;;
   */
  commandPrefix: string;

  /**
   * The name of the command
   * @example killPLayers
   */
  commandName: string;

  /**
   * This does not matter if the player has OP
   *
   * Tag needed to acces this command
   * @example ["builder", "admin"]
   */
  permissions?: string[];

  /**
   * This is for the HUD
   * @example "coolCmds/reallyCoolCmds"
   *
   * */
  directory: string;

  /**
   *
   */
  chatFunction: (chatSendEvent?: ChatSendBeforeEvent) => void;
}

let commandValues: CommandValues[] = [];

addCommand({
  commandName: "test",
  chatFunction: (event) => {
    world.sendMessage(`${"event.message"}`);
  },
  directory: "standard",
  commandPrefix: "!!",
});

export function addCommand(commandValue: CommandValues) {
  if (!commandValue.directory.startsWith("/")) {
    commandValue.directory = "/".concat(commandValue.directory);
  }
  if (!commandValue.directory.endsWith("/")) {
    commandValue.directory = commandValue.directory.concat("/");
  }

  commandValues.push(commandValue);
}

world.beforeEvents.chatSend.subscribe((event) => {
  const sender = event.sender as Player;
  if (event.message.startsWith(";;help")) {
    for (const cmd of commandValues) {
      sender.sendMessage(cmd.commandPrefix + cmd.commandName);
    }
    return;
  }

  // Iterate through registered commands
  for (const cmd of commandValues) {
    const commandString = `${cmd.commandPrefix}${cmd.commandName}`;

    // Check if the message starts with the command string
    if (!event.message.startsWith(commandString)) {
      // Check player tags
      if (commandString.startsWith(event.message)) {
        if (!cmd.permissions) {
          event.sender.sendMessage(`Did you mean: §3${commandString}`);
        } else if (
          cmd.permissions.some((tag) => sender.hasTag(tag)) ||
          sender.isOp()
        ) {
          event.sender.sendMessage(`Did you mean: §3${commandString}`);
        }
      }
      continue;
    }
    if (!cmd.permissions) {
      system.run(async () => {
        cmd.chatFunction(event);
      });
      break;
    }

    if (cmd.permissions.some((tag) => sender.hasTag(tag)) || sender.isOp()) {
      // Execute the command function
      system.run(async () => {
        cmd.chatFunction(event);
      });
      break;
    }

    event.cancel = true;
    sender.sendMessage("You don't have the required tags to use this command.");
  }
});

let commandHUDIndex: Array<{
  type: "folder" | "command";
  value: string | number;
}> = [];

const generateForm = async (
  parentPath: string,
  player: Player
): Promise<ActionFormData> => {
  commandHUDIndex.length = 0; // Clear the array
  const form = new ActionFormData();
  form.title(parentPath === "/" ? "Main Menu" : parentPath.slice(0, -1));
  form.body("Select a command or a submenu");

  // Find all unique subfolders and commands at this level
  const folders = new Set<string>();
  const commands: CommandValues[] = [];

  for (const cmd of commandValues) {
    // Normalize paths for comparison
    const tempCmdPath = cmd.directory.startsWith("/")
      ? cmd.directory
      : `/${cmd.directory}`;
    const cmdPath = tempCmdPath.endsWith("/") ? tempCmdPath : `${tempCmdPath}/`;

    if (cmdPath.startsWith(parentPath)) {
      const remainingPath = cmdPath.slice(parentPath.length);
      const nextSegment = remainingPath.split("/")[0];

      if (remainingPath.includes("/")) {
        // This is a subfolder
        if (nextSegment) {
          folders.add(nextSegment);
        }
      } else {
        // This is a command in the current directory
        commands.push(cmd);
      }
    }
  }

  // Add folder buttons first
  folders.forEach((folder) => {
    form.button(`[] ${folder}`);
    commandHUDIndex.push({ type: "folder", value: `${parentPath}${folder}/` });
  });

  // Then add command buttons
  commands.forEach((cmd, index) => {
    form.button(`=> ${cmd.commandName}`);
    commandHUDIndex.push({
      type: "command",
      value: commandValues.indexOf(cmd),
    });
  });

  return form;
};

async function commandHud(
  player: Player,
  chatSendEvent: ChatSendBeforeEvent,
  parentPath: string = "/"
) {
  system.run(async () => {
    const form = await generateForm(parentPath, player);
    Logger.warn("Generated form");

    showHUD(player, form).then((response) => {
      const selected = commandHUDIndex[response.selection];

      if (selected.type === "folder") {
        // Navigate into the folder
        commandHud(player, chatSendEvent, selected.value as string);
      } else if (selected.type === "command") {
        // Execute the command
        const cmd = commandValues[selected.value as number];
        if (
          cmd.permissions &&
          !cmd.permissions.some((tag) => player.hasTag(tag)) &&
          !player.isOp()
        ) {
          player.sendMessage("§cYou don't have permission for this command!");
          return;
        }
        cmd.chatFunction(chatSendEvent);
      }
    });
  });
}
addCommand({
  commandName: "commands",
  chatFunction: (event) => {
    commandHud(event.sender, event);
  },
  directory: "standard",
  commandPrefix: ";;",
});

type FormData = ActionFormData | ModalFormData;

type ResponseType<T> = T extends ActionFormData
  ? ActionFormResponse
  : ModalFormResponse;

export async function showHUD<T extends FormData>(
  player: Player,
  form: T,
  attempts: number = 10
): Promise<ResponseType<T>> {
  return new Promise(async (resolve) => {
    let response: ActionFormResponse;
    let attempt = 0;

    // Define a function to handle the form response
    const handleResponse = (result: ActionFormResponse) => {
      response = result;

      // Check if the form was canceled or if the maximum attempts are reached
      if (response.cancelationReason === "UserBusy" && attempt <= attempts) {
        // Show the form again
        form.show(player).then(handleResponse);
      } else {
        // Resolve the promise with the final response
        resolve(response);
      }
    };

    // Show the initial form
    form.show(player).then(handleResponse);
  });
}
