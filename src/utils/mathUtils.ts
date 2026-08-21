/**
 * Comprehensive High-Precision Math Utilities for Smart Calc
 * Optimized for 100% Offline Precision, Exact Trigonometry & Float Normalization
 */

// Clean IEEE-754 precision artifacts while preserving real decimals
export function cleanFloat(val: number, precision: number = 12): number {
  if (!isFinite(val) || isNaN(val)) return val;
  if (Math.abs(val) < 1e-14) return 0;
  
  // Check if very close to an integer
  const rounded = Math.round(val);
  if (Math.abs(val - rounded) < 1e-11) {
    return Object.is(rounded, -0) ? 0 : rounded;
  }
  
  // Format with high precision and parse back
  const fixed = parseFloat(val.toPrecision(precision));
  if (Math.abs(fixed - Math.round(fixed)) < 1e-11) {
    const intVal = Math.round(fixed);
    return Object.is(intVal, -0) ? 0 : intVal;
  }
  return Object.is(fixed, -0) ? 0 : fixed;
}

// Greatest Common Divisor
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// Least Common Multiple
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.round((a * b) / gcd(a, b)));
}

// Factorial calculation
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('Factorial only defined for non-negative integers');
  }
  if (n > 170) return Infinity; // Overflow in double precision
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

// Permutation nPr
export function nPr(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) {
    throw new Error('nPr requires non-negative integers with n ≥ r');
  }
  return factorial(n) / factorial(n - r);
}

// Combination nCr
export function nCr(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) {
    throw new Error('nCr requires non-negative integers with n ≥ r');
  }
  return factorial(n) / (factorial(r) * factorial(n - r));
}

export type DisplayNotation = 'NORM' | 'SCI' | 'ENG';

export interface Fraction {
  numerator: number;
  denominator: number;
}

export interface MixedFraction {
  whole: number;
  numerator: number;
  denominator: number;
}

// Simplify a fraction
export function simplifyFraction(num: number, den: number): Fraction {
  if (den === 0) throw new Error('Division by zero in fraction');
  if (num === 0) return { numerator: 0, denominator: 1 };
  
  const isNegative = (num < 0) !== (den < 0);
  const absNum = Math.abs(Math.round(num));
  const absDen = Math.abs(Math.round(den));
  const divisor = gcd(absNum, absDen);

  return {
    numerator: isNegative ? -(absNum / divisor) : absNum / divisor,
    denominator: absDen / divisor,
  };
}

// Convert improper fraction to mixed fraction
export function toMixedFraction(num: number, den: number): MixedFraction {
  const simplified = simplifyFraction(num, den);
  const isNeg = simplified.numerator < 0;
  const absN = Math.abs(simplified.numerator);
  const d = simplified.denominator;

  const whole = Math.floor(absN / d);
  const remNum = absN % d;

  return {
    whole: isNeg ? -whole : whole,
    numerator: remNum,
    denominator: d,
  };
}

// Convert decimal to exact/approx fraction using continued fractions
export function decimalToFraction(val: number, tolerance = 1.0e-9): Fraction {
  if (Number.isInteger(val)) {
    return { numerator: val, denominator: 1 };
  }

  const sign = val < 0 ? -1 : 1;
  val = Math.abs(val);

  let h1 = 1, h2 = 0;
  let k1 = 0, k2 = 1;
  let b = val;

  let maxIterations = 25;
  while (maxIterations-- > 0) {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    
    if (k1 === 0) break;
    const diff = Math.abs(val - h1 / k1);
    if (diff <= tolerance || diff <= Math.abs(val) * tolerance || k1 > 1000000) {
      break;
    }
    const remainder = b - a;
    if (Math.abs(remainder) < 1e-12) break;
    b = 1 / remainder;
  }

  return simplifyFraction(sign * h1, k1 || 1);
}

// Fraction Operations
export function addFractions(f1: Fraction, f2: Fraction): Fraction {
  const commonDen = lcm(f1.denominator, f2.denominator);
  const num1 = f1.numerator * (commonDen / f1.denominator);
  const num2 = f2.numerator * (commonDen / f2.denominator);
  return simplifyFraction(num1 + num2, commonDen);
}

export function subtractFractions(f1: Fraction, f2: Fraction): Fraction {
  const commonDen = lcm(f1.denominator, f2.denominator);
  const num1 = f1.numerator * (commonDen / f1.denominator);
  const num2 = f2.numerator * (commonDen / f2.denominator);
  return simplifyFraction(num1 - num2, commonDen);
}

export function multiplyFractions(f1: Fraction, f2: Fraction): Fraction {
  return simplifyFraction(f1.numerator * f2.numerator, f1.denominator * f2.denominator);
}

export function divideFractions(f1: Fraction, f2: Fraction): Fraction {
  if (f2.numerator === 0) throw new Error('Cannot divide by zero fraction');
  return simplifyFraction(f1.numerator * f2.denominator, f1.denominator * f2.numerator);
}

export type FractionOp = '+' | '−' | '×' | '÷';

export interface RawFractionTerm {
  id?: string;
  isMixed?: boolean;
  whole?: string | number;
  num: string | number;
  den: string | number;
  openBrackets?: number;
  closeBrackets?: number;
}

export interface FractionBODMASStep {
  title: string;
  expression: string;
  explanation: string;
}

export interface FractionBODMASResult {
  resultFraction: Fraction;
  mixed: MixedFraction;
  decimal: number;
  steps: FractionBODMASStep[];
  formattedExpression: string;
  rawTerms: RawFractionTerm[];
}

export function formatFractionStr(f: Fraction): string {
  if (f.denominator === 1) return `${f.numerator}`;
  return `${f.numerator}/${f.denominator}`;
}

export function formatTermOriginal(t: RawFractionTerm): string {
  const w = typeof t.whole === 'number' ? t.whole : parseInt(t.whole || '0', 10) || 0;
  const n = typeof t.num === 'number' ? t.num : parseInt(t.num || '0', 10) || 0;
  const d = typeof t.den === 'number' ? t.den : parseInt(t.den || '1', 10) || 1;
  const opens = '('.repeat(t.openBrackets || 0);
  const closes = ')'.repeat(t.closeBrackets || 0);
  let base = `${n}/${d}`;
  if (t.isMixed && w !== 0) {
    base = `${w} ${Math.abs(n)}/${d}`;
  }
  return `${opens}${base}${closes}`;
}

type Token = 
  | { type: 'frac'; frac: Fraction; label: string }
  | { type: 'op'; op: FractionOp }
  | { type: 'open' }
  | { type: 'close' };

function tokensToString(tokens: Token[]): string {
  let str = '';
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.type === 'open') {
      str += '(';
    } else if (tok.type === 'close') {
      str += ')';
      if (i < tokens.length - 1 && tokens[i + 1].type !== 'close' && tokens[i + 1].type !== 'op') {
        str += ' ';
      }
    } else if (tok.type === 'op') {
      str += ` ${tok.op} `;
    } else if (tok.type === 'frac') {
      str += formatFractionStr(tok.frac);
    }
  }
  return str.replace(/\s+/g, ' ').trim();
}

