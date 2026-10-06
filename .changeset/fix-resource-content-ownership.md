---
'@typemf/core': patch
---

Fix `Resource.getContents()` not keeping content ownership consistent (EMF semantics: adding an object makes a resource its sole owner, and the list is unique):

- Adding an object that is currently a root of a *different* resource left it there too; it is now removed from that resource's contents first.
- Adding an object that is currently contained in some other object's containment feature left it there too; it is now detached from that container first.
- Adding the same root a second time duplicated it in the list; it is now a no-op.
