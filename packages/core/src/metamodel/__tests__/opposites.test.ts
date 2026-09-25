import { describe, expect, it } from 'vitest';
import { DynamicEFactoryImpl, EClassImpl, EList, EObject, EPackageImpl, EReferenceImpl } from '../../index.js';

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
    c.recomputeAllLists();
    pkg.getEClassifiers().add(c);
    c.setEPackage(pkg);
  }
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());

  return {
    newDepartment: () => departmentClass.createInstance(),
    newPerson: () => personClass.createInstance(),
    newProject: () => projectClass.createInstance(),
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