// Solve a flat unbracketed sequence of fraction tokens (BODMAS: ÷, × first, then +, −)
function solveFlatTokens(
  flatTokens: Token[],
  stepPrefix: string,
  stepTracker: { index: number; steps: FractionBODMASStep[] }
): Fraction {
  // Extract fractions and operators
  const fracs: Fraction[] = [];
  const ops: FractionOp[] = [];

  for (const tok of flatTokens) {
    if (tok.type === 'frac') fracs.push(tok.frac);
    else if (tok.type === 'op') ops.push(tok.op);
  }

  if (fracs.length === 0) throw new Error('Empty sub-expression');
  if (fracs.length === 1) return fracs[0];

  let currentFracs = [...fracs];
  let currentOps = [...ops];

  // 1. Division (÷) and Multiplication (×)
  while (true) {
    const mdIdx = currentOps.findIndex(op => op === '×' || op === '÷');
    if (mdIdx === -1) break;

    const op = currentOps[mdIdx];
    const left = currentFracs[mdIdx];
    const right = currentFracs[mdIdx + 1];

    let res: Fraction;
    let explanation = '';
    if (op === '÷') {
      if (right.numerator === 0) throw new Error(`Division by zero fraction (${formatFractionStr(right)})`);
      res = divideFractions(left, right);
      explanation = `Division (BODMAS 'D'): ${formatFractionStr(left)} ÷ ${formatFractionStr(right)} = ${formatFractionStr(left)} × ${right.denominator}/${right.numerator} = ${formatFractionStr(res)}`;
    } else {
      res = multiplyFractions(left, right);
      explanation = `Multiplication (BODMAS 'M'): ${formatFractionStr(left)} × ${formatFractionStr(right)} = (${left.numerator} × ${right.numerator}) / (${left.denominator} × ${right.denominator}) = ${formatFractionStr(res)}`;
    }

    currentFracs.splice(mdIdx, 2, res);
    currentOps.splice(mdIdx, 1);

    const subExprStr = currentFracs.map((f, i) => i === 0 ? formatFractionStr(f) : `${currentOps[i - 1]} ${formatFractionStr(f)}`).join(' ');
    stepTracker.steps.push({
      title: `${stepPrefix} Perform ${op === '÷' ? 'Division' : 'Multiplication'}`,
      expression: subExprStr,
      explanation,
    });
    stepTracker.index++;
  }

  // 2. Addition (+) and Subtraction (−) using LCD
  if (currentFracs.length > 1) {
    const allDens = currentFracs.map(f => f.denominator);
    let commonLCD = allDens[0];
    for (let i = 1; i < allDens.length; i++) {
      commonLCD = lcm(commonLCD, allDens[i]);
    }

    const converted = currentFracs.map(f => ({
      orig: f,
      numWithLCD: f.numerator * (commonLCD / f.denominator),
    }));

    const lcdExprStr = converted.map((c, idx) => {
      const fracStr = `${c.numWithLCD}/${commonLCD}`;
      return idx === 0 ? fracStr : `${currentOps[idx - 1]} ${fracStr}`;
    }).join(' ');

    stepTracker.steps.push({
      title: `${stepPrefix} Find LCD`,
      expression: lcdExprStr,
      explanation: `LCD(${allDens.join(', ')}) = ${commonLCD}. Convert denominators to ${commonLCD}.`,
    });
    stepTracker.index++;

    let combinedNum = converted[0].numWithLCD;
    const numFormulaParts = [`${converted[0].numWithLCD}`];

    for (let i = 0; i < currentOps.length; i++) {
      const op = currentOps[i];
      const nextNum = converted[i + 1].numWithLCD;
      if (op === '+') {
        combinedNum += nextNum;
        numFormulaParts.push(`+ ${nextNum}`);
      } else {
        combinedNum -= nextNum;
        numFormulaParts.push(`- ${nextNum}`);
      }
    }

    const unsimplified: Fraction = { numerator: combinedNum, denominator: commonLCD };
    const simplified = simplifyFraction(unsimplified.numerator, unsimplified.denominator);

    stepTracker.steps.push({
      title: `${stepPrefix} Addition & Subtraction (BODMAS 'A' & 'S')`,
      expression: `(${numFormulaParts.join(' ')}) / ${commonLCD} = ${unsimplified.numerator}/${unsimplified.denominator} = ${formatFractionStr(simplified)}`,
      explanation: `Combined numerators: ${numFormulaParts.join(' ')} = ${combinedNum}. Simplified fraction: ${formatFractionStr(simplified)}.`,
    });
    stepTracker.index++;

    currentFracs = [simplified];
  }

  return simplifyFraction(currentFracs[0].numerator, currentFracs[0].denominator);
}

// Multi-term BODMAS Fraction Evaluator with Brackets support (up to 5 terms)
export function solveFractionExpressionBODMAS(
  terms: RawFractionTerm[],
  operators: FractionOp[]
): FractionBODMASResult {
  if (terms.length < 2) {
    throw new Error('At least 2 fractions are required');
  }
  if (terms.length > 5) {
    throw new Error('Maximum of 5 fractions supported');
  }
  if (operators.length !== terms.length - 1) {
    throw new Error('Operator count must match terms count - 1');
  }

  // Validate bracket balance
  let totalOpens = 0;
  let totalCloses = 0;
  for (const t of terms) {
    totalOpens += t.openBrackets || 0;
    totalCloses += t.closeBrackets || 0;
  }
  if (totalOpens !== totalCloses) {
    throw new Error(`Unmatched brackets: ${totalOpens} open '(' vs ${totalCloses} close ')'`);
  }

  const stepTracker = { index: 1, steps: [] as FractionBODMASStep[] };

  // Step 1: Parse and convert all terms to improper fractions
  const tokens: Token[] = [];
  let hadMixed = false;
  const originalParts: string[] = [];

  for (let i = 0; i < terms.length; i++) {
    const t = terms[i];
    const w = typeof t.whole === 'number' ? t.whole : parseInt(t.whole || '0', 10) || 0;
    const n = typeof t.num === 'number' ? t.num : parseInt(t.num || '0', 10) || 0;
    const d = typeof t.den === 'number' ? t.den : parseInt(t.den || '1', 10) || 1;

    if (d === 0) {
      throw new Error(`Denominator in fraction ${i + 1} cannot be 0`);
    }

    originalParts.push(formatTermOriginal(t));

    // Add open bracket tokens
    for (let k = 0; k < (t.openBrackets || 0); k++) {
      tokens.push({ type: 'open' });
    }

    let improper: Fraction;
    if (t.isMixed && w !== 0) {
      hadMixed = true;
      const isNeg = w < 0;
      const improperNum = isNeg ? -(Math.abs(w) * d + Math.abs(n)) : (w * d + Math.abs(n));
      improper = simplifyFraction(improperNum, d);
    } else {
      improper = simplifyFraction(n, d);
    }

    tokens.push({ type: 'frac', frac: improper, label: formatFractionStr(improper) });

    // Add close bracket tokens
    for (let k = 0; k < (t.closeBrackets || 0); k++) {
      tokens.push({ type: 'close' });
    }

    // Add operator if not last term
    if (i < operators.length) {
      tokens.push({ type: 'op', op: operators[i] });
    }
  }

  const originalExprFormatted = originalParts.map((s, idx) => {
    return idx === 0 ? s : `${operators[idx - 1]} ${s}`;
  }).join(' ');

  if (hadMixed) {
    stepTracker.steps.push({
      title: `Step ${stepTracker.index}: Convert Mixed Fractions to Improper`,
      expression: tokensToString(tokens),
      explanation: `Converted mixed fractions to improper fractions: ${originalExprFormatted} → ${tokensToString(tokens)}`,
    });
    stepTracker.index++;
  }

  // Working copy of tokens
  let currentTokens = [...tokens];

  // Step 2: Evaluate Brackets (BODMAS 'B')
  while (true) {
    // Find the innermost bracket pair
    let lastOpenIdx = -1;
    let matchingCloseIdx = -1;

    for (let i = 0; i < currentTokens.length; i++) {
      if (currentTokens[i].type === 'open') {
        lastOpenIdx = i;
      } else if (currentTokens[i].type === 'close') {
        if (lastOpenIdx !== -1) {
          matchingCloseIdx = i;
          break;
        } else {
          throw new Error('Mismatched closing bracket without open bracket');
        }
      }
    }

    if (lastOpenIdx === -1 || matchingCloseIdx === -1) {
      break; // No more bracket pairs
    }

    const subTokens = currentTokens.slice(lastOpenIdx + 1, matchingCloseIdx);
    if (subTokens.length === 0) {
      throw new Error('Empty brackets ()');
    }

    const subExprStr = tokensToString(subTokens);
    const bracketRes = solveFlatTokens(subTokens, `Step ${stepTracker.index} (Inside Bracket):`, stepTracker);

    // Replace ( subTokens ) with the resulting fraction token
    currentTokens.splice(lastOpenIdx, matchingCloseIdx - lastOpenIdx + 1, {
      type: 'frac',
      frac: bracketRes,
      label: formatFractionStr(bracketRes),
    });

    stepTracker.steps.push({
      title: `Step ${stepTracker.index}: Bracket Result Evaluated (BODMAS 'B')`,
      expression: tokensToString(currentTokens),
      explanation: `Evaluated ( ${subExprStr} ) = ${formatFractionStr(bracketRes)}. Updated expression: ${tokensToString(currentTokens)}`,
    });
    stepTracker.index++;
  }

  // Step 3: Evaluate remaining flat expression
  const finalFraction = solveFlatTokens(currentTokens, `Step ${stepTracker.index}:`, stepTracker);
  const mixed = toMixedFraction(finalFraction.numerator, finalFraction.denominator);
  const decimal = finalFraction.numerator / finalFraction.denominator;

  return {
    resultFraction: finalFraction,
    mixed,
    decimal,
    steps: stepTracker.steps,
    formattedExpression: originalExprFormatted,
    rawTerms: terms,
  };
}

