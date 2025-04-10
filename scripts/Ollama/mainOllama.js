import { Logger } from "staticScripts/Logger";
import ollama from "./lib/index";
const asyncOllama = async () => {
    Logger.warn("AHHHH");
    const output = await ollama.generate({
        model: "phi3",
        prompt: "why is the sky blue",
        stream: false,
    });
    // const output = "Hello yes i am ai";
    Logger.warn(output.response);
};
asyncOllama();
