// @defer only creates its child once the trigger fires,
// so a viewChild() on it starts out undefined.
type Gallery = { photoCount: () => number };
let galleryRef: Gallery | undefined;

console.log('before:', galleryRef?.photoCount() ?? 'undefined');

galleryRef = { photoCount: () => 12 }; // the @defer block renders

console.log('after:', galleryRef.photoCount());