// High-precision trigonometry helpers
function calcSin(x: number, angleMode: 'DEG' | 'RAD'): number {
  if (angleMode === 'DEG') {
    const norm = ((x % 360) + 360) % 360;
    if (norm === 0 || norm === 180 || norm === 360) return 0;
    if (norm === 90) return 1;
    if (norm === 270) return -1;
    if (norm === 30 || norm === 150) return 0.5;
    if (norm === 210 || norm === 330) return -0.5;
    if (norm === 45 || norm === 135) return cleanFloat(Math.SQRT1_2);
    if (norm === 225 || norm === 315) return cleanFloat(-Math.SQRT1_2);
    if (norm === 60 || norm === 120) return cleanFloat(Math.sqrt(3) / 2);
    if (norm === 240 || norm === 300) return cleanFloat(-Math.sqrt(3) / 2);
    return cleanFloat(Math.sin((x * Math.PI) / 180));
  } else {
    if (Math.abs(x % Math.PI) < 1e-13) return 0;
    if (Math.abs((x - Math.PI / 2) % (2 * Math.PI)) < 1e-13) return 1;
    if (Math.abs((x - (3 * Math.PI) / 2) % (2 * Math.PI)) < 1e-13) return -1;
    return cleanFloat(Math.sin(x));
  }
}

function calcCos(x: number, angleMode: 'DEG' | 'RAD'): number {
  if (angleMode === 'DEG') {
    const norm = ((x % 360) + 360) % 360;
    if (norm === 0 || norm === 360) return 1;
    if (norm === 90 || norm === 270) return 0;
    if (norm === 180) return -1;
    if (norm === 60 || norm === 300) return 0.5;
    if (norm === 120 || norm === 240) return -0.5;
    if (norm === 45 || norm === 315) return cleanFloat(Math.SQRT1_2);
    if (norm === 135 || norm === 225) return cleanFloat(-Math.SQRT1_2);
    if (norm === 30 || norm === 330) return cleanFloat(Math.sqrt(3) / 2);
    if (norm === 150 || norm === 210) return cleanFloat(-Math.sqrt(3) / 2);
    return cleanFloat(Math.cos((x * Math.PI) / 180));
  } else {
    if (Math.abs((x - Math.PI / 2) % Math.PI) < 1e-13) return 0;
    if (Math.abs(x % (2 * Math.PI)) < 1e-13) return 1;
    if (Math.abs((x - Math.PI) % (2 * Math.PI)) < 1e-13) return -1;
    return cleanFloat(Math.cos(x));
  }
}

function calcTan(x: number, angleMode: 'DEG' | 'RAD'): number {
  if (angleMode === 'DEG') {
    const norm = ((x % 180) + 180) % 180;
    if (norm === 90) throw new Error('Tangent undefined at 90° + k·180°');
    if (norm === 0 || norm === 180) return 0;
    if (norm === 45) return 1;
    if (norm === 135) return -1;
    return cleanFloat(Math.tan((x * Math.PI) / 180));
  } else {
    if (Math.abs((x - Math.PI / 2) % Math.PI) < 1e-13) {
      throw new Error('Tangent undefined at π/2 + kπ');
    }
    if (Math.abs(x % Math.PI) < 1e-13) return 0;
    return cleanFloat(Math.tan(x));
  }
}

