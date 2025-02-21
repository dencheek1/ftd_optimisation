"use strict";

import Field from "./field.js";
//TODO

class GAInstance extends Field {
  // really bad solution

  constructor(field) {
    super(field.size);
    if (field) {
      this.fieldActive = field.fieldActive;
      this.fieldState = field.fieldState;
      this.clipState = field.clipState;
    }
  }

  breed(instance) {
    const mask = 1431655765;
    let clone = this.clone();
    for (let i = 0; i < clone.size; i++) {
      clone.fieldState[i] =
        (this.fieldState[i] & (mask >> ((i + 1) & 1))) |
        (instance.fieldState[i] & (mask >> (i & 1)));
        // clone.clipState[i*2] = this.clipState[i*2];
        // clone.clipState[i*2 +1] = instance.clipState[i*2 + 1];
    }
    return clone;
  }

  static createGeneration() {
    return null;
  }

  clone() {
    let clone = new GAInstance(new Field(this.size));
    for (let i = 0; i < clone.size; i++) {
      clone.fieldState[i] = this.fieldState[i];
      clone.fieldActive[i] = this.fieldActive[i];
      clone.clipState[i * 2] = this.clipState[i * 2];
      clone.clipState[(i * 2 )+ 1] = this.clipState[(i * 2) + 1];
    }
    return clone;
  }

  mutate() {
    let clone = this.clone();
    let x = Math.ceil(Math.random() * clone.size - 1);
    let y = Math.ceil(Math.random() * clone.size - 1);
    let counter = 50;
    while (!clone.isActive(x, y) && counter > 0) {
      x = Math.ceil(Math.random() * clone.size - 1);
      y = Math.ceil(Math.random() * clone.size - 1);
      counter--;
    }
    clone.toggleCell(x, y);
    if(clone.hasSetNeighbor(x,y)){
      if(clone.isSet(x,y-1))
      clone.setClipState(x,y,0)
      if(clone.isSet(x,y+1))
      clone.setClipState(x,y,2)
      if(clone.isSet(x -1,y))
      clone.setClipState(x,y,3)
      if(clone.isSet(x + 1,y))
      clone.setClipState(x,y,1)
    }
    return clone;
  }

  mutateClips() {
    let clone = this.clone();
    let x = Math.ceil(Math.random() * clone.size - 1);
    let y = Math.ceil(Math.random() * clone.size - 1);
    let counter = 50;
    while ((!clone.isActive(x, y) || clone.isSet(x, y)) && counter > 0) {
      x = Math.ceil(Math.random() * clone.size - 1);
      y = Math.ceil(Math.random() * clone.size - 1);
      counter--;
    }
    // console.log('x ' + x + ' y ' + y + 'val ' + val)
    clone.setClipState(x, y, (Math.random() * 4) % 4);
    return clone;
  }

  score() {
    let score = 0;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.isActive(x, y)) {
          if (this.isSet(x, y)) {
            score += 1;
          } else if (this.hasSetNeighbor(x, y)) {
            score += 2; // - temp;
          } else score -= 2;
        }
      }
    }
    return score;
  }

  optimisedScore(num) {
    let score = 0;
    let count = {};
    //todo count groups with proper sets
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.isActive(x, y)) {
          if (this.isSet(x, y)) {
            score += 1;
          } else {
            let val;
            switch (this.getClipState(x, y)) {
              case 0:
                {
                  val = this.isSet(x, y - 1);
                  score += 2 * val;
                  let index = (x << 6) | (y - 1);
                  if (val) count[index] = count[index] ? count[index] + 1 : 1;
                }
                break;
              case 1:
                {
                  val = this.isSet(x + 1, y);
                  score += 2 * val;
                  let index = ((x + 1) << 6) | y;
                  if (val) count[index] = count[index] ? count[index] + 1 : 1;
                }
                break;
              case 2:
                {
                  val = this.isSet(x, y + 1);
                  score += 2 * val;
                  let index = (x << 6) | (y + 1);
                  if (val) count[index] = count[index] ? count[index] + 1 : 1;
                }
                break;
              case 3:
                {
                  val = this.isSet(x - 1, y);
                  score += 2 * val;
                  let index = ((x - 1) << 6) | y;
                  if (val) count[index] = count[index] ? count[index] + 1 : 1;
                }
                break;
              default: score -= 1;
            }
          }
        }
      }
    }
    for (let el in count) {
      // console.log('el ' + el)
      // console.log('count ' +count[el])
      if (count[el] == num) score += 8;
      // else if(count[el] == num-1  || count[el] == num + 1) score +=2;
      // else score -=2;

    }

    return score;
  }
}

class GASearch {
  population;

  static generatePopulation(instance) {
    let population = [];
    for (let i = 0; i < 1; i++) {
      population[i] = instance.clone();
    }
    return population;
  }

  static updatePopulation(best, second, last, mutationRate) {
    let population = [];

    for (let i = 5; i > 0; i--) {
      population.push(best.clone());
      population.push(second.clone());
      population.push(best.mutate());
      population.push(second.mutate());
      population.push(best.breed(second));
      population.push(second.breed(last));
      population.push(second.breed(best));
    }
    let size = population.length;
    for (let i = 0; i < size - 8; i++) {
      for (let m = 0; m < mutationRate; m++) {
        population[i] = population[i].mutate();
        // population[i] = population[i].mutateClips();
      }
    }

    return population;
  }

  // * change score method
  static step(population, mutationRate) {
    let selected = population.reduce(
      (sl, el) => {
        if (sl.best.score() < el.score()) {
          sl.second = sl.best;
          sl.best = el;
        }
        if (sl.last.score() > el.score()) {
          sl.last = el;
        }
        return sl;
      },
      { best: population[0], second: population[0], last: population[0] }
    );
    let newPopulation = this.updatePopulation(
      selected.best,
      selected.second,
      selected.last,
      mutationRate
    );
    return newPopulation;
  }

  static findSolution(instance, mutationRate) {

    let population = this.generatePopulation(instance);
    let size = population[0].size;

    console.time("solution cycle");
    for (let i = size * size * 2 ; i > 0; i--) {
      population = this.step(population, mutationRate);
    }
    console.timeEnd("solution cycle");
    return population.sort((a, b) => a.score() < b.score());
  }
}

export default GAInstance;
export { GASearch, GAInstance };
