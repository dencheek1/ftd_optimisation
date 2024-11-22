'use strict'

import Field from './field.js'
//TODO 
// * something something web workers

class GAInstance extends Field {
    // really bad solution
    constructor(field) {
        super(field.fieldData.array.length);
        if (field) this.fieldData = field.fieldData;
    }

    hasSetNeighbor(x, y) {
        return this.isSet(x - 1, y) || this.isSet(x, y - 1) || this.isSet(x + 1, y) || this.isSet(x, y + 1);
    }

    breed(instance) {

        let clone = this.clone();
        for (let x = 0; x < clone.fieldData.array.length; x++) {
            for (let y = x & 1; y < clone.fieldData.array.length; y += 2) {
                clone.setState(x, y, instance.isSet(x, y));
            }
        }
        return clone;
    }

    static createGeneration() {
        return null;
    }

    clone() {
        let data = [];
        this.fieldData.array.forEach(element => {
            let column = [];
            element.forEach(el => {
                column.push({ active: el.active, state: el.state })
            });
            data.push(column);
        });
        // let data = structuredClone(this.fieldData);
        let clone = new GAInstance(this);
        clone.fieldData = {array:  data};
        // clone.fieldData = data;
        return clone;
    }

    mutate() {
        let clone = this.clone();
        let x = Math.ceil(Math.random() * clone.fieldData.array.length - 1);
        let y = Math.ceil(Math.random() * clone.fieldData.array.length - 1);
        while (!clone.isActive(x, y)) {
            x = Math.ceil(Math.random() * clone.fieldData.array.length - 1);
            y = Math.ceil(Math.random() * clone.fieldData.array.length - 1);
        }
        clone.toggleCell(x, y);
        return clone;
    }

    score() {
        return this.fieldData.array.reduce((acc, ell, y) => {
            return acc + (ell.reduce((ac, cell, x) => {
                return ac + (cell.active
                    ? this.hasSetNeighbor(x, y)
                        ? cell.state
                            ? 1
                            : 3
                        : cell.state
                            ? 2
                            : -1
                    : 0
                )
            }
                , 0)
            )
        }, 0)
    }

}

class GASearch {

    population;

    static generatePopulation(instance) {
        let population = [];
        for (let i = 30; i > 0; i--) {
            population.push(instance.clone());
        }
        return population;
    }

    static updatePopulation(best, second, last) {
        let population = [];
        for (let i = 5; i > 0; i--) {
            population.push(best.clone());
            population.push(second.clone());
            population.push(last.clone());
            population.push(best.breed(second));
            population.push(best.breed(last));
            population.push(second.breed(last));
        }
        for (let i = 0; i < population.length; i += 2) {
            population[i] = population[i].mutate();
        }
        return population;
    }

    static step(population) {
        let selected = population.reduce((sl, el) => {
            if (sl.best.score() < el.score()) {
                sl.second = sl.best;
                sl.best = el;
            }
            if (sl.last.score() > el.score()) {
                sl.last = el;
            }
            return sl;
        }
            , { best: population[0], second: population[0], last: population[0] });

        let newPopulation = this.updatePopulation(selected.best, selected.second, selected.last);
        return newPopulation;
    }

    static findSolution(instance) {
        let population = this.generatePopulation(instance);
        let size = population[0].fieldData.array.length;

        console.time('solution cycle');
        for (let i = size * size * 2; i > 0; i--) {
            population = this.step(population);
        }
        console.timeEnd('solution cycle');
        return population.sort((a, b) => a.score() < b.score());
    }

}


export default GAInstance;
export { GASearch, GAInstance }