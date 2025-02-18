import { GASearch, GAInstance } from "./search.js";
import TilingField from "./tiling_field.js";

onmessage = (e) => {
    let instance  = new TilingField(e.data);
    // let mutationRate = Math.random() * 5;
    let solution = GASearch.findSolution(instance, 2);
    console.log(solution[0].toString())
    postMessage(solution[0]);
};