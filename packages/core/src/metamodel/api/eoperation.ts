import { EClassifier } from './eclassifier.js';
import { EList } from './elist.js';
import { EParameter } from './eparameter.js';
import { ETypedElement } from './etyped-element.js';

/**
 * Signature metadata only. There is deliberately no eInvoke() here, matching
 * the original TMF: operation bodies live in hand-written *Impl subclasses
 * (generated-code mode) or nowhere at all (dynamic mode), and are never
 * reflectively callable.
 *
 * The inherited eType and bounds describe the return type.
 */
export interface EOperation extends ETypedElement {
  /** The operation's parameters, in order. */
  getEParameters(): EList<EParameter>;

  /** The exception types the operation declares it can throw. */
  getEExceptions(): EList<EClassifier>;
}