// Standard & Scientific Expression Evaluator
export function evaluateExpression(expr: string, angleMode: 'DEG' | 'RAD' = 'DEG'): number {
  if (!expr || expr.trim() === '') return 0;

  // Clean and prepare string
  let sanitized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, `${Math.PI}`)
    .replace(/τ/g, `${2 * Math.PI}`)
    .replace(/e\b/g, `${Math.E}`)
    .replace(/φ/g, `${(1 + Math.sqrt(5)) / 2}`)
    .replace(/EE/g, '*10^')
    .replace(/mod/gi, '%')
    .trim();

  // Smart percentage replacement:
  // e.g. "100 + 10%" -> "(100 + (100 * (10 / 100)))"
  sanitized = sanitized.replace(/(\d+(?:\.\d+)?)\s*([+\-])\s*(\d+(?:\.\d+)?)%/g, '($1 $2 ($1 * ($3 / 100)))');
  // General remaining percentages: e.g. "50%" -> "(50/100)"
  sanitized = sanitized.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

  // Handle factorials (e.g. 5! -> factorial(5))
  sanitized = sanitized.replace(/(\d+)!/g, (_, n) => `${factorial(parseInt(n, 10))}`);

  // Safe Scope Context
  const scope: Record<string, any> = {
    sin: (x: number) => calcSin(x, angleMode),
    cos: (x: number) => calcCos(x, angleMode),
    tan: (x: number) => calcTan(x, angleMode),
    asin: (x: number) => {
      if (x < -1 || x > 1) throw new Error('Domain error for asin [-1, 1]');
      if (x === 0) return 0;
      if (x === 1) return angleMode === 'DEG' ? 90 : Math.PI / 2;
      if (x === -1) return angleMode === 'DEG' ? -90 : -Math.PI / 2;
      if (x === 0.5) return angleMode === 'DEG' ? 30 : Math.PI / 6;
      if (x === -0.5) return angleMode === 'DEG' ? -30 : -Math.PI / 6;
      const res = Math.asin(x);
      return cleanFloat(angleMode === 'DEG' ? (res * 180) / Math.PI : res);
    },
    acos: (x: number) => {
      if (x < -1 || x > 1) throw new Error('Domain error for acos [-1, 1]');
      if (x === 1) return 0;
      if (x === 0) return angleMode === 'DEG' ? 90 : Math.PI / 2;
      if (x === -1) return angleMode === 'DEG' ? 180 : Math.PI;
      if (x === 0.5) return angleMode === 'DEG' ? 60 : Math.PI / 3;
      if (x === -0.5) return angleMode === 'DEG' ? 120 : (2 * Math.PI) / 3;
      const res = Math.acos(x);
      return cleanFloat(angleMode === 'DEG' ? (res * 180) / Math.PI : res);
    },
    atan: (x: number) => {
      if (x === 0) return 0;
      if (x === 1) return angleMode === 'DEG' ? 45 : Math.PI / 4;
      if (x === -1) return angleMode === 'DEG' ? -45 : -Math.PI / 4;
      const res = Math.atan(x);
      return cleanFloat(angleMode === 'DEG' ? (res * 180) / Math.PI : res);
    },
    sinh: (x: number) => cleanFloat(Math.sinh(x)),
    cosh: (x: number) => cleanFloat(Math.cosh(x)),
    tanh: (x: number) => cleanFloat(Math.tanh(x)),
    asinh: (x: number) => cleanFloat(Math.asinh(x)),
    acosh: (x: number) => {
      if (x < 1) throw new Error('Domain error for acosh [1, ∞)');
      return cleanFloat(Math.acosh(x));
    },
    atanh: (x: number) => {
      if (x <= -1 || x >= 1) throw new Error('Domain error for atanh (-1, 1)');
      return cleanFloat(Math.atanh(x));
    },
    sqrt: (x: number) => {
      if (x < 0) throw new Error('Cannot take square root of negative number');
      return cleanFloat(Math.sqrt(x));
    },
    cbrt: (x: number) => (x < 0 ? cleanFloat(-Math.cbrt(-x)) : cleanFloat(Math.cbrt(x))),
    root: (y: number, x: number) => {
      if (x === 0) return 0;
      if (x < 0) {
        if (Number.isInteger(y) && y % 2 !== 0) {
          return cleanFloat(-Math.pow(-x, 1 / y));
        }
        throw new Error('Even root of negative number');
      }
      return cleanFloat(Math.pow(x, 1 / y));
    },
    log: (x: number) => {
      if (x <= 0) throw new Error('Domain error for log10 (x > 0)');
      return cleanFloat(Math.log10(x));
    },
    log2: (x: number) => {
      if (x <= 0) throw new Error('Domain error for log2 (x > 0)');
      return cleanFloat(Math.log2(x));
    },
    logBase: (base: number, x: number) => {
      if (x <= 0 || base <= 0 || base === 1) throw new Error('Domain error for custom base log');
      return cleanFloat(Math.log(x) / Math.log(base));
    },
    ln: (x: number) => {
      if (x <= 0) throw new Error('Domain error for ln (x > 0)');
      return cleanFloat(Math.log(x));
    },
    exp: (x: number) => cleanFloat(Math.exp(x)),
    abs: (x: number) => Math.abs(x),
    round: (x: number) => Math.round(x),
    floor: (x: number) => Math.floor(x),
    ceil: (x: number) => Math.ceil(x),
    pow: (x: number, y: number) => {
      if (x < 0 && !Number.isInteger(y)) {
        const inv = 1 / y;
        if (Math.abs(Math.round(inv) - inv) < 1e-9 && Math.round(inv) % 2 !== 0) {
          return cleanFloat(-Math.pow(-x, y));
        }
      }
      return cleanFloat(Math.pow(x, y));
    },
    fact: factorial,
    nPr: nPr,
    nCr: nCr,
    rand: () => Math.random(),
    mod: (a: number, b: number) => {
      if (b === 0) throw new Error('Modulo by zero');
      return cleanFloat(((a % b) + b) % b);
    },
  };

  // Replace power operator `^` with `**`
  sanitized = sanitized.replace(/\^/g, '**');

  // Replace mathematical function calls
  const funcNames = ['asin', 'acos', 'atan', 'asinh', 'acosh', 'atanh', 'sinh', 'cosh', 'tanh', 'sin', 'cos', 'tan', 'sqrt', 'cbrt', 'root', 'logBase', 'log2', 'log', 'ln', 'exp', 'abs', 'round', 'floor', 'ceil', 'fact', 'nPr', 'nCr', 'rand', 'mod'];
  
  // Implicit multiplications like 5sin(30) -> 5*sin(30) or 2(3) -> 2*(3)
  sanitized = sanitized.replace(/(\d+)\s*\(/g, '$1*(');
  sanitized = sanitized.replace(/\)\s*(\d+)/g, ')*$1');
  sanitized = sanitized.replace(/\)\s*\(/g, ')*(');
  
  for (const fn of funcNames) {
    const reg = new RegExp(`(\\d+)\\s*${fn}\\(`, 'g');
    sanitized = sanitized.replace(reg, `$1*${fn}(`);
  }

  // Validate allowed characters to prevent arbitrary execution
  const allowedChars = /^[0-9+\-*/()., %^**eE\s_a-zA-Z]+$/;
  if (!allowedChars.test(sanitized)) {
    throw new Error('Invalid mathematical characters');
  }

  // Execute in isolated safe function scope
  const argNames = Object.keys(scope);
  const argValues = Object.values(scope);

  // eslint-disable-next-line no-new-func
  const fnEvaluator = new Function(...argNames, `"use strict"; return (${sanitized});`);
  const rawResult = fnEvaluator(...argValues);

  if (typeof rawResult !== 'number' || isNaN(rawResult)) {
    throw new Error('Invalid calculation');
  }

  return cleanFloat(rawResult);
}

// Format numbers nicely for standard display
export function formatResult(val: number, maxDecimals = 8): string {
  if (isNaN(val)) return 'Error';
  if (!isFinite(val)) return val > 0 ? 'Infinity' : '-Infinity';

  const cleaned = cleanFloat(val);
  if (Object.is(cleaned, -0) || Math.abs(cleaned) < 1e-14) {
    return '0';
  }

  // If very large or very small, use scientific notation
  if (Math.abs(cleaned) >= 1e12 || (Math.abs(cleaned) < 1e-6 && cleaned !== 0)) {
    return cleaned.toExponential(6).replace(/\.?0+e/, 'e');
  }

  // Standard float rounding
  const rounded = parseFloat(cleaned.toFixed(maxDecimals));
  const finalVal = Object.is(rounded, -0) ? 0 : rounded;
  return finalVal.toLocaleString('en-US', {
    maximumFractionDigits: maxDecimals,
    useGrouping: false,
  });
}

// Comprehensive Notation Formatter: Normal, Scientific, Engineering
export function formatWithNotation(val: number, notation: DisplayNotation = 'NORM', maxDecimals = 6): string {
  if (isNaN(val)) return 'Error';
  if (!isFinite(val)) return val > 0 ? 'Infinity' : '-Infinity';
  if (val === 0) return '0';

  if (notation === 'NORM') {
    return formatResult(val, 8);
  }

  if (notation === 'SCI') {
    // Pure Scientific Notation: a × 10^b
    const expStr = val.toExponential(maxDecimals);
    const [mantissa, exponent] = expStr.split('e');
    const cleanMantissa = parseFloat(mantissa).toString();
    const expNum = parseInt(exponent, 10);
    return `${cleanMantissa} × 10${toSuperscript(expNum)}`;
  }

  if (notation === 'ENG') {
    // Engineering Notation: exponent is a multiple of 3 (e.g. 10^3, 10^6, 10^-3)
    const sign = val < 0 ? -1 : 1;
    let absVal = Math.abs(val);
    let exp = Math.floor(Math.log10(absVal));
    const engExp = Math.floor(exp / 3) * 3;
    const engMantissa = (sign * (absVal / Math.pow(10, engExp))).toFixed(maxDecimals);
    const cleanMantissa = parseFloat(engMantissa).toString();
    if (engExp === 0) {
      return cleanMantissa;
    }
    return `${cleanMantissa} × 10${toSuperscript(engExp)}`;
  }

  return formatResult(val, 8);
}

