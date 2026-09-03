const BASE = window.MV_BASE || '';

export const groups = [
    { id: "arithmetik",    title: "Arithmetic",    icon: "fa-percent" },
    { id: "zahlensysteme", title: "Number Systems", icon: "fa-calculator" },
    { id: "algebra",       title: "Algebra",       icon: "fa-bar-chart" },
    { id: "geometrie",     title: "Geometry",      icon: "fa-circle-o" },
    { id: "statistik",     title: "Statistics",    icon: "fa-line-chart" },
    { id: "einheiten",     title: "Units",         icon: "fa-arrows-h" },
    { id: "finanzen",      title: "Finance",       icon: "fa-money" }
];

export const tools = [
    {
        id:       "card1",
        title:    "Number Analysis",
        group:    "statistik",
        filename: "numberAnalysis.html",
        url:      `${BASE}/Tools/NumberAnalysis/numberAnalysis.html`,
        tags: ["numbers", "analysis", "statistics", "sum", "maximum", "minimum", "average", "gcd", "lcm", "median", "mode", "range", "variance", "standard deviation", "data"],
        info: "Calculate statistical measures for any number list. Instantly find sum, min, max, average, median, mode, range, variance, standard deviation, GCD, and LCM.",
        image: {
            big:   `${BASE}/pictures/Zahlen Analyse-appIcon.png`,
            small: `${BASE}/pictures/icons/zahlenAnalyse-icon.png`
        }
    },
    {
        id:       "card2",
        title:    "Number System Converter",
        group:    "zahlensysteme",
        filename: "numberSystemConverter.html",
        url:      `${BASE}/Tools/NumberSystemConverter/numberSystemConverter.html`,
        tags:     ["number system", "converter", "dual", "binary", "hex", "octal", "decimal"],
        info: "Convert numbers between different numeral systems (base 2 to 20), including binary, hex, octal, and decimals with fractional values and calculation steps.",
        image: {
            big:   `${BASE}/pictures/Zahlensystem Umrechner-appIcon.png`,
            small: `${BASE}/pictures/icons/zsystUmrechner-icon.png`
        }
    },
    {
        id:       "card3",
        title:    "Number System Calculator",
        group:    "zahlensysteme",
        filename: "numberSystemCalculator.html",
        url:      `${BASE}/Tools/NumberSystemCalculator/numberSystemCalculator.html`,
        tags:     ["number system", "calculator", "addition", "subtraction", "multiplication", "division", "dual"],
        info: "Perform basic arithmetic operations (addition, subtraction, multiplication, division) in numeral systems (base 2 to 20) with detailed step-by-step solutions.",
        image: {
            big:   `${BASE}/pictures/Zahlensystem Rechner-appIcon.png`,
            small: `${BASE}/pictures/icons/zsystRechner-icon.png`
        }
    },
    {
        id:       "card4",
        title:    "Unit Converter",
        group:    "einheiten",
        filename: "unitConverter.html",
        url:      `${BASE}/Tools/UnitConverter/unitConverter.html`,
        tags: ["converter", "units", "length", "mass", "time", "area", "speed", "volume", "pressure", "energy", "frequency", "decimal prefixes", "plane angle", "data size", "temperature", "fuel consumption", "advanced"],
        info: "Versatile unit converter for length, mass, time, area, speed, volume, pressure, energy, frequency, data size, plane angle, temperature, and fuel consumption.",
        image: {
            big:   `${BASE}/pictures/Einheiten Umrechner-appIcon.png`,
            small: `${BASE}/pictures/icons/einheitenUmrechner-icon.png`
        }
    },
    {
        id:       "card5",
        title:    "Percentage Calculator",
        group:    "arithmetik",
        filename: "percentageCalculator.html",
        url:      `${BASE}/Tools/PercentageCalculator/percentageCalculator.html`,
        tags: ["percent", "percentage", "discount", "cash discount", "value added tax", "VAT", "share", "base value", "percentage change", "increase", "decrease", "net", "gross", "advanced"],
        info: "Advanced percentage calculator. Easily calculate shares, base values, percentage changes, increases/decreases, VAT (net to gross), and discounts with steps.",
        image: {
            big:   `${BASE}/pictures/Prozentrechner-appIcon.png`,
            small: `${BASE}/pictures/icons/prozentrechner-icon.png`
        }
    },
    {
        id:       "card6",
        title:    "Fraction Calculator",
        group:    "arithmetik",
        filename: "fractionCalculator.html",
        url:      `${BASE}/Tools/FractionCalculator/fractionCalculator.html`,
        tags: ["fraction", "add", "subtract", "multiply", "divide", "simplify", "expand", "mixed numbers", "numerator", "denominator", "math", "calculator"],
        info: "Easily add, subtract, multiply, and divide fractions. Supports simplifying, expanding, and calculating with mixed numbers, complete with step-by-step solutions.",
        image: {
            big:   `${BASE}/pictures/Bruchrechner-appIcon.png`,
            small: `${BASE}/pictures/icons/bruchrechner-icon.png`
        }
    },
    {
        id:       "card7",
        title:    "Ratio Calculator",
        group:    "arithmetik",
        filename: "ratioCalculator.html",
        url:      `${BASE}/Tools/RatioCalculator/ratioCalculator.html`,
        tags:     ["ratio", "proportion", "direct proportion", "inverse proportion", "math"],
        info: "Calculate ratios for direct and inverse proportional relationships effortlessly. Includes detailed, step-by-step solutions for rule of three problems.",
        image: {
            big:   `${BASE}/pictures/Dreisatzrechner-appIcon.png`,
            small: `${BASE}/pictures/icons/meinTool-icon.png`
        }
    },
    {
        id:       "card8",
        title:    "Decimal ↔ Fraction Converter",
        group:    "arithmetik",
        filename: "decimalFractionConverter.html",
        url:      `${BASE}/Tools/DecimalFractionConverter/decimalFractionConverter.html`,
        tags:     ["decimal", "fraction", "converter"],
        info: "Easily convert decimals to fractions and fractions to decimals. Get precise results along with detailed, step-by-step mathematical solutions.",
        image: {
            big:   `${BASE}/pictures/DezBruchConverter-appIcon.png`,
            small: `${BASE}/pictures/icons/meinTool-icon.png`
        }
    },
    {
        id:       "card9",
        title:    "Formula Transformer",
        group:    "algebra",
        filename: "formulaTransformer.html",
        url:      `${BASE}/Tools/FormulaTransformer/formulaTransformer.html`,
        tags:     ["formula", "transformer", "algebra"],
        info: "Instantly rearrange and solve mathematical formulas for any variable. View detailed, step-by-step transformations for complex algebra problems.",
        image: {
            big:   `${BASE}/pictures/Formel Umformer-appIcon.png`,
            small: `${BASE}/pictures/icons/meinTool-icon.png`
        }
    },
    {
        id:       "card10",
        title:    "Equation Solver",
        group:    "algebra",
        filename: "equationSolver.html",
        url:      `${BASE}/Tools/EquationSolver/equationSolver.html`,
        tags: ["equation", "linear", "solve", "algebra", "linear equations", "substitution", "addition method", "equalization", "gaussian elimination", "method"],
        info: "Solve general and linear equation systems automatically. Get detailed, step-by-step solutions using substitution, addition, equalization, or Gaussian methods.",
        image: {
            big:   `${BASE}/pictures/Gleichungslöser-appIcon.png`,
            small: `${BASE}/pictures/icons/meinTool-icon.png`
        }
    },
    {
        id:       "card11",
        title:    "Finance Calculator",
        group:    "finanzen",
        filename: "financeCalculator.html",
        url:      `${BASE}/Tools/FinanceCalculator/financeCalculator.html`,
        tags: ["finance", "investment", "savings plan", "return", "inflation", "compound interest", "wealth accumulation", "capital growth", "interest", "ROI", "currency"],
        info: "Analyze wealth accumulation with our finance tools. Calculate compound interest for savings plans, account for inflation, and project capital growth over time.",
        image: {
            big:   `${BASE}/pictures/Finanzrechner-appIcon.png`,
            small: `${BASE}/pictures/icons/meinTool-icon.png`
        }
    },
    {
        id:       "card12",
        title:    "Geometry Calculator",
        group:    "geometrie",
        filename: "geometryCalculator.html",
        url:      `${BASE}/Tools/GeometryCalculator/geometryCalculator.html`,
        tags: ["geometry", "2d", "3d", "circle", "rectangle", "square", "triangle", "right triangle", "trapezoid", "parallelogram", "rhombus", "cube", "cuboid", "sphere", "cylinder", "cone", "pyramid", "volume", "area", "perimeter", "surface area"],
        info: "Calculate area, perimeter, volume, and surface area for shapes like circles, triangles, trapezoids, cubes, cylinders, cones, and pyramids with live previews.",
        image: {
            big:   `${BASE}/pictures/Geometrie Rechner-appIcon.png`,
            small: `${BASE}/pictures/icons/meinTool-icon.png`
        }
    },
    {
        id:       "card13",
        title:    "Math Calculator",
        group:    "arithmetik",
        filename: "mathCalculator.html",
        url:      `${BASE}/Tools/MathCalculator/mathCalculator.html`,
        tags: ["calculator", "arithmetic", "trigonometry", "algebra", "sin", "cos", "tan", "math", "roots", "scientific", "live result", "advanced"],
        info: "Scientific math calculator featuring trigonometry (sin, cos, tan), roots, standard arithmetic operations, and history for complex math problems.",
        image: {
            big:   `${BASE}/pictures/Mathe Rechner-appIcon.png`,
            small: `${BASE}/pictures/icons/meinTool-icon.png`
        }
    }

    // -----------------------------------------------------------------------
    // Add a new tool? Schema:
    // {
    //     id:       "card14",
    //     title:    "Tool title",
    //     group:    "one-of-the-group-ids",
    //     filename: "myTool.html",
    //     url:      `${BASE}/Tools/MyTool/myTool.html`,
    //     tags:     ["tag1", "tag2"],
    //     info:     "Short description for the tooltip.",
    //     image: {
    //         big:   `${BASE}/pictures/myTool-big.jpg`,
    //         small: `${BASE}/pictures/icons/myTool-icon.png`
    //     }
    // }
    // -----------------------------------------------------------------------
];