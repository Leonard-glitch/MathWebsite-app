// ── CONFIGURATION: Here you define all shapes and their required inputs ──
const shapeConfig = {
    // --- 2D SHAPES ---
    circle: {
        name: 'Circle',
        dimension: '2d',
        type: 1,
        inputs: [
            { id: 'r', label: 'Radius (r)' },
            { id: 'd', label: 'Diameter (d)' },
            { id: 'U', label: 'Perimeter (P)' },
            { id: 'A', label: 'Area (A)' }
        ]
    },
    rectangle: {
        name: 'Rectangle',
        dimension: '2d',
        type: 2,
        inputs: [
            { id: 'a', label: 'Side a' },
            { id: 'b', label: 'Side b' },
            { id: 'A', label: 'Area (A)' },
            { id: 'U', label: 'Perimeter (P)' },
            { id: 'd', label: 'Diagonal (d)' }
        ]
    },
    square: {
        name: 'Square',
        dimension: '2d',
        type: 1,
        inputs: [
            { id: 'a', label: 'Side length (a)' },
            { id: 'U', label: 'Perimeter (P)' },
            { id: 'A', label: 'Area (A)' },
            { id: 'd', label: 'Diagonal (d)' }
        ]
    },
    triangle: {
        name: 'General Triangle',
        dimension: '2d',
        type: 4,
        inputs: [
            { id: 'a', label: 'Side a' },
            { id: 'b', label: 'Side b' },
            { id: 'c', label: 'Side c' },
            { id: 'alpha', label: 'Angle α' },
            { id: 'beta', label: 'Angle β' },
            { id: 'gamma', label: 'Angle γ' },
            { id: 'ha', label: 'Height ha' },
            { id: 'hb', label: 'Height hb' },
            { id: 'hc', label: 'Height hc' },
            { id: 'A', label: 'Area (A)' }
        ],
        redundantGroups: [['alpha', 'beta', 'gamma']]
    },
    rightTriangle: {
        name: 'Right Triangle',
        dimension: '2d',
        type: 2,
        inputs: [
            { id: 'a', label: 'Leg a' },
            { id: 'b', label: 'Leg b' },
            { id: 'c', label: 'Hypotenuse c' },
            { id: 'alpha', label: 'Angle α' },
            { id: 'beta', label: 'Angle β' },
            { id: 'A', label: 'Area (A)' }
        ],
        redundantGroups: [['alpha', 'beta']]
    },
    trapezoid: {
        name: 'Trapezoid',
        dimension: '2d',
        type: 4,
        inputs: [
            { id: 'a', label: 'Base a' },
            { id: 'c', label: 'Parallel side c' },
            { id: 'h', label: 'Height (h)' },
            { id: 'A', label: 'Area (A)' }
        ]
    },
    parallelogram: {
        name: 'Parallelogram',
        dimension: '2d',
        type: 4,
        inputs: [
            { id: 'a', label: 'Side a' },
            { id: 'b', label: 'Side b' },
            { id: 'h', label: 'Height (h)' },
            { id: 'A', label: 'Area (A)' }
        ],
        redundantGroups: [['a', 'h', 'A']]
    },
    rhombus: {
        name: 'Rhombus',
        dimension: '2d',
        type: 2,
        inputs: [
            { id: 'a', label: 'Side length (a)' },
            { id: 'e', label: 'Diagonal e' },
            { id: 'f', label: 'Diagonal f' },
            { id: 'h', label: 'Height (h)' },
            { id: 'U', label: 'Perimeter (P)' },
            { id: 'A', label: 'Area (A)' }
        ],
        redundantGroups: [['a', 'U']]
    },

    // --- 3D SOLIDS ---
    cube: {
        name: 'Cube',
        dimension: '3d',
        type: 1,
        inputs: [
            { id: 'a', label: 'Edge length (a)' },
            { id: 'O', label: 'Surface Area (O)' },
            { id: 'V', label: 'Volume (V)' },
            { id: 'd', label: 'Space diagonal (d)' }
        ]
    },
    cuboid: {
        name: 'Cuboid',
        dimension: '3d',
        type: 4,
        inputs: [
            { id: 'a', label: 'Length (a)' },
            { id: 'b', label: 'Width (b)' },
            { id: 'c', label: 'Height (c)' },
            { id: 'V', label: 'Volume (V)' },
            { id: 'O', label: 'Surface Area (O)' },
            { id: 'd', label: 'Space diagonal (d)' },
            { id: 'G', label: 'Base Area (G)' }
        ],
        redundantGroups: [['a', 'b', 'G'], ['c', 'G', 'V']]
    },
    sphere: {
        name: 'Sphere',
        dimension: '3d',
        type: 1,
        inputs: [
            { id: 'r', label: 'Radius (r)' },
            { id: 'd', label: 'Diameter (d)' },
            { id: 'O', label: 'Surface Area (O)' },
            { id: 'V', label: 'Volume (V)' }
        ]
    },
    cylinder: {
        name: 'Cylinder',
        dimension: '3d',
        type: 2,
        redundantGroups: [['r', 'd'], ['r', 'G'], ['d', 'G']],
        inputs: [
            { id: 'r', label: 'Radius (r)' },
            { id: 'd', label: 'Diameter (d)' },
            { id: 'h', label: 'Height (h)' },
            { id: 'V', label: 'Volume (V)' },
            { id: 'O', label: 'Surface Area (O)' },
            { id: 'M', label: 'Lateral Area (M)' },
            { id: 'G', label: 'Base Area (G)' }
        ]
    },
    cone: {
        name: 'Cone',
        dimension: '3d',
        type: 2,
        redundantGroups: [['r', 'd'], ['r', 'G'], ['d', 'G']],
        inputs: [
            { id: 'r', label: 'Radius (r)' },
            { id: 'd', label: 'Diameter (d)' },
            { id: 'h', label: 'Height (h)' },
            { id: 's', label: 'Slant height (s)' },
            { id: 'V', label: 'Volume (V)' },
            { id: 'O', label: 'Surface Area (O)' },
            { id: 'M', label: 'Lateral Area (M)' },
            { id: 'G', label: 'Base Area (G)' }
        ]
    },
    quadrangularpyramid: {
        name: 'Square Pyramid',
        dimension: '3d',
        type: 2,
        inputs: [
            { id: 'a', label: 'Base edge (a)' },
            { id: 'h', label: 'Height (h)' },
            { id: 'ha', label: 'Slant height (ha)' },
            { id: 'V', label: 'Volume (V)' },
            { id: 'O', label: 'Surface Area (O)' },
            { id: 'M', label: 'Lateral Area (M)' },
            { id: 'G', label: 'Base Area (G)' }
        ],
        redundantGroups: [['a', 'G']]
    },
    rectangularpyramid: {
        name: 'Rectangular Pyramid',
        dimension: '3d',
        type: 4,
        inputs: [
            { id: 'a', label: 'Base edge a' },
            { id: 'b', label: 'Base edge b' },
            { id: 'h', label: 'Height (h)' },
            { id: 'ha', label: 'Slant height a (ha)' },
            { id: 'hb', label: 'Slant height b (hb)' },
            { id: 'V', label: 'Volume (V)' },
            { id: 'O', label: 'Surface Area (O)' },
            { id: 'M', label: 'Lateral Area (M)' },
            { id: 'G', label: 'Base Area (G)' }
        ],
        redundantGroups: [['a', 'b', 'G']]
    }
};

function buildFormOptions(dimension) {
    return Object.entries(shapeConfig)
        .filter(([, cfg]) => cfg.dimension === dimension)
        .map(([key, cfg]) => `<option value="${key}">${cfg.name}</option>`)
        .join("");
}

const inputsContainer = document.getElementById("variousInputContainer");

let inputTypeOne=document.createElement('div');
inputTypeOne.classList.add('inputContainer');
inputTypeOne.innerHTML = `
    <div class="inputSelectDiv">
        <select name="selectInput" id="selectInput" class="selection">

        </select>
    </div>
    <input type="number" id="zahlenInput" placeholder="Number" class="numberInputField">
`;

let inputTypeTwo=document.createElement('div');
inputTypeTwo.classList.add('inputContainer');
inputTypeTwo.innerHTML = `
    <div class="inputRow">
        <div class="inputSelectDiv">
            <select name="selectInput" id="selectInputRow1" class="selection">

            </select>
        </div>
        <input type="number" id="zahlenInputRow1" placeholder="Number" class="numberInputField">
    </div>
    <div class="inputRow">
        <div class="inputSelectDiv">
            <select name="selectInput" id="selectInputRow2" class="selection">
          
            </select>
        </div>
        <input type="number" id="zahlenInputRow2" placeholder="Number" class="numberInputField">
    </div>
`;

let inputTypeThree=document.createElement('div');
inputTypeThree.classList.add('inputContainer');
inputTypeThree.innerHTML =`
    <div class="numbInputSwitchDiv">
        <button class="numbInputTypeBtn active" data-type="2Inputs">2 Inputs</button>
        <button class="numbInputTypeBtn" data-type="3Inputs">3 Inputs</button>
    </div>
    <div class="inputRow">
        <div class="inputSelectDiv">
            <select name="selectInput" id="selectInputRow1" class="selection">
          
            </select>
        </div>
        <input type="number" id="zahlenInputRow1" placeholder="Number" class="numberInputField">
    </div>
    <div class="inputRow">
        <div class="inputSelectDiv">
            <select name="selectInput" id="selectInputRow2" class="selection">
         
            </select>
        </div>
        <input type="number" id="zahlenInputRow2" placeholder="Number" class="numberInputField">
    </div>
`;

let inputTypeFour=document.createElement('div');
inputTypeFour.classList.add('inputContainer');
inputTypeFour.innerHTML = `
    <div class="inputRow">
        <div class="inputSelectDiv">
            <select name="selectInput" id="selectInputRow1" class="selection">

            </select>
        </div>
        <input type="number" id="zahlenInputRow1" placeholder="Number" class="numberInputField">
    </div>
    <div class="inputRow">
        <div class="inputSelectDiv">
            <select name="selectInput" id="selectInputRow2" class="selection">

            </select>
        </div>
        <input type="number" id="zahlenInputRow2" placeholder="Number" class="numberInputField">
    </div>
    <div class="inputRow">
        <div class="inputSelectDiv">
            <select name="selectInput" id="selectInputRow3" class="selection">

            </select>
        </div>
        <input type="number" id="zahlenInputRow3" placeholder="Number" class="numberInputField">
    </div>
`;

const errorMessages=document.getElementById("errorMessages");
const typeButtons=document.querySelectorAll(".dimensionTypeBtn");
const formSelectContainer=document.getElementById("selectForm");
const sketchContainer=document.querySelector(".geometryRightFormContainer");
const ausgabeContainer=document.getElementById("ausgabeContainer");
const rechenwegOutput=document.getElementById("rechenwegOutput");

let currentType = "2d";

// ── Mutual Exclusion of Dropdown Values ────────────────────────────────
// A value already selected in another dropdown cannot be
// selected a second time
function getAllActiveSelects() {
    return Array.from(inputsContainer.querySelectorAll(".inputContainer .selection"));
}

// Checks if a property value has become redundant due to already occupied
// values of a closed group (e.g., sum of angles, radius/diameter,
// side/perimeter) – it would then no longer provide new, independent
// information. Formula relationships between two INDEPENDENT
// quantities (e.g., Area = Side × Height) deliberately DO NOT fall under this,
// as their exclusion depends on the calculation core to be built (see below).
function isRedundantGiven(inputId, usedIds, groups) {
    return groups.some(group => {
        if (!group.includes(inputId)) return false;
        const usedInGroup = group.filter(id => usedIds.has(id));
        return usedInGroup.length >= group.length - 1;
    });
}

function refreshSelectOptions(shape) {
    const selects = getAllActiveSelects();
    const groups = shape.redundantGroups || [];

    selects.forEach(select => {
        const usedByOthers = new Set(
            selects.filter(s => s !== select && s.value).map(s => s.value)
        );
        const currentValue = select.value;

        select.innerHTML = shape.inputs
            .filter(input => input.id === currentValue ||
                (!usedByOthers.has(input.id) && !isRedundantGiven(input.id, usedByOthers, groups)))
            .map(input => `<option value="${input.id}">${input.label}</option>`)
            .join("");

        if (currentValue) select.value = currentValue;
    });
}

// ── Sketch / Shape Preview ───────────────────────────────────────────────
function sketchCircle(given) {
    const on = id => given.has(id) ? "is-active" : "";
    const areaOn = given.has('A') ? "area-active" : "";
    const perimeterOn = given.has('U') ? "perimeter-active" : "";
    return `
<svg class="shapeSketch" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <circle class="sketchOutline ${areaOn} ${perimeterOn}" cx="120" cy="120" r="80" />
    <circle class="sketchCenter" cx="120" cy="120" r="2.5" />

    <line class="sketchDim ${on('r')}" x1="120" y1="120" x2="177" y2="63" />
    <circle class="sketchHandle ${on('r')}" cx="177" cy="63" r="4" />
    <text class="sketchLabel ${on('r')}" x="164" y="90">r</text>

    <line class="sketchDim ${on('d')}" x1="40" y1="120" x2="200" y2="120" />
    <circle class="sketchHandle ${on('d')}" cx="40" cy="120" r="4" />
    <circle class="sketchHandle ${on('d')}" cx="200" cy="120" r="4" />
    <text class="sketchLabel ${on('d')}" x="120" y="138">d</text>

    <text class="sketchLabel ${on('A')}" x="95" y="150">A</text>
    <text class="sketchLabel ${on('U')}" x="120" y="214">P</text>
</svg>`;
}

function sketchSquare(given) {
    const on = id => given.has(id) ? "is-active" : "";
    const areaOn = given.has('A') ? "area-active" : "";
    const perimeterOn = given.has('U') ? "perimeter-active" : "";
    return `
<svg class="shapeSketch" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <rect class="sketchOutline ${areaOn} ${perimeterOn}" x="60" y="60" width="120" height="120" />

    <line class="sketchDim ${on('a')}" x1="60" y1="192" x2="180" y2="192" />
    <circle class="sketchHandle ${on('a')}" cx="60" cy="192" r="4" />
    <circle class="sketchHandle ${on('a')}" cx="180" cy="192" r="4" />
    <text class="sketchLabel ${on('a')}" x="120" y="208">a</text>

    <line class="sketchDim ${on('d')}" x1="60" y1="60" x2="180" y2="180" />
    <circle class="sketchHandle ${on('d')}" cx="60" cy="60" r="4" />
    <circle class="sketchHandle ${on('d')}" cx="180" cy="180" r="4" />
    <text class="sketchLabel ${on('d')}" x="152" y="98">d</text>

    <text class="sketchLabel ${on('A')}" x="95" y="145">A</text>
    <text class="sketchLabel ${on('U')}" x="45" y="45">P</text>
</svg>`;
}

function sketchRectangle(given) {
    const on = id => given.has(id) ? "is-active" : "";
    const areaOn = given.has('A') ? "area-active" : "";
    const perimeterOn = given.has('U') ? "perimeter-active" : "";
    return `
<svg class="shapeSketch" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <rect class="sketchOutline ${areaOn} ${perimeterOn}" x="40" y="70" width="160" height="100" />

    <line class="sketchDim ${on('a')}" x1="40" y1="184" x2="200" y2="184" />
    <circle class="sketchHandle ${on('a')}" cx="40" cy="184" r="4" />
    <circle class="sketchHandle ${on('a')}" cx="200" cy="184" r="4" />
    <text class="sketchLabel ${on('a')}" x="120" y="200">a</text>

    <line class="sketchDim ${on('b')}" x1="214" y1="70" x2="214" y2="170" />
    <circle class="sketchHandle ${on('b')}" cx="214" cy="70" r="4" />
    <circle class="sketchHandle ${on('b')}" cx="214" cy="170" r="4" />
    <text class="sketchLabel ${on('b')}" x="228" y="120">b</text>

    <line class="sketchDim ${on('d')}" x1="40" y1="70" x2="200" y2="170" />
    <circle class="sketchHandle ${on('d')}" cx="40" cy="70" r="4" />
    <circle class="sketchHandle ${on('d')}" cx="200" cy="170" r="4" />
    <text class="sketchLabel ${on('d')}" x="165" y="100">d</text>

    <text class="sketchLabel ${on('A')}" x="90" y="140">A</text>
    <text class="sketchLabel ${on('U')}" x="40" y="55">P</text>
</svg>`;
}

function sketchTriangle(given) {
    const on = id => given.has(id) ? "is-active" : "";
    const areaOn = given.has('A') ? "area-active" : "";
    return `
<svg class="shapeSketch" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <polygon class="sketchOutline ${areaOn}" points="40,195 200,195 130,45" />

    <line class="sketchDim ${on('c')}" x1="40" y1="211" x2="200" y2="211" />
    <circle class="sketchHandle ${on('c')}" cx="40" cy="211" r="4" />
    <circle class="sketchHandle ${on('c')}" cx="200" cy="211" r="4" />
    <text class="sketchLabel ${on('c')}" x="120" y="225">c</text>

    <line class="sketchDim ${on('a')}" x1="200" y1="195" x2="130" y2="45" />
    <circle class="sketchHandle ${on('a')}" cx="200" cy="195" r="4" />
    <circle class="sketchHandle ${on('a')}" cx="130" cy="45" r="4" />
    <text class="sketchLabel ${on('a')}" x="190" y="118">a</text>

    <line class="sketchDim ${on('b')}" x1="40" y1="195" x2="130" y2="45" />
    <circle class="sketchHandle ${on('b')}" cx="40" cy="195" r="4" />
    <circle class="sketchHandle ${on('b')}" cx="130" cy="45" r="4" />
    <text class="sketchLabel ${on('b')}" x="60" y="118">b</text>

    <path class="sketchDecor ${on('alpha')}" d="M 60,195 Q 63,182 50,178" />
    <text class="sketchLabel ${on('alpha')}" x="64" y="182">α</text>

    <path class="sketchDecor ${on('beta')}" d="M 180,195 Q 178,181 192,177" />
    <text class="sketchLabel ${on('beta')}" x="176" y="180">β</text>

    <path class="sketchDecor ${on('gamma')}" d="M 121,60 Q 129,69 138,61" />
    <text class="sketchLabel ${on('gamma')}" x="129" y="73">γ</text>

    <line class="sketchDim ${on('ha')}" x1="40" y1="195" x2="171" y2="134" />
    <circle class="sketchHandle ${on('ha')}" cx="171" cy="134" r="4" />
    <text class="sketchLabel ${on('ha')}" x="101" y="187">ha</text>

    <line class="sketchDim ${on('hb')}" x1="200" y1="195" x2="82" y2="124" />
    <circle class="sketchHandle ${on('hb')}" cx="82" cy="124" r="4" />
    <text class="sketchLabel ${on('hb')}" x="154" y="188">hb</text>

    <line class="sketchDim ${on('hc')}" x1="130" y1="45" x2="130" y2="195" />
    <circle class="sketchHandle ${on('hc')}" cx="130" cy="195" r="4" />
    <text class="sketchLabel ${on('hc')}" x="143" y="115">hc</text>

    <text class="sketchLabel ${on('A')}" x="123" y="160">A</text>
</svg>`;
}

function sketchRightTriangle(given) {
    const on = id => given.has(id) ? "is-active" : "";
    const areaOn = given.has('A') ? "area-active" : "";
    return `
<svg class="shapeSketch" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <polygon class="sketchOutline ${areaOn}" points="50,195 195,195 50,60" />
    <path class="sketchDecor" d="M 50,183 L 62,183 L 62,195" />

    <line class="sketchDim ${on('b')}" x1="50" y1="211" x2="195" y2="211" />
    <circle class="sketchHandle ${on('b')}" cx="50" cy="211" r="4" />
    <circle class="sketchHandle ${on('b')}" cx="195" cy="211" r="4" />
    <text class="sketchLabel ${on('b')}" x="122" y="225">b</text>

    <line class="sketchDim ${on('a')}" x1="34" y1="195" x2="34" y2="60" />
    <circle class="sketchHandle ${on('a')}" cx="34" cy="195" r="4" />
    <circle class="sketchHandle ${on('a')}" cx="34" cy="60" r="4" />
    <text class="sketchLabel ${on('a')}" x="20" y="128">a</text>

    <line class="sketchDim ${on('c')}" x1="50" y1="60" x2="195" y2="195" />
    <circle class="sketchHandle ${on('c')}" cx="50" cy="60" r="4" />
    <circle class="sketchHandle ${on('c')}" cx="195" cy="195" r="4" />
    <text class="sketchLabel ${on('c')}" x="140" y="118">c</text>

    <path class="sketchDecor ${on('alpha')}" d="M 175,195 Q 170,185 180,181" />
    <text class="sketchLabel ${on('alpha')}" x="169" y="183">α</text>

    <path class="sketchDecor ${on('beta')}" d="M 50,80 Q 61,84 65,74" />
    <text class="sketchLabel ${on('beta')}" x="63" y="85">β</text>

    <text class="sketchLabel ${on('A')}" x="90" y="165">A</text>
</svg>`;
}

function sketchTrapezoid(given) {
    const on = id => given.has(id) ? "is-active" : "";
    const areaOn = given.has('A') ? "area-active" : "";
    return `
<svg class="shapeSketch" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <polygon class="sketchOutline ${areaOn}" points="40,180 200,180 160,80 80,80" />

    <line class="sketchDim ${on('a')}" x1="40" y1="196" x2="200" y2="196" />
    <circle class="sketchHandle ${on('a')}" cx="40" cy="196" r="4" />
    <circle class="sketchHandle ${on('a')}" cx="200" cy="196" r="4" />
    <text class="sketchLabel ${on('a')}" x="120" y="210">a</text>

    <line class="sketchDim ${on('c')}" x1="80" y1="64" x2="160" y2="64" />
    <circle class="sketchHandle ${on('c')}" cx="80" cy="64" r="4" />
    <circle class="sketchHandle ${on('c')}" cx="160" cy="64" r="4" />
    <text class="sketchLabel ${on('c')}" x="120" y="50">c</text>

    <line class="sketchDim ${on('h')}" x1="25" y1="180" x2="25" y2="80" />
    <circle class="sketchHandle ${on('h')}" cx="25" cy="180" r="4" />
    <circle class="sketchHandle ${on('h')}" cx="25" cy="80" r="4" />
    <text class="sketchLabel ${on('h')}" x="14" y="130">h</text>

    <text class="sketchLabel ${on('A')}" x="120" y="140">A</text>
</svg>`;
}

