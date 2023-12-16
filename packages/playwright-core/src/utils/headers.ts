type HeadersArray = { name: string, value: string }[];
type HeadersObject = { [key: string]: string };

export function headersObjectToArray(headers: HeadersObject, separator?: string, setCookieSeparator?: string): HeadersArray {
  if (!setCookieSeparator)
    setCookieSeparator = separator;
  const result: HeadersArray = [];
  for (const name in headers) {
    const values = headers[name];
    if (values === undefined)
      continue;
    if (separator) {
      const sep = name.toLowerCase() === 'set-cookie' ? setCookieSeparator : separator;
      for (const value of values.split(sep!))
        result.push({ name, value: value.trim() });
    } else {
      result.push({ name, value: values });
    }
  }
  return result;
}

export function headersArrayToObject(headers: HeadersArray, lowerCase: boolean): HeadersObject {
  const result: HeadersObject = {};
  for (const { name, value } of headers)
    result[lowerCase ? name.toLowerCase() : name] = value;
  return result;
}
