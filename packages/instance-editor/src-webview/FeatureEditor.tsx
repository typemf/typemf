import {
  EClass,
  EDataType,
  EList,
  EObject,
  EReference,
  EStructuralFeature,
  ProxyEObjectImpl,
  isEClass,
  isEDataType,
  isEEnum,
  isEReference,
} from '@typemf/core';
import React, { useState } from 'react';
import { displayLabel } from '../src/display-label.js';
import { uriForId } from '../src/snapshot-serializer.js';
import { useResolved, useResolvedList } from './hooks.js';
import { WebviewEnvironment } from './webview-environment.js';

export interface FeatureEditorProps {
  obj: EObject;
  feature: EStructuralFeature;
  environment: WebviewEnvironment;
  onFollowReference: (target: EObject) => void;
}

/**
 * Dispatches to the right widget for `feature`'s own kind - reflective, metadata-driven, the
 * whole point of this editor over a hand-written one-method-per-class UI (see the original design
 * discussion this whole editor came out of): nothing here is specific to any one metamodel.
 *
 * Every widget's onChange calls eSet/list mutations directly, ordinary synchronous calls with no
 * awareness of any relay mechanism at all - EditRelay.attachTo's whole point (see snapshot-
 * serializer.ts) is that this is exactly how it should look from here. "Add child" is the one
 * exception (see AddChildButton's own reasoning): host-side creation needs a real round trip,
 * with the resulting local mutation explicitly marked not to relay back.
 */
export function FeatureEditor({ obj, feature, environment, onFollowReference }: FeatureEditorProps): React.JSX.Element {
  // Derived features are read-only in every case, no exceptions - they're computed, not
  // independently stored, so there is nothing a user edit here could actually mean. Checked once,
  // at the very top, rather than threading an `isDerived` flag down into every individual widget:
  // ReferenceEditor still handles a derived reference's own display (value + follow button),
  // since following a derived reference's current, computed value is still meaningful navigation
  // - only the mutation affordances (add/link/remove) are what get suppressed, inside it.
  if (feature.isDerived() && !isEReference(feature)) {
    return <DerivedAttributeDisplay obj={obj} feature={feature} />;
  }
  if (isEReference(feature)) {
    return (
      <ReferenceEditor obj={obj} feature={feature} environment={environment} onFollowReference={onFollowReference} />
    );
  }
  return <AttributeEditor obj={obj} feature={feature} />;
}

/** A derived attribute's own current, computed value(s) - read-only, no input/checkbox of any
 *  kind, since isDerived() means there is nothing here a user edit could mean in the first place. */
function DerivedAttributeDisplay({ obj, feature }: { obj: EObject; feature: EStructuralFeature }): React.JSX.Element {
  const value = obj.eGet(feature);
  if (feature.isMany()) {
    const items = [...(value as EList<unknown>)];
    if (items.length === 0) return <span className="feature-readonly-empty">(none)</span>;
    return <span className="feature-readonly">{items.map((item) => String(item)).join(', ')}</span>;
  }
  if (value === undefined) return <span className="feature-readonly-empty">(unset)</span>;
  return <span className="feature-readonly">{String(value)}</span>;
}

interface AttributeEditorProps {
  obj: EObject;
  feature: EStructuralFeature;
}

/** The datatype's own name, not getInstanceClassName() - a real, confirmed gap: instanceClassName
 *  is undefined for every one of Ecore's own built-in datatypes (EBoolean, EInt, EString, all of
 *  them), never populated by the bootstrap at all. The datatype's own name is always real and
 *  reliable, well-known or not. */
function dataTypeName(eType: unknown): string | undefined {
  return isEDataType(eType as EDataType) ? (eType as EDataType).getName() : undefined;
}

const BOOLEAN_TYPE_NAMES = ['EBoolean', 'EBooleanObject'];
const NUMERIC_TYPE_NAMES = [
  'EInt',
  'EIntegerObject',
  'ELong',
  'ELongObject',
  'EDouble',
  'EDoubleObject',
  'EFloat',
  'EFloatObject',
  'EShort',
  'EShortObject',
  'EByte',
  'EByteObject',
  'EBigInteger',
  'EBigDecimal',
];

/** A reasonable, type-appropriate starting value for "+ Add" on a multi-valued attribute -
 *  false/0/'' rather than always an empty string regardless of type, a real, confirmed gap found
 *  investigating the same report that led to the checkbox/numeric fixes just above. */
