"use strict";

import { generateField } from './view.js';
import Field from './field.js';
import { GAInstance, GASearch } from './search.js';


// generateField(new Field(4));

const range = document.getElementById('range');
if (range.value) {
    generateField(range.value);
}
else {
    generateField(11);
}

// let f = Field.fieldFromView(document.getElementById('field'));
// let empty = Field.newEmptyField(f.fieldData.array.length);
// f.makeInactive(3,3)
// let instance = new GAInstance(f);
// instance = instance.breed(empty);
// console.log(instance.score());

// console.log(instance.toString());

// let population = GASearch.findSolution(instance);
// population.forEach( el => console.log(el.toString() + ' ' + el.score()));

// document.getElementsByTagName('input')[0].focus();