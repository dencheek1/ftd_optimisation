import { GASearch, GAInstance } from "./search.js";

onmessage = (e) => {
    let instance  = new GAInstance(e.data);
    let mutationRate = Math.random() * 4;
    let solution = GASearch.findSolution(instance, mutationRate);
    postMessage(solution[0]);
};