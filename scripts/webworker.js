import { GASearch, GAInstance } from "./search.js";

onmessage = (e) => {
    let instance  = new GAInstance(e.data);
    let solution = GASearch.findSolution(instance);
    postMessage(solution[0]);
};