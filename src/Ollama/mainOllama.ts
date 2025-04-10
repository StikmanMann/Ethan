import { Logger } from "staticScripts/Logger";
import ollama from "./lib/index";
import { post } from "./lib/utils";
import fetch from "node-fetch";

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
