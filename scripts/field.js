class Field {
  constructor(size) {
    //check if size < 32;
    this.size = size;
    this.fieldActive = [];
    this.fieldState = [];
    //use 2 bits for a clip state
    this.clipState = [];
    for (let i = 0; i < size; i++) {
      let active = -1;
      let state = -1;
      this.fieldActive[i] = active;
      this.fieldState[i] = state;
      this.clipState[i * 2] = 0;
      this.clipState[i * 2 + 1] = 0;
    }
  }

  // TODO refactor. Make normal looking conditions.
  equalField(field) {
    if (field.size != this.size) return false;
    for (let i = 0; i < this.size; i++) {
      if (this.fieldActive[i] != field.fieldActive[i]) return false;
      if (this.clipState[i * 2] != field.clipState[i * 2]) return false;
      if (this.clipState[i * + 1] != field.clipState[i * 2 + 1]) return false;
    }
    return true;
  }

  optimalPattern(offset) {
    let state = 1108378657;
    for (let i = 0; i < this.size; i++) {
      this.fieldState[i] = state << (2 * (i + (offset % 5))) % 5;
    }
    return this;
  }

  hasSetNeighbor(x, y) {
    return (
      (this.isActive(x - 1, y) && this.isSet(x - 1, y)) ||
      (this.isActive(x + 1, y) && this.isSet(x + 1, y)) ||
      (this.isActive(x, y + 1) && this.isSet(x, y + 1)) ||
      (this.isActive(x, y - 1) && this.isSet(x, y - 1))
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
  }

  makeActive(x, y) {
    if (this.isPositionValid(x, y)) {
      this.fieldActive[y] = this.fieldActive[y] | (1 << y);
    }
  }

  makeInactive(x, y) {
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

  getClipState(x, y) {
    if (this.isPositionValid(x, y)) {
      return (this.clipState[y * 2 + (x > 16)] >> (x * 2) - ((x > 16) * 16) & 3);
    };
  }

  toString() {
    let string = "";

    for (let i = 0; i < this.size; i++) {
      string += "\n";
      for (let j = 0; j < this.size; j++) {
        if ((this.fieldActive[i] & (1 << j)) != 0)
          // string += (this.fieldState[i] & (1 << j)) != 0 ? "o" : " ";
          if (this.fieldState[i] & (1 << j) != 0) string += 'o';
          else {
            switch (this.getClipState(j, i)) {
              case 0: string += '1';
                break;
              case 1:string += '2';
                break;
              case 2:string += '3';
                break;
              case 3:string += '4';
                break;
            }
          }
      }
    }
    return string;
  }

  getSize() {
    return this.size;
  }

  //Field data representation?
  size;
  fieldState;
  fieldActive;
  clipState;
  fieldData;
}

export default Field;
