class Field {
  constructor(size) {
    //check if size < 32;
    this.changed = true;
    this.size = size;
    this.fieldActive = [];
    this.fieldState = [];
    this.fieldLoaders = [];
    //use 2 bits for a clip state
    this.clipState = [];
    for (let i = 0; i < size; i++) {
      let active = -1;
      let state = -1;
      this.fieldActive[i] = active;
      this.fieldState[i] = state;
      this.clipState[i * 2] = 0;
      this.clipState[i * 2 + 1] = 0;
      this.fieldLoaders[i] = active;
    }
  }

  // TODO refactor. Make normal looking conditions.
  equalField(field) {
    if (field.size != this.size) return false;
    for (let i = 0; i < this.size; i++) {
      if (this.fieldActive[i] != field.fieldActive[i]) return false;
    }
    return true;
  }

  optimalPattern(offset) {
    let state = 1108378657;
    for (let i = 0; i < this.size; i++) {
      this.fieldLoaders[i] = state << (2 * (i + (offset % 5))) % 5;
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
      this.changed = true;
    }
  }

  makeInactive(x, y) {
    if (this.isPositionValid(x, y)) {
      this.fieldActive[y] = this.fieldActive[y] & ~(1 << x);
      this.changed = true;
    }
  }

  toggleCell(x, y) {
    if (this.isPositionValid(x, y))
      this.fieldState[y] = this.fieldState[y] ^ (1 << x);
    this.changed = true;
  }

  setState(x, y, state) {
    if (this.isPositionValid(x, y)) {
      this.fieldState[y] = (this.fieldState[y] & (~(1 << x))) | (!!state << x);
      this.changed = true;
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
      return (this.clipState[y * 2 + (x > 16)] >> (x - ((x > 16) * 16)) * 2) & 3;
    };
  }

  setClipState(x, y, state) {
    if (this.isPositionValid(x, y)) {
      // * f!ing bit shenanigans
      // * clear current state with mask 
      let shift = (x - (x>16)*16)*2;
      let index = (y * 2) + (x > 16)
      let mask = ~(3 << shift );
      this.clipState[index] = ((this.clipState[index] & mask) | ((state % 4) << shift))
      // console.log(this.clipState[(y*2) + (x > 16)]);
    }
    this.changed = true;
  }

  setLoader(x, y, state) {
    if (this.isPositionValid(x, y)) {
      this.fieldLoaders[y] =
        (this.fieldLoaders[y] & ~(1 << x)) | (!!state << x);
      this.changed = true;
    }
  }

  isLoaderSet(x, y) {
    return this.isPositionValid(x, y) && !!(this.fieldLoaders[y] & (1 << x));
  }

  recalculateField(){
    // let size = this.size ** 2;
    for (let i = 0; i < this.size; i++) {
      this.fieldState[i] = 0;
    }

    for (let i = 0; i < this.size; i++) {
      for(let j = 0; j < this.size; j++){
        if(this.isActive(i,j) && this.isLoaderSet(i, j)){
          this.setState(i + 1, j, true);
          this.setState(i - 1, j, true);
          this.setState(i, j + 1, true);
          this.setState(i, j - 1, true);
          this.setState(i, j, true);
          
          this.setClipState(i + 1,j,1);
          this.setClipState(i - 1,j,3);
          this.setClipState(i,j + 1,0);
          this.setClipState(i,j - 1,2);
        }
      }
    }
  }

  toString() {
    let string = "";
    this.recalculateField()

    for (let i = 0; i < this.size; i++) {
      string += "\n";
      for (let j = 0; j < this.size; j++) {
        if ((this.fieldActive[i] & (1 << j)) != 0)
          if ((this.fieldLoaders[i] & (1 << j)) != 0) string += 'o';
          else if(this.isSet(j,i)){
            switch (this.getClipState(j, i)) {
              case 0: string += '0';
                break;
              case 1: string += '1';
                break;
              case 2: string += '2';
                break;
              case 3: string += '3';
                break;
            }
          }
          else string += ' '
        else {
          string += '*';
        }
      }
    }
    return string;
  }

  getSize() {
    return this.size;
  }

  //Field data representation?
  fieldLoaders;
  size;
  fieldState;
  fieldActive;
  clipState;
  fieldData;
}

export default Field;