function sketchParallelogram(given) {
    const on = id => given.has(id) ? "is-active" : "";
    const areaOn = given.has('A') ? "area-active" : "";
    return `
<svg class="shapeSketch" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <polygon class="sketchOutline ${areaOn}" points="60,180 200,180 170,70 30,70" />

    <line class="sketchDim ${on('a')}" x1="60" y1="196" x2="200" y2="196" />
    <circle class="sketchHandle ${on('a')}" cx="60" cy="196" r="4" />
    <circle class="sketchHandle ${on('a')}" cx="200" cy="196" r="4" />
    <text class="sketchLabel ${on('a')}" x="130" y="210">a</text>

    <line class="sketchDim ${on('b')}" x1="60" y1="180" x2="30" y2="70" />
    <circle class="sketchHandle ${on('b')}" cx="60" cy="180" r="4" />
    <circle class="sketchHandle ${on('b')}" cx="30" cy="70" r="4" />
    <text class="sketchLabel ${on('b')}" x="30" y="128">b</text>

    <line class="sketchDim ${on('h')}" x1="215" y1="180" x2="215" y2="70" />
    <circle class="sketchHandle ${on('h')}" cx="215" cy="180" r="4" />
    <circle class="sketchHandle ${on('h')}" cx="215" cy="70" r="4" />
    <text class="sketchLabel ${on('h')}" x="228" y="128">h</text>

    <text class="sketchLabel ${on('A')}" x="115" y="128">A</text>
</svg>`;
}

function sketchRhombus(given) {
    const on = id => given.has(id) ? "is-active" : "";
    const areaOn = given.has('A') ? "area-active" : "";
    const perimeterOn = given.has('U') ? "perimeter-active" : "";
    return `
<svg class="shapeSketch" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <polygon class="sketchOutline ${areaOn} ${perimeterOn}" points="120,70 202,128 120,186 38,128" />

    <line class="sketchDim ${on('a')}" x1="120" y1="70" x2="202" y2="128" />
    <circle class="sketchHandle ${on('a')}" cx="120" cy="70" r="4" />
    <circle class="sketchHandle ${on('a')}" cx="202" cy="128" r="4" />
    <text class="sketchLabel ${on('a')}" x="182" y="90">a</text>

    <line class="sketchDim ${on('e')}" x1="38" y1="128" x2="202" y2="128" />
    <circle class="sketchHandle ${on('e')}" cx="38" cy="128" r="4" />
    <circle class="sketchHandle ${on('e')}" cx="202" cy="128" r="4" />
    <text class="sketchLabel ${on('e')}" x="152" y="115">e</text>

    <line class="sketchDim ${on('f')}" x1="120" y1="70" x2="120" y2="186" />
    <circle class="sketchHandle ${on('f')}" cx="120" cy="70" r="4" />
    <circle class="sketchHandle ${on('f')}" cx="120" cy="186" r="4" />
    <text class="sketchLabel ${on('f')}" x="133" y="100">f</text>

    <line class="sketchDecor" x1="120" y1="186" x2="147" y2="205" stroke-dasharray="3 3" />
    <path class="sketchDecor" d="M 155,211 L 161,203 L 153,197" />
    <line class="sketchDim ${on('h')}" x1="202" y1="128" x2="147" y2="205" />
    <circle class="sketchHandle ${on('h')}" cx="202" cy="128" r="4" />
    <circle class="sketchHandle ${on('h')}" cx="147" cy="205" r="4" />
    <text class="sketchLabel ${on('h')}" x="192" y="168">h</text>

    <text class="sketchLabel ${on('A')}" x="100" y="145">A</text>
    <text class="sketchLabel ${on('U')}" x="65" y="180">P</text>
</svg>`;
}

// ── 3D: Solids ───────────────────────────────────────────────────────────

function sketchCube(given) {
    const on = id => given.has(id) ? "is-active" : "";
    const areaOn = given.has('V') ? "area-active" : "";
    const perimeterOn = given.has('O') ? "perimeter-active" : "";
    return `
<svg class="shapeSketch" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <polygon class="sketchFace ${areaOn}" points="60,100 160,100 160,200 60,200" />
    <polygon class="sketchFace ${areaOn}" points="60,100 100,60 200,60 160,100" />
    <polygon class="sketchFace ${areaOn}" points="160,100 200,60 200,160 160,200" />

    <line class="sketchDim ${on('d')}" x1="60" y1="200" x2="200" y2="60" />
    <circle class="sketchHandle ${on('d')}" cx="60" cy="200" r="4" />
    <circle class="sketchHandle ${on('d')}" cx="200" cy="60" r="4" />
    <text class="sketchLabel ${on('d')}" x="150" y="115">d</text>

    <polygon class="sketchEdges ${perimeterOn}" points="60,100 160,100 160,200 60,200" />
    <polygon class="sketchEdges ${perimeterOn}" points="60,100 100,60 200,60 160,100" />
    <polygon class="sketchEdges ${perimeterOn}" points="160,100 200,60 200,160 160,200" />

    <line class="sketchDim ${on('a')}" x1="60" y1="215" x2="160" y2="215" />
    <circle class="sketchHandle ${on('a')}" cx="60" cy="215" r="4" />
    <circle class="sketchHandle ${on('a')}" cx="160" cy="215" r="4" />
    <text class="sketchLabel ${on('a')}" x="110" y="229">a</text>

    <text class="sketchLabel ${on('V')}" x="80" y="150">V</text>
    <text class="sketchLabel ${on('O')}" x="185" y="110">O</text>
</svg>`;
}

function sketchCuboid(given) {
    const on = id => given.has(id) ? "is-active" : "";
    const areaOn = given.has('V') ? "area-active" : "";
    const perimeterOn = given.has('O') ? "perimeter-active" : "";
    const gOn = on('G');
    return `
<svg class="shapeSketch" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <polygon class="sketchFace ${areaOn}" points="50,90 170,90 170,180 50,180" />
    <polygon class="sketchFace sketchPart ${areaOn} ${gOn}" points="50,90 170,90 205,55 85,55" />
    <polygon class="sketchFace ${areaOn}" points="170,90 205,55 205,145 170,180" />

    <line class="sketchDim ${on('d')}" x1="50" y1="180" x2="205" y2="55" />
    <circle class="sketchHandle ${on('d')}" cx="50" cy="180" r="4" />
    <circle class="sketchHandle ${on('d')}" cx="205" cy="55" r="4" />
    <text class="sketchLabel ${on('d')}" x="140" y="128">d</text>

    <polygon class="sketchEdges ${perimeterOn}" points="50,90 170,90 170,180 50,180" />
    <polygon class="sketchEdges sketchPart ${perimeterOn} ${gOn}" points="50,90 170,90 205,55 85,55" />
    <polygon class="sketchEdges ${perimeterOn}" points="170,90 205,55 205,145 170,180" />

    <line class="sketchDim ${on('a')}" x1="50" y1="195" x2="170" y2="195" />
    <circle class="sketchHandle ${on('a')}" cx="50" cy="195" r="4" />
    <circle class="sketchHandle ${on('a')}" cx="170" cy="195" r="4" />
    <text class="sketchLabel ${on('a')}" x="110" y="209">a</text>

    <line class="sketchDim ${on('c')}" x1="35" y1="90" x2="35" y2="180" />
    <circle class="sketchHandle ${on('c')}" cx="35" cy="90" r="4" />
    <circle class="sketchHandle ${on('c')}" cx="35" cy="180" r="4" />
    <text class="sketchLabel ${on('c')}" x="20" y="135">c</text>

    <line class="sketchDim ${on('b')}" x1="39" y1="79" x2="74" y2="44" />
    <circle class="sketchHandle ${on('b')}" cx="39" cy="79" r="4" />
    <circle class="sketchHandle ${on('b')}" cx="74" cy="44" r="4" />
    <text class="sketchLabel ${on('b')}" x="46" y="53">b</text>

    <text class="sketchLabel ${gOn}" x="127" y="75">G</text>
    <text class="sketchLabel ${on('V')}" x="75" y="168">V</text>
    <text class="sketchLabel ${on('O')}" x="188" y="118">O</text>
</svg>`;
}

function sketchSphere(given) {
    const on = id => given.has(id) ? "is-active" : "";
    const wholeOn = `${given.has('V') ? "area-active" : ""} ${given.has('O') ? "perimeter-active" : ""}`;
    return `
<svg class="shapeSketch" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <circle class="sketchOutline ${wholeOn}" cx="120" cy="130" r="75" />
    <ellipse class="sketchDecor" cx="120" cy="130" rx="75" ry="18" />
    <circle class="sketchCenter" cx="120" cy="130" r="2.5" />

    <line class="sketchDim ${on('r')}" x1="120" y1="130" x2="173" y2="88" />
    <circle class="sketchHandle ${on('r')}" cx="173" cy="88" r="4" />
    <text class="sketchLabel ${on('r')}" x="155" y="90">r</text>

    <line class="sketchDim ${on('d')}" x1="45" y1="130" x2="195" y2="130" />
    <circle class="sketchHandle ${on('d')}" cx="45" cy="130" r="4" />
    <circle class="sketchHandle ${on('d')}" cx="195" cy="130" r="4" />
    <text class="sketchLabel ${on('d')}" x="120" y="150">d</text>

    <text class="sketchLabel ${on('V')}" x="75" y="168">V</text>
    <text class="sketchLabel ${on('O')}" x="130" y="80">O</text>
</svg>`;
}

function sketchCylinder(given) {
    const on = id => given.has(id) ? "is-active" : "";
    const wholeOn = `${given.has('V') ? "area-active" : ""} ${given.has('O') ? "perimeter-active" : ""}`;
    return `
<svg class="shapeSketch" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <path class="sketchOutline sketchPart ${wholeOn} ${on('M')}" d="M 50,70 A 70,22 0 0 0 190,70 L 190,190 A 70,22 0 0 1 50,190 Z" />
    <ellipse class="sketchOutline sketchPart ${wholeOn} ${on('G')}" cx="120" cy="190" rx="70" ry="22" />
    <ellipse class="sketchOutline ${wholeOn}" cx="120" cy="70" rx="70" ry="22" />

    <line class="sketchDim ${on('d')}" x1="50" y1="70" x2="190" y2="70" />
    <circle class="sketchHandle ${on('d')}" cx="50" cy="70" r="4" />
    <circle class="sketchHandle ${on('d')}" cx="190" cy="70" r="4" />
    <text class="sketchLabel ${on('d')}" x="120" y="50">d</text>

    <line class="sketchDim ${on('r')}" x1="120" y1="70" x2="165" y2="53" />
    <circle class="sketchHandle ${on('r')}" cx="165" cy="53" r="4" />
    <text class="sketchLabel ${on('r')}" x="152" y="43">r</text>

    <line class="sketchDim ${on('h')}" x1="215" y1="70" x2="215" y2="190" />
    <circle class="sketchHandle ${on('h')}" cx="215" cy="70" r="4" />
    <circle class="sketchHandle ${on('h')}" cx="215" cy="190" r="4" />
    <text class="sketchLabel ${on('h')}" x="228" y="130">h</text>

    <text class="sketchLabel ${on('G')}" x="120" y="192">G</text>
    <text class="sketchLabel ${on('V')}" x="120" y="115">V</text>
    <text class="sketchLabel ${on('M')}" x="120" y="145">M</text>
    <text class="sketchLabel ${on('O')}" x="75" y="218">O</text>
</svg>`;
}

function sketchCone(given) {
    const on = id => given.has(id) ? "is-active" : "";
    const wholeOn = `${given.has('V') ? "area-active" : ""} ${given.has('O') ? "perimeter-active" : ""}`;
    return `
<svg class="shapeSketch" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <path class="sketchOutline sketchPart ${wholeOn} ${on('M')}" d="M 120,50 L 190,190 A 70,20 0 0 1 50,190 Z" />
    <ellipse class="sketchOutline sketchPart ${wholeOn} ${on('G')}" cx="120" cy="190" rx="70" ry="20" />

    <line class="sketchDim ${on('s')}" x1="120" y1="50" x2="190" y2="190" />
    <circle class="sketchHandle ${on('s')}" cx="190" cy="190" r="4" />
    <text class="sketchLabel ${on('s')}" x="168" y="115">s</text>

    <line class="sketchDim ${on('r')}" x1="120" y1="190" x2="120" y2="210" />
    <circle class="sketchHandle ${on('r')}" cx="120" cy="210" r="4" />
    <text class="sketchLabel ${on('r')}" x="138" y="203">r</text>

    <line class="sketchDim ${on('d')}" x1="50" y1="222" x2="190" y2="222" />
    <circle class="sketchHandle ${on('d')}" cx="50" cy="222" r="4" />
    <circle class="sketchHandle ${on('d')}" cx="190" cy="222" r="4" />
    <text class="sketchLabel ${on('d')}" x="120" y="236">d</text>

    <line class="sketchDim ${on('h')}" x1="35" y1="50" x2="35" y2="190" />
    <circle class="sketchHandle ${on('h')}" cx="35" cy="50" r="4" />
    <circle class="sketchHandle ${on('h')}" cx="35" cy="190" r="4" />
    <text class="sketchLabel ${on('h')}" x="20" y="120">h</text>

    <text class="sketchLabel ${on('G')}" x="120" y="180">G</text>
    <text class="sketchLabel ${on('V')}" x="120" y="110">V</text>
    <text class="sketchLabel ${on('M')}" x="120" y="140">M</text>
    <text class="sketchLabel ${on('O')}" x="59" y="145">O</text>
</svg>`;
}

function sketchQuadrangularPyramid(given) {
    const on = id => given.has(id) ? "is-active" : "";
    const wholeOn = `${given.has('V') ? "area-active" : ""} ${given.has('O') ? "perimeter-active" : ""}`;
    return `
<svg class="shapeSketch" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <polygon class="sketchOutline sketchPart ${wholeOn} ${on('M')}" points="105,45 50,175 190,175" />
    <polygon class="sketchOutline sketchPart ${wholeOn} ${on('M')}" points="105,45 190,175 160,120" />
    <polygon class="sketchOutline sketchPart ${wholeOn} ${on('G')}" points="50,175 190,175 160,120 20,120" />
    <line class="sketchDecor" x1="105" y1="45" x2="20" y2="120" stroke-dasharray="3 3" />

    <line class="sketchDim ${on('a')}" x1="50" y1="191" x2="190" y2="191" />
    <circle class="sketchHandle ${on('a')}" cx="50" cy="191" r="4" />
    <circle class="sketchHandle ${on('a')}" cx="190" cy="191" r="4" />
    <text class="sketchLabel ${on('a')}" x="120" y="205">a</text>

    <line class="sketchDim ${on('h')}" x1="215" y1="45" x2="215" y2="175" />
    <circle class="sketchHandle ${on('h')}" cx="215" cy="45" r="4" />
    <circle class="sketchHandle ${on('h')}" cx="215" cy="175" r="4" />
    <text class="sketchLabel ${on('h')}" x="228" y="112">h</text>

    <line class="sketchDim ${on('ha')}" x1="105" y1="45" x2="120" y2="175" />
    <circle class="sketchHandle ${on('ha')}" cx="120" cy="175" r="4" />
    <text class="sketchLabel ${on('ha')}" x="95" y="120">ha</text>

    <text class="sketchLabel ${on('G')}" x="105" y="150">G</text>
    <text class="sketchLabel ${on('V')}" x="105" y="100">V</text>
    <text class="sketchLabel ${on('M')}" x="140" y="145">M</text>
    <text class="sketchLabel ${on('O')}" x="60" y="145">O</text>
</svg>`;
}

function sketchRectangularPyramid(given) {
    const on = id => given.has(id) ? "is-active" : "";
    const wholeOn = `${given.has('V') ? "area-active" : ""} ${given.has('O') ? "perimeter-active" : ""}`;
    return `
<svg class="shapeSketch" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <polygon class="sketchOutline sketchPart ${wholeOn} ${on('M')}" points="115,45 60,175 200,175" />
    <polygon class="sketchOutline sketchPart ${wholeOn} ${on('M')}" points="115,45 200,175 170,125" />
    <polygon class="sketchOutline sketchPart ${wholeOn} ${on('G')}" points="60,175 200,175 170,125 30,125" />
    <line class="sketchDecor" x1="115" y1="45" x2="30" y2="125" stroke-dasharray="3 3" />

    <line class="sketchDim ${on('a')}" x1="60" y1="191" x2="200" y2="191" />
    <circle class="sketchHandle ${on('a')}" cx="60" cy="191" r="4" />
    <circle class="sketchHandle ${on('a')}" cx="200" cy="191" r="4" />
    <text class="sketchLabel ${on('a')}" x="130" y="205">a</text>

    <line class="sketchDim ${on('b')}" x1="60" y1="175" x2="30" y2="125" />
    <circle class="sketchHandle ${on('b')}" cx="60" cy="175" r="4" />
    <circle class="sketchHandle ${on('b')}" cx="30" cy="125" r="4" />
    <text class="sketchLabel ${on('b')}" x="24" y="153">b</text>

    <line class="sketchDim ${on('h')}" x1="222" y1="45" x2="222" y2="175" />
    <circle class="sketchHandle ${on('h')}" cx="222" cy="45" r="4" />
    <circle class="sketchHandle ${on('h')}" cx="222" cy="175" r="4" />
    <text class="sketchLabel ${on('h')}" x="232" y="112">h</text>

    <line class="sketchDim ${on('ha')}" x1="115" y1="45" x2="130" y2="175" />
    <circle class="sketchHandle ${on('ha')}" cx="130" cy="175" r="4" />
    <text class="sketchLabel ${on('ha')}" x="98" y="118">ha</text>

    <line class="sketchDim ${on('hb')}" x1="115" y1="45" x2="45" y2="150" />
    <circle class="sketchHandle ${on('hb')}" cx="45" cy="150" r="4" />
    <text class="sketchLabel ${on('hb')}" x="60" y="95">hb</text>

    <text class="sketchLabel ${on('G')}" x="115" y="152">G</text>
    <text class="sketchLabel ${on('V')}" x="115" y="100">V</text>
    <text class="sketchLabel ${on('M')}" x="150" y="145">M</text>
    <text class="sketchLabel ${on('O')}" x="65" y="145">O</text>
</svg>`;
}

const shapeSketches = {
    circle: sketchCircle,
    square: sketchSquare,
    rectangle: sketchRectangle,
    triangle: sketchTriangle,
    rightTriangle: sketchRightTriangle,
    trapezoid: sketchTrapezoid,
    parallelogram: sketchParallelogram,
    rhombus: sketchRhombus,
    cube: sketchCube,
    cuboid: sketchCuboid,
    sphere: sketchSphere,
    cylinder: sketchCylinder,
    cone: sketchCone,
    quadrangularpyramid: sketchQuadrangularPyramid,
    rectangularpyramid: sketchRectangularPyramid
};

function renderSketch(shapeKey, given) {
    if (!sketchContainer) return;

    const sketchFn = shapeSketches[shapeKey];
    if (sketchFn) {
        sketchContainer.innerHTML = `<div class="sketchCard">${sketchFn(given)}</div>`;
        return;
    }

    const shape = shapeConfig[shapeKey];
    sketchContainer.innerHTML = `
        <div class="sketchCard">
            <div class="sketchPlaceholder">
                <i class="fa fa-square-o" aria-hidden="true"></i>
                <span>Sketch for "${shape ? shape.name : ""}" coming soon.</span>
            </div>
        </div>`;
}

// Reads which properties are assigned to the currently active dropdowns
// -> controls which elements are highlighted in the sketch.
function getSelectedInputIds() {
    const ids = new Set();
    getAllActiveSelects().forEach(select => {
        if (select.value) ids.add(select.value);
    });
    return ids;
}

function refreshSketch() {
    const shape = shapeConfig[formSelectContainer.value];
    if (shape) renderSketch(formSelectContainer.value, getSelectedInputIds());
}

// ── Calculation Engine ───────────────────────────────────────────────────
// Each resolver receives a Map { inputId: numericValue } containing exactly
// the values selected and entered by the user, and returns either
// { values, steps } (all calculable values + solution steps) or { error }.

function formatNum(n) {
    return n.toLocaleString('en-US', {
        minimumFractionDigits: window.MV.getDecimalPlaces(),
        maximumFractionDigits: window.MV.getDecimalPlaces()
    });
}

// School-like notation: real fraction bar instead of "/", square root bar instead of "√(...)"
function frac(num, den) {
    return `<span class="geo-frac"><span class="geo-frac-num">${num}</span><span class="geo-frac-bar"></span><span class="geo-frac-den">${den}</span></span>`;
}

function sqrt(content) {
    return `<span class="geo-sqrt"><span class="geo-sqrt-symbol">√</span><span class="geo-sqrt-radicand">${content}</span></span>`;
}

function nthroot(index, content) {
    return `<span class="geo-sqrt"><sup class="geo-sqrt-index">${index}</sup><span class="geo-sqrt-symbol">√</span><span class="geo-sqrt-radicand">${content}</span></span>`;
}

function solveSumProduct(s, p) {
    const disc = s * s - 4 * p;
    if (disc < 0) return null;
    const diff = Math.sqrt(disc);
    return [(s + diff) / 2, (s - diff) / 2];
}

// isGiven = true when this step merely reflects a user-entered value
// (no calculation) -> stays neutral instead of highlighted green in the solution steps.
function step(title, text, formula, solution, isGiven = false) {
    return { title, text, formula, solution, isGiven };
}

const DISPLAY_SYMBOLS = { alpha: 'α', beta: 'β', gamma: 'γ' };
function displaySymbol(id) {
    return DISPLAY_SYMBOLS[id] || id;
}

function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }

// ── Triangle: Trigonometric Helper Functions ─────────────────────────────
function triSideFromSAS(p, q, includedAngleDeg) {
    return Math.sqrt(p * p + q * q - 2 * p * q * Math.cos(toRad(includedAngleDeg)));
}
function triAngleFromSSS(oppositeSide, p, q) {
    const cosVal = (p * p + q * q - oppositeSide * oppositeSide) / (2 * p * q);
    return toDeg(Math.acos(Math.max(-1, Math.min(1, cosVal))));
}

