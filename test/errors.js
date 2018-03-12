/* global describe, it, before, after */
"use strict";
const http = require("http");
const expect = require("chai").expect;
const foxx = require("./util");
const errors = require("../src/errors");

let HOST;
let ERROR;
const server = http.createServer((req, res) => {
  res.writeHead(500, {
    server: "Fake ArangoDB",
    "content-type": "application/json"
  });
  res.end(
    JSON.stringify({
      error: true,
      code: 500,
      errorNum: ERROR,
      errorMessage: "Something went wrong"
    })
  );
});

describe("Error handling", () => {
  before(done => {
    server.listen(e => {
      if (!e) HOST = `tcp://localhost:${server.address().port}`;
      done(e);
    });
  });
  after(done => {
    server.close(e => {
      done(e);
    });
  });
  describe("Foxx config", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`config -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx deps", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`deps -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx download", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`download -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx install", () => {
    it("correctly handles INVALID_MOUNTPOINT", async () => {
      ERROR = errors.ERROR_INVALID_MOUNTPOINT;
      try {
        await foxx(`install -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
    it("correctly handles SERVICE_MOUNTPOINT_CONFLICT", async () => {
      ERROR = errors.ERROR_SERVICE_MOUNTPOINT_CONFLICT;
      try {
        await foxx(`install -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
    it("correctly handles SERVICE_SOURCE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_SOURCE_NOT_FOUND;
      try {
        await foxx(`install -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/resolve/i);
        return;
      }
      expect.fail();
    });
    it("correctly handles SERVICE_SOURCE_ERROR", async () => {
      ERROR = errors.ERROR_SERVICE_SOURCE_ERROR;
      try {
        await foxx(`install -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/download/i);
        return;
      }
      expect.fail();
    });
    it("correctly handles SERVICE_MANIFEST_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_MANIFEST_NOT_FOUND;
      try {
        await foxx(`install -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/manifest/i);
        return;
      }
      expect.fail();
    });
    it("correctly handles MALFORMED_MANIFEST_FILE", async () => {
      ERROR = errors.ERROR_MALFORMED_MANIFEST_FILE;
      try {
        await foxx(`install -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/manifest/i);
        return;
      }
      expect.fail();
    });
    it("correctly handles INVALID_SERVICE_MANIFEST", async () => {
      ERROR = errors.ERROR_INVALID_SERVICE_MANIFEST;
      try {
        await foxx(`install -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/manifest/i);
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx replace", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`replace -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
    it("correctly handles SERVICE_SOURCE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_SOURCE_NOT_FOUND;
      try {
        await foxx(`replace -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/resolve/i);
        return;
      }
      expect.fail();
    });
    it("correctly handles SERVICE_SOURCE_ERROR", async () => {
      ERROR = errors.ERROR_SERVICE_SOURCE_ERROR;
      try {
        await foxx(`replace -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/download/i);
        return;
      }
      expect.fail();
    });
    it("correctly handles SERVICE_MANIFEST_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_MANIFEST_NOT_FOUND;
      try {
        await foxx(`replace -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/manifest/i);
        return;
      }
      expect.fail();
    });
    it("correctly handles MALFORMED_MANIFEST_FILE", async () => {
      ERROR = errors.ERROR_MALFORMED_MANIFEST_FILE;
      try {
        await foxx(`replace -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/manifest/i);
        return;
      }
      expect.fail();
    });
    it("correctly handles INVALID_SERVICE_MANIFEST", async () => {
      ERROR = errors.ERROR_INVALID_SERVICE_MANIFEST;
      try {
        await foxx(`replace -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/manifest/i);
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx run", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`run -H ${HOST} /myfoxx send-mail`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
    it("correctly handles SERVICE_NEEDS_CONFIGURATION", async () => {
      ERROR = errors.ERROR_SERVICE_NEEDS_CONFIGURATION;
      try {
        await foxx(`run -H ${HOST} /myfoxx send-mail`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        expect(stderr).to.match(/config/i);
        return;
      }
      expect.fail();
    });
    it("correctly handles SERVICE_UNKNOWN_SCRIPT", async () => {
      ERROR = errors.ERROR_SERVICE_UNKNOWN_SCRIPT;
      try {
        await foxx(`run -H ${HOST} /myfoxx send-mail`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("send-mail");
        return;
      }
      expect.fail();
    });
    it("correctly handles MODULE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_MODULE_NOT_FOUND;
      try {
        await foxx(`run -H ${HOST} /myfoxx send-mail`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/include/i);
        return;
      }
      expect.fail();
    });
    it("correctly handles MODULE_FAILURE", async () => {
      ERROR = errors.ERROR_MODULE_FAILURE;
      try {
        await foxx(`run -H ${HOST} /myfoxx send-mail`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx scripts", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`scripts -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx set-dev", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`set-dev -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx set-prod", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`set-prod -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx show", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`show -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx test", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`test -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
    it("correctly handles SERVICE_NEEDS_CONFIGURATION", async () => {
      ERROR = errors.ERROR_SERVICE_NEEDS_CONFIGURATION;
      try {
        await foxx(`test -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        expect(stderr).to.match(/config/i);
        return;
      }
      expect.fail();
    });
    it("correctly handles MODULE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_MODULE_NOT_FOUND;
      try {
        await foxx(`test -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/include/i);
        return;
      }
      expect.fail();
    });
    it("correctly handles MODULE_FAILURE", async () => {
      ERROR = errors.ERROR_MODULE_FAILURE;
      try {
        await foxx(`test -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/manifest/i);
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx upgrade", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`upgrade -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
    it("correctly handles SERVICE_SOURCE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_SOURCE_NOT_FOUND;
      try {
        await foxx(`upgrade -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/resolve/i);
        return;
      }
      expect.fail();
    });
    it("correctly handles SERVICE_SOURCE_ERROR", async () => {
      ERROR = errors.ERROR_SERVICE_SOURCE_ERROR;
      try {
        await foxx(`upgrade -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/download/i);
        return;
      }
      expect.fail();
    });
    it("correctly handles SERVICE_MANIFEST_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_MANIFEST_NOT_FOUND;
      try {
        await foxx(`upgrade -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/manifest/i);
        return;
      }
      expect.fail();
    });
    it("correctly handles MALFORMED_MANIFEST_FILE", async () => {
      ERROR = errors.ERROR_MALFORMED_MANIFEST_FILE;
      try {
        await foxx(`upgrade -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/manifest/i);
        return;
      }
      expect.fail();
    });
    it("correctly handles INVALID_SERVICE_MANIFEST", async () => {
      ERROR = errors.ERROR_INVALID_SERVICE_MANIFEST;
      try {
        await foxx(`upgrade -H ${HOST} -R /myfoxx /dev/null`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.match(/manifest/i);
        return;
      }
      expect.fail();
    });
  });
});
