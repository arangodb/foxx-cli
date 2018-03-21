`use strict`;

const fs = require("fs");

module.exports.rmDir = path => {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path);
    for (const file of files) {
      const current = `${path}/${file}`;
      if (fs.lstatSync(current).isDirectory()) {
        exports.rmDir(current);
      } else {
        fs.unlinkSync(current);
      }
    }
    fs.rmdirSync(path);
  }
};
