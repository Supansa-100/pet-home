/**
 * Date and Time utilities for PET-HOME
 * Ensures all timestamps are displayed accurately in Bangkok Time (Asia/Bangkok / UTC+7).
 */

const BANGKOK_TZ = 'Asia/Bangkok'

/**
 * Format time in Bangkok timezone (e.g., "01:45" or "14:30")
 * @param {string|Date} dateInput 
 * @param {Intl.DateTimeFormatOptions} options 
 * @returns {string}
 */
export const formatBangkokTime = (dateInput, options = {}) => {
  if (!dateInput) return ''
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' 
    ? new Date(dateInput) 
    : dateInput
  if (isNaN(date.getTime())) return ''

  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: BANGKOK_TZ,
    ...options
  })
}

/**
 * Format date and time in Bangkok timezone (e.g., "22 ก.ย., 01:45")
 * @param {string|Date} dateInput 
 * @param {Intl.DateTimeFormatOptions} options 
 * @returns {string}
 */
export const formatBangkokDateTime = (dateInput, options = {}) => {
  if (!dateInput) return ''
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' 
    ? new Date(dateInput) 
    : dateInput
  if (isNaN(date.getTime())) return ''

  return date.toLocaleString('th-TH', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: BANGKOK_TZ,
    ...options
  })
}

/**
 * Format date in Bangkok timezone (e.g., "22 ก.ย. 2569")
 * @param {string|Date} dateInput 
 * @param {Intl.DateTimeFormatOptions} options 
 * @returns {string}
 */
export const formatBangkokDate = (dateInput, options = {}) => {
  if (!dateInput) return ''
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' 
    ? new Date(dateInput) 
    : dateInput
  if (isNaN(date.getTime())) return ''

  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: BANGKOK_TZ,
    ...options
  })
}
