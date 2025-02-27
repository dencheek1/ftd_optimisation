// import Field from "./field.js";
import Field from "./field.js";
import RNG from "./rng.js";
import GAInstance from "./search.js";

class TilingField extends GAInstance {
  constructor(field) {
    super(field);
    this.range_start = field.range_start ?? 0;
    this.range_end = field.range_end ?? 3;

    if (field.pool_A == undefined) {
      this.pool_A = [field.size * field.size];
      this.pool_B = [field.size * field.size];
      for (let i = 0; i < field.size; i++) {
        this.fieldState[i] = 0;
        for (let j = 0; j < field.size; j++) {
          this.pool_A[i + j * field.size] = {
            x: i,
            y: j,
            type: this.range_start,
          };
          this.pool_B[i + j * field.size] = {
            x: i,
            y: j,
            type: this.range_start,
          };
        }
      }
    } else {
      this.pool_A = field.pool_A;
      this.pool_B = field.pool_B;
    }
    this.updateField();
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

  setRange(start, end) {
    this.range_start = start;
    this.range_end = end;
    let size = this.size ** 2;
    for (let i = 0; i < size; i++) {
      if (
        this.pool_A[i].type < this.range_start ||
        this.pool_A.type > this.range_end
      )
        this.pool_A[i].type = this.range_start;
      if (
        this.pool_B[i].type < this.range_start ||
        this.pool_B.type > this.range_end
      )
        this.pool_B[i].type = this.range_start;
    }
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
    }
    this.setLoader(element.x + loader.x, element.y + loader.y, true);
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
      case 4:
        return { x: 1, y: 0 };
      case 5:
        return { x: 0, y: 1 };
      case 6:
        return { x: 0, y: 0 };
      case 7:
        return { x: 1, y: 0 };
      case 8:
        return { x: 1, y: 0 };
      case 9:
        return { x: 0, y: 1 };
      case 10:
        return { x: 1, y: 0 };
    }
  }

  /*
    for now just asume
        
        10      111       01               010
    0 - 11  1 - 010   2 - 11   3 - 010 4 - 111
        10                01       111     010
  */
  getTestArray(type) {
    switch (type) {
      case 0:
        return [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: 2 },
          { x: 1, y: 1 },
        ];

      case 1:
        return [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 1 },
        ];

      case 2:
        return [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 1, y: 2 },
          { x: 0, y: 1 },
        ];

      case 3:
        return [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: -1 },
        ];
      case 4:
        return [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: -1 },
          { x: 1, y: 1 },
        ];
      case 5:
        return [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
        ];
      case 6:
        return [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ];
      case 7:
        return [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: -1 },
        ];
      case 8:
        return [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: 1 },
        ];
      case 9:
        return [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: 2 },
        ];
      case 10:
        return [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ];
    }
  }

  toString() {
    let string = "";
    let loaders = "";
    string += "\n";
    this.updateField();
    for (let i = 0; i < this.size; i++) {
      string += "\n";
      loaders += "\n";
      for (let j = 0; j < this.size; j++) {
        if ((this.fieldActive[i] & (1 << j)) != 0) {
          if ((this.fieldLoaders[i] & (1 << j)) != 0) {
            loaders += "o";
          } else {
            loaders += " ";
          }
          if (this.isSet(j, i) && !this.isLoaderSet(j, i)) {
            switch (this.getClipState(j, i)) {
              case 0:
                string += "0";
                break;
              case 1:
                string += "1";
                break;
              case 2:
                string += "2";
                break;
              case 3:
                string += "3";
                break;
            }
          } else if (this.isLoaderSet(j, i)) {
            string += "o";
          } else string += " ";
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
    clone.changed = true;
    return clone;
  }

  static createGeneration() {
    return null;
  }

  clone() {
    let clone = new TilingField(new Field(this.size));
    clone.range_start = this.range_start;
    clone.range_end = this.range_end;
    for (let i = 0; i < clone.size; i++) {
      clone.fieldState[i] = this.fieldState[i];
      clone.fieldActive[i] = this.fieldActive[i];
      clone.fieldLoaders[i] = this.fieldLoaders[i];
      clone.clipState[i * 2] = this.clipState[i * 2];
      clone.clipState[i * 2 + 1] = this.clipState[i * 2 + 1];
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
      let x = RNG.rand_kiss() % clone.size;
      let y = RNG.rand_kiss() % clone.size;
      let t =
        (RNG.rand_kiss() % (this.range_end - this.range_start + 1)) +
        this.range_start;
      clone.pool_A[i] = { x: x, y: y, type: t };
    }
    clone.changed = true;
    return clone;
  }

  updateField() {
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
          for (let type = this.range_start; type <= this.range_end; type++) {
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
      this.updateField();
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

  //arrays
  pool_A;
  pool_B;
}

export default TilingField;
