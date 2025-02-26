import Field from "./field.js";
import { GASearch, GAInstance } from "./search.js";
import TilingField from "./tiling_field.js";

const fieldView = document.getElementById("field");

function drawEvent(e) {
  if ((e.buttons & 1) == true) e.target.setAttribute("disabled", "");
  else if ((e.buttons & 2) == 2) e.target.removeAttribute("disabled");
}

let flag = false;
let counter = 0;
let best;
let type = '';

let worker = [];
if (window.Worker) {
  worker[0] = new Worker("scripts/webworker.js", { type: "module" });
  worker[1] = new Worker("scripts/webworker.js", { type: "module" });
  worker[2] = new Worker("scripts/webworker.js", { type: "module" });
}

const onWorkerMessage = (
  getBest,
  updateBest,
  type,
  counter,
  result,
  flag,
  inst,
  worker
) => {
  return (m) => {
    counter++;
    let solution = new inst(m.data);

    updateBest(solution);
    if (result && flag) {
      result.textContent = "";
      let view = new inst(best);
      result.appendChild(generateViewNode(view));
    }

    if (flag) {
      if (counter % 2 == 0) {
        let empty = getBest().clone();
        for (let i = 0; i < empty.size; i++) {
          empty.fieldState[i] = 0;
          empty.fieldLoaders[i] = 0;
        }
        worker.postMessage([empty, type]);
      } else if (counter % 5 == 0) {
        let pattern = getBest().clone();
        pattern.optimalPattern(counter / 5);
        worker.postMessage([pattern, type]);
      } else worker.postMessage([getBest(), type]);
    }
  };
};

function generateField(size) {
  let cellSize = "normal";
  cellSize = size < 9 ? "large" : size > 16 ? "small" : "normal";
  for (let xIndex = 0; xIndex < size; xIndex++) {
    let column = document.createElement("div");
    column.setAttribute("class", "field__column");
    for (let yIndex = 0; yIndex < size; yIndex++) {
      let cell = document.createElement("div");
      cell.setAttribute("class", "field__cell " + cellSize);
      cell.setAttribute("x", xIndex);
      cell.setAttribute("y", yIndex);
      column.appendChild(cell);
    }
    fieldView.appendChild(column);
  }

  if (isTouchPointer()) {
    fieldView.addEventListener("click", toggleCell);
  } else {
    fieldView.addEventListener("mouseover", drawEvent);
    fieldView.addEventListener("mousedown", clickDraw);
  }
  fieldView.setAttribute("onContextMenu", "return false;");
  fieldView.setAttribute("onDragStart", "return false;");
}

function generateViewNode(field) {
  const node = document.createElement("div");
  const wrapper = document.createElement("div");
  wrapper.setAttribute("class", "column");
  const info = document.createElement("div");
  let score = 0;
  let active = 0;
  let cellSize = "normal";
  cellSize = field.size < 9 ? "large" : field.size > 16 ? "small" : "normal";
  node.setAttribute("class", "field");
  for (let xIndex = 0; xIndex < field.size; xIndex++) {
    let column = document.createElement("div");
    column.setAttribute("class", "field__column");
    for (let yIndex = 0; yIndex < field.size; yIndex++) {
      let cell = document.createElement("div");
      cell.setAttribute("class", "field__cell");
      cell.setAttribute("class", "field__cell " + cellSize);
      cell.setAttribute("x", xIndex);
      cell.setAttribute("y", yIndex);
      if (!field.isActive(xIndex, yIndex)) {
        cell.setAttribute("disabled", "");
      } else {
        if (field.isLoaderSet(xIndex, yIndex)) {
          score++;
          cell.setAttribute("active", "");
        } else if (field.isSet(xIndex, yIndex)) {
          active++;
          cell.setAttribute("clip", "");
          let val = field.getClipState(xIndex, yIndex);

          cell.setAttribute("rotation", val);
        }
      }
      column.appendChild(cell);
    }

    node.appendChild(column);
  }
  let div = document.createElement("div");
  div.setAttribute("class", "info__item");
  div.textContent = "autoloaders " + score;
  info.appendChild(div.cloneNode(true));
  div.textContent = "clips " + active;
  info.appendChild(div.cloneNode(true));
  info.setAttribute("class", "field__info");
  div.textContent = "ratio " + (active / score).toFixed(2);
  info.appendChild(div.cloneNode(true));
  div.textContent = "material:";
  info.appendChild(div.cloneNode(true));
  div.textContent = "1 m " + (active * 160 + score * 240);
  info.appendChild(div.cloneNode(true));
  div.textContent = "2 m " + (active * 200 + score * 300);
  info.appendChild(div.cloneNode(true));
  div.textContent = "4 m " + (active * 240 + score * 360);
  info.appendChild(div.cloneNode(true));
  div.textContent = "8 m " + (active * 320 + score * 480);
  info.appendChild(div.cloneNode(true));
  wrapper.appendChild(node);
  wrapper.appendChild(info);
  return wrapper;
}

function clickDraw(e) {
  if (e.button == 0) e.target.setAttribute("disabled", "");
  else if (e.button == 2) e.target.removeAttribute("disabled");
}

