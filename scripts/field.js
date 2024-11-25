class Field {
  constructor(size) {
    //check if size < 32;
    this.size = size;
    this.fieldActive = [];
    this.fieldState = [];
    for (let i = 0; i < size; i++) {
      let active = -1;
      // let state = 1108378657;
      let state = -1;
      this.fieldActive[i] = active;
      // this.fieldState[i] = state << (2 * (i ) % 5) ;
      this.fieldState[i] = state;
    }
  }

  optimalPattern(offset){
      let state = 1108378657;
    for (let i = 0; i < this.size; i++) {
      this.fieldState[i] = state << (2 * (i + (offset % 5) ) % 5) ;
    }
  }

  hasSetNeighbor(x, y) {
    return (
      this.isSet(x - 1, y) ||
      this.isSet(x, y - 1) ||
      this.isSet(x + 1, y) ||
      this.isSet(x, y + 1)
    );
  }

  static fieldFromView(fieldView) {
    //TODO verify values before use
    let childNodes = fieldView.childNodes;
    let field = new Field(childNodes.length);

    childNodes.forEach((column) =>
      column.childNodes.forEach((cell) => {
        if (cell.hasAttribute("disabled")) {
          let x = cell.getAttribute("x");
          let y = cell.getAttribute("y");
          field.makeInactive(x, y);
          field.setState(x, y, false);
        }
      })
    );
    return field;
  }

  static newEmptyField(size) {
    let field = new Field(size);

    for (let i = 0; i < field.size; i++) {
      field.fieldState[i] = 0;
    }

    return field;
  }

  isSet(x, y) {
    return this.isPositionValid(x, y) && !!(this.fieldState[y] & (1 << x));
  }

  isActive(x, y) {
    return this.isPositionValid(x, y) && !!(this.fieldActive[y] & (1 << x));
    // if (this.isPositionValid(x, y)) return this.fieldData.array[y][x].active;
    // return false;
  }

  makeActive(x, y) {
    if (this.isPositionValid(x, y)) {
      this.fieldActive[y] = this.fieldActive[y] | (1 << y);
    }
  }

  makeInactive(x, y) {
    // if (this.isPositionValid(x, y)) this.fieldData.array[y][x].active = false;
    if (this.isPositionValid(x, y)) {
      this.fieldActive[y] = this.fieldActive[y] & ~(1 << x);
    }
  }

  toggleCell(x, y) {
    if (this.isPositionValid(x, y))
      this.fieldState[y] = this.fieldState[y] ^ (1 << x);
  }

  setState(x, y, state) {
    if (this.isPositionValid(x, y)) {
      this.fieldState[y] = (this.fieldState[y] & ~(1 << x)) | (!!state << x);
    }
  }

  isPositionValid(x, y) {
    if (x >= 0 && y >= 0 && (x < this.size) & (y < this.size)) {
      return true;
    }
    return false;
  }

  toString() {
    let string = '';

    for (let i = 0; i < this.size; i++) {
      string += "\n";
      for (let j = 0; j < this.size; j++) {
        if ((this.fieldActive[i] & (1 << j)) != 0)
          string += (this.fieldState[i] & (1 << j)) != 0 ? "o" : " ";
        else string += "+";
      }
    }
    // let string = this.fieldData.array.reduce((acc, val) =>
    //     acc += val.reduce((iacc, ival) =>
    //         iacc += ival.active ? ival.state ? '*' : '0' : ' ',
    //         '') + '\n',
    //     '')
    return string;
  }

  getSize() {
    return this.size;
  }
  //Field data representation?

  size;
  fieldState;
  fieldActive;
  fieldData;
}

export default Field;
