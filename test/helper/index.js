"use strict";

const path = require("path");

const basePath = path.resolve(".", "test", "fixtures");

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
      source: arangoPaths => arangoPaths.remote.js
    },
    {
      name: "remoteJsURL",
      source: arangoPaths => `--remote ${arangoPaths.remote.js}`
    },
    {
      name: "remoteShortJsURL",
      source: arangoPaths => `-R ${arangoPaths.remote.js}`
    },
    {
      name: "localZipURL",
      source: arangoPaths => arangoPaths.remote.zip
    },
    {
      name: "remoteZipURL",
      source: arangoPaths => `--remote ${arangoPaths.remote.zip}`
    },
    {
      name: "remoteShortZipURL",
      source: arangoPaths => `-R ${arangoPaths.remote.zip}`
    }
  ];
};
