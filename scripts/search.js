"use strict";

import Field from "./field.js";
//TODO
// * something something web workers

class GAInstance extends Field {
  // really bad solution
  constructor(field) {
    super(field.size);
    if (field) {
      this.fieldActive = field.fieldActive;
      this.fieldState = field.fieldState;
    }
  }

  breed(instance) {
    const mask = 1431655765;
    let clone = this.clone();
    for (let i = 0; i < clone.size; i++) {
      clone.fieldState[i] =
        (this.fieldState[i] & (mask >> ((i + 1) & 1))) |
        (instance.fieldState[i] & (mask >> (i & 1)));
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
    }
    // this.fieldData.array.forEach(element => {
    //     let column = [];
    //     element.forEach(el => {
    //         column.push({ active: el.active, state: el.state })
    //     });
    //     data.push(column);
    // });
    // let data = structuredClone(this.fieldData);
    // clone.fieldData = {array:  data};
    // clone.fieldData = data;
    return clone;
  }

  mutate() {
    let clone = this.clone();
    let x = Math.ceil(Math.random() * clone.size - 1);
    let y = Math.ceil(Math.random() * clone.size - 1);
    while (!clone.isActive(x, y)) {
      x = Math.ceil(Math.random() * clone.size - 1);
      y = Math.ceil(Math.random() * clone.size - 1);
    }
    clone.toggleCell(x, y);
    return clone;
  }

  score() {
    let score = 0;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.isActive(x, y)) {
          if (this.isSet(x, y)) {
            //check if match pattern
            // TODO change for bit operation
            // if ( this.isSet(x, y + 2) ||
            //   this.isSet(x, y - 2) ||
            //   this.isSet(x - 1, y + 1) ||
            //   this.isSet(x, y + 1) ||
            //   this.isSet(x + 1, y + 1) ||
            //   this.isSet(x - 1, y - 1) ||
            //   this.isSet(x, y - 1) ||
            //   this.isSet(x + 1, y - 1) ||
            //   this.isSet(x - 2, y) ||
            //   this.isSet(x - 1, y) ||
            //   this.isSet(x + 1, y) ||
            //   this.isSet(x + 2, y)
            // )
            // if (
            //   (this.isSet(x - 1, y + 1) && this.isSet(x + 1, y - 1)) ||
            //   (this.isSet(x + 1, y + 1) && this.isSet(x - 1, y + 1))
            // )
            //   score += 0;
            // else if (
            //   (this.isSet(x + 1, y + 1) && this.isSet(x - 1, y + 1)) ||
            //   (this.isSet(x + 1, y + 1) && this.isSet(x + 1, y - 1)) ||
            //   (this.isSet(x - 1, y - 1) && this.isSet(x + 1, y - 1)) ||
            //   (this.isSet(x - 1, y - 1) && this.isSet(x - 1, y + 1))
            // ) {
            //   score += 1;
            // } else {
            //   let temp =
            //     (this.isSet(x - 2, y) || this.isSet(x - 1, y)) +
            //     (this.isSet(x + 2, y) || this.isSet(x + 1, y)) +
            //     (this.isSet(x, y - 1) || this.isSet(x, y - 2)) +
            //     (this.isSet(x, y + 1) || this.isSet(x, y + 2));
            //   score += 4 - temp;
            // }
            score += 0;
            // else
          } else if (
            this.isSet(x - 1, y) ||
            this.isSet(x + 1, y) ||
            this.isSet(x, y - 1) ||
            this.isSet(x, y + 1)
          ) {
            //check if match pattern
            // let temp =
            //   this.isSet(x - 1, y) +
            //   this.isSet(x + 1, y) +
            //   this.isSet(x, y - 1) +
            //   this.isSet(x, y + 1);
            // let temp =
            score += 2; // - temp;
          } else score -= 2;
        }
      }
    }
    return score;
  }
}

class GASearch {
  population;

  static generatePopulation(instance) {
    let population = [];
    let allSet = instance.clone();
    allSet.fieldState = [
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    ];
    let allUnset = instance.clone();
    allUnset.fieldState = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
    ];

    for (let i = 0; i < 30; i++) {
      population[i] = instance.clone();
    }
    return population;
  }

  static updatePopulation(best, second, last, mutationRate) {
    let population = [];

    for (let i = 6; i > 0; i--) {
      population.push(best.clone());
      population.push(second.clone());
      population.push(last.clone());
      population.push(best.breed(second));
      population.push(best.breed(last));
      population.push(second.breed(last));
    }
    let size = population.length;
    for (let i = 0; i < size - 6; i++) {
      for (let m = 0; m < mutationRate; m++) {
        population[i] = population[i].mutate();
      }
    }

    for(let i = 0; i < size / 5; i++){
      population[i] = population[i].breed(population[i + 6])
    }
    // for (let i = 0; i < population.length; i += 4) {
    //   population[i] = population[i].mutate();
    // }
    return population;
  }

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

  static findSolution(instance) {
    let mutationRate = Math.ceil(instance.size * 0.1) | 1;
    console.log(`mutationRate ${mutationRate}`);
    let population = this.generatePopulation(instance);
    let size = population[0].size;

    console.time("solution cycle");
    for (let i = size * size * 3; i > 0; i--) {
      population = this.step(population, mutationRate);
    }
    console.timeEnd("solution cycle");
    return population.sort((a, b) => a.score() < b.score());
  }
}

export default GAInstance;
export { GASearch, GAInstance };