"use strict";
const dd = require("dedent");
const { white, bold } = require("chalk");
const { fatal } = require("./util/log");
const { load: loadIni } = require("./ini");
const parseServerUrl = require("./parseServerUrl");

function applyDefaults(server) {
  const defaultToken = process.env.FOXX_ARANGODB_SERVER_TOKEN;
  if (server.url === undefined) {
    server.url =
      process.env.FOXX_ARANGODB_SERVER_URL ||
      "http://localhost:8529/_db/_system";
  }
  if (server.version === undefined) {
    server.version = process.env.FOXX_ARANGODB_SERVER_VERSION;
  }
  if (server.token === undefined) {
    if (
      server.username === undefined &&
      server.password === undefined &&
      defaultToken
    ) {
      server.token = defaultToken;
    } else {
      if (server.username === undefined) {
        server.username = process.env.FOXX_ARANGODB_SERVER_USERNAME || "root";
      }
      if (server.password === undefined) {
        server.password = process.env.FOXX_ARANGODB_SERVER_PASSWORD || "";
      }
    }
  }
  if (server.mount && server.mount.charAt(0) !== "/") {
    server.mount = `/${server.mount}`;
  }
  return server;
}

async function resolve(mount) {
  if (!mount) return applyDefaults({});
  if (mount.match(/^(https?|tcp|ssl):\/\//)) {
    const server = parseServerUrl(mount);
    return applyDefaults(server);
  }
  let name = "default";
  if (mount && !mount.startsWith("/")) {
    let [head, ...tail] = mount.split(":");
    name = head;
    mount = tail.join(":");
  }
  const ini = await loadIni();
  if (hasOwnProperty.call(ini.server, name)) {
    return applyDefaults({ ...ini.server[name], name, mount });
  }
  if (name !== "default") {
    return { name, mount };
  }
  return applyDefaults({ name, mount });
}

module.exports = async function resolveServer(path = "", requireMount = true) {
  const server = await resolve(path);
  if (!server.mount && requireMount) {
    let extra;
    if (!server.name) {
      extra = dd`
        When passing URLs make sure to include the mount path using the following format:
          ${bold(
            "http://server.example/database-path#mount=/service-mount-path"
          )}
      `;
    } else if (server.name === path && !server.url) {
      extra = dd`
        When passing a bare mount path make sure that it starts with a slash:
          ${bold(`/${path}`)}
      `;
    } else if (server.name === path || server.name !== "default") {
      extra = dd`
        When using a named server make sure to pass the mount path using the following format:
          ${bold("server-name:service-mount-path")}
      `;
    }
    fatal(
      `Not a valid mount path: "${white(path)}".${extra ? `\n\n${extra}` : ""}`
    );
  }
  if (!server.url) {
    console.log(server.mount);
    fatal(`Not a valid server: "${white(server.name || path)}".`);
  }
  return server;
};
