import "./inputs/index.js";

const inpRange0 = document.createElement("input-range");
// inpRange0.width = 64
// inpRange0.style.width = "64px";
inpRange0.minmax = { min: 0, max: 1 };
inpRange0.steps = 4096;
inpRange0.value = 0.5;

const inpRange1 = document.createElement("input-range");
inpRange1.width = 512
// inpRange1.style.width = "512px";
inpRange1.minmax = { min: 0, max: 1 };
inpRange1.steps = 128;
inpRange1.value = 0.5;

const inpSelect0 = document.createElement("input-select");
inpSelect0.list = ["sine", "tri", "ramp up", "ramp down"];

const inpSwitch0 = document.createElement("input-switch");

const inpPicker0 = document.createElement("input-picker");
inpPicker0.setPickerType({
  type: HTMLLIElement,
  fn: (target, inp) => {},
});

const inpNumber0 = document.createElement("input-number");

document.body.append(
  inpRange0,
  inpRange1,
  inpSelect0,
  inpSwitch0,
  inpPicker0,
  inpNumber0
);

document.body.addEventListener("change", (e) => {
  console.log(e.target.value);
});
