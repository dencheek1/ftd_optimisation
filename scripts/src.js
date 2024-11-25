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
let field = new Field(6);

// field.makeInactive(3,3);
// field.toggleCell(0,2);
// console.log(field.toString())
// console.log(field.isActive(3,3))
// field.setState(2,2,false);
// field.setState(1,2,false);
// field.toggleCell(0,2);
// field.makeActive(3,3);
// console.log(field.toString())
// console.log(field.isActive(3,3))
let empty = new GAInstance(Field.newEmptyField(6));
let instance = new GAInstance(field);
instance.makeInactive(0, 0);
instance.makeInactive(1, 0);
instance.makeInactive(2, 2);
instance.makeInactive(3, 2);
console.log(instance.toString())
instance.optimalPattern(0);
console.log(instance.toString())
instance.optimalPattern(1);
console.log(instance.toString())
instance.optimalPattern(2);
console.log(instance.toString())
instance.optimalPattern(3);
console.log(instance.toString())
instance.optimalPattern(4);
console.log(instance.toString())

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