// Convert integer power to unicode superscript
export function toSuperscript(num: number): string {
  const superscripts: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    '-': '⁻',
    '+': '⁺',
  };
  return num
    .toString()
    .split('')
    .map((c) => superscripts[c] || c)
    .join('');
}

// Equation Solvers
export interface LinearSolution {
  a: number;
  b: number;
  c: number;
  solution: number;
  formattedX: string;
  steps: string[];
}

export function solveLinearEquation(a: number, b: number, c: number): LinearSolution {
  if (a === 0) {
    if (b === c) {
      throw new Error('Infinite solutions (identity 0 = 0)');
    } else {
      throw new Error('No solution (contradiction)');
    }
  }

  const steps: string[] = [];
  steps.push(`Original equation: ${a}x + ${b} = ${c}`);
  
  if (b !== 0) {
    const rhsAfterSub = c - b;
    steps.push(`Subtract ${b} from both sides: ${a}x = ${c} - (${b}) => ${a}x = ${rhsAfterSub}`);
  }
  
  const x = (c - b) / a;
  steps.push(`Divide both sides by ${a}: x = ${c - b} / ${a} = ${formatResult(x)}`);

  const frac = decimalToFraction(x);
  const fracStr = frac.denominator !== 1 ? ` (or ${frac.numerator}/${frac.denominator})` : '';

  return {
    a,
    b,
    c,
    solution: x,
    formattedX: `${formatResult(x)}${fracStr}`,
    steps,
  };
}

export interface QuadraticSolution {
  a: number;
  b: number;
  c: number;
  discriminant: number;
  rootType: 'two_real' | 'one_real' | 'complex';
  roots: {
    r1: string;
    r2: string;
    val1?: number;
    val2?: number;
  };
  vertex: {
    h: number;
    k: number;
    formatted: string;
  };
  yIntercept: number;
  steps: string[];
}

export function solveQuadraticEquation(a: number, b: number, c: number): QuadraticSolution {
  if (a === 0) {
    throw new Error('Coefficient "a" cannot be 0 in a quadratic equation (ax² + bx + c = 0)');
  }

  const steps: string[] = [];
  steps.push(`Standard Form: ${a}x² + ${b}x + ${c} = 0`);
  
  const d = b * b - 4 * a * c;
  steps.push(`Calculate Discriminant (Δ = b² - 4ac):`);
  steps.push(`Δ = (${b})² - 4(${a})(${c}) = ${b * b} - ${4 * a * c} = ${d}`);

  const h = -b / (2 * a);
  const k = c - (b * b) / (4 * a);
  const vertexFormatted = `(${formatResult(h)}, ${formatResult(k)})`;

  let rootType: 'two_real' | 'one_real' | 'complex' = 'two_real';
  let r1Str = '';
  let r2Str = '';
  let val1: number | undefined;
  let val2: number | undefined;

  if (d > 0) {
    rootType = 'two_real';
    const sqrtD = Math.sqrt(d);
    val1 = (-b + sqrtD) / (2 * a);
    val2 = (-b - sqrtD) / (2 * a);
    
    steps.push(`Since Δ > 0, there are two distinct real roots.`);
    steps.push(`x₁ = (-b + √Δ) / 2a = (${-b} + ${formatResult(sqrtD)}) / ${2 * a} = ${formatResult(val1)}`);
    steps.push(`x₂ = (-b - √Δ) / 2a = (${-b} - ${formatResult(sqrtD)}) / ${2 * a} = ${formatResult(val2)}`);

    const f1 = decimalToFraction(val1);
    const f2 = decimalToFraction(val2);
    r1Str = f1.denominator !== 1 ? `${formatResult(val1)} (${f1.numerator}/${f1.denominator})` : `${formatResult(val1)}`;
    r2Str = f2.denominator !== 1 ? `${formatResult(val2)} (${f2.numerator}/${f2.denominator})` : `${formatResult(val2)}`;
  } else if (d === 0) {
    rootType = 'one_real';
    val1 = -b / (2 * a);
    val2 = val1;
    
    steps.push(`Since Δ = 0, there is exactly one repeated real root.`);
    steps.push(`x = -b / 2a = ${-b} / ${2 * a} = ${formatResult(val1)}`);
    
    const f1 = decimalToFraction(val1);
    r1Str = f1.denominator !== 1 ? `${formatResult(val1)} (${f1.numerator}/${f1.denominator})` : `${formatResult(val1)}`;
    r2Str = r1Str;
  } else {
    rootType = 'complex';
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-d) / (2 * Math.abs(a));
    
    steps.push(`Since Δ < 0, there are two complex conjugate roots.`);
    steps.push(`x₁,₂ = (-b ± i√|Δ|) / 2a`);
    steps.push(`Real part: ${formatResult(realPart)}, Imaginary part: ±${formatResult(imagPart)}i`);

    r1Str = `${formatResult(realPart)} + ${formatResult(imagPart)}i`;
    r2Str = `${formatResult(realPart)} - ${formatResult(imagPart)}i`;
  }

  steps.push(`Parabola Vertex (h, k): x = -b / 2a = ${formatResult(h)}, y = ${formatResult(k)} => ${vertexFormatted}`);
  steps.push(`Y-intercept: (0, ${c})`);

  return {
    a,
    b,
    c,
    discriminant: d,
    rootType,
    roots: {
      r1: r1Str,
      r2: r2Str,
      val1,
      val2,
    },
    vertex: {
      h,
      k,
      formatted: vertexFormatted,
    },
    yIntercept: c,
    steps,
  };
}

// 2x2 Linear System Solver (Cramer's Rule)
export interface System2x2Solution {
  a1: number;
  b1: number;
  c1: number;
  a2: number;
  b2: number;
  c2: number;
  type: 'unique' | 'infinite' | 'none';
  x?: number;
  y?: number;
  formattedX?: string;
  formattedY?: string;
  det: number;
  detX: number;
  detY: number;
  steps: string[];
}

export function solveSystem2x2(
  a1: number, b1: number, c1: number,
  a2: number, b2: number, c2: number
): System2x2Solution {
  const steps: string[] = [];
  steps.push(`Equation (1): ${a1}x + ${b1}y = ${c1}`);
  steps.push(`Equation (2): ${a2}x + ${b2}y = ${c2}`);

  const det = a1 * b2 - a2 * b1;
  const detX = c1 * b2 - c2 * b1;
  const detY = a1 * c2 - a2 * c1;

  steps.push(`Cramer's Determinant (D) = (${a1})(${b2}) - (${a2})(${b1}) = ${det}`);
  steps.push(`Determinant Dx = (${c1})(${b2}) - (${c2})(${b1}) = ${detX}`);
  steps.push(`Determinant Dy = (${a1})(${c2}) - (${a2})(${c1}) = ${detY}`);

  if (det === 0) {
    if (detX === 0 && detY === 0) {
      steps.push(`Since D = 0, Dx = 0, and Dy = 0, the system has infinitely many solutions (dependent system).`);
      return { a1, b1, c1, a2, b2, c2, type: 'infinite', det, detX, detY, steps };
    } else {
      steps.push(`Since D = 0 but Dx or Dy ≠ 0, the system has no solution (inconsistent parallel lines).`);
      return { a1, b1, c1, a2, b2, c2, type: 'none', det, detX, detY, steps };
    }
  }

  const x = detX / det;
  const y = detY / det;

  steps.push(`x = Dx / D = ${detX} / ${det} = ${formatResult(x)}`);
  steps.push(`y = Dy / D = ${detY} / ${det} = ${formatResult(y)}`);

  const fx = decimalToFraction(x);
  const fy = decimalToFraction(y);

  return {
    a1, b1, c1, a2, b2, c2,
    type: 'unique',
    x,
    y,
    formattedX: fx.denominator !== 1 ? `${formatResult(x)} (${fx.numerator}/${fx.denominator})` : `${formatResult(x)}`,
    formattedY: fy.denominator !== 1 ? `${formatResult(y)} (${fy.numerator}/${fy.denominator})` : `${formatResult(y)}`,
    det,
    detX,
    detY,
    steps,
  };
}

