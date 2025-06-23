// Global field storage completely independent of React
// This stores field values outside of React's rendering system

interface FieldStorage {
  [fieldName: string]: any;
}

class GlobalFieldStorage {
  private storage: FieldStorage = {};
  private listeners: Array<(fieldName: string, value: any) => void> = [];

  // Set a field value
  setValue(fieldName: string, value: any) {
    this.storage[fieldName] = value;
    // Notify listeners with debouncing
    this.notifyListeners(fieldName, value);
  }

  // Get a field value
  getValue(fieldName: string): any {
    return this.storage[fieldName] || '';
  }

  // Get all values
  getAllValues(): FieldStorage {
    return { ...this.storage };
  }

  // Clear all values
  clearAll() {
    this.storage = {};
  }

  // Add a listener for value changes
  addListener(callback: (fieldName: string, value: any) => void) {
    this.listeners.push(callback);
  }

  // Remove a listener
  removeListener(callback: (fieldName: string, value: any) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notify listeners with debouncing
  private notifyListeners(fieldName: string, value: any) {
    // Use setTimeout to batch notifications
    setTimeout(() => {
      this.listeners.forEach(listener => {
        try {
          listener(fieldName, value);
        } catch (error) {
          console.error('Error in field storage listener:', error);
        }
      });
    }, 0);
  }
}

// Create a global instance
export const globalFieldStorage = new GlobalFieldStorage();