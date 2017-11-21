"use strict";
const cliui = require("cliui");
const yargs = require("yargs");

exports.group = function group(title, ...args) {
  if (Array.isArray(title)) {
    args.unshift(title);
    title = undefined;
  }
  const wrapWidth = Math.min(160, yargs.terminalWidth());
  const ui = cliui({ width: wrapWidth, wrap: true });
  const maxLength = args.reduce(
    (base, [name]) => Math.max(base, name.length),
    0
  );
  const leftWidth = Math.min(maxLength, Math.floor(wrapWidth / 2));
  if (title) ui.div(title);
  for (const [name, desc, extra] of args) {
    ui.span({ text: name, padding: [0, 2, 0, 2], width: leftWidth + 4 }, desc);
    if (extra) {
      ui.div({ text: extra, padding: [0, 0, 0, 2], align: "right" });
    } else {
      ui.div();
    }
  }
  return ui.toString();
};

exports.comma = function comma(arr, and = "and") {
  if (!arr.length) return "";
  if (arr.length === 1) return arr[0];
  return `${arr.slice(0, arr.length - 1).join(", ")} ${and} ${arr[
    arr.length - 1
  ]}`;
};

exports.inline = function inline(strings, ...values) {
  const strb = [strings[0]];
  for (let i = 0; i < values.length; i++) {
    strb.push(values[i], strings[i + 1]);
  }
  return strb
    .join("")
    .replace(/([ \t]+\n|\n[ \t]+)/g, "\n")
    .replace(/\n\n+/g, match => match.replace(/\n/g, "\0"))
    .replace(/\n/g, " ")
    .replace(/\0/g, "\n")
    .replace(/(^\s|\s$)/g, "");
};

exports.mask = function mask(val) {
  const str = String(val);
  return str.replace(/./g, "*");
};
