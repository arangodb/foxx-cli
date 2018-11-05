/* global describe, it, beforeEach */
"use strict";

const path = require("path");
const foxx = require("./util");
const expect = require("chai").expect;
const os = require("os");
const fs = require("fs");
const rmDir = require("./fs").rmDir;

const tmpDir = path.resolve(os.tmpdir(), "test-init-service");

const checkFile = (file, content) => {
  expect(
    fs.readFileSync(path.resolve(tmpDir, file), "utf-8").replace(/\r/g, "")
  ).to.equal(content);
};

describe("Foxx service init", () => {
  describe("called with an non-existing directory", () => {
    beforeEach(async () => {
      if (fs.existsSync(tmpDir)) {
        try {
          rmDir(tmpDir);
        } catch (e) {
          // noop
        }
      }
    });

    it("should create the document", async () => {
      await foxx(`init ${tmpDir}`);
      expect(fs.existsSync(tmpDir)).to.equal(true);
    });
  });

  describe("called with an existing directory", () => {
    beforeEach(async () => {
      if (fs.existsSync(tmpDir)) {
        try {
          rmDir(tmpDir);
        } catch (e) {
          // noop
        }
        fs.mkdirSync(tmpDir);
      }
    });

    it("should create service files", async () => {
      await foxx(`init ${tmpDir}`);
      expect(fs.existsSync(tmpDir)).to.equal(true);
      const files = fs.readdirSync(tmpDir);
      expect(files).contain("manifest.json");
      expect(files).contain("index.js");
      expect(files).contain("README.md");
      expect(files).contain("api");
      expect(files).contain("scripts");
      expect(files).contain("test");

      checkFile("index.js", "'use strict';\n\n");
      checkFile(
        "README.md",
        "# test-init-service\n\n## License\n\nCopyright (c) 2018 <copyright holders>. All rights reserved.\n"
      );
      expect(fs.readdirSync(path.resolve(tmpDir, "api"))).to.be.empty;
      expect(fs.readdirSync(path.resolve(tmpDir, "scripts"))).to.be.empty;
      expect(fs.readdirSync(path.resolve(tmpDir, "test"))).to.be.empty;
      const manifest = JSON.parse(
        fs.readFileSync(path.resolve(tmpDir, "manifest.json"), "utf-8")
      );
      expect(manifest).to.have.property("$schema", "http://json.schemastore.org/foxx-manifest");
      expect(manifest).to.have.property("name", "test-init-service");
      expect(manifest).to.have.property("main", "index.js");
      expect(manifest).to.have.property("version", "0.0.0");
      expect(manifest).to.have.property("tests", "test/**/*.js");
      expect(manifest).to.have.property("engines");
      expect(manifest.engines).to.have.property("arangodb", "^3.0.0");
    });

    it("with example option should create an example service", async () => {
      await foxx(`init ${tmpDir} --example`);
      expect(fs.existsSync(tmpDir)).to.equal(true);
      const files = fs.readdirSync(tmpDir);
      expect(files).contain("manifest.json");
      expect(files).contain("index.js");
      expect(files).contain("README.md");
      expect(files).contain("api");
      expect(files).contain("scripts");
      expect(files).contain("test");

      checkFile(
        "index.js",
        "'use strict';\nconst createRouter = require('@arangodb/foxx/router');\n\nconst router = createRouter();\nmodule.context.use(router);\n\nrouter.get('/', (req, res) => {\n  res.write('Hello World!')\n})\n.response(['text/plain']);\n"
      );
      checkFile(
        "README.md",
        "# hello-world\n\nA simple Hello World Foxx service\n\n## License\n\nThe Apache-2.0 license. For more information, see the accompanying LICENSE file.\n"
      );
      expect(fs.readdirSync(path.resolve(tmpDir, "api"))).to.be.empty;
      expect(fs.readdirSync(path.resolve(tmpDir, "scripts"))).to.be.empty;
      expect(fs.readdirSync(path.resolve(tmpDir, "test"))).to.be.empty;
      const manifest = JSON.parse(
        fs.readFileSync(path.resolve(tmpDir, "manifest.json"), "utf-8")
      );
      expect(manifest).to.have.property("name", "hello-world");
      expect(manifest).to.have.property("main", "index.js");
      expect(manifest).to.have.property("version", "0.0.0");
      expect(manifest).to.have.property("tests", "test/**/*.js");
      expect(manifest).to.have.property("engines");
      expect(manifest.engines).to.have.property("arangodb", "^3.0.0");
      expect(manifest).to.have.property("author", "ArangoDB GmbH");
    });

    it("with example (alias) option should create an example service", async () => {
      await foxx(`init ${tmpDir} -e`);
      expect(fs.existsSync(tmpDir)).to.equal(true);
      const files = fs.readdirSync(tmpDir);
      expect(files).contain("manifest.json");
      expect(files).contain("index.js");
      expect(files).contain("README.md");
      expect(files).contain("api");
      expect(files).contain("scripts");
      expect(files).contain("test");

      checkFile(
        "index.js",
        "'use strict';\nconst createRouter = require('@arangodb/foxx/router');\n\nconst router = createRouter();\nmodule.context.use(router);\n\nrouter.get('/', (req, res) => {\n  res.write('Hello World!')\n})\n.response(['text/plain']);\n"
      );
      checkFile(
        "README.md",
        "# hello-world\n\nA simple Hello World Foxx service\n\n## License\n\nThe Apache-2.0 license. For more information, see the accompanying LICENSE file.\n"
      );
      expect(fs.readdirSync(path.resolve(tmpDir, "api"))).to.be.empty;
      expect(fs.readdirSync(path.resolve(tmpDir, "scripts"))).to.be.empty;
      expect(fs.readdirSync(path.resolve(tmpDir, "test"))).to.be.empty;
      const manifest = JSON.parse(
        fs.readFileSync(path.resolve(tmpDir, "manifest.json"), "utf-8")
      );
      expect(manifest).to.have.property("name", "hello-world");
      expect(manifest).to.have.property("main", "index.js");
      expect(manifest).to.have.property("version", "0.0.0");
      expect(manifest).to.have.property("tests", "test/**/*.js");
      expect(manifest).to.have.property("engines");
      expect(manifest.engines).to.have.property("arangodb", "^3.0.0");
      expect(manifest).to.have.property("author", "ArangoDB GmbH");
    });
  });
});
