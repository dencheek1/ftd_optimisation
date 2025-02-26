import { GASearch, GAInstance } from "./search.js";
import TilingField from "./tiling_field.js";

onmessage = (e) => {
    let instance 
    if(e.data[1] && e.data[1] == 'pattern_2') {
        instance = new TilingField(e.data[0])
        instance.setRange(5,10);
    }else if(e.data[1] && e.data[1] == 'pattern_3') {
        instance = new TilingField(e.data[0])
        instance.setRange(0,3);
    }
    else if(e.data[1] && e.data[1] == 'pattern_4') {
        instance = new TilingField(e.data[0])
        instance.setRange(4,4);
    }
    else instance = new GAInstance(e.data[0]);
    let solution = GASearch.findSolution(instance, 2);
    postMessage(solution[0]);
};