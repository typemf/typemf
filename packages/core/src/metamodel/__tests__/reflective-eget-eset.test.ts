import { describe, expect, it } from "vitest";
import {
  EAnnotationImpl,
  EAttributeImpl,
  EClassImpl,
  EDataTypeImpl,
  EEnumImpl,
  EEnumLiteralImpl,
  EOperationImpl,
  EPackageImpl,
  EParameterImpl,
  EReferenceImpl,
} from "../impl/index";
import { EStructuralFeature } from "../../index";

/** A real EStructuralFeature usable purely as a "feature descriptor" for eGet/eSet dispatch - only its name matters to the dispatch logic. */
function feature(name: string): EStructuralFeature {
  const f = new EAttributeImpl();
  f.setName(name);
  return f;
}

describe("reflective eGet/eSet - deep inheritance fallthrough", () => {
  it('EAttributeImpl.eGet() reaches "eAnnotations", declared 3 levels up on EModelElementImpl', () => {
    const attr = new EAttributeImpl();
    attr.setName("title");
    const annotation = new EAnnotationImpl();
    annotation.setSource("http://example.com");
    attr.getEAnnotations().add(annotation);

    // EAttributeImpl -> EStructuralFeatureImpl -> ETypedElementImpl ->
    // ENamedElementImpl -> EModelElementImpl - "eAnnotations" is declared
    // on the base, reached only via the full super() chain.
    const result = attr.eGet(feature("eAnnotations"));
    expect(result).toBe(attr.getEAnnotations());
  });

  it('EEnumImpl.eGet() reaches "name", declared 2 levels up on ENamedElementImpl, and its own "eLiterals"', () => {
    const en = new EEnumImpl();
    en.setName("Genre");
    expect(en.eGet(feature("name"))).toBe("Genre");
    expect(en.eGet(feature("eLiterals"))).toBe(en.getELiterals());
  });

  it("throws a clear error for a genuinely unknown feature, only after the full chain is exhausted", () => {
    const attr = new EAttributeImpl();
    expect(() => attr.eGet(feature("doesNotExist"))).toThrow(
      /not a feature of EAttributeImpl/,
    );
  });
});

describe("reflective eGet/eSet - own features, round-tripped through eSet then eGet", () => {
  it("EClassImpl: abstract, eSuperTypes, eStructuralFeatures", () => {
    const base = new EClassImpl();
    base.setName("Base");
    const sub = new EClassImpl();
    sub.setName("Sub");
    const attr = new EAttributeImpl();
    attr.setName("x");

    sub.eSet(feature("abstract"), true);
    expect(sub.eGet(feature("abstract"))).toBe(true);
    expect(sub.isAbstract()).toBe(true);

    sub.eSet(feature("eSuperTypes"), [base]);
    expect(sub.eGet(feature("eSuperTypes"))).toBe(sub.getESuperTypes());
    expect(sub.getESuperTypes().toArray()).toEqual([base]);

    sub.eSet(feature("eStructuralFeatures"), [attr]);
    expect(sub.getEStructuralFeatures().toArray()).toEqual([attr]);
  });

  it("EPackageImpl: nsURI, nsPrefix, eClassifiers, eFactoryInstance (changeable, unlike eSuperPackage)", () => {
    const pkg = new EPackageImpl();
    pkg.eSet(feature("nsURI"), "https://example.com");
    pkg.eSet(feature("nsPrefix"), "ex");
    expect(pkg.eGet(feature("nsURI"))).toBe("https://example.com");
    expect(pkg.eGet(feature("nsPrefix"))).toBe("ex");

    const dt = new EDataTypeImpl();
    dt.setName("EString");
    pkg.eSet(feature("eClassifiers"), [dt]);
    expect(pkg.getEClassifiers().toArray()).toEqual([dt]);
  });

  it('EReferenceImpl: containment, eOpposite - and the derived "container"/"eReferenceType" verified against real EMF semantics', () => {
    const a = new EReferenceImpl();
    a.setName("a");
    const b = new EReferenceImpl();
    b.setName("b");
    a.eSet(feature("containment"), true);
    a.eSet(feature("eOpposite"), b);
    b.eSet(feature("eOpposite"), a);

    expect(a.eGet(feature("containment"))).toBe(true);
    expect(a.eGet(feature("eOpposite"))).toBe(b);
    // b's "container" is derived from ITS OWN eOpposite (a) being a
    // containment reference - verified against real
    // EReferenceImpl.isContainer() in the Java source, not assumed.
    expect(b.eGet(feature("container"))).toBe(true);
    expect(a.eGet(feature("container"))).toBe(false); // a's own opposite (b) is not containment
  });

  it("EEnumLiteralImpl: value, literal - and eIsSet distinguishes 'explicitly set' from getLiteral()'s name-fallback", () => {
    const lit = new EEnumLiteralImpl();
    lit.setName("SciFi");
    expect(lit.eIsSet(feature("literal"))).toBe(false); // never explicitly set
    expect(lit.getLiteral()).toBe("SciFi"); // but getLiteral() still falls back to name

    lit.eSet(feature("literal"), "Science Fiction");
    expect(lit.eIsSet(feature("literal"))).toBe(true);
    expect(lit.eGet(feature("literal"))).toBe("Science Fiction");
  });

  it("EOperationImpl and EParameterImpl: eParameters, and a parameter's own eType (inherited from ETypedElementImpl with no override needed)", () => {
    const op = new EOperationImpl();
    op.setName("isOverdue");
    const param = new EParameterImpl();
    param.setName("asOf");
    const eDate = new EDataTypeImpl();
    eDate.setName("EDate");
    param.eSet(feature("eType"), eDate);

    op.eSet(feature("eParameters"), [param]);
    expect(op.getEParameters().toArray()).toEqual([param]);
    expect(param.eGet(feature("eType"))).toBe(eDate);
  });
});

