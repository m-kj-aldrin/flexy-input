import "./inputs/index.js";

const inpRange0 = document.createElement("input-range");
inpRange0.width = 256;
inpRange0.minmax = { min: 128, max: 65536 };
inpRange0.normValue = 0.75;

const inpRange1 = document.createElement("input-range");
inpRange1.width = 64;
inpRange1.minmax = { min: 0, max: 128 };
inpRange1.normValue = 0.5;

const inpSelect0 = document.createElement("input-select");
inpSelect0.list = ["sine", "tri", "ramp up", "ramp down"];

const inpSwitch0 = document.createElement("input-switch");

const inpPicker0 = document.createElement("input-picker");
inpPicker0.setPickerType({
    type: HTMLLIElement,
    fn: (target, inp) => {},
});

const inpNumber0 = document.createElement("input-number");
const button0 = document.createElement("input-button");
button0.textContent = "click";

document.body.append(
    inpRange0,
    inpRange1,
    inpSelect0,
    inpSwitch0,
    button0,
    inpPicker0,
    inpNumber0
);

document.body.addEventListener("change", (e) => {
    console.log(e.target.normValue);
});

const sp = document.createElement("slide-parent");
const num = document.createElement("input-number");
num.minmax = { min: 0, max: 128 };

sp.appendChild(num);

document.body.appendChild(sp);

const spB = document.createElement("slide-parent");
const bNum = document.createElement("input-number");
bNum.minmax = { min: 512, max: 1024 };

spB.appendChild(bNum);

document.body.appendChild(spB);
