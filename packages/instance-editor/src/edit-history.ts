/**
 * Whether a document has unsaved changes, tracked the way VS Code's own undo stack does it (the
 * provider API reports edits and undo/redo but never says whether the document is dirty): a
 * position in the edit sequence and the position of the last save. An edit made while undone
 * past the saved position makes that position unreachable, so the document stays dirty however
 * far it is then undone or redone.
 */
export class EditHistory {
  private index = 0;
  private savePoint: number | undefined = 0;

  /** `initiallyDirty`: a document restored from a hot-exit backup already differs from its file. */
  constructor(initiallyDirty = false) {
    if (initiallyDirty) this.savePoint = undefined;
  }

  recordEdit(): void {
    if (this.savePoint !== undefined && this.savePoint > this.index) this.savePoint = undefined;
    this.index++;
  }

  undone(): void {
    this.index--;
  }

  redone(): void {
    this.index++;
  }

  markSaved(): void {
    this.savePoint = this.index;
  }

  /** The document was reloaded from its file: nothing to undo, nothing unsaved. */
  reset(): void {
    this.index = 0;
    this.savePoint = 0;
  }

  isDirty(): boolean {
    return this.savePoint !== this.index;
  }
}
