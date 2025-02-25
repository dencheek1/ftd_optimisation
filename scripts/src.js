"use strict";

import { generateField } from './view.js';
import Field from './field.js';
import { GAInstance, GASearch } from './search.js';
import TilingField from './tiling_field.js';


// generateField(new Field(4));

const range = document.getElementById('value');
if (range.value) {
    generateField(range.value);
}
else {
    generateField(11);
}
let field = new Field(5);
// field.setClipState(4,4,3);

// console.log(field.getClipState(17,17));
let empty = new GAInstance(field);
empty = GASearch.findSolution(empty,2)[0];

console.log('\n')
// empty.recalculateField();
console.log(empty.toString())
empty = empty.mutate();
console.log(empty)
empty.recalculateField();
console.log(empty.score());
console.log(empty.toString())
    empty.setLoader(0, 0, !empty.isLoaderSet(0,0));
empty.recalculateField();
console.log(empty.toString())
console.log(empty.score());
    empty.setLoader(0, 0, !empty.isLoaderSet(0,0));
console.log(empty.toString());
// empty.recalculateField();