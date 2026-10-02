import { getTypeMfRuntime } from '@typemf/vscode-runtime';
import { BookImpl, LibraryFactory, LibraryPackage } from 'library-model';
import * as vscode from 'vscode';

const LIBRARY_NS_URI = 'https://typemf.dev/examples/library';

/** A book with a reading note, derived from the generated BookImpl of the library-model extension. */
class AnnotatedBookImpl extends BookImpl {
  note = '';
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const runtime = await getTypeMfRuntime();

  context.subscriptions.push(
    vscode.commands.registerCommand('libraryExtension.createSample', () => {
      const pkg = runtime.packageRegistry.getPackage(LIBRARY_NS_URI) as LibraryPackage;
      const library = (pkg.getEFactoryInstance() as LibraryFactory).createLibrary();
      const book = new AnnotatedBookImpl();
      book.setTitle('Dune');
      book.note = 'Read again';
      library.getBooks().add(book);

      vscode.window.showInformationMessage(
        `'${book.getTitle()}' (${book.note}) is in the library: ${book.eContainer() === library}, ` +
          `is a Book of the shared model: ${book.eClass() === pkg.getBook()}`
      );
    })
  );
}

export function deactivate(): void {}
