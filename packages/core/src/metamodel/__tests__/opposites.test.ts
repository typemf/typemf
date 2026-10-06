import { describe, expect, it } from 'vitest';
import {
  createInstanceOf,
  DynamicEFactoryImpl,
  EClassifier,
  EClassImpl,
  EcoreFactoryImpl,
  EcorePackageImpl,
  EList,
  EObject,
  EPackageImpl,
  EReferenceImpl,
  createProxy,
  URI,
} from '../../index.js';
// Ecore must be initialized before metaclass instances can be created.
void EcorePackageImpl.eINSTANCE;

/**
 *   EClass Department
 *     EReference employees : Person[*], containment, opposite Person.department
 *   EClass Person
 *     EReference department : Department,  opposite Department.employees
 *     EReference friends    : Person[*],   opposite Person.friends (self-opposite)
 *     EReference mentor     : Person,      opposite Person.mentee
 *     EReference mentee     : Person,      opposite Person.mentor
 *     EReference projects   : Project[*],  opposite Project.members
 *   EClass Project
 *     EReference members    : Person[*],   opposite Person.projects
 */
function buildOppositeMetamodel() {
  const departmentClass = new EClassImpl();
  departmentClass.setName('Department');
  const personClass = new EClassImpl();
  personClass.setName('Person');
  const projectClass = new EClassImpl();
  projectClass.setName('Project');

  const nextId = new Map<EClassImpl, number>();
  const ref = (owner: EClassImpl, name: string, type: EClassImpl, upper: number, containment = false) => {
    const r = new EReferenceImpl();
    r.setName(name);
    r.setEType(type);
    r.setUpperBound(upper);
    r.setContainment(containment);
    const id = nextId.get(owner) ?? 0;
    nextId.set(owner, id + 1);
    r.setFeatureID(id);
    r.setEContainingClass(owner);
    owner.getEStructuralFeatures().add(r);
    return r;
  };
  const link = (a: EReferenceImpl, b: EReferenceImpl) => {
    a.setEOpposite(b);
    b.setEOpposite(a);
  };

  const employeesRef = ref(departmentClass, 'employees', personClass, -1, true);
  const departmentRef = ref(personClass, 'department', departmentClass, 1);
  const friendsRef = ref(personClass, 'friends', personClass, -1);
  const mentorRef = ref(personClass, 'mentor', personClass, 1);
  const menteeRef = ref(personClass, 'mentee', personClass, 1);
  const projectsRef = ref(personClass, 'projects', projectClass, -1);
  const membersRef = ref(projectClass, 'members', personClass, -1);

  link(employeesRef, departmentRef);
  friendsRef.setEOpposite(friendsRef);
  link(mentorRef, menteeRef);
  link(projectsRef, membersRef);

  const pkg = new EPackageImpl();
  pkg.setName('org');
  for (const c of [departmentClass, personClass, projectClass]) {
    pkg.getEClassifiers().add(c);
    c.setEPackage(pkg);
  }
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());

  return {
    newDepartment: () => createInstanceOf(departmentClass),
    newPerson: () => createInstanceOf(personClass),
    newProject: () => createInstanceOf(projectClass),
    employeesRef,
    departmentRef,
    friendsRef,
    mentorRef,
    menteeRef,
    projectsRef,
    membersRef,
  };
}

const list = (o: EObject, f: EReferenceImpl) => o.eGet(f) as EList<EObject>;

