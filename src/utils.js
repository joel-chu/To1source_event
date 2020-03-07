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
