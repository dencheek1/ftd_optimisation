// import Field from "./field.js";
import Field from "./field.js";
import GAInstance from "./search.js";

class TilingField extends GAInstance {
  constructor(field) {
    super(field);
    this.fieldLoaders = [];
    this.changed = true;
    if (field.pool_A == undefined) {
      this.pool_A = [field.size * field.size];
      this.pool_B = [field.size * field.size];
      for (let i = 0; i < field.size; i++) {
        this.fieldState[i] = 0;
        this.fieldLoaders[i] = 0;
        for (let j = 0; j < field.size; j++) {
          this.pool_A[i + j * field.size] = { x: i, y: j, type: 0 };
          this.pool_B[i + j * field.size] = { x: i, y: j, type: 0 };
        }
      }
    } else {
      this.pool_A = field.pool_A;
      this.pool_B = field.pool_B;
    }
    this.recalculateField();
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

  /*
    for now just asume
        
        10      111       01
    0 - 11  1 - 010   2 - 11   3 - 010
        10                01       111
  */
  doesFit(element) {
    let test = this.getTestArray(element.type);
    for (let val of test) {
      if (
        !this.isActive(element.x + val.x, element.y + val.y) ||
        this.isSet(element.x + val.x, element.y + val.y)
      )
        return false;
    }
    return true;
  }

  setType(element) {
    let test = this.getTestArray(element.type);
    let loader = this.getLoaderPosition(element.type);
    for (let val of test) {
      this.setState(element.x + val.x, element.y + val.y, true);
      let state =
        val.x == loader.x 
          ? val.y > loader.y
            ? 2
            : 0
          : val.x > loader.x
          ? 1
          : 3;
      this.setClipState(element.x + val.x, element.y + val.y, state);

      // console.log(`x: ${val.x + element.x} y ${val.y + element.y} vx: ${val.x} vy ${val.y} lx: ${loader.x} ly ${loader.y} state ${state}`)
    }
    this.setLoader(element.x + loader.x, element.y + loader.y, true);
    console.log(this.toString())
    this.changed = true;
  }

  getLoaderPosition(type) {
    switch (type) {
      case 0:
        return { x: 0, y: 1 };
      case 1:
        return { x: 1, y: 0 };
      case 2:
        return { x: 1, y: 1 };
      case 3:
        return { x: 1, y: 0 };
    }
  }

  /*
    for now just asume
        
        10      111       01
    0 - 11  1 - 010   2 - 11   3 - 010
        10                01       111
  */
  getTestArray(type) {
    const type_0 = [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 1 },
    ];
    const type_1 = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
    ];
    const type_2 = [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 0, y: 1 },
    ];
    const type_3 = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: -1 },
    ];
    switch (type) {
      case 0:
        return type_0;

      case 1:
        return type_1;

      case 2:
        return type_2;

      case 3:
        return type_3;
    }
    // return type_0;
  }

  toString() {
    let string = "";
    let loaders = "";
    // string += this.super.toString();
    string += "\n";
    for (let i = 0; i < this.size; i++) {
      string += "\n";
      loaders += "\n";
      for (let j = 0; j < this.size; j++) {
        if ((this.fieldActive[i] & (1 << j)) != 0) {
          if ((this.fieldLoaders[i] & (1 << j)) != 0) string += 'o';
          else {
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
          if ((this.fieldLoaders[i] & (1 << j)) != 0) loaders += "o";
          else {
            loaders += " ";
          }
        } else {
          string += "*";
          loaders += "*";
        }
      }
    }
    return string + "\n" + loaders;
  }

  breed(instance) {
    let clone = this.clone();
    let pool_B = [];
    for (let el of instance.pool_A) {
      pool_B.push({ x: el.x, y: el.y, type: el.type });
    }
    clone.pool_B = pool_B;
    // clone.recalculateField();
    clone.changed = true;
    return clone;
  }

  static createGeneration() {
    return null;
  }

  clone() {
    let clone = new TilingField(new Field(this.size));
    for (let i = 0; i < clone.size; i++) {
      clone.fieldState[i] = this.fieldState[i];
      clone.fieldActive[i] = this.fieldActive[i];
      clone.fieldLoaders[i] = this.fieldLoaders[i];
      clone.clipState[i * 2] = this.clipState[i * 2];
      clone.clipState[(i * 2 )+ 1] = this.clipState[(i * 2) + 1];
      for (let j = 0; j < clone.size; j++) {
        clone.pool_A[j + i * clone.size] = this.pool_A[j + i * clone.size];
        clone.pool_B[j + i * clone.size] = this.pool_B[j + i * clone.size];
      }
    }
    return clone;
  }

  mutate() {
    let clone = this.clone();
    let r = Math.ceil(Math.random() * 8);
    let size = this.size ** 2;
    for (let i = r; i < size; i += 8) {
      let x = Math.ceil(Math.random() * clone.size - 1);
      let y = Math.ceil(Math.random() * clone.size - 1);
      let t = Math.ceil(Math.random() * 3);
      clone.pool_A[i] = { x: x, y: y, type: t };
    }
    // clone.recalculateField()
    clone.changed = true;
    return clone;
  }

  recalculateField() {
    let free = [];
    let size = this.size ** 2;
    for (let i = 0; i < this.size; i++) {
      this.fieldState[i] = 0;
      this.fieldLoaders[i] = 0;
    }

    for (let i = 0; i < size; i++) {
      if (this.doesFit(this.pool_A[i])) {
        this.setType(this.pool_A[i]);
      } else if (this.doesFit(this.pool_B[i])) {
        this.setType(this.pool_B[i]);
      } else free.push(i);
    }
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.isActive(x, y) && !this.isSet(x, y)) {
          for (let type = 0; type < 4; type++) {
            if (this.doesFit({ x: x, y: y, type: type })) {
              let fr = free.pop();
              if (fr) {
                this.pool_B[fr] = { x: x, y: y, type: type };
                this.setType(this.pool_B[fr]);
              }
            }
          }
        }
      }
    }
  }

  score() {
    if (this.changed) {
      this.recalculateField();
      this.changed = false;
    } else {
      return this.cached_score;
    }
    let score = 0;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.isLoaderSet(x, y)) {
          score += 1;
        }
      }
    }
    this.cached_score = score;
    return score;
  }

  //Field data representation?
  fieldLoaders;

  //arrays
  pool_A;
  pool_B;
}

export default TilingField;
