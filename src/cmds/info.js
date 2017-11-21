"use strict";
const { bold, gray, white } = require("chalk");
const { common } = require("../util/cli");
const client = require("../util/client");
const resolveMount = require("../resolveMount");
const { error, fatal } = require("../util/log");
const { group, inline: il } = require("../util/text");
const { ERROR_SERVICE_NOT_FOUND } = require("../errors");

const command = (exports.command = "info [mount-path]");
exports.description = "Show mounted service information";
const aliases = (exports.aliases = ["show", "list", "ls"]);

const describe = il`
  Shows detailed information about the service installed at the
  given ${bold("mount-path")}.

  If ${bold("mount-path")} is a server name or omitted,
  an overview of all installed services will be printed instead.
`;

const args = [["mount-path", "Database-relative path of the service"]];

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
    const server = await resolveMount(argv.mountPath);
    if (!server.url) {
      fatal(il`
        Not a valid server: "${white(server.name)}".
        Make sure the mount path always starts with a leading slash.
      `);
    }
    const db = client(server);
    if (!server.mount) {
      return await listServices(db, argv.raw);
    }
    return await showService(db, server.mount, argv.raw);
  } catch (e) {
    fatal(e);
  }
};

async function showService(db, mount, raw) {
  try {
    const services = await db.getService(mount);
    console.log(JSON.stringify(services, null, 2));
    // TODO formatted output when raw != true
  } catch (e) {
    if (e.isArangoError && e.errorNum === ERROR_SERVICE_NOT_FOUND) {
      error(`No service found at "${white(mount)}".`);
      process.exit(1);
    }
    throw e;
  }
}

async function listServices(db, raw) {
  const services = await db.listServices();
  if (raw) {
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
}

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
