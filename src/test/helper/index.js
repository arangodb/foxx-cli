"use strict";

const path = require("path");

const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";
const ARANGO_URL_SELF_REACHABLE =
  process.env.TEST_ARANGODB_URL_SELF_REACHABLE || ARANGO_URL;

const basePath = path.resolve(__dirname, "..", "..", "..", "fixtures");

module.exports.crudCases = () => {
  return [
    {
      name: "localJsFile",
      source: () => path.resolve(basePath, "minimal-working-service.js")
    },
    {
      name: "localZipFile",
      source: () => path.resolve(basePath, "minimal-working-service.zip")
    },
    {
      name: "localDir",
      source: () => path.resolve(basePath, "minimal-working-service")
    },
    {
      name: "remoteJsFile",
      source: arangoPaths => `--remote ${arangoPaths.local.js}`
    },
    {
      name: "remoteZipFile",
      source: arangoPaths => `--remote ${arangoPaths.local.zip}`
    },
    {
      name: "remoteDir",
      source: arangoPaths => `--remote ${arangoPaths.local.dir}`
    },
    {
      name: "remoteShortJsFile",
      source: arangoPaths => `-R ${arangoPaths.local.js}`
    },
    {
      name: "remoteShortZipFile",
      source: arangoPaths => `-R ${arangoPaths.local.zip}`
    },
    {
      name: "remoteShortDir",
      source: arangoPaths => `-R ${arangoPaths.local.dir}`
    },
    {
      name: "localJsURL",
      source: arangoPaths =>
        arangoPaths.remote.js.replace(ARANGO_URL, ARANGO_URL_SELF_REACHABLE)
    },
    {
      name: "remoteJsURL",
      source: arangoPaths =>
        `--remote ${arangoPaths.remote.js.replace(
          ARANGO_URL,
          ARANGO_URL_SELF_REACHABLE
        )}`
    },
    {
      name: "remoteShortJsURL",
      source: arangoPaths =>
        `-R ${arangoPaths.remote.js.replace(
          ARANGO_URL,
          ARANGO_URL_SELF_REACHABLE
        )}`
    },
    {
      name: "localZipURL",
      source: arangoPaths =>
        arangoPaths.remote.zip.replace(ARANGO_URL, ARANGO_URL_SELF_REACHABLE)
    },
    {
      name: "remoteZipURL",
      source: arangoPaths =>
        `--remote ${arangoPaths.remote.zip.replace(
          ARANGO_URL,
          ARANGO_URL_SELF_REACHABLE
        )}`
    },
    {
      name: "remoteShortZipURL",
      source: arangoPaths =>
        `-R ${arangoPaths.remote.zip.replace(
          ARANGO_URL,
          ARANGO_URL_SELF_REACHABLE
        )}`
    }
  ];
};
