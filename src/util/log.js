/*eslint-disable no-console */
"use strict";
const { red, yellow, bold, gray } = require("chalk");
const { format, isError } = require("util");
const packageJson = require("../../package.json");

const bugsUrl = packageJson.bugs.url;

exports.indentable = function indentable(start = 0) {
  return {
    level: start,
    log(...messages) {
      if (!messages.length) console.log();
      else if (this.level <= 0) console.log(...messages);
      else console.log(" ".repeat(this.level * 2 - 1), ...messages);
    },
    indent(level = 1) {
      this.level += level;
    },
    dedent(level = 1) {
      this.level -= level;
    }
  };
};

exports.info = function info(message) {
  console.info(message);
};

exports.detail = function detail(message) {
  console.info(gray(message));
};

exports.json = function json(obj) {
  console.info(JSON.stringify(obj, null, 2));
};

exports.warn = function warn(message) {
  if (isError(message)) message = message.stack || message.message || message;
  console.error(yellow(format(message)));
};

exports.error = function error(message) {
  if (isError(message)) message = message.stack || message.message || message;
  console.error(red(format(message)));
};

exports.fatal = function fatal(err) {
  if (typeof err === "string") {
    exports.error(err);
  } else if (err.code === "ENETUNREACH") {
    exports.error(
      `Network unreachable: ${red.bold(err.address)}:${red.bold(
        err.port
      )}\nThis indicates connectivity issues or a server problem. Are you offline?`
    );
  } else if (err.code === "EHOSTUNREACH") {
    exports.error(
      `Host unreachable: ${red.bold(err.address)}${
        err.port ? `:${red.bold(err.port)}` : ""
      }\nThis indicates connectivity issues or a server problem. Is the server accessible from this network?`
    );
  } else if (err.code === "ECONNREFUSED") {
    exports.error(
      `Connection refused: ${red.bold(err.address)}${
        err.port ? `:${red.bold(err.port)}` : ""
      }\nThis indicates connectivity issues or a server problem. Is the server down?`
    );
  } else if (err.code === "ECONNRESET") {
    exports.error(
      `Connection reset by peer. The server closed the connection unexpectedly.\nThis indicates connectivity issues or a server problem.`
    );
  } else if (err.code === "EMFILE") {
    exports.error(
      `Too many open files. Your operating system has reached the maximum number of open file descriptors. Try running ${bold(
        "`ulimit -n 2048`"
      )} and try again.`
    );
  } else if (err.code === "EPIPE") {
    exports.error(
      `Broken pipe. Connection was dropped during upload.\nThis indicates connectivity issues or a server problem.`
    );
  } else if (err.code === "ETIMEDOUT") {
    exports.error(
      `Operation timed out. Server is not responding.\nThis indicates connectivity issues or a server problem.`
    );
  } else if (
    typeof err.code === "string" &&
    err.code.match(/^E[A-Z]+$/) &&
    !err.errorNum
  ) {
    exports.error(
      `Unknown system error:\n\n${bold(
        format(err.stack || err.message || err)
      )}\n\n\nThis may indicate connectivity issues or a server problem. See the list of error names in the errno(3) man page for more information: ${bold(
        "http://man7.org/linux/man-pages/man3/errno.3.html"
      )}\n\nIf you believe this to be an bug in ${bold(
        "foxx-cli"
      )} please open an issue at ${bold(
        bugsUrl
      )} with a full copy of the error message and a description of what you were trying to do when this problem occurred.`
    );
  } else if (err.isArangoError) {
    if (err.errorNum === 11) {
      exports.error(
        `Server refused authorization.\nEither your credentials are invalid or the user has insufficient privileges.`
      );
    } else {
      exports.error(
        `Unexpected ArangoDB error (Code: ${err.errorNum || "?"}):\n${
          err.message
        }`
      );
    }
  } else if (err.statusCode === 401) {
    exports.error("Authentication failed. Bad username or password?");
  } else if (typeof err.statusCode === "number") {
    exports.error(
      `The server responded with a ${bold(err.statusCode)} status code.\n${
        err.statusCode >= 500
          ? "This typically indicates a server-side error."
          : "This typically indicates a problem with the request."
      }\nPlease check the ArangoDB log file to determine the cause of this error.\n\nIf you believe this to be an bug in ${bold(
        "foxx-cli"
      )} please open an issue at ${bold(
        bugsUrl
      )} with the relevant part of the ArangoDB log and a description of what you were trying to do when this problem occurred.\n\nWe apologize for the inconvenience.`
    );
  } else {
    exports.error(
      `Sorry! An unexpected error occurred. This is likely a bug in ${bold(
        "foxx-cli"
      )}.\nPlease open an issue at ${bold(
        bugsUrl
      )} with a full copy of the following error message and a description of what you were trying to do when this problem occurred.\n\n${bold(
        format(err.stack || err.message || err)
      )}\n\nWe apologize for the inconvenience.`
    );
  }
  process.exit(1);
};
