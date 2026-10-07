/**
 * A class constructor, the TypeScript counterpart of Java's `Class<T>`. Used for the
 * implementation class a feature is declared on (`EStructuralFeature.getContainerClass()`).
 */
export type TypeScriptClass<T> = new (...args: unknown[]) => T;
