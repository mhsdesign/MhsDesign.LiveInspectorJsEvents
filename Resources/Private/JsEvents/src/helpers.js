const filterObject = (obj, callback) => {
    return Object.fromEntries(Object.entries(obj)
        .filter(([key, val]) => callback(key, val)))
}

export const filterOutPropertiesWithUnderscore = (obj) => {
    return filterObject(obj, (key, value) => key.startsWith("_") === false)
}
