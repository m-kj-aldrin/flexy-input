import "./inputs/index.js";

const inpRange0 = document.createElement("input-range");
inpRange0.minmax = { min: 0, max: 1 };
inpRange0.steps = 65536;
inpRange0.value = 0.5;

const inpSelect0 = document.createElement("input-select");
inpSelect0.list = ["sine", "tri", "ramp up", "ramp down"];

const inpSwitch0 = document.createElement("input-switch");

const inpPicker0 = document.createElement("input-picker");
inpPicker0.setPickerType({
    type: HTMLLIElement,
    fn: (target, inp) => {},
});

const inpNumber0 = document.createElement("input-number");

document.body.append(inpRange0, inpSelect0, inpSwitch0, inpPicker0, inpNumber0);

document.body.addEventListener("change", (e) => {
    console.log("change: ", e.target.value);
});

document.body.addEventListener("input", (e) => {
    // console.log("input: ", e.target.value);
});
