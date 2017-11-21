"use strict";
exports.uniq = function uniq(arr) {
  return Array.from(new Set(arr));
};

exports.splat = function splat(arr) {
  if (Array.isArray(arr)) return arr;
  return [arr];
};

exports.unsplat = function unsplat(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr[arr.length - 1];
};
