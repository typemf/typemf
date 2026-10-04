import { Disposable } from './Disposable.js';
import { EClass } from './EClass.js';
import { EList } from './EList.js';
import { EStructuralFeature } from './EStructuralFeature.js';
import { Notification } from './Notification.js';

/**
 * The universal reflective base type. Every model instance - whether it was
 * produced by generated code or by DynamicEObjectImpl against a parsed-only
 * .ecore file - implements this interface, and it is the interface all
 * generic (reflection-driven) tooling, such as an instance editor, is
 * written against.
 */
export interface EObject {
  /** The metaclass describing this object's structure. */
  eClass(): EClass;

  /** The object containing this one, if this object is someone's child. */
  eContainer(): EObject | undefined;

  /** The containment feature this object was set/added into, if any. */
  eContainingFeature(): EStructuralFeature | undefined;

  /** Direct containment children, across every containment feature. */
  eContents(): EList<EObject>;

  /** Every containment descendant, depth-first. */
  eAllContents(): EObject[];

  /** Generic getter, dispatched by feature. */
  eGet(feature: EStructuralFeature): unknown;

  /** Generic setter, dispatched by feature. */
  eSet(feature: EStructuralFeature, value: unknown): void;

  /** Whether the feature currently holds a non-default value. */
  eIsSet(feature: EStructuralFeature): boolean;

  /** Reset the feature to its default/unset state. */
  eUnset(feature: EStructuralFeature): void;

  /**
   * Whether this object is an unresolved placeholder for an object that
   * lives in another document (see docs/dynamic-instantiation-notes.md for
   * the current, deliberately minimal, proxy story).
   */
  eIsProxy(): boolean;

  /**
   * A stable, human-readable identity string (className_idValue when an ID
   * attribute is set, otherwise a generated fallback), used as the default
   * cross-reference key during serialization.
   */
  fullId(): string;

  /**
   * Real EMF's Notifier/Adapter mechanism, adapted: a plain callback, not a ported Adapter
   * interface (getTarget/setTarget/isAdapterForType/notifyChanged) - Adapter's four-method shape
   * exists largely because Java, when EMF was designed, had no first-class closures; this project
   * already uses the callback-based alternative throughout (vscode.EventEmitter<T>/Event<T> in
   * @typemf/vscode-runtime and instance-editor).
   *
   * `feature` omitted subscribes to every change on this object; a specific feature scopes the
   * subscription to only that one. Filtering happens once, inside the dispatcher, not duplicated
   * inside every listener's own body - real EMF's isAdapterForType exists for a related but
   * distinct purpose (finding an already-attached adapter of a given kind, not filtering
   * notification delivery), which this deliberately does not port; there is no equivalent need
   * here since callback-based subscription has no "kind of adapter" to look up in the first
   * place.
   */
  onDidChange(listener: (notification: Notification) => void, feature?: EStructuralFeature): Disposable;

  /** Whether notifications are currently being delivered to listeners. Defaults to true. */
  eDeliver(): boolean;

  /**
   * Suppresses (false) or resumes (true) notification delivery - genuinely useful, not a
   * Java-ism: bulk operations (e.g. the loader constructing a fresh object graph from a file)
   * want to suppress a flood of individual notifications during construction. Does not affect
   * eDidAdd/eDidRemove's own containment/opposite/cache-invalidation bookkeeping, which always
   * runs regardless - only whether onDidChange listeners are actually called.
   */
  eSetDeliver(deliver: boolean): void;
}