function toggleCell(e) {
  if (e.target.hasAttribute("disabled")) {
    e.target.removeAttribute("disabled");
  } else {
    e.target.setAttribute("disabled", "");
  }
}

function resetField() {
  fieldView.childNodes.forEach((fc) =>
    fc.childNodes.forEach((c) => c.removeAttribute("disabled"))
  );
}

//TODO make it look sain, only idiot could write this
function searchField() {
  flag = !flag;
  document.getElementById("search").textContent = flag ? "stop" : "search";

  if (flag) {
    let f = Field.fieldFromView(fieldView);
    let inst = type.startsWith('pattern') ? TilingField : GAInstance;
    console.log(inst)
    let gaInstance = new inst(f);

    if (best == undefined || !best.equalField(gaInstance)) {
      best = gaInstance;
      if(best ){
        if(type == 'pattern_2') best.setRange(5,10);
        if(type == 'pattern_3') best.setRange(0,3);
        if(type == 'pattern_4') best.setRange(4,4);
      }
    }
    let change = 0;
    const result = document.getElementsByClassName("results")[0];

    if (window.Worker) {
      let updateBest = (b) => {
        if (best.equalField(b) && best.score() <= b.score()) best = b;
      };
      let getBest = () => {
        return best;
      };

      worker[0].postMessage([new GAInstance(f), type]);
      worker[0].onmessage = onWorkerMessage(
        getBest,
        updateBest,
        type,
        counter,
        result,
        flag,
        inst,
        worker[0]
      );
      worker[0].onerror = (e) => console.log(e.message);
      worker[1].postMessage([new GAInstance(f), type]);
      worker[1].onmessage = onWorkerMessage(
        getBest,
        updateBest,
        type,
        counter,
        result,
        flag,
        inst,
        worker[1]
      );
      worker[1].onerror = (e) => console.log(e.message);
      worker[2].postMessage([new GAInstance(f), type]);
      worker[2].onmessage = onWorkerMessage(
        getBest,
        updateBest,
        type,
        counter,
        result,
        flag,
        inst,
        worker[2]
      );
      worker[2].onerror = (e) => console.log(e.message);
    }
  } else {
    counter = 0;
    worker[0].terminate();
    worker[0] = new Worker("scripts/webworker.js", { type: "module" });
    worker[1].terminate();
    worker[1] = new Worker("scripts/webworker.js", { type: "module" });
    worker[2].terminate();
    worker[2] = new Worker("scripts/webworker.js", { type: "module" });
  }
}

let size = 11;
const sizeView = document.getElementById("value");
const decreaseSize = () => {
  if (size > 4) {
    size--;
    fieldView.innerText = "";
    generateField(size);
    sizeView.innerText = size;
  }
};

const increaseSize = () => {
  if (size < 31) {
    size++;
    fieldView.innerText = "";
    generateField(size);
    sizeView.innerText = size;
  }
};

//TODO get rid of copypaste functions
const togglePattern_2 = (e) => {
  if (type =='pattern_2') {
    pattern_2.removeAttribute("active");
    type = '';
  } else {
    type = 'pattern_2';
    pattern_2.setAttribute("active", "");
    pattern_4.removeAttribute("active");
    pattern_3.removeAttribute("active");
  }
    flag = true;
    best = undefined;
    searchField();
};

const togglePattern_3 = (e) => {
  if (type =='pattern_3') {
    pattern_3.removeAttribute("active");
    type = '';
  } else {
    type = 'pattern_3';
    pattern_3.setAttribute("active", "");
    pattern_2.removeAttribute("active");
    pattern_4.removeAttribute("active");
  }
    flag = true;
    best = undefined;
    searchField();
};

const togglePattern_4 = (e) => {
  if (type =='pattern_4') {
    pattern_4.removeAttribute("active");
    type = '';
  } else {
    type = 'pattern_4';
    pattern_4.setAttribute("active", "");
    pattern_3.removeAttribute("active");
    pattern_2.removeAttribute("active");
  }
    flag = true;
    best = undefined;
    searchField();
};
const reset = document.getElementsByClassName("input__reset-button")[0];
if (reset) reset.addEventListener("mouseup", resetField);
const search = document.getElementsByClassName("input__search-button")[0];
if (search) search.addEventListener("mouseup", searchField);
const increase = document.getElementById("size-increase");
if (increase) increase.addEventListener("mouseup", increaseSize);
const decrease = document.getElementById("size-decrease");
if (decrease) decrease.addEventListener("mouseup", decreaseSize);
const pattern_2 = document.getElementById("pattern_2");
if (pattern_2) pattern_2.addEventListener("mouseup", togglePattern_2);
const pattern_3 = document.getElementById("pattern_3");
if (pattern_3) pattern_3.addEventListener("mouseup", togglePattern_3);
const pattern_4 = document.getElementById("pattern_4");
if (pattern_4) pattern_4.addEventListener("mouseup", togglePattern_4);

function isTouchPointer() {
  return matchMedia("(pointer: coarse)").matches;
}
export { drawEvent, generateField };
