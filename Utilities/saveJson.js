export const convertBigIntsToStrings = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntsToStrings);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'bigint') {
        newObj[key] = value.toString();
      } else {
        newObj[key] = convertBigIntsToStrings(value);
      }
    }
    return newObj;
  }
  return obj;
}