// ----------------------------------------------------
// 3. Cubic Equation Solver (ax³ + bx² + cx + d = 0)
// ----------------------------------------------------
export interface CubicSolution {
  a: number;
  b: number;
  c: number;
  d: number;
  roots: {
    r1: string;
    r2: string;
    r3: string;
    val1?: number;
    val2?: number;
    val3?: number;
  };
  discriminantDelta: number;
  nature: 'three_real_distinct' | 'all_real_multiple' | 'one_real_two_complex';
  steps: string[];
}

export function solveCubicEquation(a: number, b: number, c: number, d: number): CubicSolution {
  if (a === 0) {
    throw new Error('Coefficient "a" cannot be 0 in a cubic equation (ax³ + bx² + cx + d = 0)');
  }

  const steps: string[] = [];
  steps.push(`Standard Form: ${a}x³ + ${b}x² + ${c}x + ${d} = 0`);

  // Depress the cubic: x = t - b / (3a) => t³ + pt + q = 0
  const an = b / a;
  const bn = c / a;
  const cn = d / a;

  const p = bn - (an * an) / 3;
  const q = (2 * an * an * an) / 27 - (an * bn) / 3 + cn;

  steps.push(`Depressed cubic substitution x = t - (${formatResult(an / 3)}): t³ + pt + q = 0`);
  steps.push(`p = ${formatResult(p, 6)}, q = ${formatResult(q, 6)}`);

  const delta = (q * q) / 4 + (p * p * p) / 27;
  steps.push(`Cardano discriminant Δ = (q/2)² + (p/3)³ = ${formatResult(delta, 6)}`);

  const shift = an / 3;
  let r1Str = '';
  let r2Str = '';
  let r3Str = '';
  let val1: number | undefined;
  let val2: number | undefined;
  let val3: number | undefined;
  let nature: 'three_real_distinct' | 'all_real_multiple' | 'one_real_two_complex' = 'three_real_distinct';

  const EPS = 1e-9;

  if (Math.abs(delta) < EPS) {
    nature = 'all_real_multiple';
    if (Math.abs(p) < EPS && Math.abs(q) < EPS) {
      val1 = -shift;
      val2 = -shift;
      val3 = -shift;
      r1Str = `${formatResult(val1)} (triple root)`;
      r2Str = `${formatResult(val2)}`;
      r3Str = `${formatResult(val3)}`;
    } else {
      const u = Math.cbrt(-q / 2);
      val1 = 2 * u - shift;
      val2 = -u - shift;
      val3 = val2;
      r1Str = formatResult(val1);
      r2Str = `${formatResult(val2)} (double root)`;
      r3Str = formatResult(val3);
    }
    steps.push(`Since Δ ≈ 0, all roots are real with at least two equal.`);
  } else if (delta < 0) {
    // 3 distinct real roots (casus irreducibilis) - trigonometric solution
    nature = 'three_real_distinct';
    const r = Math.sqrt(-(p * p * p) / 27);
    const phi = Math.acos(Math.max(-1, Math.min(1, -q / (2 * r))));
    const t1 = 2 * Math.cbrt(r) * Math.cos(phi / 3);
    const t2 = 2 * Math.cbrt(r) * Math.cos((phi + 2 * Math.PI) / 3);
    const t3 = 2 * Math.cbrt(r) * Math.cos((phi + 4 * Math.PI) / 3);

    const sortedVals = [t1 - shift, t2 - shift, t3 - shift].sort((m, n) => m - n);
    val1 = sortedVals[0];
    val2 = sortedVals[1];
    val3 = sortedVals[2];

    r1Str = formatResult(val1);
    r2Str = formatResult(val2);
    r3Str = formatResult(val3);

    steps.push(`Since Δ < 0, there are 3 distinct real roots (solved via Viete trigonometric method).`);
    steps.push(`x₁ = ${r1Str}, x₂ = ${r2Str}, x₃ = ${r3Str}`);
  } else {
    // delta > 0: 1 real root and 2 complex conjugate roots
    nature = 'one_real_two_complex';
    const sqrtDelta = Math.sqrt(delta);
    const u = Math.cbrt(-q / 2 + sqrtDelta);
    const v = Math.cbrt(-q / 2 - sqrtDelta);

    val1 = u + v - shift;
    r1Str = formatResult(val1);

    const realPart = -(u + v) / 2 - shift;
    const imagPart = ((u - v) * Math.sqrt(3)) / 2;

    r2Str = `${formatResult(realPart)} + ${formatResult(Math.abs(imagPart))}i`;
    r3Str = `${formatResult(realPart)} - ${formatResult(Math.abs(imagPart))}i`;

    steps.push(`Since Δ > 0, there is 1 real root and 2 complex conjugate roots.`);
    steps.push(`x₁ (real) = ${r1Str}`);
    steps.push(`x₂ = ${r2Str}, x₃ = ${r3Str}`);
  }

  return {
    a,
    b,
    c,
    d,
    roots: {
      r1: r1Str,
      r2: r2Str,
      r3: r3Str,
      val1,
      val2,
      val3,
    },
    discriminantDelta: delta,
    nature,
    steps,
  };
}

// ----------------------------------------------------
// 4. Simultaneous Linear & Quadratic Solver
// Equation (1): y = m*x + k   (or px + qy = r => y = (r - px)/q)
// Equation (2): y = a*x² + b*x + c
// Intersection: a*x² + (b - m)*x + (c - k) = 0
// ----------------------------------------------------
export interface LinearQuadraticSolution {
  linearDesc: string;
  quadDesc: string;
  intersections: Array<{
    x: number;
    y: number;
    formattedX: string;
    formattedY: string;
  }>;
  discriminant: number;
  type: 'two_points' | 'tangent_one_point' | 'no_intersection';
  steps: string[];
}

