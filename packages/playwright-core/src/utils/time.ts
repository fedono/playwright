// The `process.hrtime()` returns a time from some arbitrary
// date in the past; on certain systems, this is the time from the system boot.
// The `monotonicTime()` converts this to milliseconds.
//
// For a Linux server with uptime of 36 days, the `monotonicTime()` value
// will be 36 * 86400 * 1000 = 3_110_400_000, which is larger than
// the maximum value that `setTimeout` accepts as an argument: 2_147_483_647.
//
// To make the `monotonicTime()` a reasonable value, we anchor
// it to the time of the first import of this utility.
const initialTime = process.hrtime();

export function monotonicTime(): number {
  const [seconds, nanoseconds] = process.hrtime(initialTime);
  return seconds * 1000 + (nanoseconds / 1000 | 0) / 1000;
}