describe('opposite (inverse) reference maintenance', () => {
  it('many-to-many: adding on one side adds on the other', () => {
    const m = buildOppositeMetamodel();
    const alice = m.newPerson();
    const apollo = m.newProject();

    list(alice, m.projectsRef).add(apollo);
    expect(list(apollo, m.membersRef).toArray()).toEqual([alice]);

    list(apollo, m.membersRef).remove(alice);
    expect(list(alice, m.projectsRef).isEmpty()).toBe(true);
  });

  it('many-to-many: clear and eSet update the other side', () => {
    const m = buildOppositeMetamodel();
    const alice = m.newPerson();
    const bob = m.newPerson();
    const apollo = m.newProject();
    const gemini = m.newProject();

    apollo.eSet(m.membersRef, [alice, bob]);
    expect(list(alice, m.projectsRef).toArray()).toEqual([apollo]);
    expect(list(bob, m.projectsRef).toArray()).toEqual([apollo]);

    gemini.eSet(m.membersRef, [bob]);
    list(apollo, m.membersRef).clear();
    expect(list(alice, m.projectsRef).isEmpty()).toBe(true);
    expect(list(bob, m.projectsRef).toArray()).toEqual([gemini]);
  });

  it('self-opposite many-valued reference is symmetric', () => {
    const m = buildOppositeMetamodel();
    const alice = m.newPerson();
    const bob = m.newPerson();

    list(alice, m.friendsRef).add(bob);
    expect(list(bob, m.friendsRef).toArray()).toEqual([alice]);

    list(bob, m.friendsRef).remove(alice);
    expect(list(alice, m.friendsRef).isEmpty()).toBe(true);
  });

  it('one-to-one: setting one side sets the other and detaches displaced partners', () => {
    const m = buildOppositeMetamodel();
    const alice = m.newPerson();
    const bob = m.newPerson();
    const carol = m.newPerson();

    bob.eSet(m.mentorRef, alice);
    expect(alice.eGet(m.menteeRef)).toBe(bob);

    // Carol takes Alice as mentor: Bob loses his mentor.
    carol.eSet(m.mentorRef, alice);
    expect(alice.eGet(m.menteeRef)).toBe(carol);
    expect(bob.eIsSet(m.mentorRef)).toBe(false);

    // Carol switches mentor to Bob: Alice loses her mentee.
    carol.eSet(m.mentorRef, bob);
    expect(bob.eGet(m.menteeRef)).toBe(carol);
    expect(alice.eIsSet(m.menteeRef)).toBe(false);

    carol.eUnset(m.mentorRef);
    expect(bob.eIsSet(m.menteeRef)).toBe(false);
  });

  it('containment with a container reference: adding sets the back-pointer', () => {
    const m = buildOppositeMetamodel();
    const sales = m.newDepartment();
    const alice = m.newPerson();

    list(sales, m.employeesRef).add(alice);
    expect(alice.eGet(m.departmentRef)).toBe(sales);
    expect(alice.eContainer()).toBe(sales);

    list(sales, m.employeesRef).remove(alice);
    expect(alice.eIsSet(m.departmentRef)).toBe(false);
    expect(alice.eContainer()).toBeUndefined();
  });

  it('containment with a container reference: setting the back-pointer moves the child', () => {
    const m = buildOppositeMetamodel();
    const sales = m.newDepartment();
    const research = m.newDepartment();
    const alice = m.newPerson();

    alice.eSet(m.departmentRef, sales);
    expect(list(sales, m.employeesRef).toArray()).toEqual([alice]);
    expect(alice.eContainer()).toBe(sales);
    expect(alice.eContainingFeature()).toBe(m.employeesRef);

    alice.eSet(m.departmentRef, research);
    expect(list(sales, m.employeesRef).isEmpty()).toBe(true);
    expect(list(research, m.employeesRef).toArray()).toEqual([alice]);
    expect(alice.eContainer()).toBe(research);

    alice.eUnset(m.departmentRef);
    expect(list(research, m.employeesRef).isEmpty()).toBe(true);
    expect(alice.eContainer()).toBeUndefined();
  });

  it('moving a child between containment lists updates old list and back-pointer', () => {
    const m = buildOppositeMetamodel();
    const sales = m.newDepartment();
    const research = m.newDepartment();
    const alice = m.newPerson();

    list(sales, m.employeesRef).add(alice);
    list(research, m.employeesRef).add(alice);

    expect(list(sales, m.employeesRef).isEmpty()).toBe(true);
    expect(list(research, m.employeesRef).toArray()).toEqual([alice]);
    expect(alice.eGet(m.departmentRef)).toBe(research);
    expect(alice.eContainer()).toBe(research);
  });
});