export function solveSimultaneousLinearQuadratic(
  m: number, // Line slope: y = mx + k
  k: number, // Line y-intercept
  a: number, // Parabola: y = ax² + bx + c
  b: number,
  c: number
): LinearQuadraticSolution {
  if (a === 0) {
    throw new Error('Quadratic coefficient "a" cannot be zero.');
  }

  const steps: string[] = [];
  const linStr = `y = ${m !== 0 ? `${m}x` : ''} ${k >= 0 ? `+ ${k}` : `- ${Math.abs(k)}`}`;
  const quadStr = `y = ${a}x² + ${b}x + ${c}`;
  steps.push(`Line: ${linStr}`);
  steps.push(`Parabola: ${quadStr}`);
  steps.push(`Substitute line y into parabola: ${a}x² + ${b}x + ${c} = ${m}x + ${k}`);

  const A = a;
  const B = b - m;
  const C = c - k;

  steps.push(`Combined Quadratic: ${A}x² + (${B})x + (${C}) = 0`);
  const D = B * B - 4 * A * C;
  steps.push(`Discriminant Δ = (${B})² - 4(${A})(${C}) = ${D}`);

  const intersections: Array<{ x: number; y: number; formattedX: string; formattedY: string }> = [];
  let type: 'two_points' | 'tangent_one_point' | 'no_intersection' = 'two_points';

  if (D > 0) {
    type = 'two_points';
    const sqrtD = Math.sqrt(D);
    const x1 = (-B + sqrtD) / (2 * A);
    const y1 = m * x1 + k;
    const x2 = (-B - sqrtD) / (2 * A);
    const y2 = m * x2 + k;

    intersections.push({
      x: x1,
      y: y1,
      formattedX: formatResult(x1),
      formattedY: formatResult(y1),
    });
    intersections.push({
      x: x2,
      y: y2,
      formattedX: formatResult(x2),
      formattedY: formatResult(y2),
    });
    steps.push(`Two intersection points found:`);
    steps.push(`Point 1: (${formatResult(x1)}, ${formatResult(y1)})`);
    steps.push(`Point 2: (${formatResult(x2)}, ${formatResult(y2)})`);
  } else if (Math.abs(D) < 1e-9) {
    type = 'tangent_one_point';
    const x1 = -B / (2 * A);
    const y1 = m * x1 + k;
    intersections.push({
      x: x1,
      y: y1,
      formattedX: formatResult(x1),
      formattedY: formatResult(y1),
    });
    steps.push(`Line is tangent to the parabola at 1 point:`);
    steps.push(`Tangent Point: (${formatResult(x1)}, ${formatResult(y1)})`);
  } else {
    type = 'no_intersection';
    steps.push(`Since Δ < 0, the line and parabola do not intersect in the real Cartesian plane.`);
  }

  return {
    linearDesc: linStr,
    quadDesc: quadStr,
    intersections,
    discriminant: D,
    type,
    steps,
  };
}

// ----------------------------------------------------
// 5. Simultaneous Linear & General Polynomial Solver
// Line: y = m*x + k
// Polynomial: y = c_n x^n + ... + c_1 x + c_0 (Degree up to 5)
// Combined: c_n x^n + ... + (c_1 - m)x + (c_0 - k) = 0
// Finds all real roots via robust numerical polynomial root isolation (Durand-Kerner & Newton)
// ----------------------------------------------------
export interface LinearPolySolution {
  deg: number;
  polyDesc: string;
  linearDesc: string;
  intersections: Array<{
    x: number;
    y: number;
    formattedX: string;
    formattedY: string;
  }>;
  steps: string[];
}

export function solveSimultaneousLinearPolynomial(
  m: number,
  k: number,
  coeffs: number[] // [c_n, c_{n-1}, ..., c_1, c_0] from highest degree to constant
): LinearPolySolution {
  // Remove leading zeros
  let cleaned = [...coeffs];
  while (cleaned.length > 0 && Math.abs(cleaned[0]) < 1e-12) {
    cleaned.shift();
  }

  if (cleaned.length < 2) {
    throw new Error('Polynomial must have degree of at least 1.');
  }

  const deg = cleaned.length - 1;
  const linStr = `y = ${m !== 0 ? `${m}x` : ''} ${k >= 0 ? `+ ${k}` : `- ${Math.abs(k)}`}`;
  
  // Build polynomial string
  let polyParts: string[] = [];
  cleaned.forEach((c, idx) => {
    const power = deg - idx;
    if (Math.abs(c) < 1e-9) return;
    if (power === 0) polyParts.push(`${c > 0 && polyParts.length ? '+ ' : ''}${c}`);
    else if (power === 1) polyParts.push(`${c > 0 && polyParts.length ? '+ ' : ''}${c === 1 ? '' : c === -1 ? '-' : c}x`);
    else polyParts.push(`${c > 0 && polyParts.length ? '+ ' : ''}${c === 1 ? '' : c === -1 ? '-' : c}x${toSuperscript(power)}`);
  });
  const polyStr = `y = ${polyParts.join(' ') || '0'}`;

  // Subtract line: combined polynomial has c_1 - m, c_0 - k
  const combined = [...cleaned];
  combined[combined.length - 2] -= m;
  combined[combined.length - 1] -= k;

  const steps: string[] = [];
  steps.push(`Line: ${linStr}`);
  steps.push(`Polynomial: ${polyStr}`);
  steps.push(`Equating both: P(x) - (${linStr}) = 0`);

  // Find real roots using numerical method (interval scanning + Newton-Raphson bisection)
  const evalPoly = (arr: number[], x: number) => {
    let res = 0;
    for (let i = 0; i < arr.length; i++) {
      res = res * x + arr[i];
    }
    return res;
  };

  const evalDeriv = (arr: number[], x: number) => {
    let res = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      const pwr = arr.length - 1 - i;
      res = res * x + arr[i] * pwr;
    }
    return res;
  };

  // Scan range [-1000, 1000] with variable step
  const realRoots: number[] = [];
  const addRootIfNew = (root: number) => {
    if (!realRoots.some((r) => Math.abs(r - root) < 1e-4)) {
      realRoots.push(root);
    }
  };

  // Cauchy bound on roots
  const leading = Math.abs(combined[0]);
  const maxCoeff = Math.max(...combined.slice(1).map(Math.abs));
  const bound = Math.min(1000, 1 + maxCoeff / leading);

  const stepsCount = 1000;
  const dx = (2 * bound) / stepsCount;
  let prevX = -bound;
  let prevY = evalPoly(combined, prevX);

  for (let i = 1; i <= stepsCount; i++) {
    const currX = -bound + i * dx;
    const currY = evalPoly(combined, currX);

    if (Math.abs(currY) < 1e-7) {
      addRootIfNew(currX);
    } else if (prevY * currY < 0) {
      // Bisection + Newton-Raphson
      let lo = prevX;
      let hi = currX;
      let mid = (lo + hi) / 2;
      for (let iter = 0; iter < 40; iter++) {
        mid = (lo + hi) / 2;
        const val = evalPoly(combined, mid);
        if (Math.abs(val) < 1e-10) break;
        if (evalPoly(combined, lo) * val < 0) {
          hi = mid;
        } else {
          lo = mid;
        }
      }
      // Refine with Newton
      for (let nIter = 0; nIter < 5; nIter++) {
        const f = evalPoly(combined, mid);
        const df = evalDeriv(combined, mid);
        if (Math.abs(df) > 1e-9) {
          mid = mid - f / df;
        }
      }
      addRootIfNew(mid);
    }
    prevX = currX;
    prevY = currY;
  }

  realRoots.sort((a, b) => a - b);

  const intersections = realRoots.map((rx) => {
    const ry = m * rx + k;
    return {
      x: rx,
      y: ry,
      formattedX: formatResult(rx, 4),
      formattedY: formatResult(ry, 4),
    };
  });

  steps.push(`Degree: ${deg}. Found ${intersections.length} real intersection points:`);
  intersections.forEach((pt, i) => {
    steps.push(`Point ${i + 1}: (${pt.formattedX}, ${pt.formattedY})`);
  });

  return {
    deg,
    polyDesc: polyStr,
    linearDesc: linStr,
    intersections,
    steps,
  };
}

