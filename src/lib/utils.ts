
/*
 * More accurately check the type of a JavaScript object
 * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com
 */
export function trueTypeOf (obj: unknown): string {
	return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}

/**
 * generate a 32bit hash based on the function.toString()
 * _from http://stackoverflow.com/questions/7616461/generate-a-hash-_from-string-in-javascript-jquery
 */
export function hashCode (s: string): string {
  // @ts-ignore @TODO convert the string to number
  return s.split('')
    .reduce(function (a, b) {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a
    }, 0)
}

/**
 * wrapper to make sure it string
 */
export function hashCode2Str (s: string): string {
  return hashCode(s) + ''
}

/**
 * Just check if a pattern is an RegExp object
 */
export function isRegExp (pat: unknown): boolean {
  return pat instanceof RegExp
}

/**
 * check if its string
 */
export function isString (arg: unknown): boolean {
  return trueTypeOf(arg) === 'string'
}

/**
 * check if it's a symbol
 */
export function isSymbol (arg: unknown): boolean {
	return trueTypeOf(arg) === 'symbol'
}

/**
 * unwrap a string from a symbol
 */
export function toString (arg: unknown): string {
	if (isString(arg)) {
		return arg as string
	}
	// the actual implementation
	if (isSymbol(arg)) {
		const s = (arg as symbol).toString()
		return s
	}
	try {
		// @ts-ignore
		return arg.toString()
	} catch(e) {
		throw new Error(`Unable to call toString on ${arg}`, e)
	}
}

/**
 * check if it's an integer
 */
export function isInt (num: unknown): boolean {
  if (isString(num)) {
    throw new Error('Wrong type, we want number!')
  }
  return !isNaN(parseInt(num as string))
}

/**
 * Find from the array by matching the pattern
 */
export function getRegex (pattern: unknown): boolean | RegExp {
  switch (true) {
    case isRegExp(pattern) === true:
      return pattern as RegExp
    case isString(pattern) === true:
      return new RegExp(pattern as string)
    default:
      return false
  }
}

export function toArray (arg: unknown) {
	return Array.isArray(arg) ? arg : [arg]
}

/**
 * in array
 */
export const inArray = (
  arr: Array<unknown>,
  prop: unknown
) => arr.includes(prop) // 2022 version