// Solves the SSA case: given a side and its opposite angle (pVal/PDeg),
// as well as a second side (qVal); solves for its opposite angle. Since arcsin
// can yield two possible solutions, both are checked for validity.
function triSolveSSA(pVal, PDeg, qVal) {
    const sinOther = qVal * Math.sin(toRad(PDeg)) / pVal;
    if (sinOther > 1 + 1e-9) return { error: "none" };
    const clamped = Math.min(1, sinOther);
    const sol1 = toDeg(Math.asin(clamped));
    const sol2 = 180 - sol1;
    const valid1 = sol1 + PDeg < 180;
    const valid2 = sol2 + PDeg < 180 && Math.abs(sol2 - sol1) > 1e-6;
    if (valid1 && valid2) return { error: "ambiguous" };
    if (valid1) return { angle: sol1 };
    if (valid2) return { angle: sol2 };
    return { error: "none" };
}

function triSSAResult(pVal, PDeg, qVal, QName) {
    const result = triSolveSSA(pVal, PDeg, qVal);
    if (result.error === "none") {
        return { error: `This combination does not yield a valid triangle – no matching angle ${displaySymbol(QName)} can be found with these values.` };
    }
    if (result.error === "ambiguous") {
        return { error: "This combination cannot be solved uniquely: Two sides and an unincluded angle (SSA case) can result in two distinct valid triangles. Please provide the included angle or a third side instead." };
    }
    return { angle: result.angle };
}

// Common completion for all triangle cases: as soon as a, b, c, α, β, γ are known,
// the area and all three heights are calculated and steps are appended.
function finishTriangle(a, b, c, alpha, beta, gamma, steps) {
    const A = (a * b * Math.sin(toRad(gamma))) / 2;
    const ha = 2 * A / a;
    const hb = 2 * A / b;
    const hc = 2 * A / c;

    steps.push(step("Area", "Using two sides and the included angle:", `A = ${frac('a · b · sin(γ)', '2')} = ${frac(`${formatNum(a)} · ${formatNum(b)} · sin(${formatNum(gamma)}°)`, '2')} = ${formatNum(A)}`));
    steps.push(step("Height ha", "Rearranged from the area formula A = (a · ha) / 2:", `ha = ${frac('2A', 'a')} = ${frac(`2 · ${formatNum(A)}`, formatNum(a))} = ${formatNum(ha)}`));
    steps.push(step("Height hb", "Similarly for height on side b:", `hb = ${frac('2A', 'b')} = ${frac(`2 · ${formatNum(A)}`, formatNum(b))} = ${formatNum(hb)}`));
    steps.push(step("Height hc", "Similarly for height on side c:", `hc = ${frac('2A', 'c')} = ${frac(`2 · ${formatNum(A)}`, formatNum(c))} = ${formatNum(hc)}`));

    return { values: { a, b, c, alpha, beta, gamma, ha, hb, hc, A }, steps };
}

function resolveCircle(given) {
    const [knownId, knownVal] = Object.entries(given)[0];
    const steps = [];
    let r;

    if (knownId === 'r') {
        r = knownVal;
        steps.push(step("Radius", "The radius is the given value.", `r = ${formatNum(r)}`, null, true));
    } else if (knownId === 'd') {
        r = knownVal / 2;
        steps.push(step("Radius from diameter", "The radius is half of the diameter:", `r = ${frac('d', '2')} = ${frac(formatNum(knownVal), '2')} = ${formatNum(r)}`));
    } else if (knownId === 'U') {
        r = knownVal / (2 * Math.PI);
        steps.push(step("Radius from circumference", "The circumference is P = 2 · π · r, rearranged for r:", `r = ${frac('P', '2π')} = ${frac(formatNum(knownVal), '2π')} = ${formatNum(r)}`));
    } else {
        r = Math.sqrt(knownVal / Math.PI);
        steps.push(step("Radius from area", "The area is A = π · r², rearranged for r:", `r = ${sqrt(frac('A', 'π'))} = ${sqrt(frac(formatNum(knownVal), 'π'))} = ${formatNum(r)}`));
    }

    const d = 2 * r;
    const U = 2 * Math.PI * r;
    const A = Math.PI * r * r;

    if (knownId !== 'd') steps.push(step("Diameter", "The diameter is twice the radius:", `d = 2 · r = 2 · ${formatNum(r)} = ${formatNum(d)}`));
    if (knownId !== 'U') steps.push(step("Circumference", "Formula for circle circumference:", `P = 2π · r = 2π · ${formatNum(r)} = ${formatNum(U)}`));
    if (knownId !== 'A') steps.push(step("Area", "Formula for circle area:", `A = π · r² = π · ${formatNum(r)}² = ${formatNum(A)}`));

    return { values: { r, d, U, A }, steps };
}

function resolveSquare(given) {
    const [knownId, knownVal] = Object.entries(given)[0];
    const steps = [];
    let a;

    if (knownId === 'a') {
        a = knownVal;
        steps.push(step("Side length", "The side length is the given value.", `a = ${formatNum(a)}`, null, true));
    } else if (knownId === 'U') {
        a = knownVal / 4;
        steps.push(step("Side length from perimeter", "A square has 4 equal side lengths:", `a = ${frac('P', '4')} = ${frac(formatNum(knownVal), '4')} = ${formatNum(a)}`));
    } else if (knownId === 'A') {
        a = Math.sqrt(knownVal);
        steps.push(step("Side length from area", "The area is A = a², rearranged for a:", `a = ${sqrt('A')} = ${sqrt(formatNum(knownVal))} = ${formatNum(a)}`));
    } else {
        a = knownVal / Math.SQRT2;
        steps.push(step("Side length from diagonal", "The diagonal is d = a√2, rearranged for a:", `a = ${frac('d', '√2')} = ${frac(formatNum(knownVal), '√2')} = ${formatNum(a)}`));
    }

    const U = 4 * a;
    const A = a * a;
    const d = a * Math.SQRT2;

    if (knownId !== 'U') steps.push(step("Perimeter", "Four sides of equal length added together:", `P = 4 · a = 4 · ${formatNum(a)} = ${formatNum(U)}`));
    if (knownId !== 'A') steps.push(step("Area", "Side length squared:", `A = a² = ${formatNum(a)}² = ${formatNum(A)}`));
    if (knownId !== 'd') steps.push(step("Diagonal", "From the Pythagorean theorem (the diagonal splits the square into two right triangles):", `d = a · √2 = ${formatNum(a)} · √2 = ${formatNum(d)}`));

    return { values: { a, U, A, d }, steps };
}

function resolveRectangle(given) {
    const order = ['a', 'b', 'A', 'U', 'd'];
    const ids = Object.keys(given).sort((x, y) => order.indexOf(x) - order.indexOf(y));
    const key = ids.join(',');
    const v = given;
    const steps = [];
    let a, b;

    switch (key) {
        case 'a,b':
            a = v.a; b = v.b;
            steps.push(step("Sides", "Both sides are already given.", `a = ${formatNum(a)}, b = ${formatNum(b)}`, null, true));
            break;

        case 'a,A':
            a = v.a; b = v.A / v.a;
            steps.push(step("Side b from area", "The area is A = a · b, rearranged for b:", `b = ${frac('A', 'a')} = ${frac(formatNum(v.A), formatNum(a))} = ${formatNum(b)}`));
            break;

        case 'b,A':
            b = v.b; a = v.A / v.b;
            steps.push(step("Side a from area", "The area is A = a · b, rearranged for a:", `a = ${frac('A', 'b')} = ${frac(formatNum(v.A), formatNum(b))} = ${formatNum(a)}`));
            break;

        case 'a,U':
            a = v.a; b = v.U / 2 - v.a;
            if (b <= 0) return { error: "This combination does not result in a valid rectangle – the second side would be 0 or negative." };
            steps.push(step("Side b from perimeter", "The perimeter is P = 2 · (a + b), rearranged for b:", `b = ${frac('P', '2')} − a = ${frac(formatNum(v.U), '2')} − ${formatNum(a)} = ${formatNum(b)}`));
            break;

        case 'b,U':
            b = v.b; a = v.U / 2 - v.b;
            if (a <= 0) return { error: "This combination does not result in a valid rectangle – the second side would be 0 or negative." };
            steps.push(step("Side a from perimeter", "The perimeter is P = 2 · (a + b), rearranged for a:", `a = ${frac('P', '2')} − b = ${frac(formatNum(v.U), '2')} − ${formatNum(b)} = ${formatNum(a)}`));
            break;

        case 'a,d':
            a = v.a;
            if (v.d <= v.a) return { error: "This combination does not result in a valid rectangle – the diagonal must be greater than side a." };
            b = Math.sqrt(v.d * v.d - v.a * v.a);
            steps.push(step("Side b from diagonal", "By the Pythagorean theorem d² = a² + b², rearranged for b:", `b = ${sqrt('d² − a²')} = ${sqrt(`${formatNum(v.d)}² − ${formatNum(a)}²`)} = ${formatNum(b)}`));
            break;

        case 'b,d':
            b = v.b;
            if (v.d <= v.b) return { error: "This combination does not result in a valid rectangle – the diagonal must be greater than side b." };
            a = Math.sqrt(v.d * v.d - v.b * v.b);
            steps.push(step("Side a from diagonal", "By the Pythagorean theorem d² = a² + b², rearranged for a:", `a = ${sqrt('d² − b²')} = ${sqrt(`${formatNum(v.d)}² − ${formatNum(b)}²`)} = ${formatNum(a)}`));
            break;

        case 'A,U': {
            const s = v.U / 2;
            const disc = s * s - 4 * v.A;
            if (disc < 0) return { error: "This combination does not result in a valid rectangle – the area is too large for this perimeter." };
            const root = Math.sqrt(disc);
            a = (s + root) / 2;
            b = (s - root) / 2;
            steps.push(step("Half perimeter", "From the perimeter, we get the sum of the sides:", `a + b = ${frac('P', '2')} = ${frac(formatNum(v.U), '2')} = ${formatNum(s)}`));
            steps.push(step("Sides from sum and product", "a and b are the two solutions to t² − (a+b) · t + A = 0. Since both sides are interchangeable, the larger value is assigned to a and the smaller to b:", `t² − ${formatNum(s)} · t + ${formatNum(v.A)} = 0\nt₁ = ${formatNum(a)},  t₂ = ${formatNum(b)}`));
            break;
        }

        case 'A,d': {
            if (v.d * v.d < 2 * v.A) return { error: "This combination does not result in a valid rectangle – the area is too large for this diagonal." };
            const s = Math.sqrt(v.d * v.d + 2 * v.A);
            const diff = Math.sqrt(v.d * v.d - 2 * v.A);
            a = (s + diff) / 2;
            b = (s - diff) / 2;
            steps.push(step("Sum of sides", "From (a+b)² = d² + 2A it follows:", `a + b = ${sqrt('d² + 2A')} = ${sqrt(`${formatNum(v.d)}² + 2 · ${formatNum(v.A)}`)} = ${formatNum(s)}`));
            steps.push(step("Difference of sides", "From (a−b)² = d² − 2A it follows:", `a − b = ${sqrt('d² − 2A')} = ${sqrt(`${formatNum(v.d)}² − 2 · ${formatNum(v.A)}`)} = ${formatNum(diff)}`));
            steps.push(step("Sides a and b", "Combining the sum and difference yields both sides:", `a = ${frac(`${formatNum(s)} + ${formatNum(diff)}`, '2')} = ${formatNum(a)}\nb = ${frac(`${formatNum(s)} − ${formatNum(diff)}`, '2')} = ${formatNum(b)}`));
            break;
        }

        case 'U,d': {
            const s = v.U / 2;
            const disc = 2 * v.d * v.d - s * s;
            if (disc < 0) return { error: "This combination does not result in a valid rectangle – perimeter and diagonal are incompatible." };
            const diff = Math.sqrt(disc);
            a = (s + diff) / 2;
            b = (s - diff) / 2;
            steps.push(step("Half perimeter", "From the perimeter, we get the sum of the sides:", `a + b = ${frac('P', '2')} = ${frac(formatNum(v.U), '2')} = ${formatNum(s)}`));
            steps.push(step("Difference of sides", "Combined with d² = a² + b², we get the difference:", `a − b = ${sqrt('2d² − (a+b)²')} = ${sqrt(`2 · ${formatNum(v.d)}² − ${formatNum(s)}²`)} = ${formatNum(diff)}`));
            steps.push(step("Sides a and b", "Combining the sum and difference yields both sides:", `a = ${frac(`${formatNum(s)} + ${formatNum(diff)}`, '2')} = ${formatNum(a)}\nb = ${frac(`${formatNum(s)} − ${formatNum(diff)}`, '2')} = ${formatNum(b)}`));
            break;
        }

        default:
            return { error: "This combination is currently not supported." };
    }

    const A = a * b;
    const U = 2 * (a + b);
    const d = Math.sqrt(a * a + b * b);

    if (!ids.includes('A')) steps.push(step("Area", "Side times side:", `A = a · b = ${formatNum(a)} · ${formatNum(b)} = ${formatNum(A)}`));
    if (!ids.includes('U')) steps.push(step("Perimeter", "Twice the sum of both sides:", `P = 2 · (a + b) = 2 · (${formatNum(a)} + ${formatNum(b)}) = ${formatNum(U)}`));
    if (!ids.includes('d')) steps.push(step("Diagonal", "By the Pythagorean theorem:", `d = ${sqrt('a² + b²')} = ${sqrt(`${formatNum(a)}² + ${formatNum(b)}²`)} = ${formatNum(d)}`));

    return { values: { a, b, A, U, d }, steps };
}

