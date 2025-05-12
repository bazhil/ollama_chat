import { Ollama } from "langchain/llms/ollama";

export const localOllama = new Ollama({
  baseUrl: "http://localhost:11434",
  model: "deepseek-r1",
});