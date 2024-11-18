"use strict";

import { generateField } from './view.js';
import Field from './field.js';


// generateField(new Field(4));


generateField(11)

let f = Field.fieldFromView(document.getElementById('field'));
f.makeInactive(3,3)