function resolveTriangle(given) {
    const sides = ['a', 'b', 'c'].filter(id => id in given);
    const angles = ['alpha', 'beta', 'gamma'].filter(id => id in given);
    const others = Object.keys(given).filter(id => !sides.includes(id) && !angles.includes(id));

    if (others.length > 0) {
        return { error: "This combination is currently not supported – currently, only combinations of three values among a, b, c, α, β, or γ can be calculated (e.g., SSS, SAS, ASA, or SSA)." };
    }

    for (const id of angles) {
        if (given[id] <= 0 || given[id] >= 180) {
            return { error: "Angles must be between 0° and 180°." };
        }
    }

    // ── SSS: three sides ─────────────────────────────────────────────────
    if (sides.length === 3) {
        const a = given.a, b = given.b, c = given.c;
        if (a + b <= c || a + c <= b || b + c <= a) {
            return { error: "This combination does not result in a valid triangle – the triangle inequality is violated (each side must be shorter than the sum of the other two)." };
        }
        const alpha = triAngleFromSSS(a, b, c);
        const beta = triAngleFromSSS(b, a, c);
        const gamma = 180 - alpha - beta;
        const steps = [
            step("Sides", "All three sides are already given.", `a = ${formatNum(a)}, b = ${formatNum(b)}, c = ${formatNum(c)}`, null, true),
            step("Angle α (Law of Cosines)", "The Law of Cosines relates all three sides to the angle opposite a:", `cos(α) = ${frac('b² + c² − a²', '2 · b · c')} = ${frac(`${formatNum(b)}² + ${formatNum(c)}² − ${formatNum(a)}²`, `2 · ${formatNum(b)} · ${formatNum(c)}`)}\nα = ${formatNum(alpha)}°`),
            step("Angle β (Law of Cosines)", "Similarly for the angle opposite b:", `cos(β) = ${frac('a² + c² − b²', '2 · a · c')} = ${frac(`${formatNum(a)}² + ${formatNum(c)}² − ${formatNum(b)}²`, `2 · ${formatNum(a)} · ${formatNum(c)}`)}\nβ = ${formatNum(beta)}°`),
            step("Angle γ", "The sum of angles in a triangle yields the third angle:", `γ = 180° − α − β = 180° − ${formatNum(alpha)}° − ${formatNum(beta)}° = ${formatNum(gamma)}°`)
        ];
        return finishTriangle(a, b, c, alpha, beta, gamma, steps);
    }

    // ── SAS (included angle) or SSA (unincluded angle) ──────
    if (sides.length === 2 && angles.length === 1) {
        const pair = sides.join(',');
        const knownAngleId = angles[0];

        if (pair === 'a,b' && knownAngleId === 'gamma') {
            const a = given.a, b = given.b, gamma = given.gamma;
            const c = triSideFromSAS(a, b, gamma);
            const alpha = triAngleFromSSS(a, b, c);
            const beta = 180 - alpha - gamma;
            const steps = [
                step("Sides and included angle", "Sides a, b and the angle γ between them are given.", `a = ${formatNum(a)}, b = ${formatNum(b)}, γ = ${formatNum(gamma)}°`, null, true),
                step("Side c (Law of Cosines)", "The Law of Cosines calculates the third side from the other two and the included angle:", `c = ${sqrt('a² + b² − 2 · a · b · cos(γ)')} = ${sqrt(`${formatNum(a)}² + ${formatNum(b)}² − 2 · ${formatNum(a)} · ${formatNum(b)} · cos(${formatNum(gamma)}°)`)} = ${formatNum(c)}`),
                step("Angle α (Law of Cosines)", "With all three sides known, the Law of Cosines yields the angle opposite a:", `cos(α) = ${frac('b² + c² − a²', '2 · b · c')}\nα = ${formatNum(alpha)}°`),
                step("Angle β", "The sum of angles in a triangle yields the final angle:", `β = 180° − α − γ = ${formatNum(beta)}°`)
            ];
            return finishTriangle(a, b, c, alpha, beta, gamma, steps);
        }

        if (pair === 'b,c' && knownAngleId === 'alpha') {
            const b = given.b, c = given.c, alpha = given.alpha;
            const a = triSideFromSAS(b, c, alpha);
            const beta = triAngleFromSSS(b, a, c);
            const gamma = 180 - alpha - beta;
            const steps = [
                step("Sides and included angle", "Sides b, c and the angle α between them are given.", `b = ${formatNum(b)}, c = ${formatNum(c)}, α = ${formatNum(alpha)}°`, null, true),
                step("Side a (Law of Cosines)", "The Law of Cosines calculates the third side from the other two and the included angle:", `a = ${sqrt('b² + c² − 2 · b · c · cos(α)')} = ${sqrt(`${formatNum(b)}² + ${formatNum(c)}² − 2 · ${formatNum(b)} · ${formatNum(c)} · cos(${formatNum(alpha)}°)`)} = ${formatNum(a)}`),
                step("Angle β (Law of Cosines)", "With all three sides known, the Law of Cosines yields the angle opposite b:", `cos(β) = ${frac('a² + c² − b²', '2 · a · c')}\nβ = ${formatNum(beta)}°`),
                step("Angle γ", "The sum of angles in a triangle yields the final angle:", `γ = 180° − α − β = ${formatNum(gamma)}°`)
            ];
            return finishTriangle(a, b, c, alpha, beta, gamma, steps);
        }

        if (pair === 'a,c' && knownAngleId === 'beta') {
            const a = given.a, c = given.c, beta = given.beta;
            const b = triSideFromSAS(a, c, beta);
            const alpha = triAngleFromSSS(a, b, c);
            const gamma = 180 - alpha - beta;
            const steps = [
                step("Sides and included angle", "Sides a, c and the angle β between them are given.", `a = ${formatNum(a)}, c = ${formatNum(c)}, β = ${formatNum(beta)}°`, null, true),
                step("Side b (Law of Cosines)", "The Law of Cosines calculates the third side from the other two and the included angle:", `b = ${sqrt('a² + c² − 2 · a · c · cos(β)')} = ${sqrt(`${formatNum(a)}² + ${formatNum(c)}² − 2 · ${formatNum(a)} · ${formatNum(c)} · cos(${formatNum(beta)}°)`)} = ${formatNum(b)}`),
                step("Angle α (Law of Cosines)", "With all three sides known, the Law of Cosines yields the angle opposite a:", `cos(α) = ${frac('b² + c² − a²', '2 · b · c')}\nα = ${formatNum(alpha)}°`),
                step("Angle γ", "The sum of angles in a triangle yields the final angle:", `γ = 180° − α − β = ${formatNum(gamma)}°`)
            ];
            return finishTriangle(a, b, c, alpha, beta, gamma, steps);
        }

        // ── SSA: known angle is NOT between the two sides ───
        if (pair === 'a,b' && knownAngleId === 'alpha') {
            const a = given.a, b = given.b, alpha = given.alpha;
            const res = triSSAResult(a, alpha, b, 'beta');
            if (res.error) return { error: res.error };
            const beta = res.angle;
            const gamma = 180 - alpha - beta;
            const c = a * Math.sin(toRad(gamma)) / Math.sin(toRad(alpha));
            const steps = [
                step("Two sides and an unincluded angle", "Sides a, b are given, as well as angle α opposite side a.", `a = ${formatNum(a)}, b = ${formatNum(b)}, α = ${formatNum(alpha)}°`, null, true),
                step("Angle β (Law of Sines)", "The Law of Sines relates sides to their opposite angles:", `sin(β) = ${frac('b · sin(α)', 'a')} = ${frac(`${formatNum(b)} · sin(${formatNum(alpha)}°)`, formatNum(a))}\nβ = ${formatNum(beta)}°`),
                step("Angle γ", "The sum of angles in a triangle yields the final angle:", `γ = 180° − α − β = ${formatNum(gamma)}°`),
                step("Side c (Law of Sines)", "The Law of Sines also yields the final side:", `c = ${frac('a · sin(γ)', 'sin(α)')} = ${frac(`${formatNum(a)} · sin(${formatNum(gamma)}°)`, `sin(${formatNum(alpha)}°)`)} = ${formatNum(c)}`)
            ];
            return finishTriangle(a, b, c, alpha, beta, gamma, steps);
        }

        if (pair === 'a,b' && knownAngleId === 'beta') {
            const a = given.a, b = given.b, beta = given.beta;
            const res = triSSAResult(b, beta, a, 'alpha');
            if (res.error) return { error: res.error };
            const alpha = res.angle;
            const gamma = 180 - alpha - beta;
            const c = a * Math.sin(toRad(gamma)) / Math.sin(toRad(alpha));
            const steps = [
                step("Two sides and an unincluded angle", "Sides a, b are given, as well as angle β opposite side b.", `a = ${formatNum(a)}, b = ${formatNum(b)}, β = ${formatNum(beta)}°`, null, true),
                step("Angle α (Law of Sines)", "The Law of Sines relates sides to their opposite angles:", `sin(α) = ${frac('a · sin(β)', 'b')} = ${frac(`${formatNum(a)} · sin(${formatNum(beta)}°)`, formatNum(b))}\nα = ${formatNum(alpha)}°`),
                step("Angle γ", "The sum of angles in a triangle yields the final angle:", `γ = 180° − α − β = ${formatNum(gamma)}°`),
                step("Side c (Law of Sines)", "The Law of Sines also yields the final side:", `c = ${frac('a · sin(γ)', 'sin(α)')} = ${frac(`${formatNum(a)} · sin(${formatNum(gamma)}°)`, `sin(${formatNum(alpha)}°)`)} = ${formatNum(c)}`)
            ];
            return finishTriangle(a, b, c, alpha, beta, gamma, steps);
        }

        if (pair === 'b,c' && knownAngleId === 'beta') {
            const b = given.b, c = given.c, beta = given.beta;
            const res = triSSAResult(b, beta, c, 'gamma');
            if (res.error) return { error: res.error };
            const gamma = res.angle;
            const alpha = 180 - beta - gamma;
            const a = b * Math.sin(toRad(alpha)) / Math.sin(toRad(beta));
            const steps = [
                step("Two sides and an unincluded angle", "Sides b, c are given, as well as angle β opposite side b.", `b = ${formatNum(b)}, c = ${formatNum(c)}, β = ${formatNum(beta)}°`, null, true),
                step("Angle γ (Law of Sines)", "The Law of Sines relates sides to their opposite angles:", `sin(γ) = ${frac('c · sin(β)', 'b')} = ${frac(`${formatNum(c)} · sin(${formatNum(beta)}°)`, formatNum(b))}\nγ = ${formatNum(gamma)}°`),
                step("Angle α", "The sum of angles in a triangle yields the final angle:", `α = 180° − β − γ = ${formatNum(alpha)}°`),
                step("Side a (Law of Sines)", "The Law of Sines also yields the final side:", `a = ${frac('b · sin(α)', 'sin(β)')} = ${frac(`${formatNum(b)} · sin(${formatNum(alpha)}°)`, `sin(${formatNum(beta)}°)`)} = ${formatNum(a)}`)
            ];
            return finishTriangle(a, b, c, alpha, beta, gamma, steps);
        }

        if (pair === 'b,c' && knownAngleId === 'gamma') {
            const b = given.b, c = given.c, gamma = given.gamma;
            const res = triSSAResult(c, gamma, b, 'beta');
            if (res.error) return { error: res.error };
            const beta = res.angle;
            const alpha = 180 - beta - gamma;
            const a = b * Math.sin(toRad(alpha)) / Math.sin(toRad(beta));
            const steps = [
                step("Two sides and an unincluded angle", "Sides b, c are given, as well as angle γ opposite side c.", `b = ${formatNum(b)}, c = ${formatNum(c)}, γ = ${formatNum(gamma)}°`, null, true),
                step("Angle β (Law of Sines)", "The Law of Sines relates sides to their opposite angles:", `sin(β) = ${frac('b · sin(γ)', 'c')} = ${frac(`${formatNum(b)} · sin(${formatNum(gamma)}°)`, formatNum(c))}\nβ = ${formatNum(beta)}°`),
                step("Angle α", "The sum of angles in a triangle yields the final angle:", `α = 180° − β − γ = ${formatNum(alpha)}°`),
                step("Side a (Law of Sines)", "The Law of Sines also yields the final side:", `a = ${frac('b · sin(α)', 'sin(β)')} = ${frac(`${formatNum(b)} · sin(${formatNum(alpha)}°)`, `sin(${formatNum(beta)}°)`)} = ${formatNum(a)}`)
            ];
            return finishTriangle(a, b, c, alpha, beta, gamma, steps);
        }

        if (pair === 'a,c' && knownAngleId === 'alpha') {
            const a = given.a, c = given.c, alpha = given.alpha;
            const res = triSSAResult(a, alpha, c, 'gamma');
            if (res.error) return { error: res.error };
            const gamma = res.angle;
            const beta = 180 - alpha - gamma;
            const b = a * Math.sin(toRad(beta)) / Math.sin(toRad(alpha));
            const steps = [
                step("Two sides and an unincluded angle", "Sides a, c are given, as well as angle α opposite side a.", `a = ${formatNum(a)}, c = ${formatNum(c)}, α = ${formatNum(alpha)}°`, null, true),
                step("Angle γ (Law of Sines)", "The Law of Sines relates sides to their opposite angles:", `sin(γ) = ${frac('c · sin(α)', 'a')} = ${frac(`${formatNum(c)} · sin(${formatNum(alpha)}°)`, formatNum(a))}\nγ = ${formatNum(gamma)}°`),
                step("Angle β", "The sum of angles in a triangle yields the final angle:", `β = 180° − α − γ = ${formatNum(beta)}°`),
                step("Side b (Law of Sines)", "The Law of Sines also yields the final side:", `b = ${frac('a · sin(β)', 'sin(α)')} = ${frac(`${formatNum(a)} · sin(${formatNum(beta)}°)`, `sin(${formatNum(alpha)}°)`)} = ${formatNum(b)}`)
            ];
            return finishTriangle(a, b, c, alpha, beta, gamma, steps);
        }

        if (pair === 'a,c' && knownAngleId === 'gamma') {
            const a = given.a, c = given.c, gamma = given.gamma;
            const res = triSSAResult(c, gamma, a, 'alpha');
            if (res.error) return { error: res.error };
            const alpha = res.angle;
            const beta = 180 - alpha - gamma;
            const b = a * Math.sin(toRad(beta)) / Math.sin(toRad(alpha));
            const steps = [
                step("Two sides and an unincluded angle", "Sides a, c are given, as well as angle γ opposite side c.", `a = ${formatNum(a)}, c = ${formatNum(c)}, γ = ${formatNum(gamma)}°`, null, true),
                step("Angle α (Law of Sines)", "The Law of Sines relates sides to their opposite angles:", `sin(α) = ${frac('a · sin(γ)', 'c')} = ${frac(`${formatNum(a)} · sin(${formatNum(gamma)}°)`, formatNum(c))}\nα = ${formatNum(alpha)}°`),
                step("Angle β", "The sum of angles in a triangle yields the final angle:", `β = 180° − α − γ = ${formatNum(beta)}°`),
                step("Side b (Law of Sines)", "The Law of Sines also yields the final side:", `b = ${frac('a · sin(β)', 'sin(α)')} = ${frac(`${formatNum(a)} · sin(${formatNum(beta)}°)`, `sin(${formatNum(alpha)}°)`)} = ${formatNum(b)}`)
            ];
            return finishTriangle(a, b, c, alpha, beta, gamma, steps);
        }
    }

    // ── ASA / AAS: two angles and one side ──────────────────────────────
    if (angles.length === 2 && sides.length === 1) {
        const angleSum = angles.reduce((sum, id) => sum + given[id], 0);
        if (angleSum >= 180) {
            return { error: "This combination does not result in a valid triangle – the sum of two angles cannot reach or exceed 180°." };
        }

        const angleVals = { alpha: given.alpha, beta: given.beta, gamma: given.gamma };
        const missingAngle = ['alpha', 'beta', 'gamma'].find(id => !(id in given));
        angleVals[missingAngle] = 180 - angleSum;
        const { alpha, beta, gamma } = angleVals;

        const sideId = sides[0];
        const sideVal = given[sideId];
        const oppAngleOf = { a: 'alpha', b: 'beta', c: 'gamma' };
        const sideVals = { [sideId]: sideVal };
        const missingSides = ['a', 'b', 'c'].filter(id => id !== sideId);

        missingSides.forEach(id => {
            sideVals[id] = sideVal * Math.sin(toRad(angleVals[oppAngleOf[id]])) / Math.sin(toRad(angleVals[oppAngleOf[sideId]]));
        });

        const knownLabel = angles.map(id => displaySymbol(id)).join(', ');
        const steps = [
            step("Two angles and one side", `Angles ${knownLabel} and side ${sideId} are given.`,
                angles.map(id => `${displaySymbol(id)} = ${formatNum(given[id])}°`).concat(`${sideId} = ${formatNum(sideVal)}`).join(',  '), null, true),
            step(`Angle ${displaySymbol(missingAngle)}`, "The sum of angles in a triangle yields the third angle:", `${displaySymbol(missingAngle)} = 180° − ${angles.map(id => displaySymbol(id)).join(' − ')} = ${formatNum(angleVals[missingAngle])}°`)
        ];
        missingSides.forEach(id => {
            steps.push(step(`Side ${id}`, "The Law of Sines relates each side to its opposite angle:",
                `${id} = ${frac(`${sideId} · sin(${displaySymbol(oppAngleOf[id])})`, `sin(${displaySymbol(oppAngleOf[sideId])})`)} = ${frac(`${formatNum(sideVal)} · sin(${formatNum(angleVals[oppAngleOf[id]])}°)`, `sin(${formatNum(angleVals[oppAngleOf[sideId]])}°)`)} = ${formatNum(sideVals[id])}`));
        });

        return finishTriangle(sideVals.a, sideVals.b, sideVals.c, alpha, beta, gamma, steps);
    }

    return { error: "This combination is currently not supported." };
}

function resolveRightTriangle(given) {
    if (('alpha' in given && (given.alpha <= 0 || given.alpha >= 90)) ||
        ('beta' in given && (given.beta <= 0 || given.beta >= 90))) {
        return { error: "Angles in a right triangle must be between 0° and 90°." };
    }

    const order = ['a', 'b', 'c', 'alpha', 'beta', 'A'];
    const ids = Object.keys(given).sort((x, y) => order.indexOf(x) - order.indexOf(y));
    const key = ids.join(',');
    const v = given;
    const steps = [];
    let a, b, c, alpha, beta;

    switch (key) {
        case 'a,b':
            a = v.a; b = v.b;
            c = Math.sqrt(a * a + b * b);
            alpha = toDeg(Math.atan(a / b));
            beta = 90 - alpha;
            steps.push(step("Legs", "Both legs are already given.", `a = ${formatNum(a)}, b = ${formatNum(b)}`, null, true));
            steps.push(step("Hypotenuse", "By the Pythagorean theorem:", `c = ${sqrt('a² + b²')} = ${sqrt(`${formatNum(a)}² + ${formatNum(b)}²`)} = ${formatNum(c)}`));
            steps.push(step("Angle α", "Using the tangent function (opposite over adjacent):", `tan(α) = ${frac('a', 'b')} = ${frac(formatNum(a), formatNum(b))}\nα = tan⁻¹(${formatNum(a / b)}) = ${formatNum(alpha)}°`));
            steps.push(step("Angle β", "The sum of angles in a right triangle yields β:", `β = 90° − α = 90° − ${formatNum(alpha)}° = ${formatNum(beta)}°`));
            break;

        case 'a,c':
            a = v.a; c = v.c;
            if (c <= a) return { error: "This combination does not yield a valid triangle – the hypotenuse must be greater than leg a." };
            b = Math.sqrt(c * c - a * a);
            alpha = toDeg(Math.asin(a / c));
            beta = 90 - alpha;
            steps.push(step("Leg b", "By the Pythagorean theorem, rearranged for b:", `b = ${sqrt('c² − a²')} = ${sqrt(`${formatNum(c)}² − ${formatNum(a)}²`)} = ${formatNum(b)}`));
            steps.push(step("Angle α", "Using the sine function (opposite over hypotenuse):", `sin(α) = ${frac('a', 'c')} = ${frac(formatNum(a), formatNum(c))}\nα = sin⁻¹(${formatNum(a / c)}) = ${formatNum(alpha)}°`));
            steps.push(step("Angle β", "The sum of angles in a right triangle yields β:", `β = 90° − α = ${formatNum(beta)}°`));
            break;

        case 'b,c':
            b = v.b; c = v.c;
            if (c <= b) return { error: "This combination does not yield a valid triangle – the hypotenuse must be greater than leg b." };
            a = Math.sqrt(c * c - b * b);
            beta = toDeg(Math.asin(b / c));
            alpha = 90 - beta;
            steps.push(step("Leg a", "By the Pythagorean theorem, rearranged for a:", `a = ${sqrt('c² − b²')} = ${sqrt(`${formatNum(c)}² − ${formatNum(b)}²`)} = ${formatNum(a)}`));
            steps.push(step("Angle β", "Using the sine function (opposite over hypotenuse):", `sin(β) = ${frac('b', 'c')} = ${frac(formatNum(b), formatNum(c))}\nβ = sin⁻¹(${formatNum(b / c)}) = ${formatNum(beta)}°`));
            steps.push(step("Angle α", "The sum of angles in a right triangle yields α:", `α = 90° − β = ${formatNum(alpha)}°`));
            break;

        case 'c,alpha':
            c = v.c; alpha = v.alpha;
            beta = 90 - alpha;
            a = c * Math.sin(toRad(alpha));
            b = c * Math.cos(toRad(alpha));
            steps.push(step("Angle β", "The sum of angles in a right triangle yields β:", `β = 90° − α = ${formatNum(beta)}°`));
            steps.push(step("Leg a", "Using the sine function:", `a = c · sin(α) = ${formatNum(c)} · sin(${formatNum(alpha)}°) = ${formatNum(a)}`));
            steps.push(step("Leg b", "Using the cosine function:", `b = c · cos(α) = ${formatNum(c)} · cos(${formatNum(alpha)}°) = ${formatNum(b)}`));
            break;

        case 'c,beta':
            c = v.c; beta = v.beta;
            alpha = 90 - beta;
            b = c * Math.sin(toRad(beta));
            a = c * Math.cos(toRad(beta));
            steps.push(step("Angle α", "The sum of angles in a right triangle yields α:", `α = 90° − β = ${formatNum(alpha)}°`));
            steps.push(step("Leg b", "Using the sine function:", `b = c · sin(β) = ${formatNum(c)} · sin(${formatNum(beta)}°) = ${formatNum(b)}`));
            steps.push(step("Leg a", "Using the cosine function:", `a = c · cos(β) = ${formatNum(c)} · cos(${formatNum(beta)}°) = ${formatNum(a)}`));
            break;

        case 'a,alpha':
            a = v.a; alpha = v.alpha;
            beta = 90 - alpha;
            c = a / Math.sin(toRad(alpha));
            b = a / Math.tan(toRad(alpha));
            steps.push(step("Angle β", "The sum of angles in a right triangle yields β:", `β = 90° − α = ${formatNum(beta)}°`));
            steps.push(step("Hypotenuse", "Using the sine function, rearranged for c:", `c = ${frac('a', 'sin(α)')} = ${frac(formatNum(a), `sin(${formatNum(alpha)}°)`)} = ${formatNum(c)}`));
            steps.push(step("Leg b", "Using the tangent function, rearranged for b:", `b = ${frac('a', 'tan(α)')} = ${frac(formatNum(a), `tan(${formatNum(alpha)}°)`)} = ${formatNum(b)}`));
            break;

        case 'b,alpha':
            b = v.b; alpha = v.alpha;
            beta = 90 - alpha;
            a = b * Math.tan(toRad(alpha));
            c = b / Math.cos(toRad(alpha));
            steps.push(step("Angle β", "The sum of angles in a right triangle yields β:", `β = 90° − α = ${formatNum(beta)}°`));
            steps.push(step("Leg a", "Using the tangent function:", `a = b · tan(α) = ${formatNum(b)} · tan(${formatNum(alpha)}°) = ${formatNum(a)}`));
            steps.push(step("Hypotenuse", "Using the cosine function, rearranged for c:", `c = ${frac('b', 'cos(α)')} = ${frac(formatNum(b), `cos(${formatNum(alpha)}°)`)} = ${formatNum(c)}`));
            break;

        case 'a,beta':
            a = v.a; beta = v.beta;
            alpha = 90 - beta;
            b = a * Math.tan(toRad(beta));
            c = a / Math.cos(toRad(beta));
            steps.push(step("Angle α", "The sum of angles in a right triangle yields α:", `α = 90° − β = ${formatNum(alpha)}°`));
            steps.push(step("Leg b", "Using the tangent function:", `b = a · tan(β) = ${formatNum(a)} · tan(${formatNum(beta)}°) = ${formatNum(b)}`));
            steps.push(step("Hypotenuse", "Using the cosine function, rearranged for c:", `c = ${frac('a', 'cos(β)')} = ${frac(formatNum(a), `cos(${formatNum(beta)}°)`)} = ${formatNum(c)}`));
            break;

        case 'b,beta':
            b = v.b; beta = v.beta;
            alpha = 90 - beta;
            c = b / Math.sin(toRad(beta));
            a = b / Math.tan(toRad(beta));
            steps.push(step("Angle α", "The sum of angles in a right triangle yields α:", `α = 90° − β = ${formatNum(alpha)}°`));
            steps.push(step("Hypotenuse", "Using the sine function, rearranged for c:", `c = ${frac('b', 'sin(β)')} = ${frac(formatNum(b), `sin(${formatNum(beta)}°)`)} = ${formatNum(c)}`));
            steps.push(step("Leg a", "Using the tangent function, rearranged for a:", `a = ${frac('b', 'tan(β)')} = ${frac(formatNum(b), `tan(${formatNum(beta)}°)`)} = ${formatNum(a)}`));
            break;

        case 'a,A':
            a = v.a;
            b = 2 * v.A / a;
            c = Math.sqrt(a * a + b * b);
            alpha = toDeg(Math.atan(a / b));
            beta = 90 - alpha;
            steps.push(step("Leg b from area", "The area is A = (a · b) / 2, rearranged for b:", `b = ${frac('2A', 'a')} = ${frac(`2 · ${formatNum(v.A)}`, formatNum(a))} = ${formatNum(b)}`));
            steps.push(step("Hypotenuse", "By the Pythagorean theorem:", `c = ${sqrt('a² + b²')} = ${formatNum(c)}`));
            steps.push(step("Angle α", "Using the tangent function:", `α = tan⁻¹(${frac('a', 'b')}) = tan⁻¹(${formatNum(a / b)}) = ${formatNum(alpha)}°`));
            steps.push(step("Angle β", "The sum of angles yields β:", `β = 90° − α = ${formatNum(beta)}°`));
            break;

        case 'b,A':
            b = v.b;
            a = 2 * v.A / b;
            c = Math.sqrt(a * a + b * b);
            alpha = toDeg(Math.atan(a / b));
            beta = 90 - alpha;
            steps.push(step("Leg a from area", "The area is A = (a · b) / 2, rearranged for a:", `a = ${frac('2A', 'b')} = ${frac(`2 · ${formatNum(v.A)}`, formatNum(b))} = ${formatNum(a)}`));
            steps.push(step("Hypotenuse", "By the Pythagorean theorem:", `c = ${sqrt('a² + b²')} = ${formatNum(c)}`));
            steps.push(step("Angle α", "Using the tangent function:", `α = tan⁻¹(${frac('a', 'b')}) = ${formatNum(alpha)}°`));
            steps.push(step("Angle β", "The sum of angles yields β:", `β = 90° − α = ${formatNum(beta)}°`));
            break;

        case 'c,A': {
            c = v.c;
            if (c * c < 4 * v.A) return { error: "This combination does not yield a valid triangle – the area is too large for this hypotenuse." };
            const sum = Math.sqrt(c * c + 4 * v.A);
            const dif = Math.sqrt(c * c - 4 * v.A);
            a = (sum + dif) / 2;
            b = (sum - dif) / 2;
            alpha = toDeg(Math.atan(a / b));
            beta = 90 - alpha;
            steps.push(step("Sum of legs", "From a² + b² = c² and a · b = 2A, it follows that (a+b)² = c² + 4A:", `a + b = ${sqrt('c² + 4A')} = ${sqrt(`${formatNum(c)}² + 4 · ${formatNum(v.A)}`)} = ${formatNum(sum)}`));
            steps.push(step("Difference of legs", "Similarly, (a−b)² = c² − 4A:", `a − b = ${sqrt('c² − 4A')} = ${sqrt(`${formatNum(c)}² − 4 · ${formatNum(v.A)}`)} = ${formatNum(dif)}`));
            steps.push(step("Legs a and b", "Sum and difference together yield both legs:", `a = ${frac(`${formatNum(sum)} + ${formatNum(dif)}`, '2')} = ${formatNum(a)}\nb = ${frac(`${formatNum(sum)} − ${formatNum(dif)}`, '2')} = ${formatNum(b)}`));
            steps.push(step("Angle α", "Using the tangent function:", `α = tan⁻¹(${frac('a', 'b')}) = ${formatNum(alpha)}°`));
            steps.push(step("Angle β", "The sum of angles yields β:", `β = 90° − α = ${formatNum(beta)}°`));
            break;
        }

        case 'alpha,A':
            alpha = v.alpha; beta = 90 - alpha;
            c = Math.sqrt(4 * v.A / Math.sin(2 * toRad(alpha)));
            a = c * Math.sin(toRad(alpha));
            b = c * Math.cos(toRad(alpha));
            steps.push(step("Angle β", "The sum of angles in a right triangle yields β:", `β = 90° − α = ${formatNum(beta)}°`));
            steps.push(step("Hypotenuse from area", "With a = c·sin(α) and b = c·cos(α), it follows that A = c² · sin(2α) / 4, rearranged for c:", `c = ${sqrt(frac('4A', 'sin(2α)'))} = ${sqrt(frac(`4 · ${formatNum(v.A)}`, `sin(${formatNum(2 * alpha)}°)`))} = ${formatNum(c)}`));
            steps.push(step("Leg a", "Using the sine function:", `a = c · sin(α) = ${formatNum(c)} · sin(${formatNum(alpha)}°) = ${formatNum(a)}`));
            steps.push(step("Leg b", "Using the cosine function:", `b = c · cos(α) = ${formatNum(c)} · cos(${formatNum(alpha)}°) = ${formatNum(b)}`));
            break;

        case 'beta,A':
            beta = v.beta; alpha = 90 - beta;
            c = Math.sqrt(4 * v.A / Math.sin(2 * toRad(beta)));
            b = c * Math.sin(toRad(beta));
            a = c * Math.cos(toRad(beta));
            steps.push(step("Angle α", "The sum of angles in a right triangle yields α:", `α = 90° − β = ${formatNum(alpha)}°`));
            steps.push(step("Hypotenuse from area", "Analogous to the derivation using α, using β instead:", `c = ${sqrt(frac('4A', 'sin(2β)'))} = ${sqrt(frac(`4 · ${formatNum(v.A)}`, `sin(${formatNum(2 * beta)}°)`))} = ${formatNum(c)}`));
            steps.push(step("Leg b", "Using the sine function:", `b = c · sin(β) = ${formatNum(c)} · sin(${formatNum(beta)}°) = ${formatNum(b)}`));
            steps.push(step("Leg a", "Using the cosine function:", `a = c · cos(β) = ${formatNum(c)} · cos(${formatNum(beta)}°) = ${formatNum(a)}`));
            break;

        default:
            return { error: "This combination is currently not supported." };
    }

    const A = a * b / 2;
    if (!ids.includes('A')) steps.push(step("Area", "Half the product of the two legs:", `A = ${frac('a · b', '2')} = ${frac(`${formatNum(a)} · ${formatNum(b)}`, '2')} = ${formatNum(A)}`));

    return { values: { a, b, c, alpha, beta, A }, steps };
}

