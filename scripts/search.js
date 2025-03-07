"use strict";

import Field from "./field.js";
import RNG from "./rng.js";
//TODO

class GAInstance extends Field {
  // really bad solution

  constructor(field) {
    super(field.size);
    if (field) {
      this.fieldActive = field.fieldActive;
      this.fieldState = field.fieldState;
      this.clipState = field.clipState;
      this.fieldLoaders = field.fieldLoaders;
    }
  }

  breed(instance) {
    const mask = 1431655765;
    let clone = this.clone();
    for (let i = 0; i < clone.size; i++) {
      clone.fieldState[i] =
        (this.fieldLoaders[i] & (mask >> ((i + 1) & 1))) |
        (instance.fieldLoaders[i] & (mask >> (i & 1)));
    }
    return clone;
  }

  static createGeneration() {
    return null;
  }

  clone() {
    let clone = new GAInstance(new Field(this.size));
    for (let i = 0; i < clone.size; i++) {
      clone.fieldLoaders[i] = this.fieldLoaders[i];
      clone.fieldState[i] = this.fieldState[i];
      clone.fieldActive[i] = this.fieldActive[i];
      clone.clipState[i * 2] = this.clipState[i * 2];
      clone.clipState[i * 2 + 1] = this.clipState[i * 2 + 1];
    }
    return clone;
  }

  mutate() {
    let clone = this.clone();
    let x = RNG.rand_kiss() % clone.size;
    let y = RNG.rand_kiss() % clone.size;
    let counter = 50;
    while (!clone.isActive(x, y) && counter > 0) {
      x = RNG.rand_kiss() % clone.size;
      y = RNG.rand_kiss() % clone.size;
      counter--;
    }
    clone.setLoader(x, y, !this.isLoaderSet(x, y));
    clone.setClipState(x + 1, y, 1);
    clone.setClipState(x - 1, y, 3);
    clone.setClipState(x, y + 1, 2);
    clone.setClipState(x, y - 1, 0);
    clone.setState(x + 1, y, true);
    clone.setState(x - 1, y, true);
    clone.setState(x, y + 1, true);
    clone.setState(x, y - 1, true);
    clone.setState(x, y, true);
    // if(clone.hasSetNeighbor(x,y)){
    //   if(clone.isSet(x,y-1))
    //   clone.setClipState(x,y,0)
    //   if(clone.isSet(x,y+1))
    //   clone.setClipState(x,y,2)
    //   if(clone.isSet(x -1,y))
    //   clone.setClipState(x,y,3)
    //   if(clone.isSet(x + 1,y))
    //   clone.setClipState(x,y,1)
    // }
    return clone;
  }

  mutateClips() {
    let clone = this.clone();
    let x = RNG.rand_kiss() % clone.size;
    let y = RNG.rand_kiss() % clone.size;
    let counter = 50;
    while ((!clone.isActive(x, y) || clone.isSet(x, y)) && counter > 0) {
      x = RNG.rand_kiss() % clone.size;
      y = RNG.rand_kiss() % clone.size;
      counter--;
    }
    clone.setClipState(x, y, (Math.random() * 4) % 4);
    return clone;
  }

  score() {
    if (this.changed) {
      this.updateField();
      this.changed = false;
    }
    let score = 0;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.isActive(x, y)) {
          if (this.isLoaderSet(x, y)) {
            score += 1;
          } else if (this.isSet(x, y)) {
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
      population.push(last.breed(best));
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
    for (let i = size * size * 2; i > 0; i--) {
      population = this.step(population, mutationRate);
    }
    console.timeEnd("solution cycle");
    return population.sort((a, b) => a.score() < b.score());
  }
}

export default GAInstance;
export { GASearch, GAInstance };
