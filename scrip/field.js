
class Field {
    constructor(size) {
        let field = { array: [] };
        for (let i = 0; i < size; i++) {
            let column = [];
            for (let j = 0; j < size; j++) {
                //create cell
                column.push({ active: true, state: true })
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
                field.setState(x,y, false);
            } 
        }
        ));
        return field;
    }

    static newEmptyField(size){
        let field = new Field(size);

        field.fieldData.array.forEach( el => el.forEach( cell => cell.state = false));
        return field; 
    }

    isSet(x, y){
        return this.isPositionValid(x, y) ? this.fieldData.array[y][x].state : false;
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
            this.fieldData.array[y][x].state = !(this.fieldData.array[y][x].state);
    }

    setState(x,y, state){
        if (this.isPositionValid(x,y))  this.fieldData.array[y][x].state = state;
    }


    isPositionValid(x, y) {
        let size = this.fieldData.array.length;
        if (x >= 0 && y >= 0 && x < size & y < size) {
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


export default Field