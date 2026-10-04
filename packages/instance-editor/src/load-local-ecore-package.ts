import {
  DynamicEFactoryImpl,
  EcorePackageImpl,
  EPackage,
  EPackageRegistryImpl,
  EStructuralFeatureImpl,
  isEClass,
  isEPackage,
  ResourceSetImpl,
  URI,
} from '@typemf/core';
import { NodeFileUriConverter } from '@typemf/node';
import { registerXmiFormat } from '@typemf/xmi';

/**
 * Loads a .ecore file's root EPackage, entirely locally: a fresh, throwaway EPackageRegistry
 * with only Ecore's own metamodel registered (needed to interpret xsi:type="ecore:EClass" etc. -
 * always safe, Ecore's own nsURI never collides with a real domain metamodel's), never touching
 * runtime.packageRegistry. Matches the earlier design decision that a dynamically-picked .ecore
 * file stays local to whatever's doing the picking - a "New Model Instance" dynamic-mode pick, or
 * the missing-package resolution flow for an existing file - not globally registered.
 *
 * Used for reading a METAMODEL (.ecore) file specifically, distinct from loading an actual
 * instance document (library.xmi/library.json), which InstanceEditorProvider does separately,
 * against the document's own, by-then-fully-resolved registry.
 *
 * Takes `{ fsPath }`, not a real vscode.Uri, deliberately - the only thing this ever used, and
 * narrowing it is what makes this genuinely unit-testable without a real VS Code runtime present,
 * same reasoning as handleGetObjectRequest's own `{ objectIds }` narrowing. Not just a style
 * choice this time: the untestable signature is exactly why the real bug this function had (never
 * called setEFactoryInstance on the returned package, discovered only via real VS Code testing)
 * went uncaught - a real test constructing an instance from a returned classifier, which this
 * narrowing enables, would have caught it immediately.
 */
export async function loadLocalEcorePackage(fileUri: { fsPath: string }): Promise<EPackage> {
  const packageRegistry = new EPackageRegistryImpl();
  packageRegistry.register(EcorePackageImpl.eINSTANCE);

  const resourceSet = new ResourceSetImpl(packageRegistry);
  registerXmiFormat(resourceSet.getResourceFactoryRegistry()); // .ecore parses as an ordinary XMI document
  resourceSet.getUriConverterRegistry().register(new NodeFileUriConverter());

  const resource = await resourceSet.getResource(URI.createFileURI(fileUri.fsPath), true);
  const contents = resource?.getContents();
  // EList.get(0) throws on an empty list rather than returning undefined - check isEmpty() first.
  const root = contents && !contents.isEmpty() ? contents.get(0) : undefined;
  if (!root || !isEPackage(root)) {
    throw new Error(`'${fileUri.fsPath}' did not load a valid EPackage.`);
  }
  // A purely parsed .ecore package has no factory of its own yet - createInstanceOf's own error
  // message documents this exact requirement; this function existed to satisfy it but never
  // actually did, a real bug confirmed against real VS Code testing, not caught by any test here
  // since nothing in this package's own test suite ever went on to construct an instance from a
  // classifier this function returned.
  root.setEFactoryInstance(new DynamicEFactoryImpl());

  // Every feature given a real, unique featureID here - a second real, confirmed bug found via
  // the same "new instance of a dynamic model freezes" reproduction: a plain .ecore file never
  // serializes featureID at all (real EMF always computes it, never stores it - there's no XML
  // attribute for it to parse in the first place), so every feature loaded this way keeps
  // whatever sentinel default it was constructed with - the SAME one, for every feature, since
  // nothing here was ever setting it apart. DynamicEObjectImpl's own storage is a single
  // Map<featureID, value> (see its own constructor/eGet/eSet) - every feature colliding on one id
  // means they all silently read and write the exact same underlying slot, so the LAST feature to
  // get a value (in construction order) clobbers every other feature's own, independently-set
  // value, and eGet() for any of them returns whichever slot that collision left behind - a
  // many-valued feature's own BasicEList, for a single-valued one, moments after confirming a
  // feature is NOT many-valued (feature.isMany() correctly false) - which is why the crash
  // specifically was "treated like a many-valued feature's own list, passed whole to something
  // expecting one object" rather than a more obviously-wrong value.
  //
  // Assigns each class's own, directly-declared features (getEStructuralFeatures(), not "All") a
  // contiguous id range, offset past however many of this same class's own features are
  // inherited - real EMF's own numbering convention (supertypes' features first, by position in
  // getEAllStructuralFeatures()). Correct regardless of which classifier gets processed in which
  // order: a feature is only ever touched once, by its own declaring class's own loop; the offset
  // for "how many ids come before this class's own features" is a fixed property of the class
  // itself (inherited feature count), not something that depends on whether those inherited
  // features have had their own ids assigned yet.
  for (const classifier of root.getEClassifiers()) {
    if (!isEClass(classifier)) continue;
    const ownFeatures = [...classifier.getEStructuralFeatures()];
    const inheritedCount = classifier.getEAllStructuralFeatures().size() - ownFeatures.length;
    ownFeatures.forEach((feature, index) => (feature as EStructuralFeatureImpl).setFeatureID(inheritedCount + index));
  }

  // Every own feature's eType eagerly resolved here, before this package is considered "ready" -
  // a real, confirmed bug found via direct reproduction of "new instance of a dynamic model
  // freezes on Loading…": a feature whose eType is a same-attribute, cross-document reference
  // into Ecore's own metamodel (e.g. eType="ecore:EDataType http://.../Ecore#//EString" - the
  // real, externally-authored convention the read-side XMI fix earlier this session made lazy,
  // not eager) stays an unresolved proxy after a plain load() - fine for XmiSerializer itself,
  // but the rest of this system assumes a loaded package's own features always have a real eType,
  // not a proxy (needsEagerOwnFeatures relies on it implicitly; so, more immediately, does
  // @typemf/json's encodeAttributeValue, which calls eType?.getName() synchronously the moment a
  // brand-new instance's own attribute value is first snapshotted for the webview - throwing
  // uncaught, inside the host's own message handler, before any response is ever sent back, which
  // is why the symptom was a silent, permanent "Loading…" rather than a visible error). Resolved
  // against this same, local resourceSet (the one with Ecore's own metamodel registered) - a
  // failure here (e.g. a reference into some OTHER, unknown external document this project
  // doesn't yet support) is left as a still-unresolved proxy rather than aborting the whole load,
  // since that's a materially different, rarer problem than the one actually being fixed.
  for (const classifier of root.getEClassifiers()) {
    if (!isEClass(classifier)) continue;
    for (const feature of classifier.getEStructuralFeatures()) {
      const eType = feature.getEType();
      if (!eType?.eIsProxy()) continue;
      try {
        const resolved = await resourceSet.resolve(eType);
        if (resolved) feature.setEType(resolved as typeof eType);
      } catch {
        // Left as a proxy - see this loop's own reasoning above.
      }
    }
  }

  return root;
}