function resolveTrapezoid(given) {
    const order = ['a', 'c', 'h', 'A'];
    const ids = Object.keys(given).sort((x, y) => order.indexOf(x) - order.indexOf(y));
    const key = ids.join(',');
    const v = given;
    const steps = [];
    let a, c, h, A;

    switch (key) {
        case 'a,c,h':
            a = v.a; c = v.c; h = v.h;
            A = (a + c) / 2 * h;
            steps.push(step("Bases and height", "All three values are already given.", `a = ${formatNum(a)}, c = ${formatNum(c)}, h = ${formatNum(h)}`, null, true));
            steps.push(step("Area", "The trapezoid area is the average of the two parallel sides times the height:", `A = ${frac('a + c', '2')} · h = ${frac(`${formatNum(a)} + ${formatNum(c)}`, '2')} · ${formatNum(h)} = ${formatNum(A)}`));
            break;

        case 'a,c,A':
            a = v.a; c = v.c; A = v.A;
            if (a + c === 0) return { error: "This combination does not yield a valid trapezoid." };
            h = 2 * A / (a + c);
            steps.push(step("Bases and area", "All three values are already given.", `a = ${formatNum(a)}, c = ${formatNum(c)}, A = ${formatNum(A)}`, null, true));
            steps.push(step("Height", "The area formula A = (a+c)/2 · h rearranged for h:", `h = ${frac('2A', 'a + c')} = ${frac(`2 · ${formatNum(A)}`, `${formatNum(a)} + ${formatNum(c)}`)} = ${formatNum(h)}`));
            break;

        case 'a,h,A':
            a = v.a; h = v.h; A = v.A;
            if (h === 0) return { error: "This combination does not yield a valid trapezoid – the height cannot be 0." };
            c = 2 * A / h - a;
            if (c <= 0) return { error: "This combination does not yield a valid trapezoid – the second base would be 0 or negative." };
            steps.push(step("Base and height", "Both values are already given.", `a = ${formatNum(a)}, h = ${formatNum(h)}`, null, true));
            steps.push(step("Parallel side c", "The area formula A = (a+c)/2 · h rearranged for c:", `c = ${frac('2A', 'h')} − a = ${frac(`2 · ${formatNum(A)}`, formatNum(h))} − ${formatNum(a)} = ${formatNum(c)}`));
            break;

        case 'c,h,A':
            c = v.c; h = v.h; A = v.A;
            if (h === 0) return { error: "This combination does not yield a valid trapezoid – the height cannot be 0." };
            a = 2 * A / h - c;
            if (a <= 0) return { error: "This combination does not yield a valid trapezoid – base a would be 0 or negative." };
            steps.push(step("Parallel side and height", "Both values are already given.", `c = ${formatNum(c)}, h = ${formatNum(h)}`, null, true));
            steps.push(step("Base a", "The area formula A = (a+c)/2 · h rearranged for a:", `a = ${frac('2A', 'h')} − c = ${frac(`2 · ${formatNum(A)}`, formatNum(h))} − ${formatNum(c)} = ${formatNum(a)}`));
            break;

        default:
            return { error: "This combination is currently not supported." };
    }

    return { values: { a, c, h, A }, steps };
}

function resolveParallelogram(given) {
    const order = ['a', 'b', 'h', 'A'];
    const ids = Object.keys(given).sort((x, y) => order.indexOf(x) - order.indexOf(y));
    const key = ids.join(',');
    const v = given;
    const steps = [];
    let a, b, h, A;

    switch (key) {
        case 'a,b,h':
            a = v.a; b = v.b; h = v.h;
            A = a * h;
            steps.push(step("Sides and height", "All three values are already given.", `a = ${formatNum(a)}, b = ${formatNum(b)}, h = ${formatNum(h)}`, null, true));
            steps.push(step("Area", "Base side a times corresponding height h:", `A = a · h = ${formatNum(a)} · ${formatNum(h)} = ${formatNum(A)}`));
            break;

        case 'a,b,A':
            a = v.a; b = v.b; A = v.A;
            if (a === 0) return { error: "This combination does not yield a valid parallelogram – side a cannot be 0." };
            h = A / a;
            steps.push(step("Sides and area", "All three values are already given.", `a = ${formatNum(a)}, b = ${formatNum(b)}, A = ${formatNum(A)}`, null, true));
            steps.push(step("Height", "The area formula A = a · h rearranged for h:", `h = ${frac('A', 'a')} = ${frac(formatNum(A), formatNum(a))} = ${formatNum(h)}`));
            break;

        case 'b,h,A':
            b = v.b; h = v.h; A = v.A;
            if (h === 0) return { error: "This combination does not yield a valid parallelogram – height cannot be 0." };
            a = A / h;
            if (b < h) return { error: "This combination does not yield a valid parallelogram – side b cannot be shorter than height h." };
            steps.push(step("Side and height", "Both values are already given.", `b = ${formatNum(b)}, h = ${formatNum(h)}`, null, true));
            steps.push(step("Side a", "The area formula A = a · h rearranged for a:", `a = ${frac('A', 'h')} = ${frac(formatNum(A), formatNum(h))} = ${formatNum(a)}`));
            break;

        default:
            return { error: "This combination is currently not supported." };
    }

    return { values: { a, b, h, A }, steps };
}

function resolveRhombus(given) {
    const v = { ...given };
    const preSteps = [];
    const steps = [];

    const rawIds = Object.keys(given);
    preSteps.push(step("Given values", "These values are already known.",
        rawIds.map(id => `${id} = ${formatNum(given[id])}`).join(',  '), null, true));

    if ('U' in v && !('a' in v)) {
        v.a = v.U / 4;
        preSteps.push(step("Side length from perimeter", "A rhombus has 4 sides of equal length:", `a = ${frac('P', '4')} = ${frac(formatNum(v.U), '4')} = ${formatNum(v.a)}`));
    }

    let a, e, f, h, A, U;
    const order = ['a', 'e', 'f', 'h', 'A'];
    const ids = Object.keys(v).filter(id => order.includes(id)).sort((x, y) => order.indexOf(x) - order.indexOf(y));
    const key = ids.join(',');

    switch (key) {
        case 'a,e':
            a = v.a; e = v.e;
            if (e >= 2 * a) return { error: "This combination does not yield a valid rhombus – the diagonal is too long for this side length." };
            f = 2 * Math.sqrt(a * a - (e / 2) * (e / 2));
            A = e * f / 2;
            h = A / a;
            steps.push(step("Diagonal f", "The diagonals bisect each other at right angles; by the Pythagorean theorem in the sub-triangle:", `f = 2 · ${sqrt(`a² − ${frac('e', '2')}²`)} = 2 · ${sqrt(`${formatNum(a)}² − ${frac(formatNum(e), '2')}²`)} = ${formatNum(f)}`));
            steps.push(step("Area", "Half the product of the diagonals:", `A = ${frac('e · f', '2')} = ${frac(`${formatNum(e)} · ${formatNum(f)}`, '2')} = ${formatNum(A)}`));
            steps.push(step("Height", "Rearranged from the area formula A = a · h:", `h = ${frac('A', 'a')} = ${frac(formatNum(A), formatNum(a))} = ${formatNum(h)}`));
            break;

        case 'a,f':
            a = v.a; f = v.f;
            if (f >= 2 * a) return { error: "This combination does not yield a valid rhombus – the diagonal is too long for this side length." };
            e = 2 * Math.sqrt(a * a - (f / 2) * (f / 2));
            A = e * f / 2;
            h = A / a;
            steps.push(step("Diagonal e", "The diagonals bisect each other at right angles; by the Pythagorean theorem in the sub-triangle:", `e = 2 · ${sqrt(`a² − ${frac('f', '2')}²`)} = 2 · ${sqrt(`${formatNum(a)}² − ${frac(formatNum(f), '2')}²`)} = ${formatNum(e)}`));
            steps.push(step("Area", "Half the product of the diagonals:", `A = ${frac('e · f', '2')} = ${frac(`${formatNum(e)} · ${formatNum(f)}`, '2')} = ${formatNum(A)}`));
            steps.push(step("Height", "Rearranged from the area formula A = a · h:", `h = ${frac('A', 'a')} = ${frac(formatNum(A), formatNum(a))} = ${formatNum(h)}`));
            break;

        case 'e,f':
            e = v.e; f = v.f;
            a = Math.sqrt((e / 2) * (e / 2) + (f / 2) * (f / 2));
            A = e * f / 2;
            h = A / a;
            steps.push(step("Side length", "The diagonals bisect each other at right angles; by the Pythagorean theorem in the sub-triangle:", `a = ${sqrt(`${frac('e', '2')}² + ${frac('f', '2')}²`)} = ${sqrt(`${frac(formatNum(e), '2')}² + ${frac(formatNum(f), '2')}²`)} = ${formatNum(a)}`));
            steps.push(step("Area", "Half the product of the diagonals:", `A = ${frac('e · f', '2')} = ${frac(`${formatNum(e)} · ${formatNum(f)}`, '2')} = ${formatNum(A)}`));
            steps.push(step("Height", "Rearranged from the area formula A = a · h:", `h = ${frac('A', 'a')} = ${frac(formatNum(A), formatNum(a))} = ${formatNum(h)}`));
            break;

        case 'a,h':
            a = v.a; h = v.h;
            if (h > a) return { error: "This combination does not yield a valid rhombus – height cannot be greater than side length." };
            A = a * h;
            {
                const disc = 4 * Math.pow(a, 4) - 4 * A * A;
                if (disc < 0) return { error: "This combination does not yield a valid rhombus." };
                e = Math.sqrt(2 * a * a + Math.sqrt(disc));
                f = Math.sqrt(2 * a * a - Math.sqrt(disc));
            }
            steps.push(step("Area", "Side length times corresponding height:", `A = a · h = ${formatNum(a)} · ${formatNum(h)} = ${formatNum(A)}`));
            steps.push(step("Diagonals from a and A", "From e² + f² = 4a² and e · f = 2A, e² and f² are found as solutions to a quadratic equation:", `t² − 4a² · t + 4A² = 0\ne = ${formatNum(e)},  f = ${formatNum(f)}`));
            break;

        case 'a,A':
            a = v.a; A = v.A;
            h = A / a;
            {
                const disc = 4 * Math.pow(a, 4) - 4 * A * A;
                if (disc < 0) return { error: "This combination does not yield a valid rhombus – the area is too large for this side length." };
                e = Math.sqrt(2 * a * a + Math.sqrt(disc));
                f = Math.sqrt(2 * a * a - Math.sqrt(disc));
            }
            steps.push(step("Height", "Rearranged from the area formula A = a · h:", `h = ${frac('A', 'a')} = ${frac(formatNum(A), formatNum(a))} = ${formatNum(h)}`));
            steps.push(step("Diagonals from a and A", "From e² + f² = 4a² and e · f = 2A, e² and f² are found as solutions to a quadratic equation:", `t² − 4a² · t + 4A² = 0\ne = ${formatNum(e)},  f = ${formatNum(f)}`));
            break;

        case 'e,h':
            e = v.e; h = v.h;
            if (h >= e) return { error: "This combination does not yield a valid rhombus – the height must be smaller than diagonal e." };
            a = (e * e) / (2 * Math.sqrt(e * e - h * h));
            A = a * h;
            f = 2 * A / e;
            steps.push(step("Side length from e and h", "Combining a² = (e/2)² + (f/2)² with A = a·h = e·f/2 yields after solving:", `a = ${frac('e²', `2 · ${sqrt('e² − h²')}`)} = ${frac(`${formatNum(e)}²`, `2 · ${sqrt(`${formatNum(e)}² − ${formatNum(h)}²`)}`)} = ${formatNum(a)}`));
            steps.push(step("Area", "Side length times height:", `A = a · h = ${formatNum(a)} · ${formatNum(h)} = ${formatNum(A)}`));
            steps.push(step("Diagonal f", "Rearranged from the area formula A = e · f / 2:", `f = ${frac('2A', 'e')} = ${frac(`2 · ${formatNum(A)}`, formatNum(e))} = ${formatNum(f)}`));
            break;

        case 'f,h':
            f = v.f; h = v.h;
            if (h >= f) return { error: "This combination does not yield a valid rhombus – the height must be smaller than diagonal f." };
            a = (f * f) / (2 * Math.sqrt(f * f - h * h));
            A = a * h;
            e = 2 * A / f;
            steps.push(step("Side length from f and h", "Combining a² = (e/2)² + (f/2)² with A = a·h = e·f/2 yields after solving:", `a = ${frac('f²', `2 · ${sqrt('f² − h²')}`)} = ${frac(`${formatNum(f)}²`, `2 · ${sqrt(`${formatNum(f)}² − ${formatNum(h)}²`)}`)} = ${formatNum(a)}`));
            steps.push(step("Area", "Side length times height:", `A = a · h = ${formatNum(a)} · ${formatNum(h)} = ${formatNum(A)}`));
            steps.push(step("Diagonal e", "Rearranged from the area formula A = e · f / 2:", `e = ${frac('2A', 'f')} = ${frac(`2 · ${formatNum(A)}`, formatNum(f))} = ${formatNum(e)}`));
            break;

        case 'e,A':
            e = v.e; A = v.A;
            f = 2 * A / e;
            a = Math.sqrt((e / 2) * (e / 2) + (f / 2) * (f / 2));
            h = A / a;
            steps.push(step("Diagonal f", "Rearranged from the area formula A = e · f / 2:", `f = ${frac('2A', 'e')} = ${frac(`2 · ${formatNum(A)}`, formatNum(e))} = ${formatNum(f)}`));
            steps.push(step("Side length", "By the Pythagorean theorem in the sub-triangle formed by diagonals:", `a = ${sqrt(`${frac('e', '2')}² + ${frac('f', '2')}²`)} = ${formatNum(a)}`));
            steps.push(step("Height", "Rearranged from the area formula A = a · h:", `h = ${frac('A', 'a')} = ${frac(formatNum(A), formatNum(a))} = ${formatNum(h)}`));
            break;

        case 'f,A':
            f = v.f; A = v.A;
            e = 2 * A / f;
            a = Math.sqrt((e / 2) * (e / 2) + (f / 2) * (f / 2));
            h = A / a;
            steps.push(step("Diagonal e", "Rearranged from the area formula A = e · f / 2:", `e = ${frac('2A', 'f')} = ${frac(`2 · ${formatNum(A)}`, formatNum(f))} = ${formatNum(e)}`));
            steps.push(step("Side length", "By the Pythagorean theorem in the sub-triangle formed by diagonals:", `a = ${sqrt(`${frac('e', '2')}² + ${frac('f', '2')}²`)} = ${formatNum(a)}`));
            steps.push(step("Height", "Rearranged from the area formula A = a · h:", `h = ${frac('A', 'a')} = ${frac(formatNum(A), formatNum(a))} = ${formatNum(h)}`));
            break;

        case 'h,A':
            h = v.h; A = v.A;
            if (h === 0) return { error: "This combination does not yield a valid rhombus – height cannot be 0." };
            a = A / h;
            {
                const disc = 4 * Math.pow(a, 4) - 4 * A * A;
                if (disc < 0) return { error: "This combination does not yield a valid rhombus." };
                e = Math.sqrt(2 * a * a + Math.sqrt(disc));
                f = Math.sqrt(2 * a * a - Math.sqrt(disc));
            }
            steps.push(step("Side length", "Rearranged from the area formula A = a · h:", `a = ${frac('A', 'h')} = ${frac(formatNum(A), formatNum(h))} = ${formatNum(a)}`));
            steps.push(step("Diagonals from a and A", "From e² + f² = 4a² and e · f = 2A, e² and f² are found as solutions to a quadratic equation:", `t² − 4a² · t + 4A² = 0\ne = ${formatNum(e)},  f = ${formatNum(f)}`));
            break;

        default:
            return { error: "This combination is currently not supported." };
    }

    U = 4 * a;
    if (!('U' in given)) steps.push(step("Perimeter", "Four equal side lengths added together:", `P = 4 · a = 4 · ${formatNum(a)} = ${formatNum(U)}`));

    return { values: { a, e, f, h, U, A }, steps: [...preSteps, ...steps] };
}

function resolveCube(given) {
    const [knownId, knownVal] = Object.entries(given)[0];
    const steps = [];
    let a;

    if (knownId === 'a') {
        a = knownVal;
        steps.push(step("Edge length", "The edge length is the given value.", `a = ${formatNum(a)}`, null, true));
    } else if (knownId === 'O') {
        a = Math.sqrt(knownVal / 6);
        steps.push(step("Edge length from surface area", "The surface area consists of 6 congruent squares: O = 6a², rearranged for a:", `a = ${sqrt(frac('O', '6'))} = ${sqrt(frac(formatNum(knownVal), '6'))} = ${formatNum(a)}`));
    } else if (knownId === 'V') {
        a = Math.cbrt(knownVal);
        steps.push(step("Edge length from volume", "The volume is V = a³, rearranged for a:", `a = ${nthroot(3, 'V')} = ${nthroot(3, formatNum(knownVal))} = ${formatNum(a)}`));
    } else {
        a = knownVal / Math.sqrt(3);
        steps.push(step("Edge length from space diagonal", "The space diagonal is d = a√3, rearranged for a:", `a = ${frac('d', '√3')} = ${frac(formatNum(knownVal), '√3')} = ${formatNum(a)}`));
    }

    const O = 6 * a * a, V = a * a * a, d = a * Math.sqrt(3);

    if (knownId !== 'O') steps.push(step("Surface area", "Six square faces:", `O = 6 · a² = 6 · ${formatNum(a)}² = ${formatNum(O)}`));
    if (knownId !== 'V') steps.push(step("Volume", "Edge length cubed:", `V = a³ = ${formatNum(a)}³ = ${formatNum(V)}`));
    if (knownId !== 'd') steps.push(step("Space diagonal", "Via the 3D Pythagorean theorem:", `d = a · √3 = ${formatNum(a)} · √3 = ${formatNum(d)}`));

    return { values: { a, O, V, d }, steps };
}

function resolveSphere(given) {
    const [knownId, knownVal] = Object.entries(given)[0];
    const steps = [];
    let r;

    if (knownId === 'r') {
        r = knownVal;
        steps.push(step("Radius", "The radius is the given value.", `r = ${formatNum(r)}`, null, true));
    } else if (knownId === 'd') {
        r = knownVal / 2;
        steps.push(step("Radius from diameter", "The radius is half of the diameter:", `r = ${frac('d', '2')} = ${frac(formatNum(knownVal), '2')} = ${formatNum(r)}`));
    } else if (knownId === 'O') {
        r = Math.sqrt(knownVal / (4 * Math.PI));
        steps.push(step("Radius from surface area", "The surface area of a sphere is O = 4π · r², rearranged for r:", `r = ${sqrt(frac('O', '4π'))} = ${sqrt(frac(formatNum(knownVal), '4π'))} = ${formatNum(r)}`));
    } else {
        r = Math.cbrt((3 * knownVal) / (4 * Math.PI));
        steps.push(step("Radius from volume", "The volume of a sphere is V = (4/3)π · r³, rearranged for r:", `r = ${nthroot(3, frac('3V', '4π'))} = ${nthroot(3, frac(`3 · ${formatNum(knownVal)}`, '4π'))} = ${formatNum(r)}`));
    }

    const d = 2 * r, O = 4 * Math.PI * r * r, V = (4 / 3) * Math.PI * r * r * r;

    if (knownId !== 'd') steps.push(step("Diameter", "Double the radius:", `d = 2 · r = 2 · ${formatNum(r)} = ${formatNum(d)}`));
    if (knownId !== 'O') steps.push(step("Surface area", "Formula for the surface area of a sphere:", `O = 4π · r² = 4π · ${formatNum(r)}² = ${formatNum(O)}`));
    if (knownId !== 'V') steps.push(step("Volume", "Formula for the volume of a sphere:", `V = ${frac('4', '3')}π · r³ = ${frac('4', '3')}π · ${formatNum(r)}³ = ${formatNum(V)}`));

    return { values: { r, d, O, V }, steps };
}

