export function uniq (arr) {
  return Array.from(new Set(arr))
}

export function splat (arr) {
  if (Array.isArray(arr)) return arr
  return [arr]
}

export function unsplat (arr) {
  if (!Array.isArray(arr)) return arr
  return arr[arr.length - 1]
}