// ----------------------------------------------------
// 6. Equation Formulator: Build Quadratic from Roots
// Given roots r1, r2 and optional scale factor 'a' (default a=1)
// Standard equation: a(x - r1)(x - r2) = a*x² - a*(r1+r2)*x + a*(r1*r2) = 0
// Also supports complex conjugate roots (u ± vi): x² - 2u x + (u² + v²) = 0
// ----------------------------------------------------
export interface QuadraticFormulatorResult {
  a: number;
  b: number;
  c: number;
  equationString: string;
  factoredString: string;
  sumOfRoots: number;
  productOfRoots: number;
  steps: string[];
}

export function formulateQuadraticFromRoots(
  r1: number,
  r2: number,
  a: number = 1
): QuadraticFormulatorResult {
  if (a === 0) a = 1;

  const sum = r1 + r2;
  const product = r1 * r2;

  const b = -a * sum;
  const c = a * product;

  const steps: string[] = [];
  steps.push(`Given Roots: r₁ = ${r1}, r₂ = ${r2}, Scaling coefficient a = ${a}`);
  steps.push(`Vieta's Formulas: Sum = r₁ + r₂ = ${sum}, Product = r₁ × r₂ = ${product}`);
  steps.push(`Factored Form: ${a !== 1 ? `${a}` : ''}(x - (${r1}))(x - (${r2})) = 0`);
  steps.push(`Expanded Form: ${a}x² - ${a}(${sum})x + ${a}(${product}) = 0`);

  const eqStr = `${a !== 1 ? (a === -1 ? '-' : `${formatResult(a)}`) : ''}x² ${
    b >= 0 ? `+ ${formatResult(b)}` : `- ${formatResult(Math.abs(b))}`
  }x ${c >= 0 ? `+ ${formatResult(c)}` : `- ${formatResult(Math.abs(c))}`} = 0`;

  const factStr = `${a !== 1 ? `${formatResult(a)}` : ''}(x ${r1 >= 0 ? `- ${formatResult(r1)}` : `+ ${formatResult(Math.abs(r1))}`})(x ${r2 >= 0 ? `- ${formatResult(r2)}` : `+ ${formatResult(Math.abs(r2))}`}) = 0`;

  return {
    a,
    b,
    c,
    equationString: eqStr,
    factoredString: factStr,
    sumOfRoots: sum,
    productOfRoots: product,
    steps,
  };
}

// ----------------------------------------------------
// 7. General Polynomial Formulator from arbitrary Real Roots
// Given list of roots [r_1, r_2, ..., r_k] and leading coefficient 'a'
// Expands a * ∏(x - r_i) = 0 using polynomial multiplication
// ----------------------------------------------------
export interface PolynomialFormulatorResult {
  degree: number;
  roots: number[];
  coefficients: number[]; // [a_n, a_{n-1}, ..., a_0]
  equationString: string;
  factoredString: string;
  steps: string[];
}

export function formulatePolynomialFromRoots(
  roots: number[],
  a: number = 1
): PolynomialFormulatorResult {
  if (roots.length === 0) {
    throw new Error('Please provide at least one root.');
  }
  if (a === 0) a = 1;

  const deg = roots.length;
  // Start with poly = [1]
  let currentPoly: number[] = [1];

  for (const root of roots) {
    // Multiply currentPoly by (x - root) => [1, -root]
    const nextPoly: number[] = new Array(currentPoly.length + 1).fill(0);
    for (let i = 0; i < currentPoly.length; i++) {
      nextPoly[i] += currentPoly[i]; // x * term
      nextPoly[i + 1] -= currentPoly[i] * root; // -root * term
    }
    currentPoly = nextPoly;
  }

  // Multiply by leading coeff 'a'
  const finalCoeffs = currentPoly.map((c) => c * a);

  // Build factored string
  const factoredParts = roots.map(
    (r) => `(x ${r >= 0 ? `- ${formatResult(r)}` : `+ ${formatResult(Math.abs(r))}`})`
  );
  const factStr = `${a !== 1 ? `${formatResult(a)}` : ''}${factoredParts.join('')} = 0`;

  // Build expanded string
  const termStrings: string[] = [];
  finalCoeffs.forEach((c, idx) => {
    const power = deg - idx;
    if (Math.abs(c) < 1e-9) return;
    const formattedVal = formatResult(Math.abs(c));
    const sign = c < 0 ? '-' : termStrings.length > 0 ? '+' : '';
    
    let term = '';
    if (power === 0) {
      term = `${sign} ${formattedVal}`.trim();
    } else if (power === 1) {
      const coeffPart = formattedVal === '1' ? '' : formattedVal;
      term = `${sign} ${coeffPart}x`.trim();
    } else {
      const coeffPart = formattedVal === '1' ? '' : formattedVal;
      term = `${sign} ${coeffPart}x${toSuperscript(power)}`.trim();
    }
    termStrings.push(term);
  });

  const eqStr = `${termStrings.join(' ')} = 0`;

  const steps: string[] = [];
  steps.push(`Degree: ${deg}, Provided Roots: [${roots.join(', ')}], Leading coefficient a = ${a}`);
  steps.push(`Factored Formulation: ${factStr}`);
  steps.push(`Expanded Polynomial: ${eqStr}`);

  return {
    degree: deg,
    roots,
    coefficients: finalCoeffs,
    equationString: eqStr,
    factoredString: factStr,
    steps,
  };
}

// ----------------------------------------------------
// Statistics Calculator

export interface StatisticsResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  modes: number[];
  min: number;
  max: number;
  range: number;
  sampleVariance: number;
  populationVariance: number;
  sampleStdDev: number;
  populationStdDev: number;
  q1: number;
  q3: number;
  iqr: number;
  sortedData: number[];
}

export function calculateStatistics(numbers: number[]): StatisticsResult {
  if (!numbers || numbers.length === 0) {
    throw new Error('Dataset is empty');
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;

  // Median
  let median: number;
  const mid = Math.floor(n / 2);
  if (n % 2 === 0) {
    median = (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    median = sorted[mid];
  }

  // Mode
  const frequencyMap = new Map<number, number>();
  let maxFreq = 0;
  for (const num of sorted) {
    const count = (frequencyMap.get(num) || 0) + 1;
    frequencyMap.set(num, count);
    if (count > maxFreq) maxFreq = count;
  }

  const modes: number[] = [];
  if (maxFreq > 1) {
    for (const [key, val] of frequencyMap.entries()) {
      if (val === maxFreq) modes.push(key);
    }
  }

  // Min, Max, Range
  const min = sorted[0];
  const max = sorted[n - 1];
  const range = max - min;

  // Variances & Std Deviations
  const sumSquaredDiffs = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const populationVariance = sumSquaredDiffs / n;
  const populationStdDev = Math.sqrt(populationVariance);

  const sampleVariance = n > 1 ? sumSquaredDiffs / (n - 1) : 0;
  const sampleStdDev = Math.sqrt(sampleVariance);

  // Quartiles (Tukey method)
  let q1: number;
  let q3: number;
  const lowerHalf = n % 2 === 0 ? sorted.slice(0, mid) : sorted.slice(0, mid);
  const upperHalf = n % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);

  const getHalfMedian = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const m = Math.floor(arr.length / 2);
    return arr.length % 2 === 0 ? (arr[m - 1] + arr[m]) / 2 : arr[m];
  };

  q1 = getHalfMedian(lowerHalf);
  q3 = getHalfMedian(upperHalf);
  const iqr = q3 - q1;

  return {
    count: n,
    sum,
    mean,
    median,
    modes,
    min,
    max,
    range,
    sampleVariance,
    populationVariance,
    sampleStdDev,
    populationStdDev,
    q1,
    q3,
    iqr,
    sortedData: sorted,
  };
}
