/**
 * Store data in local storage
 *
 * @param key The key to store the data under
 * @param value The data to store
 */
export function setLocalStorage<T>(key: string, value: T): void {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

/**
 * Get data from local storage
 *
 * @param key The key to retrieve
 * @param defaultValue A default value to return if key doesn't exist
 * @returns The retrieved value or defaultValue if key doesn't exist
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error(`Error getting localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Remove data from local storage
 *
 * @param key The key to remove
 */
export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * Clear all data from local storage
 */
export function clearLocalStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Store data in session storage
 *
 * @param key The key to store the data under
 * @param value The data to store
 */
export function setSessionStorage<T>(key: string, value: T): void {
  try {
    const serializedValue = JSON.stringify(value);
    sessionStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error setting sessionStorage key "${key}":`, error);
  }
}

/**
 * Get data from session storage
 *
 * @param key The key to retrieve
 * @param defaultValue A default value to return if key doesn't exist
 * @returns The retrieved value or defaultValue if key doesn't exist
 */
export function getSessionStorage<T>(key: string, defaultValue: T): T {
  try {
    const serializedValue = sessionStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error(`Error getting sessionStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Remove data from session storage
 *
 * @param key The key to remove
 */
export function removeSessionStorage(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing sessionStorage key "${key}":`, error);
  }
}

/**
 * Clear all data from session storage
 */
export function clearSessionStorage(): void {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
  }
}