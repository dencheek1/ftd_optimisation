import Field from './field.js'

function drawEvent(e) {
    if ((e.buttons & 1) == true)
        e.target.setAttribute('disabled', '');
    else if ((e.buttons & 2) == 2)
        e.target.removeAttribute('disabled');
}

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

function generateViewNode(field) {
    const node = document.createElement('div');
    node.setAttribute('class', 'field')
    for (let xIndex = 0; xIndex < field.fieldData.array.length; xIndex++) {

        let column = document.createElement('div');
        column.setAttribute('class', "field__column")
        for (let yIndex = 0; yIndex < field.fieldData.array.length; yIndex++) {

            let cell = document.createElement('div');
            cell.setAttribute('class', 'field__cell');
            cell.setAttribute('x', xIndex);
            cell.setAttribute('y', yIndex);
            if( !field.isActive(xIndex, yIndex) ) cell.setAttribute('disabled', '');
            if( !field.isSet(xIndex, yIndex) ) cell.setAttribute('active', ''); 
            column.appendChild(cell);
        }
        node.appendChild(column);
    }

    return node;
}

function clickDraw(e) {
    if (e.button == 0)
        e.target.setAttribute('disabled', '');
    else if (e.button == 2) e.target.removeAttribute('disabled');
}

function resetField() {
    const field = document.getElementById('field');
    field.childNodes.forEach(fc => fc.childNodes.forEach(c => c.removeAttribute('disabled')));
    // field.textContent = '';
}

function searchField() {
    const field = document.getElementById('field');
    let f = Field.fieldFromView(field);
    console.log(f.toString());
    // let view = generateViewNode(f);
    // const result = document.getElementsByClassName('results')[0];
    // if(result) {
    //     result.textContent = ''
    //     result.appendChild(view);
    
    // }
}

const reset = document.getElementsByClassName('input__reset-button')[0];
if (reset) reset.addEventListener('mouseup', resetField);
const search = document.getElementsByClassName('input__search-button')[0];
if (search) search.addEventListener('mouseup', searchField);

export { drawEvent, generateField };