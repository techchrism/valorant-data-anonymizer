
// From https://dev.to/ankittanna/how-to-create-a-type-for-complex-json-object-in-typescript-d81
type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | JSONArray;

interface JSONObject {
    [x: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> { }

interface AnonymizeOptions {
    uuidWhitelist: string[]
    uuidMapping: Map<string, string>
    gameNameMapping: Map<string, string>
    taglineMapping: Map<string, string>
    generators: {
        uuid: () => string
        gameName: () => string
        tagline: () => string
    }
}

const uuidRegex = /^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i

function getOrSet<T, U>(map: Map<T, U>, key: T, value: () => U): U {
    const existing = map.get(key)
    if(existing !== undefined) return existing

    const newValue = value()
    map.set(key, newValue)
    return newValue
}

function recursiveAnonymize(data: JSONValue, options: AnonymizeOptions): JSONValue {
    if (typeof data === 'string') {
        if(uuidRegex.test(data) && !options.uuidWhitelist.includes(data)) {
            return getOrSet(options.uuidMapping, data, options.generators.uuid)
        }
        return data
    } else if (typeof data === 'number') {
        return data
    } else if (typeof data === 'boolean') {
        return data
    } else if (Array.isArray(data)) {
        return data.map(e => recursiveAnonymize(e, options))
    } else if (data === null) {
        return data
    } else {
        const result: JSONObject = {}
        for (const key in data) {
            if(key === 'gameName') {
                result[key] = getOrSet(options.gameNameMapping, data[key], options.generators.gameName)
            } else if(key === 'tagLine') {
                result[key] = getOrSet(options.taglineMapping, data[key], options.generators.tagline)
            } else {
                const cleanKey = recursiveAnonymize(key, options) as string
                result[cleanKey] = recursiveAnonymize(data[key], options)
            }
        }
        return result
    }
}

export function anonymize(input: string): string {
    if(input.length === 0) return ''
    let data
    try {
        data = JSON.parse(input)
    } catch (e) {
        return e.toString()
    }

    let gameNameID = 0
    let taglineID = 0

    return JSON.stringify(recursiveAnonymize(data, {
        uuidWhitelist: [],
        uuidMapping: new Map(),
        gameNameMapping: new Map(),
        taglineMapping: new Map(),
        generators: {
            uuid: () => crypto.randomUUID(),
            gameName: () => `Player${('00'+(++gameNameID)).slice(-2)}`,
            tagline: () => ('0000'+(++taglineID)).slice(-4)
        }
    }), null, 4)
}