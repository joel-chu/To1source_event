// group all the repetitive message here

export const TAKEN_BY_OTHER_TYPE_ERR = 'You are trying to register an event already been taken by other type:'

// use constants for type 
export const ON_TYPE = 'on'
export const ONLY_TYPE = 'only'
export const ONCE_TYPE = 'once'
export const ONLY_ONCE_TYPE = 'onlyOnce'
export const MAX_CALL_TYPE = 'maxAllowCall'

export const AVAILABLE_TYPES = [
  ON_TYPE,
  ONLY_TYPE,
  ONCE_TYPE,
  ONLY_ONCE_TYPE
]
// the type which the callMax can execute on
export const ON_MAX_TYPES = [
  ON_TYPE,
  ONLY_TYPE 
]

