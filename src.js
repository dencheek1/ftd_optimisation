"use strict";

function generateField(size) {
    //TODO reverse dependencie, create data model based on field view 
    // * would be nice to have methods for two ways
    const fieldView = document.getElementById('field');
    for (let xIndex = 0; xIndex < size; xIndex++) {

        let column = document.createElement('div');
        column.setAttribute('class', "field__column")
        for (let yIndex = 0; yIndex < size; yIndex++) {

            let cell = document.createElement('div');
            cell.setAttribute('class', 'field__cell');
            cell.setAttribute('x', xIndex);
            cell.setAttribute('y', yIndex);
            column.appendChild(cell);
        }
        fieldView.appendChild(column);
    }

    fieldView.addEventListener('mouseover', drawEvent);
    fieldView.addEventListener('mousedown', clickDraw);
    fieldView.setAttribute('onContextMenu', 'return false;');
    fieldView.setAttribute('onDragStart', 'return false;')
}



function drawEvent(e) {
    if ((e.buttons & 1) == true)
        e.target.setAttribute('disabled', '');
    else if ((e.buttons & 2) == 2)
        e.target.removeAttribute('disabled');
}

function clickDraw(e) {
    console.log(e.button)
    if (e.button == 0)
        e.target.setAttribute('disabled', '');
    else if (e.button == 2) e.target.removeAttribute('disabled');
}

function resetField() {
    const field = document.getElementById('field');
    field.childNodes.forEach(fc => fc.childNodes.forEach(c => c.removeAttribute('disabled')));
    // field.textContent = '';
}

function clearField() {
    const field = document.getElementById('field');
    field.textContent = '';
}

function createFieldCell() {
    let cell = document.createElement('div');
    cell.setAttribute('class', 'field-cell');
    return cell;
}

function createColumn() {
    let column = document.createElement('div');
    column.setAttribute('class', 'field-column');
    return column;
}

class Field {
    constructor(size) {
        let field = { array: [] };
        for (let i = 0; i < size; i++) {
            let column = [];
            for (let j = 0; j < size; j++) {

                //create cell
                column.push({ active: true, state: false })
            }
            //push line to field
            field.array.push(column);
        }
        this.fieldData = field;
    }

    static fieldFromView(fieldView) {
        //TODO verify values before use
        let childNodes = fieldView.childNodes;
        let field = new Field(childNodes.length);

        childNodes.forEach(column => column.childNodes.forEach(cell => {
            if (cell.hasAttribute('disabled')){
                let x = cell.getAttribute('x');
                let y = cell.getAttribute('y');
                field.makeInactive(x, y);
            } 
            console.log(cell.hasAttribute('disabled'))
        }
        ));
        return field;
    }

    isActive(x, y) {
        if (this.isPositionValid(x, y)) return this.fieldData.array[y][x].active;
        return false;
    }

    makeActive(x, y) {
        if (this.isPositionValid(x, y)) this.fieldData.array[y][x].active = false;
    }

    makeInactive(x, y) {
        if (this.isPositionValid(x, y)) this.fieldData.array[y][x].active = false;
    }

    toggleCell(x, y) {
        if (this.isPositionValid(x, y))
            this.fieldData.array[y][x].state = !this.fieldData.array[y][x].state;
    }

    isPositionValid(x, y) {
        let size = this.fieldData.array.length;
        if (x > 0 && y > 0 && x < size & y < size) {
            return true;
        }
        return false;
    }

    toString() {
        let string = this.fieldData.array.reduce((acc, val) =>
            acc += val.reduce((iacc, ival) =>
                iacc += ival.active ? ival.state ? '*' : '0' : ' ',
                '') + '\n',
            '')
        return string;
    }

    getSize() {
        return this.fieldData.array.length;
    }
    //Field data representation?

    getColumn() { }
    fieldData;
}

function searchField(){
    const field = document.getElementById('field');
    let f = Field.fieldFromView(field);
    console.log(f.toString());
}
// generateField(new Field(4));

const reset = document.getElementsByClassName('input__reset-button')[0];
if (reset) reset.addEventListener('mouseup', resetField);
const search = document.getElementsByClassName('input__search-button')[0];
if (search) search.addEventListener('mouseup', searchField);
console.log(reset);

generateField(11)

let f = Field.fieldFromView(document.getElementById('field'));
f.makeInactive(3,3)
console.log(f.toString());