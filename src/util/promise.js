export function promisify (fn, self) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      args.push((err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
      fn.apply(this || self, args)
    })
  }
}

export function promisify2 (fn, self) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      args.push(resolve)
      fn.apply(this || self, args)
    })
  }
}
