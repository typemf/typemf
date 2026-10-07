import { describe, expect, it } from 'vitest';
import { EditHistory } from '../edit-history.js';

describe('EditHistory', () => {
  it('is clean at first and dirty after an edit', () => {
    const history = new EditHistory();
    expect(history.isDirty()).toBe(false);
    history.recordEdit();
    expect(history.isDirty()).toBe(true);
  });

  it('is clean again after undoing back to the saved state, dirty after redo', () => {
    const history = new EditHistory();
    history.recordEdit();
    history.undone();
    expect(history.isDirty()).toBe(false);
    history.redone();
    expect(history.isDirty()).toBe(true);
  });

  it('treats the position of a save as the clean state', () => {
    const history = new EditHistory();
    history.recordEdit();
    history.markSaved();
    expect(history.isDirty()).toBe(false);
    history.undone();
    expect(history.isDirty()).toBe(true);
    history.redone();
    expect(history.isDirty()).toBe(false);
  });

  it('stays dirty when a new edit replaces the redo branch past the saved state', () => {
    const history = new EditHistory();
    history.recordEdit();
    history.recordEdit();
    history.markSaved();
    history.undone();
    history.undone();
    history.recordEdit();
    history.redone(); // the saved position is no longer reachable, even at the same index
    history.undone();
    expect(history.isDirty()).toBe(true);
    history.recordEdit();
    expect(history.isDirty()).toBe(true);
  });

  it('starts dirty for a document restored from a backup, until it is saved', () => {
    const history = new EditHistory(true);
    expect(history.isDirty()).toBe(true);
    history.markSaved();
    expect(history.isDirty()).toBe(false);
  });

  it('reset makes the current state clean with nothing to undo', () => {
    const history = new EditHistory();
    history.recordEdit();
    history.reset();
    expect(history.isDirty()).toBe(false);
  });
});