function resolveCylinder(given) {
    const v = { ...given };
    const rawIds = Object.keys(given);
    const preSteps = [step("Given values", "These values are already known.", rawIds.map(id => `${id} = ${formatNum(given[id])}`).join(',  '), null, true)];

    if ('d' in v && !('r' in v)) {
        v.r = v.d / 2;
        preSteps.push(step("Radius from diameter", "The radius is half of the diameter:", `r = ${frac('d', '2')} = ${frac(formatNum(v.d), '2')} = ${formatNum(v.r)}`));
    } else if ('G' in v && !('r' in v)) {
        v.r = Math.sqrt(v.G / Math.PI);
        preSteps.push(step("Radius from base area", "The base area is G = π · r², rearranged for r:", `r = ${sqrt(frac('G', 'π'))} = ${sqrt(frac(formatNum(v.G), 'π'))} = ${formatNum(v.r)}`));
    }

    const steps = [];
    const order = ['r', 'h', 'V', 'O', 'M'];
    const key = Object.keys(v).filter(id => order.includes(id)).sort((x, y) => order.indexOf(x) - order.indexOf(y)).join(',');
    let r, h;

    switch (key) {
        case 'r,h': r = v.r; h = v.h; break;

        case 'r,V':
            r = v.r; h = v.V / (Math.PI * r * r);
            steps.push(step("Height from volume", "The volume is V = π · r² · h, rearranged for h:", `h = ${frac('V', 'π · r²')} = ${frac(formatNum(v.V), `π · ${formatNum(r)}²`)} = ${formatNum(h)}`));
            break;

        case 'r,O':
            r = v.r; h = v.O / (2 * Math.PI * r) - r;
            if (h <= 0) return { error: "This combination does not yield a valid cylinder – the height would be 0 or negative." };
            steps.push(step("Height from surface area", "The surface area is O = 2π · r² + 2π · r · h, rearranged for h:", `h = ${frac('O', '2π · r')} − r = ${frac(formatNum(v.O), `2π · ${formatNum(r)}`)} − ${formatNum(r)} = ${formatNum(h)}`));
            break;

        case 'r,M':
            r = v.r; h = v.M / (2 * Math.PI * r);
            steps.push(step("Height from lateral area", "The lateral area is M = 2π · r · h, rearranged for h:", `h = ${frac('M', '2π · r')} = ${frac(formatNum(v.M), `2π · ${formatNum(r)}`)} = ${formatNum(h)}`));
            break;

        case 'h,V':
            h = v.h; r = Math.sqrt(v.V / (Math.PI * h));
            steps.push(step("Radius from volume", "The volume is V = π · r² · h, rearranged for r:", `r = ${sqrt(frac('V', 'π · h'))} = ${sqrt(frac(formatNum(v.V), `π · ${formatNum(h)}`))} = ${formatNum(r)}`));
            break;

        case 'h,O': {
            h = v.h;
            r = (-h + Math.sqrt(h * h + (2 * v.O) / Math.PI)) / 2;
            if (r <= 0) return { error: "This combination does not yield a valid cylinder." };
            steps.push(step("Radius from surface area", "From O = 2π · r² + 2π · r · h, a quadratic equation for r is formed:", `2π · r² + 2π · h · r − O = 0\nr = ${frac(`−h + ${sqrt('h² + 2O/π')}`, '2')} = ${formatNum(r)}`));
            break;
        }

        case 'h,M':
            h = v.h; r = v.M / (2 * Math.PI * h);
            steps.push(step("Radius from lateral area", "The lateral area is M = 2π · r · h, rearranged for r:", `r = ${frac('M', '2π · h')} = ${frac(formatNum(v.M), `2π · ${formatNum(h)}`)} = ${formatNum(r)}`));
            break;

        case 'V,M':
            r = 2 * v.V / v.M; h = v.M / (2 * Math.PI * r);
            steps.push(step("Radius from volume and lateral area", "From V = π · r² · h and M = 2π · r · h, it follows that V/M = r/2:", `r = ${frac('2V', 'M')} = ${frac(`2 · ${formatNum(v.V)}`, formatNum(v.M))} = ${formatNum(r)}`));
            steps.push(step("Height from lateral area", "The lateral area is M = 2π · r · h, rearranged for h:", `h = ${frac('M', '2π · r')} = ${frac(formatNum(v.M), `2π · ${formatNum(r)}`)} = ${formatNum(h)}`));
            break;

        case 'O,M':
            r = Math.sqrt((v.O - v.M) / (2 * Math.PI)); h = v.M / (2 * Math.PI * r);
            steps.push(step("Radius from surface area and lateral area", "Since O = 2π · r² + M, rearranging for r yields:", `r = ${sqrt(frac('O − M', '2π'))} = ${sqrt(frac(`${formatNum(v.O)} − ${formatNum(v.M)}`, '2π'))} = ${formatNum(r)}`));
            steps.push(step("Height from lateral area", "The lateral area is M = 2π · r · h, rearranged for h:", `h = ${frac('M', '2π · r')} = ${frac(formatNum(v.M), `2π · ${formatNum(r)}`)} = ${formatNum(h)}`));
            break;

        default:
            return { error: "This combination is currently not supported." };
    }

    const G = Math.PI * r * r, M = 2 * Math.PI * r * h, O = 2 * G + M, V = G * h, d = 2 * r;

    if (!('G' in given)) steps.push(step("Base area", "Circular area of top and bottom base:", `G = π · r² = π · ${formatNum(r)}² = ${formatNum(G)}`));
    if (!('M' in given)) steps.push(step("Lateral area", "Unrolled rectangle around the cylinder:", `M = 2π · r · h = 2π · ${formatNum(r)} · ${formatNum(h)} = ${formatNum(M)}`));
    if (!('O' in given)) steps.push(step("Surface area", "Top and bottom base area plus lateral area:", `O = 2G + M = 2 · ${formatNum(G)} + ${formatNum(M)} = ${formatNum(O)}`));
    if (!('V' in given)) steps.push(step("Volume", "Base area times height:", `V = G · h = ${formatNum(G)} · ${formatNum(h)} = ${formatNum(V)}`));
    if (!('d' in given)) steps.push(step("Diameter", "Double the radius:", `d = 2 · r = 2 · ${formatNum(r)} = ${formatNum(d)}`));

    return { values: { r, d, h, V, O, M, G }, steps: [...preSteps, ...steps] };
}

function resolveCone(given) {
    const v = { ...given };
    const rawIds = Object.keys(given);
    const preSteps = [step("Given values", "These values are already known.", rawIds.map(id => `${id} = ${formatNum(given[id])}`).join(',  '), null, true)];

    if ('d' in v && !('r' in v)) {
        v.r = v.d / 2;
        preSteps.push(step("Radius from diameter", "The radius is half of the diameter:", `r = ${frac('d', '2')} = ${frac(formatNum(v.d), '2')} = ${formatNum(v.r)}`));
    } else if ('G' in v && !('r' in v)) {
        v.r = Math.sqrt(v.G / Math.PI);
        preSteps.push(step("Radius from base area", "The base area is G = π · r², rearranged for r:", `r = ${sqrt(frac('G', 'π'))} = ${sqrt(frac(formatNum(v.G), 'π'))} = ${formatNum(v.r)}`));
    }

    const steps = [];
    const order = ['r', 'h', 's', 'V', 'O', 'M'];
    const key = Object.keys(v).filter(id => order.includes(id)).sort((x, y) => order.indexOf(x) - order.indexOf(y)).join(',');
    let r, h, s;

    switch (key) {
        case 'r,h':
            r = v.r; h = v.h; s = Math.sqrt(r * r + h * h);
            steps.push(step("Slant height", "By the Pythagorean theorem using radius and height:", `s = ${sqrt('r² + h²')} = ${sqrt(`${formatNum(r)}² + ${formatNum(h)}²`)} = ${formatNum(s)}`));
            break;

        case 'r,s':
            r = v.r; s = v.s;
            if (s <= r) return { error: "This combination does not yield a valid cone – the slant height must be greater than the radius." };
            h = Math.sqrt(s * s - r * r);
            steps.push(step("Height", "By the Pythagorean theorem, rearranged for h:", `h = ${sqrt('s² − r²')} = ${sqrt(`${formatNum(s)}² − ${formatNum(r)}²`)} = ${formatNum(h)}`));
            break;

        case 'r,V':
            r = v.r; h = 3 * v.V / (Math.PI * r * r); s = Math.sqrt(r * r + h * h);
            steps.push(step("Height from volume", "The volume is V = (1/3)π · r² · h, rearranged for h:", `h = ${frac('3V', 'π · r²')} = ${frac(`3 · ${formatNum(v.V)}`, `π · ${formatNum(r)}²`)} = ${formatNum(h)}`));
            steps.push(step("Slant height", "By the Pythagorean theorem:", `s = ${sqrt('r² + h²')} = ${formatNum(s)}`));
            break;

        case 'r,O':
            r = v.r; s = v.O / (Math.PI * r) - r;
            if (s <= r) return { error: "This combination does not yield a valid cone." };
            h = Math.sqrt(s * s - r * r);
            steps.push(step("Slant height from surface area", "The surface area is O = π · r² + π · r · s, rearranged for s:", `s = ${frac('O', 'π · r')} − r = ${frac(formatNum(v.O), `π · ${formatNum(r)}`)} − ${formatNum(r)} = ${formatNum(s)}`));
            steps.push(step("Height", "By the Pythagorean theorem:", `h = ${sqrt('s² − r²')} = ${formatNum(h)}`));
            break;

        case 'r,M':
            r = v.r; s = v.M / (Math.PI * r);
            if (s <= r) return { error: "This combination does not yield a valid cone." };
            h = Math.sqrt(s * s - r * r);
            steps.push(step("Slant height from lateral area", "The lateral area is M = π · r · s, rearranged for s:", `s = ${frac('M', 'π · r')} = ${frac(formatNum(v.M), `π · ${formatNum(r)}`)} = ${formatNum(s)}`));
            steps.push(step("Height", "By the Pythagorean theorem:", `h = ${sqrt('s² − r²')} = ${formatNum(h)}`));
            break;

        case 'h,s':
            h = v.h; s = v.s;
            if (s <= h) return { error: "This combination does not yield a valid cone – the slant height must be greater than the height." };
            r = Math.sqrt(s * s - h * h);
            steps.push(step("Radius", "By the Pythagorean theorem, rearranged for r:", `r = ${sqrt('s² − h²')} = ${sqrt(`${formatNum(s)}² − ${formatNum(h)}²`)} = ${formatNum(r)}`));
            break;

        case 'h,V':
            h = v.h; r = Math.sqrt(3 * v.V / (Math.PI * h)); s = Math.sqrt(r * r + h * h);
            steps.push(step("Radius from volume", "The volume is V = (1/3)π · r² · h, rearranged for r:", `r = ${sqrt(frac('3V', 'π · h'))} = ${sqrt(frac(`3 · ${formatNum(v.V)}`, `π · ${formatNum(h)}`))} = ${formatNum(r)}`));
            steps.push(step("Slant height", "By the Pythagorean theorem:", `s = ${sqrt('r² + h²')} = ${formatNum(s)}`));
            break;

        case 's,O':
            s = v.s; r = (-s + Math.sqrt(s * s + (4 * v.O) / Math.PI)) / 2;
            if (r <= 0) return { error: "This combination does not yield a valid cone." };
            h = Math.sqrt(s * s - r * r);
            steps.push(step("Radius from surface area", "From O = π · r² + π · r · s, a quadratic equation for r is formed:", `π · r² + π · s · r − O = 0\nr = ${frac(`−s + ${sqrt('s² + 4O/π')}`, '2')} = ${formatNum(r)}`));
            steps.push(step("Height", "By the Pythagorean theorem:", `h = ${sqrt('s² − r²')} = ${formatNum(h)}`));
            break;

        case 's,M':
            s = v.s; r = v.M / (Math.PI * s);
            if (s <= r) return { error: "This combination does not yield a valid cone." };
            h = Math.sqrt(s * s - r * r);
            steps.push(step("Radius from lateral area", "The lateral area is M = π · r · s, rearranged for r:", `r = ${frac('M', 'π · s')} = ${frac(formatNum(v.M), `π · ${formatNum(s)}`)} = ${formatNum(r)}`));
            steps.push(step("Height", "By the Pythagorean theorem:", `h = ${sqrt('s² − r²')} = ${formatNum(h)}`));
            break;

        case 'O,M':
            r = Math.sqrt((v.O - v.M) / Math.PI); s = v.M / (Math.PI * r);
            if (s <= r) return { error: "This combination does not yield a valid cone." };
            h = Math.sqrt(s * s - r * r);
            steps.push(step("Radius from surface area and lateral area", "Since O = π · r² + M, rearranging for r yields:", `r = ${sqrt(frac('O − M', 'π'))} = ${sqrt(frac(`${formatNum(v.O)} − ${formatNum(v.M)}`, 'π'))} = ${formatNum(r)}`));
            steps.push(step("Slant height from lateral area", "The lateral area is M = π · r · s, rearranged for s:", `s = ${frac('M', 'π · r')} = ${formatNum(s)}`));
            steps.push(step("Height", "By the Pythagorean theorem:", `h = ${sqrt('s² − r²')} = ${formatNum(h)}`));
            break;

        default:
            return { error: "This combination is currently not supported." };
    }

    const G = Math.PI * r * r, M = Math.PI * r * s, O = G + M, V = (1 / 3) * G * h, d = 2 * r;

    if (!('G' in given)) steps.push(step("Base area", "Circular area of the base:", `G = π · r² = π · ${formatNum(r)}² = ${formatNum(G)}`));
    if (!('M' in given)) steps.push(step("Lateral area", "Unrolled circular sector forming the cone sides:", `M = π · r · s = π · ${formatNum(r)} · ${formatNum(s)} = ${formatNum(M)}`));
    if (!('O' in given)) steps.push(step("Surface area", "Base area plus lateral area:", `O = G + M = ${formatNum(G)} + ${formatNum(M)} = ${formatNum(O)}`));
    if (!('V' in given)) steps.push(step("Volume", "One third of base area times height:", `V = ${frac('1', '3')} · G · h = ${frac('1', '3')} · ${formatNum(G)} · ${formatNum(h)} = ${formatNum(V)}`));
    if (!('d' in given)) steps.push(step("Diameter", "Double the radius:", `d = 2 · r = 2 · ${formatNum(r)} = ${formatNum(d)}`));

    return { values: { r, d, h, s, V, O, M, G }, steps: [...preSteps, ...steps] };
}

function resolveQuadPyramid(given) {
    const v = { ...given };
    const rawIds = Object.keys(given);
    const preSteps = [step("Given values", "These values are already known.", rawIds.map(id => `${id} = ${formatNum(given[id])}`).join(',  '), null, true)];

    if ('G' in v && !('a' in v)) {
        v.a = Math.sqrt(v.G);
        preSteps.push(step("Base edge from base area", "The square base area is G = a², rearranged for a:", `a = ${sqrt('G')} = ${sqrt(formatNum(v.G))} = ${formatNum(v.a)}`));
    }

    const steps = [];
    const order = ['a', 'h', 'ha', 'V', 'O', 'M'];
    const key = Object.keys(v).filter(id => order.includes(id)).sort((x, y) => order.indexOf(x) - order.indexOf(y)).join(',');
    let a, h, ha;

    switch (key) {
        case 'a,h':
            a = v.a; h = v.h; ha = Math.sqrt(h * h + (a / 2) * (a / 2));
            steps.push(step("Slant height", "By the Pythagorean theorem (using height and half the base edge distance to edge midpoint):", `ha = ${sqrt(`h² + (${frac('a', '2')})²`)} = ${sqrt(`${formatNum(h)}² + (${frac(formatNum(a), '2')})²`)} = ${formatNum(ha)}`));
            break;

        case 'a,ha':
            a = v.a; ha = v.ha;
            if (ha <= a / 2) return { error: "This combination does not yield a valid pyramid – the slant height must be greater than half the base edge distance." };
            h = Math.sqrt(ha * ha - (a / 2) * (a / 2));
            steps.push(step("Height", "By the Pythagorean theorem, rearranged for h:", `h = ${sqrt(`ha² − (${frac('a', '2')})²`)} = ${sqrt(`${formatNum(ha)}² − (${frac(formatNum(a), '2')})²`)} = ${formatNum(h)}`));
            break;

        case 'a,V':
            a = v.a; h = 3 * v.V / (a * a); ha = Math.sqrt(h * h + (a / 2) * (a / 2));
            steps.push(step("Height from volume", "The volume is V = (1/3) · a² · h, rearranged for h:", `h = ${frac('3V', 'a²')} = ${frac(`3 · ${formatNum(v.V)}`, `${formatNum(a)}²`)} = ${formatNum(h)}`));
            steps.push(step("Slant height", "By the Pythagorean theorem:", `ha = ${sqrt(`h² + (${frac('a', '2')})²`)} = ${formatNum(ha)}`));
            break;

        case 'a,O':
            a = v.a; ha = (v.O - a * a) / (2 * a);
            if (ha <= a / 2) return { error: "This combination does not yield a valid pyramid." };
            h = Math.sqrt(ha * ha - (a / 2) * (a / 2));
            steps.push(step("Slant height from surface area", "The surface area is O = a² + 2a · ha, rearranged for ha:", `ha = ${frac('O − a²', '2a')} = ${frac(`${formatNum(v.O)} − ${formatNum(a)}²`, `2 · ${formatNum(a)}`)} = ${formatNum(ha)}`));
            steps.push(step("Height", "By the Pythagorean theorem:", `h = ${sqrt(`ha² − (${frac('a', '2')})²`)} = ${formatNum(h)}`));
            break;

        case 'a,M':
            a = v.a; ha = v.M / (2 * a);
            if (ha <= a / 2) return { error: "This combination does not yield a valid pyramid." };
            h = Math.sqrt(ha * ha - (a / 2) * (a / 2));
            steps.push(step("Slant height from lateral area", "The lateral area is M = 2a · ha, rearranged for ha:", `ha = ${frac('M', '2a')} = ${frac(formatNum(v.M), `2 · ${formatNum(a)}`)} = ${formatNum(ha)}`));
            steps.push(step("Height", "By the Pythagorean theorem:", `h = ${sqrt(`ha² − (${frac('a', '2')})²`)} = ${formatNum(h)}`));
            break;

        case 'h,ha':
            h = v.h; ha = v.ha;
            if (ha <= h) return { error: "This combination does not yield a valid pyramid – the slant height must be greater than the height." };
            a = 2 * Math.sqrt(ha * ha - h * h);
            steps.push(step("Base edge", "By the Pythagorean theorem, rearranged for a:", `a = 2 · ${sqrt('ha² − h²')} = 2 · ${sqrt(`${formatNum(ha)}² − ${formatNum(h)}²`)} = ${formatNum(a)}`));
            break;

        case 'h,V':
            h = v.h; a = Math.sqrt(3 * v.V / h); ha = Math.sqrt(h * h + (a / 2) * (a / 2));
            steps.push(step("Base edge from volume", "The volume is V = (1/3) · a² · h, rearranged for a:", `a = ${sqrt(frac('3V', 'h'))} = ${sqrt(frac(`3 · ${formatNum(v.V)}`, formatNum(h)))} = ${formatNum(a)}`));
            steps.push(step("Slant height", "By the Pythagorean theorem:", `ha = ${sqrt(`h² + (${frac('a', '2')})²`)} = ${formatNum(ha)}`));
            break;

        case 'h,O': {
            h = v.h;
            a = v.O / Math.sqrt(2 * v.O + 4 * h * h);
            ha = Math.sqrt(h * h + (a / 2) * (a / 2));
            steps.push(step("Base edge from surface area", "From O = a² + 2a · ha and ha = √(h²+(a/2)²), squaring and rearranging yields:", `a = ${frac('O', sqrt('2O + 4h²'))} = ${frac(formatNum(v.O), sqrt(`2 · ${formatNum(v.O)} + 4 · ${formatNum(h)}²`))} = ${formatNum(a)}`));
            steps.push(step("Slant height", "By the Pythagorean theorem:", `ha = ${sqrt(`h² + (${frac('a', '2')})²`)} = ${formatNum(ha)}`));
            break;
        }

        case 'h,M': {
            h = v.h;
            const u = -2 * h * h + Math.sqrt(4 * Math.pow(h, 4) + v.M * v.M);
            a = Math.sqrt(u);
            ha = Math.sqrt(h * h + (a / 2) * (a / 2));
            steps.push(step("Base edge from lateral area", "From M = 2a · ha and ha = √(h²+(a/2)²), setting x = a² forms a quadratic equation:", `x² + 4h² · x − M² = 0\nx = a² = ${formatNum(u)}\na = √x = ${formatNum(a)}`));
            steps.push(step("Slant height", "By the Pythagorean theorem:", `ha = ${sqrt(`h² + (${frac('a', '2')})²`)} = ${formatNum(ha)}`));
            break;
        }

        case 'ha,O':
            ha = v.ha; a = -ha + Math.sqrt(ha * ha + v.O);
            if (a <= 0) return { error: "This combination does not yield a valid pyramid." };
            h = Math.sqrt(ha * ha - (a / 2) * (a / 2));
            steps.push(step("Base edge from surface area", "From O = a² + 2ha · a, a quadratic equation for a is formed:", `a² + 2ha · a − O = 0\na = −ha + ${sqrt('ha² + O')} = ${formatNum(a)}`));
            steps.push(step("Height", "By the Pythagorean theorem:", `h = ${sqrt(`ha² − (${frac('a', '2')})²`)} = ${formatNum(h)}`));
            break;

        case 'ha,M':
            ha = v.ha; a = v.M / (2 * ha);
            if (ha <= a / 2) return { error: "This combination does not yield a valid pyramid." };
            h = Math.sqrt(ha * ha - (a / 2) * (a / 2));
            steps.push(step("Base edge from lateral area", "The lateral area is M = 2a · ha, rearranged for a:", `a = ${frac('M', '2 · ha')} = ${frac(formatNum(v.M), `2 · ${formatNum(ha)}`)} = ${formatNum(a)}`));
            steps.push(step("Height", "By the Pythagorean theorem:", `h = ${sqrt(`ha² − (${frac('a', '2')})²`)} = ${formatNum(h)}`));
            break;

        case 'O,M':
            a = Math.sqrt(v.O - v.M);
            if (a <= 0) return { error: "This combination does not yield a valid pyramid." };
            ha = v.M / (2 * a);
            h = Math.sqrt(ha * ha - (a / 2) * (a / 2));
            steps.push(step("Base edge", "Since O = a² + M, rearranging for a yields:", `a = ${sqrt('O − M')} = ${sqrt(`${formatNum(v.O)} − ${formatNum(v.M)}`)} = ${formatNum(a)}`));
            steps.push(step("Slant height from lateral area", "The lateral area is M = 2a · ha, rearranged for ha:", `ha = ${frac('M', '2a')} = ${formatNum(ha)}`));
            steps.push(step("Height", "By the Pythagorean theorem:", `h = ${sqrt(`ha² − (${frac('a', '2')})²`)} = ${formatNum(h)}`));
            break;

        default:
            return { error: "This combination is currently not supported." };
    }

    const G = a * a, M = 2 * a * ha, O = G + M, V = (1 / 3) * G * h;

    if (!('G' in given)) steps.push(step("Base area", "Squared base edge:", `G = a² = ${formatNum(a)}² = ${formatNum(G)}`));
    if (!('M' in given)) steps.push(step("Lateral area", "Four isosceles triangles:", `M = 2a · ha = 2 · ${formatNum(a)} · ${formatNum(ha)} = ${formatNum(M)}`));
    if (!('O' in given)) steps.push(step("Surface area", "Base area plus lateral area:", `O = G + M = ${formatNum(G)} + ${formatNum(M)} = ${formatNum(O)}`));
    if (!('V' in given)) steps.push(step("Volume", "One third of base area times height:", `V = ${frac('1', '3')} · G · h = ${frac('1', '3')} · ${formatNum(G)} · ${formatNum(h)} = ${formatNum(V)}`));

    return { values: { a, h, ha, V, O, M, G }, steps: [...preSteps, ...steps] };
}

