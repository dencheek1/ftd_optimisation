"use strict";

import { generateField } from './view.js';
import Field from './field.js';
import { GAInstance, GASearch } from './search.js';


// generateField(new Field(4));

const range = document.getElementById('value');
if (range.value) {
    generateField(range.value);
}
else {
    generateField(11);
}
let field = new Field(7);
field.makeInactive(0,0);
field.makeInactive(1,0);
field.makeInactive(0,1);
field.makeInactive(5,0);
field.makeInactive(6,0);
field.makeInactive(6,1);
field.makeInactive(0,5);
field.makeInactive(0,6);
field.makeInactive(1,6);
field.makeInactive(6,5);
field.makeInactive(5,6);
field.makeInactive(6,6);
let empty = new GAInstance(field);

console.log(empty);