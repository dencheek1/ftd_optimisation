import { GASearch, GAInstance } from "./search.js";
import TilingField from "./tiling_field.js";

onmessage = (e) => {
    let instance 
    if(e.data[1] && e.data[1] == 'pattern') instance = new TilingField(e.data[0]);
    else instance = new GAInstance(e.data[0]);
    let solution = GASearch.findSolution(instance, 2);
    postMessage(solution[0]);
};