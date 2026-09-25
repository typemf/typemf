import { describe, expect, it } from "vitest";
import { buildSampleMetamodel } from "./sample-metamodel.js";
import { EAnnotationImpl } from "../impl/index";

describe("EAnnotation", () => {
  it("can be attached to any EModelElement and looked up by source", () => {
    const { titleAttr } = buildSampleMetamodel();

    const uiHint = new EAnnotationImpl();
    uiHint.setSource("https://typemf.dev/ui");
    uiHint.getDetails().set("widget", "text-field");
    uiHint.getDetails().set("order", "1");

    titleAttr.getEAnnotations().add(uiHint);
    uiHint.setEModelElement(titleAttr);

    const found = titleAttr.getEAnnotation("https://typemf.dev/ui");
    expect(found).toBe(uiHint);
    expect(found?.getDetails().get("widget")).toBe("text-field");
    expect(found?.getEModelElement()).toBe(titleAttr);
  });

  it("returns undefined for an unknown source", () => {
    const { titleAttr } = buildSampleMetamodel();
    expect(titleAttr.getEAnnotation("https://nope.example")).toBeUndefined();
  });

  it("supports multiple annotations from different sources on one element", () => {
    const { bookClass } = buildSampleMetamodel();

    const docAnnotation = new EAnnotationImpl();
    docAnnotation.setSource("https://typemf.dev/doc");
    docAnnotation.getDetails().set("summary", "A single book in the library.");

    const genAnnotation = new EAnnotationImpl();
    genAnnotation.setSource("https://typemf.dev/generator");
    genAnnotation.getDetails().set("rest.expose", "true");

    bookClass.getEAnnotations().add(docAnnotation);
    bookClass.getEAnnotations().add(genAnnotation);

    expect(bookClass.getEAnnotations().size()).toBe(2);
    expect(
      bookClass
        .getEAnnotation("https://typemf.dev/generator")
        ?.getDetails()
        .get("rest.expose"),
    ).toBe("true");
  });
});
