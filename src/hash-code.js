'use strict';
 /**
  * generate a 32bit hash based on the function.toString()
  * _from http://stackoverflow.com/questions/7616461/generate-a-hash-_from-string-in-javascript-jquery
  * @params (string) the converted to string function
  */
export default function(s)
{
	return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
};
