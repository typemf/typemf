/**
 * A TypeScript class constructor - the analog of Java's `Class<?>`, which is what real EMF's own
 * EJavaClass maps to. Used specifically for EStructuralFeature.getContainerClass(): the constructor of
 * the class a feature is DECLARED on (matching real EMF's setContainerClass(Class<?>), called from
 * generated bootstrap code with a literal, e.g. `EClassifier.class` - here, the generated
 * implementation class itself, e.g. `EClassifierImpl`, which is a real value in TypeScript, not just a
 * type).
 */
export type TypeScriptClass<T> = new (...args: unknown[]) => T;