function defaultValueFor(typeName: string | undefined): unknown {
  if (typeName && BOOLEAN_TYPE_NAMES.includes(typeName)) return false;
  if (typeName && NUMERIC_TYPE_NAMES.includes(typeName)) return 0;
  return '';
}

/** One value's own editor widget, shared between the single- and multi-valued cases - the same
 *  checkbox/number/enum/text dispatch either way, just parameterized by value+onChange instead of
 *  reading/writing obj/feature directly, so ManyValuedAttributeEditor can use it once per row. */
function ValueEditor({
  eType,
  value,
  onChange,
}: {
  eType: unknown;
  value: unknown;
  onChange: (v: unknown) => void;
}): React.JSX.Element {
  const typeName = dataTypeName(eType);

  if (isEEnum(eType)) {
    return (
      <select
        className="feature-input"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => {
          const literal =
            eType.getEEnumLiteralByLiteral(e.target.value) ??
            eType.getELiterals().find((l) => l.getName() === e.target.value);
          onChange(literal?.getLiteral() ?? e.target.value);
        }}
      >
        <option value="" disabled>
          (unset)
        </option>
        {eType.getELiterals().map((literal) => (
          <option key={literal.getName()} value={literal.getLiteral() ?? literal.getName()}>
            {literal.getName()}
          </option>
        ))}
      </select>
    );
  }

  if (typeName && BOOLEAN_TYPE_NAMES.includes(typeName)) {
    return (
      <input
        className="feature-input feature-input-checkbox"
        type="checkbox"
        checked={value === true}
        onChange={(e) => onChange(e.target.checked)}
      />
    );
  }

  if (typeName && NUMERIC_TYPE_NAMES.includes(typeName)) {
    return (
      <input
        className="feature-input"
        type="number"
        value={typeof value === 'number' ? value : ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
      />
    );
  }

  return (
    <input
      className="feature-input"
      type="text"
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function AttributeEditor({ obj, feature }: AttributeEditorProps): React.JSX.Element {
  if (feature.isMany()) {
    return <ManyValuedAttributeEditor obj={obj} feature={feature} />;
  }
  const value = obj.eGet(feature);
  return <ValueEditor eType={feature.getEType()} value={value} onChange={(v) => obj.eSet(feature, v)} />;
}

function ManyValuedAttributeEditor({ obj, feature }: AttributeEditorProps): React.JSX.Element {
  const list = obj.eGet(feature) as EList<unknown>;
  const items = [...list];
  const eType = feature.getEType();

  return (
    <div className="feature-list">
      {items.map((item, index) => (
        <div className="feature-list-row" key={index}>
          <ValueEditor
            eType={eType}
            value={item}
            onChange={(v) => {
              list.removeAt(index);
              list.addAt(index, v);
            }}
          />
          <button className="feature-list-remove" onClick={() => list.remove(item)} aria-label="Remove">
            {'✕'}
          </button>
        </div>
      ))}
      <button className="feature-list-add" onClick={() => list.add(defaultValueFor(dataTypeName(eType)))}>
        + Add
      </button>
    </div>
  );
}

/**
 * Still read-only for wiring/creating a NON-containment reference from scratch (a genuinely
 * separate, substantial piece of UI in its own right) - but "follow" (jump to the referenced
 * object in the tree), "remove" (list.remove(), or eUnset() for a single-valued one), and now
 * "add child" (for a containment feature) are all real, working actions.
 *
 * Every item goes through useResolved/useResolvedList, not a bare item.eIsProxy() check - the
 * real fix for a real, reported bug: a still-unresolved item used to show "…" permanently, since
 * nothing ever triggered resolution or a re-render once it completed. This affects containment
 * lists shown here too (e.g. EPackage.eClassifiers, EClass.eAnnotations) exactly the same way a
 * non-containment reference would - both come back from eGet() as (possibly still-proxy) EObject
 * values, and this editor doesn't distinguish the two.
 */
function ReferenceEditor({
  obj,
  feature: rawFeature,
  environment,
  onFollowReference,
}: FeatureEditorProps): React.JSX.Element {
  // Always a real EReference here - FeatureEditor's own dispatch only ever calls this after
  // isEReference(feature) was already true; FeatureEditorProps itself stays typed at the broader
  // EStructuralFeature since every other widget genuinely needs that wider type.
  const feature = rawFeature as EReference;
  const { resourceSet } = environment;
  const value = obj.eGet(feature);

  if (feature.isMany()) {
    const list = value as EList<EObject>;
    const items = [...list];
    const resolvedItems = useResolvedList(items, resourceSet);
    return (
      <div className="feature-list">
        {resolvedItems.length > 0 && (
          <ul className="feature-reference-list">
            {resolvedItems.map((item, index) => (
              <li className="feature-reference-row" key={index}>
                <span className="feature-reference-label">{item.eIsProxy() ? '…' : displayLabel(item)}</span>
                {!item.eIsProxy() && (
                  <button
                    className="feature-reference-follow"
                    onClick={() => onFollowReference(item)}
                    aria-label="Follow reference"
                    title="Select in tree"
                  >
                    {'→'}
                  </button>
                )}
                {!feature.isDerived() && (
                  <button
                    className="feature-reference-remove"
                    onClick={() => list.remove(items[index]!)} // items[index], not the (possibly since-resolved) `item` - list.remove() must match the exact element the list itself still holds
                    aria-label="Remove"
                    title="Remove"
                  >
                    {'✕'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {resolvedItems.length === 0 && <span className="feature-readonly-empty">(none)</span>}
        {/* Derived means read-only in every case (see FeatureEditor's own top-level check) -
            add/link is a mutation affordance same as remove, so it's suppressed here too, not
            just the single-valued "+ Link"/"+ Add" case below. */}
        {!feature.isDerived() &&
          (feature.isContainment() ? (
            <AddChildButton obj={obj} feature={feature} environment={environment} />
          ) : (
            <LinkReferenceButton obj={obj} feature={feature} environment={environment} />
          ))}
      </div>
    );
  }

  const resolvedSingle = useResolved(value as EObject | undefined, resourceSet);
  if (value === undefined) {
    return (
      <div className="feature-list">
        <span className="feature-readonly-empty">(unset)</span>
        {!feature.isDerived() &&
          (feature.isContainment() ? (
            <AddChildButton obj={obj} feature={feature} environment={environment} />
          ) : (
            <LinkReferenceButton obj={obj} feature={feature} environment={environment} />
          ))}
      </div>
    );
  }
  return (
    <span className="feature-reference-row">
      {/* value itself was set (a real proxy or object), but useResolved hasn't settled yet -
          genuinely pending, not "(unset)" - no follow/remove until it has, since following needs
          a real, resolved target and removing while still pending could race the resolution. */}
      <span className="feature-reference-label">
        {resolvedSingle === undefined ? '…' : displayLabel(resolvedSingle)}
      </span>
      {resolvedSingle !== undefined && (
        <>
          <button
            className="feature-reference-follow"
            onClick={() => onFollowReference(resolvedSingle)}
            aria-label="Follow reference"
            title="Select in tree"
          >
            {'→'}
          </button>
          {!feature.isDerived() && (
            <button
              className="feature-reference-remove"
              onClick={() => obj.eUnset(feature)}
              aria-label="Remove"
              title="Remove"
            >
              {'✕'}
            </button>
          )}
        </>
      )}
    </span>
  );
}

type AddChildState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'picking'; candidates: EClass[] }
  | { kind: 'creating' }
  | { kind: 'error'; message: string };

/**
 * "Add child" for a containment feature - asks the host which concrete classes are actually
 * instantiable for this feature's own declared type (ConcreteSubtypesQuery, already built for
 * exactly this), skipping the picker entirely when there's only one real choice, then asks the
 * host to create and add the new instance atomically (EditRelay.createChild). The new child is
 * then resolved normally (the same GetObjectRequest machinery as anything else the webview
 * doesn't have locally yet) and added to THIS object's own, already-displayed local list/
 * reference - marked via suppressNext first, since the host has already added it and relaying
 * that local mutation back would be redundant (see EditRelay's own reasoning for the full story).
 */
function AddChildButton({
  obj,
  feature,
  environment,
}: {
  obj: EObject;
  feature: EStructuralFeature;
  environment: WebviewEnvironment;
}): React.JSX.Element {
  const { resourceSet, objectRegistry, concreteSubtypesQuery, editRelay } = environment;
  const [state, setState] = useState<AddChildState>({ kind: 'idle' });

  const declaredType = feature.getEType();
  if (!isEClass(declaredType)) {
    // Containment on a non-EClass type shouldn't be possible per Ecore's own rules (a containment
    // reference is always object-valued), but this stays defensive rather than assuming it.
    return <></>;
  }

  const startAdd = async (): Promise<void> => {
    setState({ kind: 'loading' });
    const declaredTypeId = objectRegistry.hostIdFor(declaredType);
    if (!declaredTypeId) {
      setState({ kind: 'error', message: "Could not identify this feature's own declared type." });
      return;
    }
    let classIds: string[];
    try {
      classIds = await concreteSubtypesQuery.query(declaredTypeId);
    } catch (err) {
      setState({ kind: 'error', message: (err as Error).message });
      return;
    }
    if (classIds.length === 0) {
      setState({ kind: 'error', message: 'No concrete class is available to create here.' });
      return;
    }
    if (classIds.length === 1) {
      await createChild(classIds[0]!);
      return;
    }
    const candidates: EClass[] = [];
    for (const id of classIds) {
      const resolved = await resourceSet.resolve(new ProxyEObjectImpl(declaredType, uriForId(id)));
      if (isEClass(resolved)) candidates.push(resolved);
    }
    setState({ kind: 'picking', candidates });
  };

  const createChild = async (classId: string): Promise<void> => {
    setState({ kind: 'creating' });
    const parentId = objectRegistry.hostIdFor(obj);
    const featureId = objectRegistry.hostIdFor(feature);
    if (!parentId || !featureId) {
      setState({ kind: 'error', message: 'Could not identify this object or feature to add to.' });
      return;
    }
    let childId: string;
    try {
      childId = await editRelay.createChild(parentId, featureId, classId);
    } catch (err) {
      setState({ kind: 'error', message: (err as Error).message });
      return;
    }
    const resource = await resourceSet.getResource(uriForId(childId), true);
    const child = resource?.getContents().get(0);
    if (!child) {
      setState({ kind: 'error', message: 'The new object was created, but could not be loaded.' });
      return;
    }
    editRelay.suppressNext(obj);
    if (feature.isMany()) (obj.eGet(feature) as EList<unknown>).add(child);
    else obj.eSet(feature, child);
    setState({ kind: 'idle' });
  };

  if (state.kind === 'picking') {
    return (
      <PickObjectForm
        candidates={state.candidates}
        labelFor={(c) => c.getName() ?? '(unnamed)'}
        confirmLabel="Add"
        onCancel={() => setState({ kind: 'idle' })}
        onPick={(eClass) => {
          const classId = objectRegistry.hostIdFor(eClass);
          if (classId) void createChild(classId);
        }}
      />
    );
  }

  return (
    <div className="feature-add-child">
      <button
        className="feature-list-add"
        onClick={() => void startAdd()}
        disabled={state.kind === 'loading' || state.kind === 'creating'}
      >
        {state.kind === 'loading' ? 'Loading…' : state.kind === 'creating' ? 'Adding…' : '+ Add'}
      </button>
      {state.kind === 'error' && <span className="feature-add-child-error">{state.message}</span>}
    </div>
  );
}

type LinkReferenceState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'picking'; candidates: EObject[] }
  | { kind: 'linking' }
  | { kind: 'error'; message: string };

/**
 * The reference picker for a NON-containment feature - "point this at an existing object",
 * as opposed to AddChildButton's "create a brand new one". Asks the host which objects already in
 * the document are type-compatible (ReferenceCandidatesQuery), then does a perfectly ordinary
 * local eSet()/list.add() - no suppressNext needed here, unlike AddChildButton: the chosen object
 * already exists and is already known on both sides, so the normal relay mechanism
 * (relayNotification encoding it as `{ ref: hostId }`, handleApplyEditRequest resolving that id
 * back to the same real object) already handles this correctly with no special-casing at all.
 */
function LinkReferenceButton({
  obj,
  feature,
  environment,
}: {
  obj: EObject;
  feature: EReference;
  environment: WebviewEnvironment;
}): React.JSX.Element {
  const { resourceSet, objectRegistry, referenceCandidatesQuery, browseExternalReferenceQuery } = environment;
  const [state, setState] = useState<LinkReferenceState>({ kind: 'idle' });

  const declaredType = feature.getEType();
  if (!isEClass(declaredType)) return <></>; // a reference's own eType is always an EClass per Ecore's own rules - defensive, not assumed

  // Resolves each of the host's own candidateIds into a real, usable EObject for the picker -
  // the one piece genuinely shared between the in-document and external flows below, which differ
  // only in WHERE the candidateIds themselves come from.
  const resolveCandidates = async (candidateIds: string[]): Promise<EObject[]> => {
    const candidates: EObject[] = [];
    for (const id of candidateIds) {
      const resolved = await resourceSet.resolve(new ProxyEObjectImpl(declaredType, uriForId(id)));
      if (resolved) candidates.push(resolved);
    }
    return candidates;
  };

  const startLink = async (): Promise<void> => {
    setState({ kind: 'loading' });
    const declaredTypeId = objectRegistry.hostIdFor(declaredType);
    if (!declaredTypeId) {
      setState({ kind: 'error', message: "Could not identify this feature's own declared type." });
      return;
    }
    let candidateIds: string[];
    try {
      candidateIds = await referenceCandidatesQuery.query(declaredTypeId);
    } catch (err) {
      setState({ kind: 'error', message: (err as Error).message });
      return;
    }
    if (candidateIds.length === 0) {
      setState({ kind: 'error', message: 'No compatible object exists in this document yet.' });
      return;
    }
    setState({ kind: 'picking', candidates: await resolveCandidates(candidateIds) });
  };

  // "Link external..." - the cross-document counterpart, a separate file picker per click (not
  // a document search) rather than anything cached, since which file the user wants varies every
  // time. A user-cancelled file picker (cancelled: true) quietly returns to idle, no error shown
  // at all - dismissing it is a completely ordinary outcome, not a failure; only a genuine "found
  // nothing compatible in that file" gets the same error treatment as the in-document case.
  const startLinkExternal = async (): Promise<void> => {
    setState({ kind: 'loading' });
    const declaredTypeId = objectRegistry.hostIdFor(declaredType);
    if (!declaredTypeId) {
      setState({ kind: 'error', message: "Could not identify this feature's own declared type." });
      return;
    }
    let result: { candidateIds: string[]; cancelled: boolean };
    try {
      result = await browseExternalReferenceQuery.query(declaredTypeId);
    } catch (err) {
      setState({ kind: 'error', message: (err as Error).message });
      return;
    }
    if (result.cancelled) {
      setState({ kind: 'idle' });
      return;
    }
    if (result.candidateIds.length === 0) {
      setState({ kind: 'error', message: 'No compatible object was found in that file.' });
      return;
    }
    setState({ kind: 'picking', candidates: await resolveCandidates(result.candidateIds) });
  };

  const link = (chosen: EObject): void => {
    setState({ kind: 'linking' });
    if (feature.isMany()) (obj.eGet(feature) as EList<EObject>).add(chosen);
    else obj.eSet(feature, chosen);
    setState({ kind: 'idle' });
  };

  if (state.kind === 'picking') {
    return (
      <PickObjectForm
        candidates={state.candidates}
        labelFor={displayLabel}
        confirmLabel="Link"
        onCancel={() => setState({ kind: 'idle' })}
        onPick={link}
      />
    );
  }

  const busy = state.kind === 'loading' || state.kind === 'linking';
  return (
    <div className="feature-add-child">
      <button className="feature-list-add" onClick={() => void startLink()} disabled={busy}>
        {state.kind === 'loading' ? 'Loading…' : state.kind === 'linking' ? 'Linking…' : '+ Link'}
      </button>
      <button className="feature-list-add" onClick={() => void startLinkExternal()} disabled={busy}>
        Link external…
      </button>
      {state.kind === 'error' && <span className="feature-add-child-error">{state.message}</span>}
    </div>
  );
}

/** Shared by AddChildButton (candidates: EClass[], labeled by name) and LinkReferenceButton
 *  (candidates: EObject[], labeled by displayLabel()) - selected by INDEX, not label text:
 *  two different instances can easily share the same displayLabel() (e.g. two untitled books),
 *  unlike class names, which this form can't assume are unique either way. */
function PickObjectForm<T extends EObject>({
  candidates,
  labelFor,
  confirmLabel,
  onPick,
  onCancel,
}: {
  candidates: T[];
  labelFor: (item: T) => string;
  confirmLabel: string;
  onPick: (item: T) => void;
  onCancel: () => void;
}): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <div className="feature-add-child-picker">
      <select
        className="feature-input"
        value={selectedIndex}
        onChange={(e) => setSelectedIndex(Number(e.target.value))}
      >
        {candidates.map((item, index) => (
          <option key={index} value={index}>
            {labelFor(item)}
          </option>
        ))}
      </select>
      <button className="feature-list-add" onClick={() => onPick(candidates[selectedIndex]!)}>
        {confirmLabel}
      </button>
      <button className="feature-list-remove" onClick={onCancel} aria-label="Cancel">
        {'✕'}
      </button>
    </div>
  );
}
