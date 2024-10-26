import deepmerge from "@fastify/deepmerge";
import userConfig from "../phinda.toml";

const defaults = {};

export const config = deepmerge({ all: true })(defaults, userConfig);