describe("reflective eGet/eSet - non-changeable features are readable but not settable, matching real EMF exactly", () => {
  it('EClassifier.ePackage: readable via eGet, but eSet falls through to "unknown feature"', () => {
    const dt = new EDataTypeImpl();
    dt.setName("EString");
    const pkg = new EPackageImpl();
    pkg.setName("lib");
    pkg.getEClassifiers().add(dt);
    dt.setEPackage(pkg);

    expect(dt.eGet(feature("ePackage"))).toBe(pkg);
    expect(() => dt.eSet(feature("ePackage"), pkg)).toThrow(/not a feature of/);
  });

  it("EStructuralFeature.eContainingClass: readable, not settable", () => {
    const cls = new EClassImpl();
    cls.setName("Book");
    const attr = new EAttributeImpl();
    attr.setName("title");
    attr.setEContainingClass(cls);

    expect(attr.eGet(feature("eContainingClass"))).toBe(cls);
    expect(() => attr.eSet(feature("eContainingClass"), cls)).toThrow(
      /not a feature of/,
    );
  });

  it("EPackage.eSuperPackage: readable, not settable (unlike eFactoryInstance on the same class)", () => {
    const parent = new EPackageImpl();
    parent.setName("parent");
    const child = new EPackageImpl();
    child.setName("child");
    child.setESuperPackage(parent);

    expect(child.eGet(feature("eSuperPackage"))).toBe(parent);
    expect(() => child.eSet(feature("eSuperPackage"), parent)).toThrow(
      /not a feature of/,
    );
  });
});

describe("reflective eGet - derived features return real, correct computed values (not stubs)", () => {
  it("EClassImpl.eAllSuperTypes / eAllStructuralFeatures reflect real inheritance", () => {
    const eString = new EDataTypeImpl();
    eString.setName("EString");
    const base = new EClassImpl();
    base.setName("Base");
    const baseAttr = new EAttributeImpl();
    baseAttr.setName("id");
    baseAttr.setEType(eString);
    base.getEStructuralFeatures().add(baseAttr);

    const sub = new EClassImpl();
    sub.setName("Sub");
    sub.getESuperTypes().add(base);
    const subAttr = new EAttributeImpl();
    subAttr.setName("name");
    subAttr.setEType(eString);
    subAttr.setID(true);
    sub.getEStructuralFeatures().add(subAttr);
    sub.recomputeAllLists();

    expect(sub.eGet(feature("eAllSuperTypes"))).toEqual([base]);
    const allFeatureNames = (
      sub.eGet(feature("eAllStructuralFeatures")) as EStructuralFeature[]
    ).map((f) => f.getName());
    expect(allFeatureNames).toEqual(["id", "name"]);

    // getEIDAttribute() - added as part of this work, previously missing
    // entirely (not just undispatched).
    expect(sub.eGet(feature("eIDAttribute"))).toBe(subAttr);
  });
});
