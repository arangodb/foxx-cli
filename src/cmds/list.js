"use strict";
const { bold, gray } = require("chalk");
const { common } = require("../util/cli");
const client = require("../util/client");
const resolveServer = require("../resolveServer");
const { fatal } = require("../util/log");
const { group } = require("../util/text");

const command = (exports.command = "list [path]");
exports.description = "List mounted services";
const aliases = (exports.aliases = ["ls"]);

const describe = "Shows an overview of all installed services.";

const args = [["path", "Database-relative path of the service"]];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args }).options({
    raw: {
      describe: "Output raw JSON responses",
      type: "boolean",
      default: false
    }
  });

exports.handler = async function handler(argv) {
  try {
    const server = await resolveServer(argv.path, false);
    const db = client(server);
    const services = await db.listServices();
    if (argv.raw) {
      console.log(JSON.stringify(services, null, 2));
      process.exit(0);
    }
    console.log(
      group(
        ...services.map(service => [
          service.development ? bold(service.mount) : service.mount,
          prettyVersion(service)
        ])
      )
    );
  } catch (e) {
    fatal(e);
  }
};

function prettyVersion(service) {
  let parts = [];
  if (service.name && service.version) {
    parts.push(`${service.name}@${service.version}`);
  } else {
    if (service.name) parts.push(service.name);
    if (service.version) parts.push(service.version);
  }
  if (service.legacy) parts.push(gray("(legacy)"));
  if (service.development) parts.push(bold("[DEV]"));
  return parts.join(" ");
}
