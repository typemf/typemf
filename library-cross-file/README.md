# Cross-file reference with an opposite

`city.xmi` and `campus.xmi` reference each other through the opposite pair `Writer.books` / `Book.author`.

- `city.xmi`, `campus.xmi`: EMF-style relative `href`s (`campus.xmi#//@books.0`). Eclipse EMF reads these. TypeMF 0.6.0 throws `Not a valid absolute URI` when loading them.
- `absolute-uris/`: the same files with absolute `file://` URIs, which TypeMF can load. If you move the folder, update the `href`s.
