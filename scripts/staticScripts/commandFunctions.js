import { system, world } from "@minecraft/server";
import { ActionFormData, } from "@minecraft/server-ui";
import { Logger } from "./Logger";
let commandValues = [];
addCommand({
    commandName: "test",
    chatFunction: (event) => {
        world.sendMessage(`${"event.message"}`);
    },
    directory: "standard",
    commandPrefix: "!!",
});
export function addCommand(commandValue) {
    if (!commandValue.directory.startsWith("/")) {
        commandValue.directory = "/".concat(commandValue.directory);
    }
    if (!commandValue.directory.endsWith("/")) {
        commandValue.directory = commandValue.directory.concat("/");
    }
    commandValues.push(commandValue);
}
world.beforeEvents.chatSend.subscribe((event) => {
    const sender = event.sender;
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
                }
                else if (cmd.permissions.some((tag) => sender.hasTag(tag)) ||
                    sender.isOp()) {
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
let commandHUDIndex = [];
const generateForm = async (parentPath, player) => {
    commandHUDIndex.length = 0; // Clear the array
    const form = new ActionFormData();
    form.title(parentPath === "/" ? "Main Menu" : parentPath.slice(0, -1));
    form.body("Select a command or a submenu");
    // Find all unique subfolders and commands at this level
    const folders = new Set();
    const commands = [];
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
            }
            else {
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
async function commandHud(player, chatSendEvent, parentPath = "/") {
    system.run(async () => {
        const form = await generateForm(parentPath, player);
        Logger.warn("Generated form");
        showHUD(player, form).then((response) => {
            const selected = commandHUDIndex[response.selection];
            if (selected.type === "folder") {
                // Navigate into the folder
                commandHud(player, chatSendEvent, selected.value);
            }
            else if (selected.type === "command") {
                // Execute the command
                const cmd = commandValues[selected.value];
                if (cmd.permissions &&
                    !cmd.permissions.some((tag) => player.hasTag(tag)) &&
                    !player.isOp()) {
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
export async function showHUD(player, form, attempts = 10) {
    return new Promise(async (resolve) => {
        let response;
        let attempt = 0;
        // Define a function to handle the form response
        const handleResponse = (result) => {
            response = result;
            // Check if the form was canceled or if the maximum attempts are reached
            if (response.cancelationReason === "UserBusy" && attempt <= attempts) {
                // Show the form again
                form.show(player).then(handleResponse);
            }
            else {
                // Resolve the promise with the final response
                resolve(response);
            }
        };
        // Show the initial form
        form.show(player).then(handleResponse);
    });
}
