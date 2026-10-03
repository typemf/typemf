import { EClassImpl, EcorePackageImpl, EPackageImpl, EReferenceImpl } from '@typemf/core';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

void EcorePackageImpl.eINSTANCE;

/**
 *   EClass Team
 *     EReference members : Person[*], containment, opposite Person.team
 *   EClass Person
 *     EReference team    : Team,                   opposite Team.members
 *     EReference friends : Person[*],              opposite Person.friends
 */
function buildTeamPackage(): EPackageImpl {
  const team = new EClassImpl();
  team.setName('Team');
  const person = new EClassImpl();
  person.setName('Person');

  const reference = (owner: EClassImpl, name: string, type: EClassImpl, upper: number, containment = false) => {
    const r = new EReferenceImpl();
    r.setName(name);
    r.setEType(type);
    r.setUpperBound(upper);
    r.setContainment(containment);
    owner.getEStructuralFeatures().add(r);
    return r;
  };
  const members = reference(team, 'members', person, -1, true);
  const teamRef = reference(person, 'team', team, 1);
  const friends = reference(person, 'friends', person, -1);
  members.setEOpposite(teamRef);
  teamRef.setEOpposite(members);
  friends.setEOpposite(friends);

  const pkg = new EPackageImpl();
  pkg.setName('teams');
  pkg.setNsURI('https://typemf.dev/samples/teams');
  pkg.setNsPrefix('teams');
  pkg.getEClassifiers().add(team);
  pkg.getEClassifiers().add(person);
  return pkg;
}

describe('generated code for a metamodel with opposites', () => {
  let dir: string;
  const jsPaths = new Map<string, string>();
  const load = async (path: string): Promise<any> => import(jsPaths.get(path)!);

  beforeAll(async () => {
    dir = await mkdtemp(join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), '.tmp-generated-'));
    for (const file of generate(buildTeamPackage(), typescriptTemplateSet, {})) {
      const jsPath = join(dir, file.path.replace(/\.ts$/, '.js'));
      const { outputText } = ts.transpileModule(file.content, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      });
      await mkdir(dirname(jsPath), { recursive: true });
      await writeFile(jsPath, outputText, 'utf-8');
      jsPaths.set(file.path, jsPath);
    }
  });

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('registers the opposites in the generated package', async () => {
    const pkg = (await load('impl/TeamsPackageImpl.ts')).TeamsPackageImpl.eINSTANCE;
    expect(pkg.getTeam_Members().getEOpposite()).toBe(pkg.getPerson_Team());
    expect(pkg.getPerson_Team().getEOpposite()).toBe(pkg.getTeam_Members());
    expect(pkg.getPerson_Friends().getEOpposite()).toBe(pkg.getPerson_Friends());
  });

  it('keeps both ends in sync', async () => {
    const factory = (await load('impl/TeamsPackageImpl.ts')).TeamsPackageImpl.eINSTANCE.getEFactoryInstance();
    const red = factory.createTeam();
    const blue = factory.createTeam();
    const alice = factory.createPerson();
    const bob = factory.createPerson();

    red.getMembers().add(alice);
    expect(alice.getTeam()).toBe(red);

    alice.setTeam(blue);
    expect(red.getMembers().isEmpty()).toBe(true);
    expect(blue.getMembers().toArray()).toEqual([alice]);

    blue.getMembers().remove(alice);
    expect(alice.getTeam()).toBeUndefined();

    alice.getFriends().add(bob);
    expect(bob.getFriends().toArray()).toEqual([alice]);
  });
});
