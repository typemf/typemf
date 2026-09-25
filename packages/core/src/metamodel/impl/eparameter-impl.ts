import { EClass } from '../api/eclass.js';
import { EParameter } from '../api/eparameter.js';
import { ETypedElementImpl } from './etyped-element-impl.js';
import { metamodelEClassNotBootstrapped } from './emodel-element-impl.js';

export class EParameterImpl extends ETypedElementImpl implements EParameter {
  eClass(): EClass {
    metamodelEClassNotBootstrapped('EParameterImpl');
  }
}
