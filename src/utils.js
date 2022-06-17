/**
 * generate a 32bit hash based on the function.toString()
 * _from http://stackoverflow.com/questions/7616461/generate-a-hash-_from-string-in-javascript-jquery
 * @param {string} s the converted to string function
 * @return {string} the hashed function string
 */
export function hashCode(s) {
	return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)
}

/**
 * wrapper to make sure it string
 * @param {*} input whatever
 * @return {string} output
 */
export function hashCode2Str(s) {
  return hashCode(s) + ''
}

/**
 * Just check if a pattern is an RegExp object
 * @param {*} pat whatever
 * @return {boolean} false when its not
 */
export function isRegExp(pat) {
  return pat instanceof RegExp
}

/**
 * check if its string
 * @param {*} arg whatever
 * @return {boolean} false when it's not
 */
export function isString(arg) {
  return typeof arg === 'string'
}

/**
 * check if it's an integer
 * @param {*} num input number
 * @return {boolean}
 */
export function isInt(num) {
  if (isString(num)) {
    throw new Error(`Wrong type, we want number!`)
  }
  return !isNaN(parseInt(num))
}

/**
 * Find from the array by matching the pattern
 * @param {*} pattern a string or RegExp object
 * @return {object} regex object or false when we can not id the input
 */
export function getRegex(pattern) {
  switch (true) {
    case isRegExp(pattern) === true:
      return pattern
    case isString(pattern) === true:
      return new RegExp(pattern)
    default:
      return false
  }
}

/**
 * in array
 * @param {array} arr to search
 * @param {*} prop to search
 */
 // export const inArray = (arr, prop) => !!arr.filter(v => prop === v).length
 export const inArray = (arr, prop) => arr.includes(prop) // 2022 version
