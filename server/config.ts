import deepmerge from "@fastify/deepmerge";
import userConfig from "../phinda.toml";
import defaults from "./defaults.toml";

export const config = deepmerge({ all: true })(defaults, userConfig);