describe('opposites of the Ecore metamodel', () => {
  const ecore = EcorePackageImpl.eINSTANCE;
  const factory = new EcoreFactoryImpl();

  it('has an eOpposite on both ends of every bidirectional Ecore reference', () => {
    expect(ecore.getEPackage_EClassifiers().getEOpposite()).toBe(ecore.getEClassifier_EPackage());
    expect(ecore.getEClassifier_EPackage().getEOpposite()).toBe(ecore.getEPackage_EClassifiers());
  });

  it('sets the back-reference when a child is added', () => {
    const pkg = factory.createEPackage();
    const subpackage = factory.createEPackage();
    const eClass = factory.createEClass();
    const attribute = factory.createEAttribute();
    const operation = factory.createEOperation();
    const parameter = factory.createEParameter();
    const eEnum = factory.createEEnum();
    const literal = factory.createEEnumLiteral();

    pkg.getESubpackages().add(subpackage);
    pkg.getEClassifiers().add(eClass);
    eClass.getEStructuralFeatures().add(attribute);
    eClass.getEOperations().add(operation);
    operation.getEParameters().add(parameter);
    eEnum.getELiterals().add(literal);

    expect(subpackage.getESuperPackage()).toBe(pkg);
    expect(eClass.getEPackage()).toBe(pkg);
    expect(attribute.getEContainingClass()).toBe(eClass);
    expect(operation.getEContainingClass()).toBe(eClass);
    expect(parameter.getEOperation()).toBe(operation);
    expect(literal.getEEnum()).toBe(eEnum);
  });

  it('clears the back-reference on remove and updates both packages on a move', () => {
    const first = factory.createEPackage();
    const second = factory.createEPackage();
    const eClass = factory.createEClass();

    first.getEClassifiers().add(eClass);
    first.getEClassifiers().remove(eClass);
    expect(eClass.getEPackage()).toBeUndefined();

    first.getEClassifiers().add(eClass);
    second.getEClassifiers().add(eClass);
    expect(eClass.getEPackage()).toBe(second);
    expect(first.getEClassifiers().isEmpty()).toBe(true);
    expect(second.getEClassifiers().toArray()).toEqual([eClass]);
  });
});

describe('opposite maintenance with an unresolved proxy', () => {
  const ecore = EcorePackageImpl.eINSTANCE;
  const factory = new EcoreFactoryImpl();

  it('adding an unresolved proxy to a containment feature with an eOpposite does not throw, and sets the opposite too', () => {
    const pkg = factory.createEPackage();
    const proxy = createProxy(ecore.getEClass(), URI.parse('typemf-host:/1#self')) as EClassifier;

    expect(() => pkg.getEClassifiers().add(proxy)).not.toThrow();
    expect(pkg.getEClassifiers().toArray()).toEqual([proxy]);
    expect(proxy.eContainer()).toBe(pkg);
    // Unlike a throwing proxy, a real (if not-yet-resolved) instance can have its opposite
    // feature set correctly - this is already known from context, independent of whatever the
    // proxy's own document eventually says.
    expect(proxy.getEPackage()).toBe(pkg);
  });

  it('a second unresolved proxy is still added after the first', () => {
    const pkg = factory.createEPackage();
    const first = createProxy(ecore.getEClass(), URI.parse('typemf-host:/1#self')) as EClassifier;
    const second = createProxy(ecore.getEClass(), URI.parse('typemf-host:/2#self')) as EClassifier;

    pkg.getEClassifiers().add(first);
    pkg.getEClassifiers().add(second);

    expect(pkg.getEClassifiers().toArray()).toEqual([first, second]);
  });
});
