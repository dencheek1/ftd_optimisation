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
let field = new Field(4);
console.log(field.toString());
console.log(field.getClipState(0,0));
field.setClipState(4,4,3);
console.log(field.toString());

// console.log(field.getClipState(17,17));
let empty = new TilingField(field);
// console.log(field);
// console.log(empty);
// console.log(empty.score());
// console.log(empty.toString());
let res = GASearch.findSolution(empty, 2);
empty = res[0];
empty.score();
console.log(empty.score());
console.log(empty.toString());
empty.recalculateField();
console.log(empty.toString());
console.log(empty)

// res = GASearch.findSolution(empty, 2);
// empty = res[0];
// empty.score();
// // console.log(empty.score());
// console.log(empty.toString());

// let res = GASearch.findSolution(empty, 4);
// empty = res[0];

// console.log(res[0].score());
// console.log(res[0].toString());

// res = GASearch.findSolution(empty, 2);
// empty = res[0];
// console.log(res[0].score());
// console.log(res[0].toString());
// // console.log(res[0].breed(res[1]));

// res = GASearch.findSolution(empty, 8);
// empty =empty.score() < res[0].score() ? res[0] : empty;
// console.log(res[0].score());
// console.log(res[0].toString());
// res = GASearch.findSolution(empty, 2);
// empty =empty.score() < res[0].score() ? res[0] : empty;
// console.log(res[0].score());
// console.log(res[0].toString());
// res = GASearch.findSolution(empty, 2);
// empty =empty.score() < res[0].score() ? res[0] : empty;
// console.log(res[0].score());
// console.log(res[0].toString());
// res = GASearch.findSolution(empty, 2);
// empty =empty.score() < res[0].score() ? res[0] : empty;
// console.log(res[0].score());
// console.log(res[0].toString());
// res = GASearch.findSolution(empty, 2);
// empty =empty.score() < res[0].score() ? res[0] : empty;
// console.log(res[0].score());
// console.log(res[0].toString());
// res = GASearch.findSolution(empty, 2);
// empty =empty.score() < res[0].score() ? res[0] : empty;
// console.log(res[0].score());
// console.log(res[0].toString());
// res = GASearch.findSolution(empty, 2);
// empty =empty.score() < res[0].score() ? res[0] : empty;
// console.log(res[0].score());
// console.log(res[0].toString());
// res = GASearch.findSolution(empty, 2);
// empty =empty.score() < res[0].score() ? res[0] : empty;
// console.log(res[0].score());
// console.log(res[0].toString());