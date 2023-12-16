export async function queryObjectCount(type: Function): Promise<number> {
  globalThis.typeForQueryObjects = type;
  const session: import('inspector').Session = new (require('node:inspector').Session)();
  session.connect();
  try {
    await new Promise(f => session.post('Runtime.enable', f));
    const { result: constructorFunction } = await new Promise(f => session.post('Runtime.evaluate', {
      expression: `globalThis.typeForQueryObjects.prototype`,
      includeCommandLineAPI: true,
    }, (_, result) => f(result))) as any;

    const { objects: instanceArray } = await new Promise(f => session.post('Runtime.queryObjects', {
      prototypeObjectId: constructorFunction.objectId
    }, (_, result) => f(result))) as any;

    const { result: { value } } = await new Promise<any>(f => session.post('Runtime.callFunctionOn', {
      functionDeclaration: 'function (arr) { return this.length; }',
      objectId: instanceArray.objectId,
      arguments: [{ objectId: instanceArray.objectId }],
    }, (_, result) => f(result as any)));

    return value;
  } finally {
    session.disconnect();
  }
}
