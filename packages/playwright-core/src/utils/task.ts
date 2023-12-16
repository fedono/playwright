// See https://joel.tools/microtasks/
export function makeWaitForNextTask() {
  // As of Mar 2021, Electron v12 doesn't create new task with `setImmediate` despite
  // using Node 14 internally, so we fallback to `setTimeout(0)` instead.
  // @see https://github.com/electron/electron/issues/28261
  if ((process.versions as any).electron)
    return (callback: () => void) => setTimeout(callback, 0);
  if (parseInt(process.versions.node, 10) >= 11)
    return setImmediate;

  // Unlike Node 11, Node 10 and less have a bug with Task and MicroTask execution order:
  // - https://github.com/nodejs/node/issues/22257
  //
  // So we can't simply run setImmediate to dispatch code in a following task.
  // However, we can run setImmediate from-inside setImmediate to make sure we're getting
  // in the following task.

  let spinning = false;
  const callbacks: (() => void)[] = [];
  const loop = () => {
    const callback = callbacks.shift();
    if (!callback) {
      spinning = false;
      return;
    }
    setImmediate(loop);
    // Make sure to call callback() as the last thing since it's
    // untrusted code that might throw.
    callback();
  };

  return (callback: () => void) => {
    callbacks.push(callback);
    if (!spinning) {
      spinning = true;
      setImmediate(loop);
    }
  };
}
