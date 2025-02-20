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

let worker = [];
if (window.Worker) {
  worker = new Worker("scripts/webworker.js", { type: "module" });
  // worker[0] = new Worker("scripts/webworker.js", { type: "module" });
  // worker[1] = new Worker("scripts/webworker.js", { type: "module" });
  // worker[2] = new Worker("scripts/webworker.js", { type: "module" });
}

function generateField(size) {
  //TODO reverse dependencie, create data model based on field view
  // * would be nice to have methods for two ways
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
        if (field.isSet(xIndex, yIndex)) {
          score++;
          cell.setAttribute("active", "");
        } else if (field.hasSetNeighbor(xIndex, yIndex)) {
          active++;
          cell.setAttribute("clip", "");
          let val = field.getClipState(xIndex, yIndex);

          cell.setAttribute('rotation', val)
        }
      }
      column.appendChild(cell);
    }

    node.appendChild(column);
  }
  let div = document.createElement("div");
  div.setAttribute("class", "info__item");
  div.textContent = "autoloaders " + score;
  console.log(div.innerText);
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
  // node.append(info);
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
    // e.target.removeAttribute("disabled");
  }
}

function resetField() {
  fieldView.childNodes.forEach((fc) =>
    fc.childNodes.forEach((c) => c.removeAttribute("disabled"))
  );
  // field.textContent = '';
}
function searchField() {
  flag = !flag;
  document.getElementById("search").textContent = flag ? "stop" : "search";

  if (flag) {
    let f = Field.fieldFromView(fieldView);

    let gaInstance = new TilingField(f);

    if (best == undefined || !best.equalField(gaInstance)) best = gaInstance; //population[0]
    let change = 0;
    const result = document.getElementsByClassName("results")[0];
    // while (change-- > 0) {
    //   population = GASearch.findSolution(best);
    //   // console.log(population[0].score(3));
    //   if (best.score(3) < population[0].score(3)) {
    //     best = population[0];
    //     change = 55;
    //   }

    //   let view = generateViewNode(best);
    //   if (result) {
    //     result.textContent = "";
    //     result.appendChild(view);
    //   }
    // }
    if (window.Worker) {
      // console.log(new GAInstance(f))
      worker.postMessage(new TilingField(f));
      worker.onmessage = (m) => {
        counter++;
        console.log(m)
        let solution = new TilingField(m.data);
        solution.score();
        console.log(solution);
        console.log(solution.toString());
        // console.log(solution.score(3));
        // console.log(best.toString());
        // console.log(best.score(3));
        if (
          best.equalField(solution) &&
          solution.score() >= best.score() &&
          best.size == solution.size
        ) {
          best = solution;
          if (result && flag) {
            result.textContent = "";
            let view = new TilingField(best);
            view.fieldState = view.fieldLoaders;
            console.log(view);
            result.appendChild(generateViewNode(view));
          }
        }
        if (flag) {
          if (counter % 2 == 0) {
            worker.postMessage(gaInstance.clone());
          } else if (counter % 5 == 0) {
            let pattern = gaInstance.clone();
            pattern.optimalPattern(counter / 5);
            worker.postMessage(pattern);
          } else worker.postMessage(best);
        }
      };
      worker.onerror = (e) => console.log(e.message);
    }
  } else {
    counter = 0;
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

const reset = document.getElementsByClassName("input__reset-button")[0];
if (reset) reset.addEventListener("mouseup", resetField);
const search = document.getElementsByClassName("input__search-button")[0];
if (search) search.addEventListener("mouseup", searchField);
const increase = document.getElementById("size-increase");
if (increase) increase.addEventListener("mouseup", increaseSize);
const decrease = document.getElementById("size-decrease");
if (decrease) decrease.addEventListener("mouseup", decreaseSize);

function isTouchPointer() {
  return matchMedia("(pointer: coarse)").matches;
}
export { drawEvent, generateField };
