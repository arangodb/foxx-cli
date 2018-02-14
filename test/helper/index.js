"use strict";

const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";

module.exports.crudCases = (db, serviceServiceMount) => {
  return [
    {
      name: "localJsFile",
      source: arangoPaths => arangoPaths.local.js
    },
    {
      name: "localZipFile",
      source: arangoPaths => arangoPaths.local.zip
    },
    // {
    //   name: "localDir",
    //   source: arangoPaths => arangoPaths.local.dir
    // }
    {
      name: "remoteJsFile",
      source: arangoPaths => `--remote ${arangoPaths.remote.js}`
    },
    {
      name: "remoteZipFile",
      source: arangoPaths => `--remote ${arangoPaths.remote.zip}`
    },
    {
      name: "remoteShortJsFile",
      source: arangoPaths => `-R ${arangoPaths.remote.js}`
    },
    {
      name: "remoteShortZipFile",
      source: arangoPaths => `-R ${arangoPaths.remote.zip}`
    },
    {
      name: "localJsURL",
      source: () => `${ARANGO_URL}/_db/${db.name}${serviceServiceMount}/js`
    },
    {
      name: "remoteJsURL",
      source: () =>
        `--remote ${ARANGO_URL}/_db/${db.name}${serviceServiceMount}/js`
    },
    {
      name: "remoteShortJsURL",
      source: () => `-R ${ARANGO_URL}/_db/${db.name}${serviceServiceMount}/js`
    },
    {
      name: "localZipURL",
      source: () => `${ARANGO_URL}/_db/${db.name}${serviceServiceMount}/zip`
    },
    {
      name: "remoteZipURL",
      source: () =>
        `--remote ${ARANGO_URL}/_db/${db.name}${serviceServiceMount}/zip`
    },
    {
      name: "remoteShortZipURL",
      source: () => `-R ${ARANGO_URL}/_db/${db.name}${serviceServiceMount}/zip`
    }
  ];
};
