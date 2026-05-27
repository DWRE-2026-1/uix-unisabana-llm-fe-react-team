export function notImplemented(moduleName, methodName) {
  throw new Error(`[${moduleName}] ${methodName} not implemented`);
}
