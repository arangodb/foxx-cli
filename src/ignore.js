"use strict";
const { exists, readFile, writeFile } = require("./util/fs");

const { Minimatch } = require("minimatch");

const defaults = [".git/", ".svn/", ".hg/", "*.swp", ".DS_Store"];

exports.load = async function load(file) {
  let lines = defaults;
  if (await exists(file)) {
    const text = await readFile(file, "utf-8");
    lines = text.replace(/\r/g, "").split(/\n+/g);
  }
  return exports.buildMatcher(lines);
};

exports.buildMatcher = function buildMatcher(lines) {
  const blacklist = [];
  const whitelist = [];
  for (const line of lines) {
    let list = blacklist;
    let pattern = line.trim();
    if (pattern.startsWith("!")) {
      list = whitelist;
      pattern = pattern.slice(1);
    }
    if (!pattern) continue;
    if (pattern.endsWith("/")) pattern += "**";
    if (!pattern.startsWith("/")) pattern = "**/" + pattern;
    else pattern = pattern.slice(1);
    list.push(new Minimatch(pattern, { dot: true, nonegate: true }));
  }
  return (path) =>
    whitelist.every((matcher) => !matcher.match(path)) &&
    blacklist.some((matcher) => matcher.match(path));
};

exports.save = async function save(file, values, overwrite) {
  const patterns = new Set(values);
  if (!overwrite) {
    if (await exists(file)) {
      const text = await readFile(file, "utf-8");
      for (const line of text.split(/\n|\r/g)) {
        if (!line) continue;
        patterns.add(line);
      }
    } else {
      for (const line of defaults) {
        patterns.add(line);
      }
    }
  }
  const lines = Array.from(patterns.values());
  await writeFile(file, lines.join("\n") + "\n");
};
