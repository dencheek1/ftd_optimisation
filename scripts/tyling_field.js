// import Field from "./field.js";
import Field from "./field.js";
import GAInstance from "./search.js";

class TylingField extends GAInstance {
  constructor(field) {
    //check if size < 32;
    super(field);
    this.fieldLoaders = [];
    this.pool_A = [field.size*field.size];
    this.pool_B = [field.size * field.size];
    for (let i = 0; i < field.size; i++) {
      this.fieldState[i] = 0;
      this.fieldLoaders[i] = 0;
      for (let j = 0; j < field.size; j++) {
        this.pool_A[i+j*field.size] = {x:0, y:0, type:0};
        this.pool_B[i+j*field.size] = {x:0, y:0, type:0};
      }
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

  setLoader(x, y, state) {
    if (this.isPositionValid(x, y)) {
      this.fieldLoaders[y] = (this.fieldLoaders[y] & ~(1 << x)) | (!!state << x);
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
  doesFit(element){
    let test = this.getTestArray(element.type);
    for(let val of test){
      if(!this.isActive(element.x+val.x,element.y+val.y) || this.isSet(element.x+val.x, element.y+val.y)) return false;
    }
    return true;
  }

  setType(element){
    let test = this.getTestArray(element.type);
    let main = this.getLoaderPosition(element.type);
    for(let val of test){
      this.setState(element.x+val.x, element.y+val.y, true);
    }
    this.setLoader(element.x + main.x,element.y + main.y,true);
  }

  getLoaderPosition(type){
    switch(type){
      case 0: return {x:0, y:1};
      case 1: return {x:1, y:0};
      case 2: return {x:1, y:1};
      case 3: return {x:1, y:1};
    }
  }

  /*
    for now just asume
        
        10      111       01
    0 - 11  1 - 010   2 - 11   3 - 010
        10                01       111
  */
  getTestArray(type){

    let test = [];
    switch (type) {
      case 0:
        test.push({x:0,y:0});
        test.push({x:0,y:1});
        test.push({x:0,y:2});
        test.push({x:1,y:1});
        break;

      case 1:
        test.push({x:0,y:0});
        test.push({x:1,y:0});
        test.push({x:2,y:0});
        test.push({x:1,y:1});
        break;

      case 2:
        test.push({x:1,y:0});
        test.push({x:1,y:1});
        test.push({x:1,y:2});
        test.push({x:0,y:1});
        break;

      case 3:
        test.push({x:0,y:1});
        test.push({x:1,y:1});
        test.push({x:2,y:1});
        test.push({x:1,y:0});
        break;
    }
    return test;
  }

  getClipState(x, y) {
    if (this.isPositionValid(x, y)) {
      return (this.clipState[y * 2 + (x > 16)] >> (x * 2) - ((x > 16) * 16) & 3);
    };
  }

  toString() {
    let string = "";
    let loaders = '';
    // string += this.super.toString();
    string += '\n'
    for (let i = 0; i < this.size; i++) {
      string += "\n";
      loaders +='\n';
      for (let j = 0; j < this.size; j++) {
        if ((this.fieldActive[i] & (1 << j)) != 0){
          string += (this.fieldState[i] & (1 << j)) != 0 ? "o" : " ";
          if ((this.fieldLoaders[i] & (1 << j)) != 0) loaders += 'o';
          else {
            loaders+=' ';
          }
        }else{ 
          string += '*'
          loaders += '*';
        }
      }
    }
    return string + '\n' + loaders;
  }

  breed(instance) {
    let clone = this.clone();
    let pool_B = [];
    for(let el of instance.pool_A){
      pool_B.push({'x':el.x, 'y':el.y, 'type':el.type});
    }
    clone.pool_B = pool_B;
    return clone;
  }

  static createGeneration() {
    return null;
  }

  clone() {
    let clone = new TylingField(new Field(this.size));
    for (let i = 0; i < clone.size; i++) {
      clone.fieldState[i] = this.fieldState[i];
      clone.fieldActive[i] = this.fieldActive[i];
      clone.fieldLoaders[i] = this.fieldLoaders[i];
      for(let j = 0; j < clone.size; j++){
        clone.pool_A[j+i*clone.size] = this.pool_A[j+i*clone.size];
        clone.pool_B[j+i*clone.size] = this.pool_B[j+i*clone.size];
      }
    }
    return clone;
  }

  mutate() {
    let clone = this.clone();
    let r = Math.ceil(Math.random() * 2);
    let size = this.size ** 2;
    for (let i = 0; i < size; i++ ) {
      let x = Math.ceil(Math.random() * clone.size - 1);
      let y = Math.ceil(Math.random() * clone.size - 1);
      let t = Math.ceil(Math.random() * 3);
      clone.pool_A[i] = {'x': x,'y':y, 'type':t };
    }
    return clone;
  }

  score() {
    let score = 0;
    let size = this.size ** 2;

    for (let i = 0; i < this.size; i++) {
      this.fieldState[i] = 0;
      this.fieldLoaders[i] = 0;
    }

    for (let i = 0; i < size; i++ ) {
      if(this.doesFit(this.pool_A[i])) {
        this.setType(this.pool_A[i]);
        score+=1;
      }
      else if(this.doesFit(this.pool_B[i])) {
        this.setType(this.pool_B[i]);
        score+=1;
      } 
    }
    // for (let y = 0; y < this.size; y++) {
    //   for (let x = 0; x < this.size; x++) {
    //     if (this.isLoaderSet(x, y)) {
    //      score+=1; 
    //     }
    //   }
    // }
    return score;
  }

  //Field data representation?
  fieldLoaders;
  
  //arrays
  pool_A
  pool_B
}

export default TylingField;
