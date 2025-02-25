import { GASearch, GAInstance } from "./search.js";
import TilingField from "./tiling_field.js";

onmessage = (e) => {
    console.log(e.data[1]);
    let instance 
    if(e.data[1] == 'price') instance = new TilingField(e.data[0]);
    else instance = new GAInstance(e.data[0]);
    let solution = GASearch.findSolution(instance, 2);
    postMessage(solution[0]);
};