function resolveRectPyramid(given) {
    const order = ['a', 'b', 'h', 'ha', 'hb', 'V', 'G', 'O', 'M'];
    const ids = Object.keys(given).filter(id => order.includes(id)).sort((x, y) => order.indexOf(x) - order.indexOf(y));
    const key = ids.join(',');
    const v = given;
    const steps = [];
    let a, b, h;

    switch (key) {
        case 'a,b,h':
            a = v.a; b = v.b; h = v.h;
            steps.push(step("Base edges and height", "All three values are already given.", `a = ${formatNum(a)}, b = ${formatNum(b)}, h = ${formatNum(h)}`, null, true));
            break;

        case 'a,b,V':
            a = v.a; b = v.b; h = 3 * v.V / (a * b);
            steps.push(step("Base edges and volume", "Both base edges and volume are given.", `a = ${formatNum(a)}, b = ${formatNum(b)}, V = ${formatNum(v.V)}`, null, true));
            steps.push(step("Height", "The volume is V = (1/3) · a · b · h, rearranged for h:", `h = ${frac('3V', 'a · b')} = ${frac(`3 · ${formatNum(v.V)}`, `${formatNum(a)} · ${formatNum(b)}`)} = ${formatNum(h)}`));
            break;

        case 'a,b,ha':
            a = v.a; b = v.b;
            if (v.ha <= b / 2) return { error: "This combination does not yield a valid pyramid." };
            h = Math.sqrt(v.ha * v.ha - (b / 2) * (b / 2));
            steps.push(step("Base edges and slant height ha", "a, b and the slant height ha (of the side face over a) are given.", `a = ${formatNum(a)}, b = ${formatNum(b)}, ha = ${formatNum(v.ha)}`, null, true));
            steps.push(step("Height", "ha = √(h² + (b/2)²), rearranged for h:", `h = ${sqrt(`ha² − (${frac('b', '2')})²`)} = ${sqrt(`${formatNum(v.ha)}² − (${frac(formatNum(b), '2')})²`)} = ${formatNum(h)}`));
            break;

        case 'a,b,hb':
            a = v.a; b = v.b;
            if (v.hb <= a / 2) return { error: "This combination does not yield a valid pyramid." };
            h = Math.sqrt(v.hb * v.hb - (a / 2) * (a / 2));
            steps.push(step("Base edges and slant height hb", "a, b and the slant height hb (of the side face over b) are given.", `a = ${formatNum(a)}, b = ${formatNum(b)}, hb = ${formatNum(v.hb)}`, null, true));
            steps.push(step("Height", "hb = √(h² + (a/2)²), rearranged for h:", `h = ${sqrt(`hb² − (${frac('a', '2')})²`)} = ${sqrt(`${formatNum(v.hb)}² − (${frac(formatNum(a), '2')})²`)} = ${formatNum(h)}`));
            break;

        case 'a,h,V':
            a = v.a; h = v.h; b = 3 * v.V / (a * h);
            steps.push(step("Base edge a, height and volume", "a, h and volume are given.", `a = ${formatNum(a)}, h = ${formatNum(h)}, V = ${formatNum(v.V)}`, null, true));
            steps.push(step("Base edge b", "The volume is V = (1/3) · a · b · h, rearranged for b:", `b = ${frac('3V', 'a · h')} = ${frac(`3 · ${formatNum(v.V)}`, `${formatNum(a)} · ${formatNum(h)}`)} = ${formatNum(b)}`));
            break;

        case 'a,h,G':
            a = v.a; h = v.h; b = v.G / a;
            steps.push(step("Base edge a, height and base area", "a, h and base area are given.", `a = ${formatNum(a)}, h = ${formatNum(h)}, G = ${formatNum(v.G)}`, null, true));
            steps.push(step("Base edge b", "The base area is G = a · b, rearranged for b:", `b = ${frac('G', 'a')} = ${frac(formatNum(v.G), formatNum(a))} = ${formatNum(b)}`));
            break;

        case 'a,h,ha':
            a = v.a; h = v.h;
            if (v.ha <= h) return { error: "This combination does not yield a valid pyramid." };
            b = 2 * Math.sqrt(v.ha * v.ha - h * h);
            steps.push(step("Base edge a, height and slant height ha", "a, h and ha (slant height of the face over a) are given.", `a = ${formatNum(a)}, h = ${formatNum(h)}, ha = ${formatNum(v.ha)}`, null, true));
            steps.push(step("Base edge b", "ha = √(h² + (b/2)²), rearranged for b:", `b = 2 · ${sqrt('ha² − h²')} = 2 · ${sqrt(`${formatNum(v.ha)}² − ${formatNum(h)}²`)} = ${formatNum(b)}`));
            break;

        case 'b,h,V':
            b = v.b; h = v.h; a = 3 * v.V / (b * h);
            steps.push(step("Base edge b, height and volume", "b, h and volume are given.", `b = ${formatNum(b)}, h = ${formatNum(h)}, V = ${formatNum(v.V)}`, null, true));
            steps.push(step("Base edge a", "The volume is V = (1/3) · a · b · h, rearranged for a:", `a = ${frac('3V', 'b · h')} = ${frac(`3 · ${formatNum(v.V)}`, `${formatNum(b)} · ${formatNum(h)}`)} = ${formatNum(a)}`));
            break;

        case 'b,h,G':
            b = v.b; h = v.h; a = v.G / b;
            steps.push(step("Base edge b, height and base area", "b, h and base area are given.", `b = ${formatNum(b)}, h = ${formatNum(h)}, G = ${formatNum(v.G)}`, null, true));
            steps.push(step("Base edge a", "The base area is G = a · b, rearranged for a:", `a = ${frac('G', 'b')} = ${frac(formatNum(v.G), formatNum(b))} = ${formatNum(a)}`));
            break;

        case 'b,h,hb':
            b = v.b; h = v.h;
            if (v.hb <= h) return { error: "This combination does not yield a valid pyramid." };
            a = 2 * Math.sqrt(v.hb * v.hb - h * h);
            steps.push(step("Base edge b, height and slant height hb", "b, h and hb (slant height of the face over b) are given.", `b = ${formatNum(b)}, h = ${formatNum(h)}, hb = ${formatNum(v.hb)}`, null, true));
            steps.push(step("Base edge a", "hb = √(h² + (a/2)²), rearranged for a:", `a = 2 · ${sqrt('hb² − h²')} = 2 · ${sqrt(`${formatNum(v.hb)}² − ${formatNum(h)}²`)} = ${formatNum(a)}`));
            break;

        case 'h,ha,hb': {
            h = v.h;
            if (v.ha <= h || v.hb <= h) return { error: "This combination does not yield a valid pyramid – both slant heights must be greater than the height." };
            b = 2 * Math.sqrt(v.ha * v.ha - h * h);
            a = 2 * Math.sqrt(v.hb * v.hb - h * h);
            steps.push(step("Height and both slant heights", "The height h and the slant heights ha and hb are given.", `h = ${formatNum(h)}, ha = ${formatNum(v.ha)}, hb = ${formatNum(v.hb)}`, null, true));
            steps.push(step("Base edge b", "From ha = √(h² + (b/2)²), rearranged for b:", `b = 2 · ${sqrt('ha² − h²')} = 2 · ${sqrt(`${formatNum(v.ha)}² − ${formatNum(h)}²`)} = ${formatNum(b)}`));
            steps.push(step("Base edge a", "From hb = √(h² + (a/2)²), rearranged for a:", `a = 2 · ${sqrt('hb² − h²')} = 2 · ${sqrt(`${formatNum(v.hb)}² − ${formatNum(h)}²`)} = ${formatNum(a)}`));
            break;
        }

        case 'a,ha,hb': {
            a = v.a;
            if (v.hb <= a / 2) return { error: "This combination does not yield a valid pyramid – slant height hb is too small for this base edge." };
            h = Math.sqrt(v.hb * v.hb - (a / 2) * (a / 2));
            if (v.ha <= h) return { error: "This combination does not yield a valid pyramid." };
            b = 2 * Math.sqrt(v.ha * v.ha - h * h);
            steps.push(step("Base edge a and both slant heights", "Base edge a and slant heights ha and hb are given.", `a = ${formatNum(a)}, ha = ${formatNum(v.ha)}, hb = ${formatNum(v.hb)}`, null, true));
            steps.push(step("Height", "From hb = √(h² + (a/2)²), rearranged for h:", `h = ${sqrt(`hb² − (${frac('a', '2')})²`)} = ${sqrt(`${formatNum(v.hb)}² − (${frac(formatNum(a), '2')})²`)} = ${formatNum(h)}`));
            steps.push(step("Base edge b", "From ha = √(h² + (b/2)²), rearranged for b:", `b = 2 · ${sqrt('ha² − h²')} = ${formatNum(b)}`));
            break;
        }

        case 'b,ha,hb': {
            b = v.b;
            if (v.ha <= b / 2) return { error: "This combination does not yield a valid pyramid – slant height ha is too small for this base edge." };
            h = Math.sqrt(v.ha * v.ha - (b / 2) * (b / 2));
            if (v.hb <= h) return { error: "This combination does not yield a valid pyramid." };
            a = 2 * Math.sqrt(v.hb * v.hb - h * h);
            steps.push(step("Base edge b and both slant heights", "Base edge b and slant heights ha and hb are given.", `b = ${formatNum(b)}, ha = ${formatNum(v.ha)}, hb = ${formatNum(v.hb)}`, null, true));
            steps.push(step("Height", "From ha = √(h² + (b/2)²), rearranged for h:", `h = ${sqrt(`ha² − (${frac('b', '2')})²`)} = ${sqrt(`${formatNum(v.ha)}² − (${frac(formatNum(b), '2')})²`)} = ${formatNum(h)}`));
            steps.push(step("Base edge a", "From hb = √(h² + (a/2)²), rearranged for a:", `a = 2 · ${sqrt('hb² − h²')} = ${formatNum(a)}`));
            break;
        }

        case 'h,ha,V':
            h = v.h;
            if (v.ha <= h) return { error: "This combination does not yield a valid pyramid." };
            b = 2 * Math.sqrt(v.ha * v.ha - h * h);
            a = 3 * v.V / (b * h);
            steps.push(step("Height, slant height ha and volume", "h, ha and volume are given.", `h = ${formatNum(h)}, ha = ${formatNum(v.ha)}, V = ${formatNum(v.V)}`, null, true));
            steps.push(step("Base edge b", "From ha = √(h² + (b/2)²), rearranged for b:", `b = 2 · ${sqrt('ha² − h²')} = ${formatNum(b)}`));
            steps.push(step("Base edge a", "The volume is V = (1/3) · a · b · h, rearranged for a:", `a = ${frac('3V', 'b · h')} = ${frac(`3 · ${formatNum(v.V)}`, `${formatNum(b)} · ${formatNum(h)}`)} = ${formatNum(a)}`));
            break;

        case 'h,hb,V':
            h = v.h;
            if (v.hb <= h) return { error: "This combination does not yield a valid pyramid." };
            a = 2 * Math.sqrt(v.hb * v.hb - h * h);
            b = 3 * v.V / (a * h);
            steps.push(step("Height, slant height hb and volume", "h, hb and volume are given.", `h = ${formatNum(h)}, hb = ${formatNum(v.hb)}, V = ${formatNum(v.V)}`, null, true));
            steps.push(step("Base edge a", "From hb = √(h² + (a/2)²), rearranged for a:", `a = 2 · ${sqrt('hb² − h²')} = ${formatNum(a)}`));
            steps.push(step("Base edge b", "The volume is V = (1/3) · a · b · h, rearranged for b:", `b = ${frac('3V', 'a · h')} = ${frac(`3 · ${formatNum(v.V)}`, `${formatNum(a)} · ${formatNum(h)}`)} = ${formatNum(b)}`));
            break;

        case 'h,ha,G':
            h = v.h;
            if (v.ha <= h) return { error: "This combination does not yield a valid pyramid." };
            b = 2 * Math.sqrt(v.ha * v.ha - h * h);
            a = v.G / b;
            steps.push(step("Height, slant height ha and base area", "h, ha and base area are given.", `h = ${formatNum(h)}, ha = ${formatNum(v.ha)}, G = ${formatNum(v.G)}`, null, true));
            steps.push(step("Base edge b", "From ha = √(h² + (b/2)²), rearranged for b:", `b = 2 · ${sqrt('ha² − h²')} = ${formatNum(b)}`));
            steps.push(step("Base edge a", "The base area is G = a · b, rearranged for a:", `a = ${frac('G', 'b')} = ${frac(formatNum(v.G), formatNum(b))} = ${formatNum(a)}`));
            break;

        case 'h,hb,G':
            h = v.h;
            if (v.hb <= h) return { error: "This combination does not yield a valid pyramid." };
            a = 2 * Math.sqrt(v.hb * v.hb - h * h);
            b = v.G / a;
            steps.push(step("Height, slant height hb and base area", "h, hb and base area are given.", `h = ${formatNum(h)}, hb = ${formatNum(v.hb)}, G = ${formatNum(v.G)}`, null, true));
            steps.push(step("Base edge a", "From hb = √(h² + (a/2)²), rearranged for a:", `a = 2 · ${sqrt('hb² − h²')} = ${formatNum(a)}`));
            steps.push(step("Base edge b", "The base area is G = a · b, rearranged for b:", `b = ${frac('G', 'a')} = ${frac(formatNum(v.G), formatNum(a))} = ${formatNum(b)}`));
            break;

        case 'h,ha,M': {
            h = v.h;
            if (v.ha <= h) return { error: "This combination does not yield a valid pyramid." };
            b = 2 * Math.sqrt(v.ha * v.ha - h * h);
            // Quadratic equation for a (from M = a·ha + b·√(h²+(a/2)²) after squaring).
            // Both possible solutions are checked against the original equation
            // to safely exclude extraneous solutions created by squaring.
            const discRoot = b * Math.sqrt(v.M * v.M + 4 * Math.pow(h, 4));
            const candidates = [(2 * v.M * v.ha + discRoot) / (2 * h * h), (2 * v.M * v.ha - discRoot) / (2 * h * h)];
            const valid = candidates.find(cand => {
                if (cand <= 0) return false;
                const hbCheck = Math.sqrt(h * h + (cand / 2) * (cand / 2));
                return Math.abs(cand * v.ha + b * hbCheck - v.M) < 1e-6 * v.M;
            });
            if (valid === undefined) return { error: "This combination does not yield a valid pyramid – the given values are incompatible." };
            a = valid;
            steps.push(step("Height, slant height ha and lateral area", "h, ha and lateral area are given.", `h = ${formatNum(h)}, ha = ${formatNum(v.ha)}, M = ${formatNum(v.M)}`, null, true));
            steps.push(step("Base edge b", "From ha = √(h² + (b/2)²), rearranged for b:", `b = 2 · ${sqrt('ha² − h²')} = ${formatNum(b)}`));
            steps.push(step("Base edge a", "From M = a · ha + b · √(h² + (a/2)²), squaring forms a quadratic equation for a:", `h² · a² − 2M·ha · a + (M² − b²h²) = 0\na = ${formatNum(a)}`));
            break;
        }

        case 'h,hb,M': {
            h = v.h;
            if (v.hb <= h) return { error: "This combination does not yield a valid pyramid." };
            a = 2 * Math.sqrt(v.hb * v.hb - h * h);
            const discRoot = a * Math.sqrt(v.M * v.M + 4 * Math.pow(h, 4));
            const candidates = [(2 * v.M * v.hb + discRoot) / (2 * h * h), (2 * v.M * v.hb - discRoot) / (2 * h * h)];
            const valid = candidates.find(cand => {
                if (cand <= 0) return false;
                const haCheck = Math.sqrt(h * h + (cand / 2) * (cand / 2));
                return Math.abs(a * haCheck + cand * v.hb - v.M) < 1e-6 * v.M;
            });
            if (valid === undefined) return { error: "This combination does not yield a valid pyramid – the given values are incompatible." };
            b = valid;
            steps.push(step("Height, slant height hb and lateral area", "h, hb and lateral area are given.", `h = ${formatNum(h)}, hb = ${formatNum(v.hb)}, M = ${formatNum(v.M)}`, null, true));
            steps.push(step("Base edge a", "From hb = √(h² + (a/2)²), rearranged for a:", `a = 2 · ${sqrt('hb² − h²')} = ${formatNum(a)}`));
            steps.push(step("Base edge b", "From M = a · √(h² + (b/2)²) + b · hb, squaring forms a quadratic equation for b:", `h² · b² − 2M·hb · b + (M² − a²h²) = 0\nb = ${formatNum(b)}`));
            break;
        }

        default:
            return { error: "This combination is currently not supported." };
    }

    const ha = Math.sqrt(h * h + (b / 2) * (b / 2));
    const hb = Math.sqrt(h * h + (a / 2) * (a / 2));
    const G = a * b, M = a * ha + b * hb, O = G + M, V = (1 / 3) * G * h;

    if (!ids.includes('ha')) steps.push(step("Slant height ha", "Height of the side face over base edge a:", `ha = ${sqrt(`h² + (${frac('b', '2')})²`)} = ${formatNum(ha)}`));
    if (!ids.includes('hb')) steps.push(step("Slant height hb", "Height of the side face over base edge b:", `hb = ${sqrt(`h² + (${frac('a', '2')})²`)} = ${formatNum(hb)}`));
    if (!ids.includes('G')) steps.push(step("Base area", "Length times width:", `G = a · b = ${formatNum(a)} · ${formatNum(b)} = ${formatNum(G)}`));
    steps.push(step("Lateral area", "Two pairs of isosceles triangles:", `M = a · ha + b · hb = ${formatNum(a)} · ${formatNum(ha)} + ${formatNum(b)} · ${formatNum(hb)} = ${formatNum(M)}`));
    steps.push(step("Surface area", "Base area plus lateral area:", `O = G + M = ${formatNum(G)} + ${formatNum(M)} = ${formatNum(O)}`));
    if (!ids.includes('V')) steps.push(step("Volume", "One third of base area times height:", `V = ${frac('1', '3')} · G · h = ${formatNum(V)}`));

    return { values: { a, b, h, ha, hb, V, O, M, G }, steps };
}

