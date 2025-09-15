export function make_replacer() {
  const seen = new WeakSet();
  return (_key: any, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    if (value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()), // or with spread: value: [...value]
      };
    } else if (value instanceof Set) {
      return {
        dataType: 'Set',
        value: Array.from(value.values()), // or with spread: value: [...value]
      };
    } else {
      return value;
    }
  };
}
export function reviver(_key: any, value: any) {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    } else if (value.dataType === 'Set') {
      return new Set(value.value);
    }
  }
  return value;
}