function resolveCuboid(given) {
    const order = ['a', 'b', 'c', 'V', 'O', 'd', 'G'];
    const ids = Object.keys(given).filter(id => order.includes(id)).sort((x, y) => order.indexOf(x) - order.indexOf(y));
    const key = ids.join(',');
    const v = given;
    const steps = [];
    let a, b, c;

    switch (key) {
        case 'a,b,c':
            a = v.a; b = v.b; c = v.c;
            steps.push(step("Edges", "All three edge lengths are already given.", `a = ${formatNum(a)}, b = ${formatNum(b)}, c = ${formatNum(c)}`, null, true));
            break;

        case 'a,b,V':
            a = v.a; b = v.b; c = v.V / (a * b);
            steps.push(step("Edges a, b and volume", "a, b and volume are given.", `a = ${formatNum(a)}, b = ${formatNum(b)}, V = ${formatNum(v.V)}`, null, true));
            steps.push(step("Edge c", "The volume is V = a · b · c, rearranged for c:", `c = ${frac('V', 'a · b')} = ${frac(formatNum(v.V), `${formatNum(a)} · ${formatNum(b)}`)} = ${formatNum(c)}`));
            break;

        case 'a,b,O':
            a = v.a; b = v.b; c = (v.O - 2 * a * b) / (2 * (a + b));
            if (c <= 0) return { error: "This combination does not yield a valid cuboid." };
            steps.push(step("Edges a, b and surface area", "a, b and surface area are given.", `a = ${formatNum(a)}, b = ${formatNum(b)}, O = ${formatNum(v.O)}`, null, true));
            steps.push(step("Edge c", "The surface area is O = 2(ab + ac + bc), rearranged for c:", `c = ${frac('O − 2ab', '2(a + b)')} = ${frac(`${formatNum(v.O)} − 2 · ${formatNum(a)} · ${formatNum(b)}`, `2 · (${formatNum(a)} + ${formatNum(b)})`)} = ${formatNum(c)}`));
            break;

        case 'a,b,d':
            a = v.a; b = v.b;
            if (v.d * v.d <= a * a + b * b) return { error: "This combination does not yield a valid cuboid – the space diagonal is too short." };
            c = Math.sqrt(v.d * v.d - a * a - b * b);
            steps.push(step("Edges a, b and space diagonal", "a, b and the space diagonal are given.", `a = ${formatNum(a)}, b = ${formatNum(b)}, d = ${formatNum(v.d)}`, null, true));
            steps.push(step("Edge c", "By 3D Pythagorean theorem d² = a² + b² + c², rearranged for c:", `c = ${sqrt('d² − a² − b²')} = ${sqrt(`${formatNum(v.d)}² − ${formatNum(a)}² − ${formatNum(b)}²`)} = ${formatNum(c)}`));
            break;

        case 'a,c,V':
            a = v.a; c = v.c; b = v.V / (a * c);
            steps.push(step("Edges a, c and volume", "a, c and volume are given.", `a = ${formatNum(a)}, c = ${formatNum(c)}, V = ${formatNum(v.V)}`, null, true));
            steps.push(step("Edge b", "The volume is V = a · b · c, rearranged for b:", `b = ${frac('V', 'a · c')} = ${frac(formatNum(v.V), `${formatNum(a)} · ${formatNum(c)}`)} = ${formatNum(b)}`));
            break;

        case 'a,c,O':
            a = v.a; c = v.c; b = (v.O - 2 * a * c) / (2 * (a + c));
            if (b <= 0) return { error: "This combination does not yield a valid cuboid." };
            steps.push(step("Edges a, c and surface area", "a, c and surface area are given.", `a = ${formatNum(a)}, c = ${formatNum(c)}, O = ${formatNum(v.O)}`, null, true));
            steps.push(step("Edge b", "The surface area is O = 2(ab + ac + bc), rearranged for b:", `b = ${frac('O − 2ac', '2(a + c)')} = ${frac(`${formatNum(v.O)} − 2 · ${formatNum(a)} · ${formatNum(c)}`, `2 · (${formatNum(a)} + ${formatNum(c)})`)} = ${formatNum(b)}`));
            break;

        case 'a,c,d':
            a = v.a; c = v.c;
            if (v.d * v.d <= a * a + c * c) return { error: "This combination does not yield a valid cuboid – the space diagonal is too short." };
            b = Math.sqrt(v.d * v.d - a * a - c * c);
            steps.push(step("Edges a, c and space diagonal", "a, c and space diagonal are given.", `a = ${formatNum(a)}, c = ${formatNum(c)}, d = ${formatNum(v.d)}`, null, true));
            steps.push(step("Edge b", "By 3D Pythagorean theorem, rearranged for b:", `b = ${sqrt('d² − a² − c²')} = ${sqrt(`${formatNum(v.d)}² − ${formatNum(a)}² − ${formatNum(c)}²`)} = ${formatNum(b)}`));
            break;

        case 'a,c,G':
            a = v.a; c = v.c; b = v.G / a;
            steps.push(step("Edge a, c and base area", "a, c and base area are given.", `a = ${formatNum(a)}, c = ${formatNum(c)}, G = ${formatNum(v.G)}`, null, true));
            steps.push(step("Edge b", "The base area is G = a · b, rearranged for b:", `b = ${frac('G', 'a')} = ${frac(formatNum(v.G), formatNum(a))} = ${formatNum(b)}`));
            break;

        case 'b,c,V':
            b = v.b; c = v.c; a = v.V / (b * c);
            steps.push(step("Edges b, c and volume", "b, c and volume are given.", `b = ${formatNum(b)}, c = ${formatNum(c)}, V = ${formatNum(v.V)}`, null, true));
            steps.push(step("Edge a", "The volume is V = a · b · c, rearranged for a:", `a = ${frac('V', 'b · c')} = ${frac(formatNum(v.V), `${formatNum(b)} · ${formatNum(c)}`)} = ${formatNum(a)}`));
            break;

        case 'b,c,O':
            b = v.b; c = v.c; a = (v.O - 2 * b * c) / (2 * (b + c));
            if (a <= 0) return { error: "This combination does not yield a valid cuboid." };
            steps.push(step("Edges b, c and surface area", "b, c and surface area are given.", `b = ${formatNum(b)}, c = ${formatNum(c)}, O = ${formatNum(v.O)}`, null, true));
            steps.push(step("Edge a", "The surface area is O = 2(ab + ac + bc), rearranged for a:", `a = ${frac('O − 2bc', '2(b + c)')} = ${frac(`${formatNum(v.O)} − 2 · ${formatNum(b)} · ${formatNum(c)}`, `2 · (${formatNum(b)} + ${formatNum(c)})`)} = ${formatNum(a)}`));
            break;

        case 'b,c,d':
            b = v.b; c = v.c;
            if (v.d * v.d <= b * b + c * c) return { error: "This combination does not yield a valid cuboid – the space diagonal is too short." };
            a = Math.sqrt(v.d * v.d - b * b - c * c);
            steps.push(step("Edges b, c and space diagonal", "b, c and space diagonal are given.", `b = ${formatNum(b)}, c = ${formatNum(c)}, d = ${formatNum(v.d)}`, null, true));
            steps.push(step("Edge a", "By 3D Pythagorean theorem, rearranged for a:", `a = ${sqrt('d² − b² − c²')} = ${sqrt(`${formatNum(v.d)}² − ${formatNum(b)}² − ${formatNum(c)}²`)} = ${formatNum(a)}`));
            break;

        case 'b,c,G':
            b = v.b; c = v.c; a = v.G / b;
            steps.push(step("Edges b, c and base area", "b, c and base area are given.", `b = ${formatNum(b)}, c = ${formatNum(c)}, G = ${formatNum(v.G)}`, null, true));
            steps.push(step("Edge a", "The base area is G = a · b, rearranged for a:", `a = ${frac('G', 'b')} = ${frac(formatNum(v.G), formatNum(b))} = ${formatNum(a)}`));
            break;

        // ── Only one edge given directly + two derived quantities ─────────
        case 'a,V,O': case 'b,V,O': case 'c,V,O':
        case 'a,V,d': case 'b,V,d': case 'c,V,d':
        case 'a,O,d': case 'b,O,d': case 'c,O,d': {
            const edgeId = ids[0]; // a, b, or c – always comes first due to sorting
            const [otherX, otherY] = ['a', 'b', 'c'].filter(id => id !== edgeId);
            const known = v[edgeId];
            const pairKey = ids.slice(1).join(',');

            let s, p, extraSteps;

            if (pairKey === 'V,O') {
                p = v.V / known;
                s = (v.O / 2 - p) / known;
                extraSteps = [
                    step(`Product of ${otherX} and ${otherY}`, `From volume V = ${edgeId} · ${otherX} · ${otherY}:`,
                        `${otherX} · ${otherY} = ${frac('V', edgeId)} = ${frac(formatNum(v.V), formatNum(known))} = ${formatNum(p)}`),
                    step(`Sum of ${otherX} and ${otherY}`, `From surface area O = 2 · (${edgeId}·${otherX} + ${edgeId}·${otherY} + ${otherX}·${otherY}):`,
                        `${otherX} + ${otherY} = ${frac(`O/2 − ${otherX}·${otherY}`, edgeId)} = ${frac(`${formatNum(v.O)}/2 − ${formatNum(p)}`, formatNum(known))} = ${formatNum(s)}`)
                ];
            } else if (pairKey === 'V,d') {
                p = v.V / known;
                const q = v.d * v.d - known * known;
                if (q < 2 * p) return { error: "This combination does not yield a valid cuboid." };
                s = Math.sqrt(q + 2 * p);
                extraSteps = [
                    step(`Product of ${otherX} and ${otherY}`, `From volume:`,
                        `${otherX} · ${otherY} = ${frac('V', edgeId)} = ${formatNum(p)}`),
                    step(`Sum of ${otherX} and ${otherY}`, `From d² = ${edgeId}² + ${otherX}² + ${otherY}² and (${otherX}+${otherY})² = ${otherX}² + ${otherY}² + 2·${otherX}${otherY}:`,
                        `${otherX} + ${otherY} = ${sqrt(`(d² − ${edgeId}²) + 2 · ${otherX}·${otherY}`)} = ${formatNum(s)}`)
                ];
            } else { // 'O,d'
                const sumSq = v.O + v.d * v.d;
                if (sumSq < known * known) return { error: "This combination does not yield a valid cuboid." };
                s = -known + Math.sqrt(sumSq);
                if (s <= 0) return { error: "This combination does not yield a valid cuboid." };
                p = v.O / 2 - known * s;
                extraSteps = [
                    step(`Sum of ${otherX} and ${otherY}`, `Combining O = 2 · (${edgeId}·(${otherX}+${otherY}) + ${otherX}·${otherY}) with d² = ${edgeId}² + ${otherX}² + ${otherY}² yields:`,
                        `${otherX} + ${otherY} = −${edgeId} + ${sqrt('O + d²')} = −${formatNum(known)} + ${sqrt(`${formatNum(v.O)} + ${formatNum(v.d)}²`)} = ${formatNum(s)}`),
                    step(`Product of ${otherX} and ${otherY}`, `From surface area formula:`,
                        `${otherX} · ${otherY} = ${frac('O', '2')} − ${edgeId} · (${otherX}+${otherY}) = ${frac(formatNum(v.O), '2')} − ${formatNum(known)} · ${formatNum(s)} = ${formatNum(p)}`)
                ];
            }

            const roots = solveSumProduct(s, p);
            if (!roots) return { error: "This combination does not yield a valid cuboid – the given values are incompatible." };

            const resultMap = { [edgeId]: known, [otherX]: roots[0], [otherY]: roots[1] };
            a = resultMap.a; b = resultMap.b; c = resultMap.c;

            steps.push(step(`Edge ${edgeId} and two derived quantities`, "These values are already given.",
                ids.map(id => `${id} = ${formatNum(v[id])}`).join(',  '), null, true));
            steps.push(...extraSteps);
            steps.push(step(`Edges ${otherX} and ${otherY}`, `They are the roots of t² − (Sum) · t + (Product) = 0:`,
                `t² − ${formatNum(s)} · t + ${formatNum(p)} = 0\n${otherX} = ${formatNum(roots[0])},  ${otherY} = ${formatNum(roots[1])}`));
            break;
        }

        case 'V,O,G': {
            const cKnown = v.V / v.G;
            const s = (v.O / 2 - v.G) / cKnown;
            const roots = solveSumProduct(s, v.G);
            if (!roots) return { error: "This combination does not yield a valid cuboid – the given values are incompatible." };
            a = roots[0]; b = roots[1]; c = cKnown;
            steps.push(step("Base area, volume and surface area", "These values are already given.", `G = ${formatNum(v.G)}, V = ${formatNum(v.V)}, O = ${formatNum(v.O)}`, null, true));
            steps.push(step("Edge c", "The volume is V = G · c, rearranged for c:", `c = ${frac('V', 'G')} = ${frac(formatNum(v.V), formatNum(v.G))} = ${formatNum(c)}`));
            steps.push(step("Sum of edges a and b", "From surface area O = 2 · (G + c·(a+b)):", `a + b = ${frac('O/2 − G', 'c')} = ${frac(`${formatNum(v.O)}/2 − ${formatNum(v.G)}`, formatNum(c))} = ${formatNum(s)}`));
            steps.push(step("Edges a and b", "They are the roots of t² − (Sum) · t + G = 0 (the base area is already their product):", `t² − ${formatNum(s)} · t + ${formatNum(v.G)} = 0\na = ${formatNum(a)},  b = ${formatNum(b)}`));
            break;
        }

        case 'V,d,G': {
            const cKnown = v.V / v.G;
            const q = v.d * v.d - cKnown * cKnown;
            if (q < 2 * v.G) return { error: "This combination does not yield a valid cuboid." };
            const s = Math.sqrt(q + 2 * v.G);
            const roots = solveSumProduct(s, v.G);
            if (!roots) return { error: "This combination does not yield a valid cuboid – the given values are incompatible." };
            a = roots[0]; b = roots[1]; c = cKnown;
            steps.push(step("Base area, volume and space diagonal", "These values are already given.", `G = ${formatNum(v.G)}, V = ${formatNum(v.V)}, d = ${formatNum(v.d)}`, null, true));
            steps.push(step("Edge c", "The volume is V = G · c, rearranged for c:", `c = ${frac('V', 'G')} = ${formatNum(c)}`));
            steps.push(step("Sum of edges a and b", "From d² = a² + b² + c² and (a+b)² = a² + b² + 2G:", `a + b = ${sqrt('(d² − c²) + 2G')} = ${sqrt(`(${formatNum(v.d)}² − ${formatNum(c)}²) + 2 · ${formatNum(v.G)}`)} = ${formatNum(s)}`));
            steps.push(step("Edges a and b", "They are the roots of t² − (Sum) · t + G = 0:", `t² − ${formatNum(s)} · t + ${formatNum(v.G)} = 0\na = ${formatNum(a)},  b = ${formatNum(b)}`));
            break;
        }

        default:
            return { error: "This combination is currently not supported." };
    }

    const G = a * b, V = a * b * c, O = 2 * (a * b + b * c + a * c), d = Math.sqrt(a * a + b * b + c * c);

    if (!ids.includes('G')) steps.push(step("Base area", "Length times width:", `G = a · b = ${formatNum(a)} · ${formatNum(b)} = ${formatNum(G)}`));
    if (!ids.includes('V')) steps.push(step("Volume", "Length times width times height:", `V = a · b · c = ${formatNum(a)} · ${formatNum(b)} · ${formatNum(c)} = ${formatNum(V)}`));
    if (!ids.includes('O')) steps.push(step("Surface area", "Twice the sum of all three face areas:", `O = 2 · (ab + bc + ac) = ${formatNum(O)}`));
    if (!ids.includes('d')) steps.push(step("Space diagonal", "3D Pythagorean theorem:", `d = ${sqrt('a² + b² + c²')} = ${formatNum(d)}`));

    return { values: { a, b, c, V, O, d, G }, steps };
}
const shapeResolvers = {
    circle: resolveCircle,
    square: resolveSquare,
    rectangle: resolveRectangle,
    triangle: resolveTriangle,
    rightTriangle: resolveRightTriangle,
    trapezoid: resolveTrapezoid,
    parallelogram: resolveParallelogram,
    rhombus: resolveRhombus,
    cube: resolveCube,
    sphere: resolveSphere,
    cylinder: resolveCylinder,
    cone: resolveCone,
    quadrangularpyramid: resolveQuadPyramid,
    rectangularpyramid: resolveRectPyramid,
    cuboid: resolveCuboid
};

function renderRechenwegSteps(steps) {
    // The CSS class "final-step" (a historical name carried over from 
    // other tools) is applied here to EVERY step that calculates something –
    // not just the last one. Only steps that reflect an entered value 
    // unchanged (isGiven) remain neutral.
    rechenwegOutput.innerHTML = steps.map(s => `
            <div class="step-container ${s.isGiven ? "" : "final-step"}">
                <div class="step-title">${s.title}</div>
                ${s.text ? `<div class="step-text">${s.text}</div>` : ""}
                ${s.formula ? `<div class="step-formula-box">${s.formula}</div>` : ""}
                ${s.solution ? `<div class="step-sub-solution">${s.solution}</div>` : ""}
            </div>`).join("");
}

function renderResultsGrid(shape, values, given) {
    const grid = document.querySelector(".ergebnisGrid");
    if (!grid) return;

    grid.innerHTML = shape.inputs.map(input => {
        const isGiven = input.id in given;
        const label = displaySymbol(input.id);
        return `
        <div class="ergebnisItem ${isGiven ? "is-given" : ""}">
            <p class="ergebnisLabel">${label}${isGiven ? ' <i class="fa fa-pencil ergebnisGivenIcon" title="Entered value"></i>' : ''}</p>
            <p class="ergebnisValue">${formatNum(values[input.id])}</p>
        </div>`;
    }).join("");
}

function readGivenValues() {
    const given = {};
    let hasInvalid = false;

    getAllActiveSelects().forEach(select => {
        const row = select.closest(".inputContainer, .inputRow");
        const numberInput = row ? row.querySelector(".numberInputField") : null;
        if (!numberInput) return;

        const raw = numberInput.value.trim();
        if (raw === "") return;

        const num = parseFloat(raw.replace(",", "."));
        if (isNaN(num) || num <= 0) { hasInvalid = true; return; }

        given[select.value] = num;
    });

    return { given, hasInvalid };
}

function setResultsVisible(visible) {
    // Uses opacity instead of display:none so that the box retains its height
    // (see comment at .zahlenAusgabestyle in geometrieRechner.css)
    ausgabeContainer.style.opacity = visible ? "1" : "0";
    ausgabeContainer.style.pointerEvents = visible ? "auto" : "none";
}

function calculate() {
    const shapeKey = formSelectContainer.value;
    const shape = shapeConfig[shapeKey];
    if (!shape) return;

    const { given, hasInvalid } = readGivenValues();
    const requiredCount = document.querySelectorAll("#variousInputContainer .numberInputField").length;
    const givenCount = Object.keys(given).length;

    if (hasInvalid) {
        showError("Please enter positive numbers only.");
        setResultsVisible(false);
        rechenwegOutput.innerHTML = "";
        return;
    }

    if (givenCount < requiredCount) {
        hideError();
        setResultsVisible(false);
        rechenwegOutput.innerHTML = "";
        return;
    }

    const resolver = shapeResolvers[shapeKey];
    if (!resolver) {
        hideError();
        setResultsVisible(false);
        rechenwegOutput.innerHTML = `<div class="step-container"><div class="step-title">Available soon</div><div class="step-text">Calculation for "${shape.name}" will be added next.</div></div>`;
        return;
    }

    const result = resolver(given);

    if (result.error) {
        showError(result.error);
        setResultsVisible(false);
        rechenwegOutput.innerHTML = "";
        return;
    }

    hideError();
    setResultsVisible(true);
    renderResultsGrid(shape, result.values, given);
    renderRechenwegSteps(result.steps);
}

typeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        typeButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentType = btn.dataset.type;

        formSelectContainer.innerHTML = buildFormOptions(currentType);
        setCurrentInputType(formSelectContainer.value);
    });
});

function showError(message) {
    errorMessages.textContent = message;
    errorMessages.style.display = "block";
}

function hideError() {
    errorMessages.style.display = "none";
}

let currentDecimalPlaces = window.MV.getDecimalPlaces();

document.addEventListener('DOMContentLoaded', () => {
    const advancedSettingsBtn = document.getElementById('advancedSettingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const decimalPlacesSelect = document.getElementById('decimalPlaces');

    decimalPlacesSelect.value = currentDecimalPlaces;

    advancedSettingsBtn.addEventListener('click', () => { settingsModal.classList.add('show'); });
    closeModalBtn.addEventListener('click', () => { settingsModal.classList.remove('show'); });
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) settingsModal.classList.remove('show');
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && settingsModal.classList.contains('show')) {
            settingsModal.classList.remove('show');
        }
    });

    saveSettingsBtn.addEventListener('click', () => {
        currentDecimalPlaces = parseInt(decimalPlacesSelect.value, 10);
        window.MV.setDecimalPlaces(currentDecimalPlaces);
        settingsModal.classList.remove('show');
        calculate(); // Recalculate currently displayed results with the new rounding configuration
    });

    // Cross-tab/bfcache sync, matching the financial calculator's logic
    window.addEventListener('mv:staterestore', () => {
        currentDecimalPlaces = window.MV.getDecimalPlaces();
        decimalPlacesSelect.value = currentDecimalPlaces;
        calculate(); // Recalculate currently displayed results with the new rounding configuration
    });
});

function addThirdInput(){
    const shape = shapeConfig[formSelectContainer.value];
    if (!shape) return;

    document.querySelector(".inputContainer").insertAdjacentHTML('beforeend', `
    <div class="inputRow" id="inputRow3">
        <div class="inputSelectDiv">
            <select name="selectInput" id="selectInputRow3" class="selection"></select>
        </div>
        <input type="number" id="zahlenInputRow3" placeholder="Number" class="numberInputField">
    </div>`);

    const select3 = document.getElementById("selectInputRow3");
    select3.innerHTML = shape.inputs
        .map(input => `<option value="${input.id}">${input.label}</option>`)
        .join("");

    // Pre-select the first sensible available value: neither already taken
    // by other dropdowns nor made redundant by a closed group.
    const used = new Set(getAllActiveSelects().filter(s => s !== select3 && s.value).map(s => s.value));
    const groups = shape.redundantGroups || [];
    const free = shape.inputs.find(input => !used.has(input.id) && !isRedundantGiven(input.id, used, groups));
    if (free) select3.value = free.id;

    refreshSelectOptions(shape);
    refreshSketch();
    calculate();
}

function deleteThirdInput(){
    const row = document.getElementById("inputRow3");
    if (row) row.remove();

    const shape = shapeConfig[formSelectContainer.value];
    if (shape) refreshSelectOptions(shape);
    refreshSketch();
    calculate();
}

// Delegated to inputTypeThree itself (persistent node, only attached/detached,
// never recreated) – previously querySelectorAll ran on an unattached element 
// and therefore never bound a listener.
inputTypeThree.addEventListener("click", (e) => {
    const btn = e.target.closest(".numbInputTypeBtn");
    if (!btn) return;

    inputTypeThree.querySelectorAll(".numbInputTypeBtn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const thirdInput = document.getElementById("zahlenInputRow3");

    if (btn.dataset.type === "2Inputs" && thirdInput) {
        deleteThirdInput();
    } else if (btn.dataset.type === "3Inputs" && !thirdInput) {
        addThirdInput();
    }
});


formSelectContainer.addEventListener("change", (event) => {
    const selectedShape = event.target.value;
    setCurrentInputType(selectedShape);
});

// Delegated to the container instead of individual selects/inputs so that 
// the 3rd row added dynamically via addThirdInput() is also caught.
inputsContainer.addEventListener("change", (e) => {
    if (!e.target.classList.contains("selection")) return;
    const shape = shapeConfig[formSelectContainer.value];
    if (shape) refreshSelectOptions(shape);
    refreshSketch();
    calculate();
});

inputsContainer.addEventListener("input", (e) => {
    if (!e.target.classList.contains("numberInputField")) return;
    calculate();
});

function setCurrentInputType(type){
    const currentType = shapeConfig[type].type;
    
    inputsContainer.innerHTML = "";
    
    switch(currentType){
        case 1: 
            inputsContainer.appendChild(inputTypeOne); 
            break;
        case 2: 
            inputsContainer.appendChild(inputTypeTwo); 
            break;
        case 3: 
            inputsContainer.appendChild(inputTypeThree); 
            break;
        case 4:
            inputsContainer.appendChild(inputTypeFour);
            break;
    }

    populateDropdowns(type);
    refreshSketch();
    calculate();
}

function populateDropdowns(shapeKey) {
    const shape = shapeConfig[shapeKey];
    if (!shape) return;

    const selects = getAllActiveSelects();
    const groups = shape.redundantGroups || [];
    const chosen = new Set();

    selects.forEach(select => {
        select.innerHTML = shape.inputs
            .map(input => `<option value="${input.id}">${input.label}</option>`)
            .join("");

        // Sensible default mapping: sequentially pick the next property
        // that hasn't been assigned AND hasn't become redundant yet 
        // (e.g., h instead of d for cylinder/cone once r has been selected).
        const next = shape.inputs.find(input =>
            !chosen.has(input.id) && !isRedundantGiven(input.id, chosen, groups)
        );

        if (next) {
            select.value = next.id;
            chosen.add(next.id);
        }
    });

    refreshSelectOptions(shape);
}

formSelectContainer.innerHTML = buildFormOptions("2d");
setCurrentInputType(formSelectContainer.value);