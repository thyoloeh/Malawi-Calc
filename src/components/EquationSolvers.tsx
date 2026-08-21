import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  Calculator, 
  ArrowRight,
  TrendingUp,
  Split,
  Equal,
  Layers,
  Plus,
  Trash2,
  LineChart
} from 'lucide-react';
import { 
  solveLinearEquation, 
  solveQuadraticEquation, 
  solveCubicEquation,
  solveSimultaneousLinearQuadratic,
  solveSimultaneousLinearPolynomial,
  formulateQuadraticFromRoots,
  formulatePolynomialFromRoots,
  solveSystem2x2, 
  formatResult,
  decimalToFraction,
  LinearSolution,
  QuadraticSolution,
  CubicSolution,
  LinearQuadraticSolution,
  LinearPolySolution,
  QuadraticFormulatorResult,
  PolynomialFormulatorResult,
  System2x2Solution
} from '../utils/mathUtils';
import { useHistory } from '../context/HistoryContext';
import { NumInput } from './NumInput';
import { EquationGraph, GraphCurve, KeyPoint } from './EquationGraph';

type SolverType = 
  | 'quadratic' 
  | 'cubic' 
  | 'sim_lin_quad' 
  | 'sim_lin_poly' 
  | 'formulate_quad' 
  | 'formulate_poly' 
  | 'linear' 
  | 'system' 
  | 'proportion';

export const EquationSolvers: React.FC = () => {
  const { addHistory, setActiveModule, setInjectedExpression } = useHistory();

  const [activeSolver, setActiveSolver] = useState<SolverType>('quadratic');

  // 1. Quadratic: ax² + bx + c = 0
  const [quadA, setQuadA] = useState<string>('1');
  const [quadB, setQuadB] = useState<string>('-5');
  const [quadC, setQuadC] = useState<string>('6');

  // 2. Cubic: ax³ + bx² + cx + d = 0
  const [cubicA, setCubicA] = useState<string>('1');
  const [cubicB, setCubicB] = useState<string>('-6');
  const [cubicC, setCubicC] = useState<string>('11');
  const [cubicD, setCubicD] = useState<string>('-6');

  // 3. Simultaneous Linear & Quadratic: y = mx + k & y = ax² + bx + c
  const [simM, setSimM] = useState<string>('2');
  const [simK, setSimK] = useState<string>('1');
  const [simQA, setSimQA] = useState<string>('1');
  const [simQB, setSimQB] = useState<string>('-1');
  const [simQC, setSimQC] = useState<string>('-3');

  // 4. Simultaneous Linear & Polynomial: y = mx + k & y = c_n x^n + ... + c_0
  const [simPolyM, setSimPolyM] = useState<string>('3');
  const [simPolyK, setSimPolyK] = useState<string>('2');
  const [polyDegree, setPolyDegree] = useState<number>(3);
  const [polyCoeffs, setPolyCoeffs] = useState<string[]>(['1', '0', '-4', '2']); // x³ - 4x + 2

  // 5. Formulate Quadratic from Roots: r1, r2, scale a
  const [formR1, setFormR1] = useState<string>('2');
  const [formR2, setFormR2] = useState<string>('-3');
  const [formScaleA, setFormScaleA] = useState<string>('1');

  // 6. Formulate Polynomial from Roots: r1, r2, r3...
  const [polyRootsList, setPolyRootsList] = useState<string[]>(['1', '-2', '3']);
  const [newRootInput, setNewRootInput] = useState<string>('');
  const [polyScaleA, setPolyScaleA] = useState<string>('1');

  // 7. Linear: ax + b = c
  const [linA, setLinA] = useState<string>('3');
  const [linB, setLinB] = useState<string>('7');
  const [linC, setLinC] = useState<string>('22');

  // 8. System 2x2: a1 x + b1 y = c1, a2 x + b2 y = c2
  const [sysA1, setSysA1] = useState<string>('2');
  const [sysB1, setSysB1] = useState<string>('3');
  const [sysC1, setSysC1] = useState<string>('13');
  const [sysA2, setSysA2] = useState<string>('5');
  const [sysB2, setSysB2] = useState<string>('-1');
  const [sysC2, setSysC2] = useState<string>('7');

  // 9. Proportion: A / B = C / D
  const [propA, setPropA] = useState<string>('3');
  const [propB, setPropB] = useState<string>('4');
  const [propC, setPropC] = useState<string>('15');
  const [propUnknown, setPropUnknown] = useState<'D' | 'C' | 'B' | 'A'>('D');

  const [showGraph, setShowGraph] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToCalc = (val: string) => {
    setInjectedExpression(val);
    setActiveModule('standard');
  };

  // Helper to handle poly degree changes
  const handlePolyDegreeChange = (newDeg: number) => {
    setPolyDegree(newDeg);
    const newCoeffs: string[] = [];
    for (let i = 0; i <= newDeg; i++) {
      newCoeffs.push(polyCoeffs[i] !== undefined ? polyCoeffs[i] : i === 0 ? '1' : '0');
    }
    setPolyCoeffs(newCoeffs);
  };

  // 1. Solve Quadratic
  const runQuadratic = (): { sol?: QuadraticSolution; error?: string } => {
    const a = parseFloat(quadA);
    const b = parseFloat(quadB);
    const c = parseFloat(quadC);
    if (isNaN(a) || isNaN(b) || isNaN(c)) return { error: 'Please enter valid coefficients' };
    try {
      return { sol: solveQuadraticEquation(a, b, c) };
    } catch (e: any) {
      return { error: e.message };
    }
  };
  const quadResult = runQuadratic();

  // 2. Solve Cubic
  const runCubic = (): { sol?: CubicSolution; error?: string } => {
    const a = parseFloat(cubicA);
    const b = parseFloat(cubicB);
    const c = parseFloat(cubicC);
    const d = parseFloat(cubicD);
    if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) return { error: 'Please enter valid cubic coefficients' };
    try {
      return { sol: solveCubicEquation(a, b, c, d) };
    } catch (e: any) {
      return { error: e.message };
    }
  };
  const cubicResult = runCubic();

  // 3. Simultaneous Linear & Quadratic
  const runSimLinQuad = (): { sol?: LinearQuadraticSolution; error?: string } => {
    const m = parseFloat(simM);
    const k = parseFloat(simK);
    const a = parseFloat(simQA);
    const b = parseFloat(simQB);
    const c = parseFloat(simQC);
    if ([m, k, a, b, c].some(isNaN)) return { error: 'Please enter all linear and quadratic parameters' };
    try {
      return { sol: solveSimultaneousLinearQuadratic(m, k, a, b, c) };
    } catch (e: any) {
      return { error: e.message };
    }
  };
  const simLinQuadResult = runSimLinQuad();

  // 4. Simultaneous Linear & Polynomial
  const runSimLinPoly = (): { sol?: LinearPolySolution; error?: string } => {
    const m = parseFloat(simPolyM);
    const k = parseFloat(simPolyK);
    const coeffs = polyCoeffs.map((v) => parseFloat(v));
    if (isNaN(m) || isNaN(k) || coeffs.some(isNaN)) return { error: 'Please enter all line and polynomial coefficients' };
    try {
      return { sol: solveSimultaneousLinearPolynomial(m, k, coeffs) };
    } catch (e: any) {
      return { error: e.message };
    }
  };
  const simLinPolyResult = runSimLinPoly();

  // 5. Formulate Quadratic from Roots
  const runFormulateQuad = (): { sol?: QuadraticFormulatorResult; error?: string } => {
    const r1 = parseFloat(formR1);
    const r2 = parseFloat(formR2);
    const a = parseFloat(formScaleA || '1');
    if (isNaN(r1) || isNaN(r2) || isNaN(a)) return { error: 'Please enter roots r₁ and r₂' };
    try {
      return { sol: formulateQuadraticFromRoots(r1, r2, a) };
    } catch (e: any) {
      return { error: e.message };
    }
  };
  const formQuadResult = runFormulateQuad();

  // 6. Formulate Polynomial from Roots
  const runFormulatePoly = (): { sol?: PolynomialFormulatorResult; error?: string } => {
    const roots = polyRootsList.map((r) => parseFloat(r)).filter((r) => !isNaN(r));
    const a = parseFloat(polyScaleA || '1');
    if (roots.length === 0) return { error: 'Please add at least 1 root' };
    try {
      return { sol: formulatePolynomialFromRoots(roots, a) };
    } catch (e: any) {
      return { error: e.message };
    }
  };
  const formPolyResult = runFormulatePoly();

  // 7. Solve Linear
  const runLinear = (): { sol?: LinearSolution; error?: string } => {
    const a = parseFloat(linA);
    const b = parseFloat(linB);
    const c = parseFloat(linC);
    if (isNaN(a) || isNaN(b) || isNaN(c)) return { error: 'Please enter valid coefficients' };
    try {
      return { sol: solveLinearEquation(a, b, c) };
    } catch (e: any) {
      return { error: e.message };
    }
  };
  const linearResult = runLinear();

  // 8. Solve System 2x2
  const runSystem = (): { sol?: System2x2Solution; error?: string } => {
    const a1 = parseFloat(sysA1);
    const b1 = parseFloat(sysB1);
    const c1 = parseFloat(sysC1);
    const a2 = parseFloat(sysA2);
    const b2 = parseFloat(sysB2);
    const c2 = parseFloat(sysC2);
    if ([a1, b1, c1, a2, b2, c2].some(isNaN)) return { error: 'Please enter all 6 coefficients' };
    try {
      return { sol: solveSystem2x2(a1, b1, c1, a2, b2, c2) };
    } catch (e: any) {
      return { error: e.message };
    }
  };
  const sysResult = runSystem();

  // 9. Solve Proportion
  const runProportion = () => {
    const a = parseFloat(propA);
    const b = parseFloat(propB);
    const c = parseFloat(propC);
    if (isNaN(a) || isNaN(b) || isNaN(c)) return { error: 'Please fill all known values' };

    let solvedVal = 0;
    if (propUnknown === 'D') {
      if (a === 0) return { error: 'Division by zero (A = 0)' };
      solvedVal = (b * c) / a;
    } else if (propUnknown === 'C') {
      if (b === 0) return { error: 'Division by zero (B = 0)' };
      solvedVal = (a * c) / b;
    } else if (propUnknown === 'B') {
      if (c === 0) return { error: 'Division by zero (C = 0)' };
      solvedVal = (a * b) / c;
    } else {
      if (c === 0) return { error: 'Division by zero' };
      solvedVal = (b * c) / a;
    }
    return { val: solvedVal, frac: decimalToFraction(solvedVal) };
  };
  const propResult = runProportion();

  // Compute real-time graph curves and key points (Origin, X-intercepts, Y-intercepts, Vertices, Intersections)
  const graphData = useMemo(() => {
    const curves: GraphCurve[] = [];
    const points: KeyPoint[] = [];
    let title = 'Equation Graph';

    if (activeSolver === 'quadratic') {
      const a = parseFloat(quadA);
      const b = parseFloat(quadB);
      const c = parseFloat(quadC);
      title = 'Quadratic Graph (Parabola)';
      if (!isNaN(a) && !isNaN(b) && !isNaN(c) && a !== 0) {
        curves.push({
          id: 'quad-curve',
          name: 'Parabola',
          label: `y = ${a !== 1 ? (a === -1 ? '-' : a) : ''}x² ${b !== 0 ? (b > 0 ? '+ ' + b : '- ' + Math.abs(b)) + 'x' : ''} ${c !== 0 ? (c > 0 ? '+ ' + c : '- ' + Math.abs(c)) : ''}`,
          color: '#30D158',
          fn: (x) => a * x * x + b * x + c
        });

        // Y-Intercept (0, c)
        points.push({ x: 0, y: c, label: 'y-intercept', type: 'y-intercept', color: '#FF9F0A' });

        // X-Intercepts (Roots)
        if (quadResult.sol && quadResult.sol.roots) {
          const { val1, val2 } = quadResult.sol.roots;
          if (val1 !== undefined) {
            points.push({ x: val1, y: 0, label: 'x-intercept (r₁)', type: 'x-intercept', color: '#30D158' });
          }
          if (val2 !== undefined && val2 !== val1) {
            points.push({ x: val2, y: 0, label: 'x-intercept (r₂)', type: 'x-intercept', color: '#30D158' });
          }
          if (quadResult.sol.vertex) {
            points.push({ x: quadResult.sol.vertex.h, y: quadResult.sol.vertex.k, label: 'Vertex (h, k)', type: 'vertex', color: '#0A84FF' });
          }
        }
      }
    } else if (activeSolver === 'cubic') {
      const a = parseFloat(cubicA);
      const b = parseFloat(cubicB);
      const c = parseFloat(cubicC);
      const d = parseFloat(cubicD);
      title = 'Cubic Graph: y = ax³ + bx² + cx + d';
      if (!isNaN(a) && !isNaN(b) && !isNaN(c) && !isNaN(d) && a !== 0) {
        curves.push({
          id: 'cubic-curve',
          name: 'Cubic Curve',
          label: `y = ${a}x³ ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x² ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}x ${d >= 0 ? '+ ' + d : '- ' + Math.abs(d)}`,
          color: '#30D158',
          fn: (x) => a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d
        });

        // Y-intercept (0, d)
        points.push({ x: 0, y: d, label: 'y-intercept', type: 'y-intercept', color: '#FF9F0A' });

        // X-intercepts (Roots)
        if (cubicResult.sol && cubicResult.sol.roots) {
          const { val1, val2, val3 } = cubicResult.sol.roots;
          if (val1 !== undefined) {
            points.push({ x: val1, y: 0, label: 'x-intercept (r₁)', type: 'x-intercept', color: '#30D158' });
          }
          if (val2 !== undefined && val2 !== val1) {
            points.push({ x: val2, y: 0, label: 'x-intercept (r₂)', type: 'x-intercept', color: '#30D158' });
          }
          if (val3 !== undefined && val3 !== val1 && val3 !== val2) {
            points.push({ x: val3, y: 0, label: 'x-intercept (r₃)', type: 'x-intercept', color: '#30D158' });
          }
        }
      }
    } else if (activeSolver === 'sim_lin_quad') {
      const m = parseFloat(simM);
      const k = parseFloat(simK);
      const a = parseFloat(simQA);
      const b = parseFloat(simQB);
      const c = parseFloat(simQC);
      title = 'Simultaneous System: Line & Parabola';
      if (![m, k, a, b, c].some(isNaN) && a !== 0) {
        curves.push({
          id: 'sim-quad',
          name: 'Parabola',
          label: `Parabola: y = ${a}x² + ${b}x + ${c}`,
          color: '#30D158',
          fn: (x) => a * x * x + b * x + c
        });
        curves.push({
          id: 'sim-line',
          name: 'Line',
          label: `Line: y = ${m}x + ${k}`,
          color: '#FF9F0A',
          fn: (x) => m * x + k
        });

        // Intercepts
        points.push({ x: 0, y: c, label: 'Parabola y-int', type: 'y-intercept', color: '#30D158' });
        points.push({ x: 0, y: k, label: 'Line y-int', type: 'y-intercept', color: '#FF9F0A' });
        if (m !== 0) {
          points.push({ x: -k / m, y: 0, label: 'Line x-int', type: 'x-intercept', color: '#FF9F0A' });
        }

        // Intersections
        if (simLinQuadResult.sol && simLinQuadResult.sol.intersections) {
          simLinQuadResult.sol.intersections.forEach((pt, i) => {
            points.push({
              x: pt.x,
              y: pt.y,
              label: `Intersection P${i + 1}`,
              type: 'intersection',
              color: '#BF5AF2'
            });
          });
        }
      }
    } else if (activeSolver === 'sim_lin_poly') {
      const m = parseFloat(simPolyM);
      const k = parseFloat(simPolyK);
      const coeffs = polyCoeffs.map((v) => parseFloat(v));
      title = 'Simultaneous System: Line & Polynomial';
      if (!isNaN(m) && !isNaN(k) && !coeffs.some(isNaN)) {
        const deg = coeffs.length - 1;
        curves.push({
          id: 'sim-poly',
          name: 'Polynomial',
          label: `Polynomial P(x) (deg ${deg})`,
          color: '#30D158',
          fn: (x) => coeffs.reduce((acc, c, idx) => acc + c * Math.pow(x, deg - idx), 0)
        });
        curves.push({
          id: 'sim-line-p',
          name: 'Line',
          label: `Line: y = ${m}x + ${k}`,
          color: '#FF9F0A',
          fn: (x) => m * x + k
        });

        points.push({ x: 0, y: coeffs[coeffs.length - 1] || 0, label: 'Poly y-int', type: 'y-intercept', color: '#30D158' });
        points.push({ x: 0, y: k, label: 'Line y-int', type: 'y-intercept', color: '#FF9F0A' });
        if (m !== 0) {
          points.push({ x: -k / m, y: 0, label: 'Line x-int', type: 'x-intercept', color: '#FF9F0A' });
        }

        if (simLinPolyResult.sol && simLinPolyResult.sol.intersections) {
          simLinPolyResult.sol.intersections.forEach((pt, i) => {
            points.push({
              x: pt.x,
              y: pt.y,
              label: `Intersection P${i + 1}`,
              type: 'intersection',
              color: '#BF5AF2'
            });
          });
        }
      }
    } else if (activeSolver === 'formulate_quad') {
      const r1 = parseFloat(formR1);
      const r2 = parseFloat(formR2);
      const a = parseFloat(formScaleA || '1');
      title = 'Formulated Quadratic Parabola';
      if (!isNaN(r1) && !isNaN(r2) && !isNaN(a) && a !== 0) {
        const b = -a * (r1 + r2);
        const c = a * r1 * r2;
        curves.push({
          id: 'form-quad-curve',
          name: 'Parabola',
          label: formQuadResult.sol?.equationString || `y = ${a}x² + ${b}x + ${c}`,
          color: '#30D158',
          fn: (x) => a * x * x + b * x + c
        });
        points.push({ x: r1, y: 0, label: 'x-intercept (r₁)', type: 'x-intercept', color: '#30D158' });
        points.push({ x: r2, y: 0, label: 'x-intercept (r₂)', type: 'x-intercept', color: '#30D158' });
        points.push({ x: 0, y: c, label: 'y-intercept', type: 'y-intercept', color: '#FF9F0A' });
        const h = (r1 + r2) / 2;
        const k = a * (h - r1) * (h - r2);
        points.push({ x: h, y: k, label: 'Vertex (h, k)', type: 'vertex', color: '#0A84FF' });
      }
    } else if (activeSolver === 'formulate_poly') {
      const roots = polyRootsList.map((r) => parseFloat(r)).filter((r) => !isNaN(r));
      const a = parseFloat(polyScaleA || '1');
      title = 'Formulated Polynomial Graph';
      if (roots.length > 0 && !isNaN(a) && a !== 0) {
        const polyFn = (x: number) => a * roots.reduce((prod, r) => prod * (x - r), 1);
        curves.push({
          id: 'form-poly-curve',
          name: 'Polynomial',
          label: formPolyResult.sol?.equationString || `y = P(x)`,
          color: '#30D158',
          fn: polyFn
        });
        points.push({ x: 0, y: polyFn(0), label: 'y-intercept', type: 'y-intercept', color: '#FF9F0A' });
        roots.forEach((r, i) => {
          points.push({ x: r, y: 0, label: `x-intercept (r${i + 1})`, type: 'x-intercept', color: '#30D158' });
        });
      }
    } else if (activeSolver === 'linear') {
      const a = parseFloat(linA);
      const b = parseFloat(linB);
      const c = parseFloat(linC);
      title = 'Linear Graph: y = ax + (b - c)';
      if (!isNaN(a) && !isNaN(b) && !isNaN(c) && a !== 0) {
        const yInt = b - c;
        const rootX = (c - b) / a;
        curves.push({
          id: 'lin-curve',
          name: 'Linear Line',
          label: `y = ${a}x ${yInt >= 0 ? '+ ' + yInt : '- ' + Math.abs(yInt)}`,
          color: '#30D158',
          fn: (x) => a * x + yInt
        });
        points.push({ x: rootX, y: 0, label: 'x-intercept (Root)', type: 'x-intercept', color: '#30D158' });
        points.push({ x: 0, y: yInt, label: 'y-intercept', type: 'y-intercept', color: '#FF9F0A' });
      }
    } else if (activeSolver === 'system') {
      const a1 = parseFloat(sysA1);
      const b1 = parseFloat(sysB1);
      const c1 = parseFloat(sysC1);
      const a2 = parseFloat(sysA2);
      const b2 = parseFloat(sysB2);
      const c2 = parseFloat(sysC2);
      title = '2×2 Linear System Graph';

      if (!isNaN(a1) && !isNaN(b1) && !isNaN(c1) && b1 !== 0) {
        curves.push({
          id: 'sys-line-1',
          name: 'Equation 1',
          label: `Line 1: ${a1}x + ${b1}y = ${c1}`,
          color: '#30D158',
          fn: (x) => (c1 - a1 * x) / b1
        });
        points.push({ x: 0, y: c1 / b1, label: 'Line 1 y-int', type: 'y-intercept', color: '#30D158' });
        if (a1 !== 0) points.push({ x: c1 / a1, y: 0, label: 'Line 1 x-int', type: 'x-intercept', color: '#30D158' });
      }

      if (!isNaN(a2) && !isNaN(b2) && !isNaN(c2) && b2 !== 0) {
        curves.push({
          id: 'sys-line-2',
          name: 'Equation 2',
          label: `Line 2: ${a2}x + ${b2}y = ${c2}`,
          color: '#FF9F0A',
          fn: (x) => (c2 - a2 * x) / b2
        });
        points.push({ x: 0, y: c2 / b2, label: 'Line 2 y-int', type: 'y-intercept', color: '#FF9F0A' });
        if (a2 !== 0) points.push({ x: c2 / a2, y: 0, label: 'Line 2 x-int', type: 'x-intercept', color: '#FF9F0A' });
      }

      if (sysResult.sol && sysResult.sol.type === 'unique' && sysResult.sol.x !== undefined && sysResult.sol.y !== undefined) {
        points.push({
          x: sysResult.sol.x,
          y: sysResult.sol.y,
          label: 'Intersection (x, y)',
          type: 'intersection',
          color: '#BF5AF2'
        });
      }
    } else if (activeSolver === 'proportion') {
      const a = parseFloat(propA);
      const b = parseFloat(propB);
      const c = parseFloat(propC);
      title = 'Direct Proportion Ratio Graph';
      if (!isNaN(a) && !isNaN(b) && !isNaN(c) && b !== 0) {
        curves.push({
          id: 'prop-curve',
          name: 'Proportion Line',
          label: `y = (${a}/${b})x`,
          color: '#30D158',
          fn: (x) => (a / b) * x
        });
        if (propResult.val !== undefined) {
          points.push({
            x: propResult.val,
            y: c,
            label: 'Solution Point (x, C)',
            type: 'intersection',
            color: '#FF9F0A'
          });
        }
      }
    }

    return { curves, points, title };
  }, [
    activeSolver,
    quadA, quadB, quadC, quadResult,
    cubicA, cubicB, cubicC, cubicD, cubicResult,
    simM, simK, simQA, simQB, simQC, simLinQuadResult,
    simPolyM, simPolyK, polyCoeffs, simLinPolyResult,
    formR1, formR2, formScaleA, formQuadResult,
    polyRootsList, polyScaleA, formPolyResult,
    linA, linB, linC, linearResult,
    sysA1, sysB1, sysC1, sysA2, sysB2, sysC2, sysResult,
    propA, propB, propC, propResult
  ]);

  const handleSaveHistory = () => {
    if (activeSolver === 'quadratic' && quadResult.sol) {
      const q = quadResult.sol;
      addHistory({
        type: 'equation',
        expression: `${quadA}x² + (${quadB})x + (${quadC}) = 0`,
        result: `x₁ = ${q.roots.r1}, x₂ = ${q.roots.r2}`,
        details: `Δ = ${q.discriminant}, Vertex: (${formatResult(q.vertex.h)}, ${formatResult(q.vertex.k)})`,
      });
    } else if (activeSolver === 'cubic' && cubicResult.sol) {
      const c = cubicResult.sol;
      addHistory({
        type: 'equation',
        expression: `${cubicA}x³ + (${cubicB})x² + (${cubicC})x + (${cubicD}) = 0`,
        result: `x₁ = ${c.roots.r1}, x₂ = ${c.roots.r2}, x₃ = ${c.roots.r3}`,
        details: `Cardano Δ = ${formatResult(c.discriminantDelta, 4)}, Nature: ${c.nature.replace(/_/g, ' ')}`,
      });
    } else if (activeSolver === 'sim_lin_quad' && simLinQuadResult.sol) {
      const s = simLinQuadResult.sol;
      addHistory({
        type: 'equation',
        expression: `Simultaneous: ${s.linearDesc} & ${s.quadDesc}`,
        result: s.intersections.map((p, i) => `P${i+1}(${p.formattedX}, ${p.formattedY})`).join(' | ') || 'No real intersection',
        details: `Δ = ${s.discriminant}`,
      });
    } else if (activeSolver === 'sim_lin_poly' && simLinPolyResult.sol) {
      const s = simLinPolyResult.sol;
      addHistory({
        type: 'equation',
        expression: `Simultaneous: ${s.linearDesc} & ${s.polyDesc}`,
        result: s.intersections.map((p, i) => `P${i+1}(${p.formattedX}, ${p.formattedY})`).join(' | ') || 'No real intersection',
        details: `Degree ${s.deg}`,
      });
    } else if (activeSolver === 'formulate_quad' && formQuadResult.sol) {
      const f = formQuadResult.sol;
      addHistory({
        type: 'equation',
        expression: `Formulate Quadratic from roots r₁=${formR1}, r₂=${formR2}`,
        result: f.equationString,
        details: `Factored: ${f.factoredString}`,
      });
    } else if (activeSolver === 'formulate_poly' && formPolyResult.sol) {
      const f = formPolyResult.sol;
      addHistory({
        type: 'equation',
        expression: `Formulate Polynomial from roots [${polyRootsList.join(', ')}]`,
        result: f.equationString,
        details: `Factored: ${f.factoredString}`,
      });
    } else if (activeSolver === 'linear' && linearResult.sol) {
      const l = linearResult.sol;
      addHistory({
        type: 'equation',
        expression: `${linA}x + (${linB}) = ${linC}`,
        result: `x = ${l.formattedX}`,
      });
    } else if (activeSolver === 'system' && sysResult.sol) {
      const s = sysResult.sol;
      addHistory({
        type: 'equation',
        expression: `${sysA1}x + ${sysB1}y = ${sysC1} & ${sysA2}x + ${sysB2}y = ${sysC2}`,
        result: `x = ${formatResult(s.x)}, y = ${formatResult(s.y)}`,
      });
    } else if (activeSolver === 'proportion' && propResult.val !== undefined) {
      addHistory({
        type: 'equation',
        expression: `Proportion solved for ${propUnknown}`,
        result: `${propUnknown} = ${formatResult(propResult.val)}`,
      });
    }
  };

  return (
    <div id="equation-solvers-module" className="w-full max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto flex flex-col gap-3 sm:gap-4 flex-1">
      {/* Category Tabs Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1C1C1E] rounded-2xl sm:rounded-full border border-[#2C2C2E] shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSolver('quadratic')}
            className={`px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeSolver === 'quadratic'
                ? 'bg-[#FF9F0A] text-white shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Quadratic (ax²+bx+c=0)
          </button>
          <button
            type="button"
            onClick={() => setActiveSolver('cubic')}
            className={`px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeSolver === 'cubic'
                ? 'bg-[#FF9F0A] text-white shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Cubic (ax³+bx²+cx+d=0)
          </button>
          <button
            type="button"
            onClick={() => setActiveSolver('sim_lin_quad')}
            className={`px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeSolver === 'sim_lin_quad'
                ? 'bg-[#FF9F0A] text-white shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Simultaneous (Line & Quad)
          </button>
          <button
            type="button"
            onClick={() => setActiveSolver('sim_lin_poly')}
            className={`px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeSolver === 'sim_lin_poly'
                ? 'bg-[#FF9F0A] text-white shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Simultaneous (Line & Poly)
          </button>
          <button
            type="button"
            onClick={() => setActiveSolver('formulate_quad')}
            className={`px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeSolver === 'formulate_quad'
                ? 'bg-[#FF9F0A] text-white shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Formulate Quadratic (Roots)
          </button>
          <button
            type="button"
            onClick={() => setActiveSolver('formulate_poly')}
            className={`px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeSolver === 'formulate_poly'
                ? 'bg-[#FF9F0A] text-white shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Formulate Polynomial (Roots)
          </button>
          <button
            type="button"
            onClick={() => setActiveSolver('linear')}
            className={`px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeSolver === 'linear'
                ? 'bg-[#FF9F0A] text-white shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Linear (ax+b=c)
          </button>
          <button
            type="button"
            onClick={() => setActiveSolver('system')}
            className={`px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeSolver === 'system'
                ? 'bg-[#FF9F0A] text-white shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            2×2 System
          </button>
          <button
            type="button"
            onClick={() => setActiveSolver('proportion')}
            className={`px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeSolver === 'proportion'
                ? 'bg-[#FF9F0A] text-white shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Proportion
          </button>
        </div>

        <button
          type="button"
          onClick={handleSaveHistory}
          className="px-3 py-1 sm:py-1.5 rounded-full bg-[#242424] hover:bg-[#333333] text-xs sm:text-sm text-[#FF9F0A] border border-[#333333] transition-colors shrink-0 ml-2 font-bold shadow-sm"
        >
          Save
        </button>
      </div>

      {/* Main Solver Card */}
      <div className="bg-[#1C1C1E] p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#2C2C2E] shadow-xl flex flex-col gap-3.5 flex-1">
        
        {/* 1. QUADRATIC SOLVER */}
        {activeSolver === 'quadratic' && (
          <div className="flex flex-col gap-3.5">
            {/* Interactive Equation Builder */}
            <div className="flex items-center justify-center gap-2 p-3 bg-black rounded-2xl border border-[#242424] overflow-x-auto scrollbar-none min-h-[90px]">
              <NumInput
                value={quadA}
                onChange={setQuadA}
                placeholder="a"
                className="w-16 sm:w-20 md:w-24"
              />
              <span className="font-mono text-sm sm:text-base font-bold text-white">x² +</span>
              <NumInput
                value={quadB}
                onChange={setQuadB}
                placeholder="b"
                className="w-16 sm:w-20 md:w-24"
              />
              <span className="font-mono text-sm sm:text-base font-bold text-white">x +</span>
              <NumInput
                value={quadC}
                onChange={setQuadC}
                placeholder="c"
                className="w-16 sm:w-20 md:w-24"
              />
              <span className="font-mono text-sm sm:text-base font-bold text-white">= 0</span>
            </div>

            {/* Results Grid */}
            {quadResult.sol ? (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex flex-col items-center justify-center p-3 bg-black/60 rounded-xl border border-[#2C2C2E]">
                    <span className="text-[10px] sm:text-xs text-gray-400 font-mono font-medium">Root x₁</span>
                    <span className="font-mono text-base sm:text-lg font-bold text-[#30D158]">
                      {quadResult.sol.roots.r1}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-black/60 rounded-xl border border-[#2C2C2E]">
                    <span className="text-[10px] sm:text-xs text-gray-400 font-mono font-medium">Root x₂</span>
                    <span className="font-mono text-base sm:text-lg font-bold text-[#30D158]">
                      {quadResult.sol.roots.r2}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-black/30 p-2.5 rounded-xl border border-[#242424] text-xs font-mono text-center">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Discriminant (Δ)</span>
                    <span className="font-bold text-white text-sm sm:text-base">{quadResult.sol.discriminant}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Vertex (h, k)</span>
                    <span className="font-bold text-white text-xs sm:text-sm">({formatResult(quadResult.sol.vertex.h, 2)}, {formatResult(quadResult.sol.vertex.k, 2)})</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Nature</span>
                    <span className="font-bold text-[#FF9F0A] uppercase text-xs">{quadResult.sol.rootType.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-black/40 rounded-xl text-center text-xs text-[#FF453A] font-mono">
                {quadResult.error}
              </div>
            )}
          </div>
        )}

        {/* 2. CUBIC SOLVER */}
        {activeSolver === 'cubic' && (
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-3 bg-black rounded-2xl border border-[#242424] overflow-x-auto scrollbar-none min-h-[90px]">
              <NumInput
                value={cubicA}
                onChange={setCubicA}
                placeholder="a"
                className="w-14 sm:w-18 md:w-22"
              />
              <span className="font-mono text-xs sm:text-sm font-bold text-white">x³ +</span>
              <NumInput
                value={cubicB}
                onChange={setCubicB}
                placeholder="b"
                className="w-14 sm:w-18 md:w-22"
              />
              <span className="font-mono text-xs sm:text-sm font-bold text-white">x² +</span>
              <NumInput
                value={cubicC}
                onChange={setCubicC}
                placeholder="c"
                className="w-14 sm:w-18 md:w-22"
              />
              <span className="font-mono text-xs sm:text-sm font-bold text-white">x +</span>
              <NumInput
                value={cubicD}
                onChange={setCubicD}
                placeholder="d"
                className="w-14 sm:w-18 md:w-22"
              />
              <span className="font-mono text-xs sm:text-sm font-bold text-white">= 0</span>
            </div>

            {cubicResult.sol ? (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 bg-black/60 rounded-xl border border-[#2C2C2E]">
                    <span className="text-[10px] sm:text-xs text-gray-400 font-mono">Root x₁</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#30D158] truncate max-w-full">
                      {cubicResult.sol.roots.r1}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 bg-black/60 rounded-xl border border-[#2C2C2E]">
                    <span className="text-[10px] sm:text-xs text-gray-400 font-mono">Root x₂</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#30D158] truncate max-w-full">
                      {cubicResult.sol.roots.r2}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 bg-black/60 rounded-xl border border-[#2C2C2E]">
                    <span className="text-[10px] sm:text-xs text-gray-400 font-mono">Root x₃</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#30D158] truncate max-w-full">
                      {cubicResult.sol.roots.r3}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-3 py-2 bg-black/30 rounded-xl border border-[#242424] text-xs font-mono">
                  <span className="text-gray-400 text-xs">Cardano Δ: <strong className="text-white">{formatResult(cubicResult.sol.discriminantDelta, 4)}</strong></span>
                  <span className="text-[#FF9F0A] uppercase text-xs font-bold">
                    {cubicResult.sol.nature.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-black/40 rounded-xl text-center text-xs text-[#FF453A] font-mono">
                {cubicResult.error}
              </div>
            )}
          </div>
        )}

        {/* 3. SIMULTANEOUS LINEAR & QUADRATIC */}
        {activeSolver === 'sim_lin_quad' && (
          <div className="flex flex-col gap-3.5">
            <div className="p-3 bg-black rounded-2xl border border-[#242424] flex flex-col gap-2.5">
              {/* Line */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-xs sm:text-sm font-mono text-[#FF9F0A] font-bold w-12 shrink-0">Line:</span>
                <span className="font-mono text-xs sm:text-sm text-white">y =</span>
                <NumInput value={simM} onChange={setSimM} placeholder="m" className="w-16 sm:w-20" />
                <span className="font-mono text-xs sm:text-sm text-white">x +</span>
                <NumInput value={simK} onChange={setSimK} placeholder="k" className="w-16 sm:w-20" />
              </div>

              {/* Parabola */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-xs sm:text-sm font-mono text-[#30D158] font-bold w-12 shrink-0">Quad:</span>
                <span className="font-mono text-xs sm:text-sm text-white">y =</span>
                <NumInput value={simQA} onChange={setSimQA} placeholder="a" className="w-14 sm:w-18" />
                <span className="font-mono text-xs sm:text-sm text-white">x² +</span>
                <NumInput value={simQB} onChange={setSimQB} placeholder="b" className="w-14 sm:w-18" />
                <span className="font-mono text-xs sm:text-sm text-white">x +</span>
                <NumInput value={simQC} onChange={setSimQC} placeholder="c" className="w-14 sm:w-18" />
              </div>
            </div>

            {simLinQuadResult.sol ? (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {simLinQuadResult.sol.intersections.length > 0 ? (
                    simLinQuadResult.sol.intersections.map((pt, idx) => (
                      <div key={idx} className="flex flex-col items-center justify-center p-3 bg-black/60 rounded-xl border border-[#2C2C2E]">
                        <span className="text-[10px] sm:text-xs text-gray-400 font-mono font-medium">Intersection Point {idx + 1}</span>
                        <span className="font-mono text-sm sm:text-base font-bold text-[#30D158]">
                          ({pt.formattedX}, {pt.formattedY})
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 p-3 bg-black/60 rounded-xl border border-[#2C2C2E] text-center font-mono text-xs sm:text-sm text-gray-400">
                      No real intersection points (Line and parabola do not cross)
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-3 py-2 bg-black/30 rounded-xl border border-[#242424] text-xs font-mono">
                  <span className="text-gray-400 text-xs">Combined Δ: <strong className="text-white">{simLinQuadResult.sol.discriminant}</strong></span>
                  <span className="text-[#FF9F0A] uppercase text-xs font-bold">
                    {simLinQuadResult.sol.type.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-black/40 rounded-xl text-center text-xs text-[#FF453A] font-mono">
                {simLinQuadResult.error}
              </div>
            )}
          </div>
        )}

        {/* 4. SIMULTANEOUS LINEAR & POLYNOMIAL */}
        {activeSolver === 'sim_lin_poly' && (
          <div className="flex flex-col gap-3.5">
            <div className="p-3 bg-black rounded-2xl border border-[#242424] flex flex-col gap-2.5">
              {/* Line */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-xs sm:text-sm font-mono text-[#FF9F0A] font-bold w-12 shrink-0">Line:</span>
                <span className="font-mono text-xs sm:text-sm text-white">y =</span>
                <NumInput value={simPolyM} onChange={setSimPolyM} placeholder="m" className="w-16 sm:w-20" />
                <span className="font-mono text-xs sm:text-sm text-white">x +</span>
                <NumInput value={simPolyK} onChange={setSimPolyK} placeholder="k" className="w-16 sm:w-20" />
              </div>

              {/* Polynomial degree selector & coefficients */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#242424]">
                <span className="text-xs sm:text-sm font-mono text-[#30D158] font-bold w-16 shrink-0">Degree:</span>
                <div className="flex items-center gap-1.5">
                  {[2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handlePolyDegreeChange(d)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        polyDegree === d ? 'bg-[#30D158] text-black shadow-sm' : 'bg-[#242424] text-gray-400 hover:text-white'
                      }`}
                    >
                      Degree {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Poly equation input row */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-2 bg-[#1C1C1E] rounded-xl">
                <span className="font-mono text-xs sm:text-sm text-white shrink-0 font-bold">y =</span>
                {polyCoeffs.map((cVal, idx) => {
                  const pwr = polyDegree - idx;
                  return (
                    <div key={idx} className="flex items-center gap-1 shrink-0">
                      <NumInput
                        value={cVal}
                        onChange={(val) => {
                          const next = [...polyCoeffs];
                          next[idx] = val;
                          setPolyCoeffs(next);
                        }}
                        placeholder={`c${pwr}`}
                        className="w-14 sm:w-18"
                      />
                      <span className="font-mono text-xs sm:text-sm text-gray-300 font-semibold">
                        {pwr === 0 ? '' : pwr === 1 ? 'x +' : `x${pwr === 2 ? '²' : pwr === 3 ? '³' : pwr === 4 ? '⁴' : '⁵'} +`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {simLinPolyResult.sol ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-400 font-mono">
                  Intersection Points ({simLinPolyResult.sol.intersections.length} Real Roots Found):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {simLinPolyResult.sol.intersections.length > 0 ? (
                    simLinPolyResult.sol.intersections.map((pt, idx) => (
                      <div key={idx} className="flex flex-col items-center justify-center p-3 bg-black/60 rounded-xl border border-[#2C2C2E]">
                        <span className="text-[10px] sm:text-xs text-gray-400 font-mono font-medium">Point {idx + 1}</span>
                        <span className="font-mono text-sm sm:text-base font-bold text-[#30D158]">
                          ({pt.formattedX}, {pt.formattedY})
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 p-3 bg-black/60 rounded-xl border border-[#2C2C2E] text-center font-mono text-xs sm:text-sm text-gray-400">
                      No real intersection points in evaluated span
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-black/40 rounded-xl text-center text-xs text-[#FF453A] font-mono">
                {simLinPolyResult.error}
              </div>
            )}
          </div>
        )}

        {/* 5. FORMULATE QUADRATIC FROM ROOTS */}
        {activeSolver === 'formulate_quad' && (
          <div className="flex flex-col gap-3.5">
            <div className="p-3 bg-black rounded-2xl border border-[#242424] flex flex-col gap-2.5">
              <span className="text-xs sm:text-sm font-mono text-[#FF9F0A] font-bold">Input Roots to Formulate ax² + bx + c = 0:</span>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs sm:text-sm text-gray-400">Root 1 (r₁):</span>
                  <NumInput value={formR1} onChange={setFormR1} placeholder="r1" className="w-16 sm:w-20" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs sm:text-sm text-gray-400">Root 2 (r₂):</span>
                  <NumInput value={formR2} onChange={setFormR2} placeholder="r2" className="w-16 sm:w-20" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs sm:text-sm text-gray-400">Scale (a):</span>
                  <NumInput value={formScaleA} onChange={setFormScaleA} placeholder="1" className="w-14 sm:w-18" />
                </div>
              </div>
            </div>

            {formQuadResult.sol ? (
              <div className="flex flex-col gap-2">
                <div className="p-3 bg-black/60 rounded-2xl border border-[#2C2C2E] flex flex-col items-center justify-center gap-1 text-center">
                  <span className="text-[10px] sm:text-xs text-gray-400 font-mono uppercase">Expanded Form</span>
                  <span className="font-mono text-base sm:text-lg font-bold text-[#30D158]">
                    {formQuadResult.sol.equationString}
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-gray-300 mt-1">
                    Factored: <strong className="text-white">{formQuadResult.sol.factoredString}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-black/30 rounded-xl border border-[#242424] text-center">
                    <span className="text-gray-400 block text-[10px]">Sum of Roots (r₁+r₂)</span>
                    <span className="font-bold text-white text-sm">{formatResult(formQuadResult.sol.sumOfRoots)}</span>
                  </div>
                  <div className="p-2.5 bg-black/30 rounded-xl border border-[#242424] text-center">
                    <span className="text-gray-400 block text-[10px]">Product of Roots (r₁×r₂)</span>
                    <span className="font-bold text-white text-sm">{formatResult(formQuadResult.sol.productOfRoots)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-black/40 rounded-xl text-center text-xs text-[#FF453A] font-mono">
                {formQuadResult.error}
              </div>
            )}
          </div>
        )}

        {/* 6. FORMULATE GENERAL POLYNOMIAL FROM ROOTS */}
        {activeSolver === 'formulate_poly' && (
          <div className="flex flex-col gap-3.5">
            <div className="p-3 bg-black rounded-2xl border border-[#242424] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-mono text-[#FF9F0A] font-bold">List of Roots:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-gray-400">Scale (a):</span>
                  <NumInput value={polyScaleA} onChange={setPolyScaleA} placeholder="1" className="w-14 sm:w-18" />
                </div>
              </div>

              {/* Roots Pill Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {polyRootsList.map((r, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-[#242424] rounded-lg border border-[#333333]">
                    <span className="text-xs sm:text-sm font-mono font-bold text-white">r_{idx + 1} = {r}</span>
                    <button
                      type="button"
                      onClick={() => setPolyRootsList(polyRootsList.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-[#FF453A] ml-1 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Root Input */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#242424]">
                <NumInput
                  value={newRootInput}
                  onChange={setNewRootInput}
                  placeholder="Enter root (e.g. -4)"
                  className="w-36 sm:w-48"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newRootInput.trim() !== '' && !isNaN(parseFloat(newRootInput))) {
                      setPolyRootsList([...polyRootsList, newRootInput.trim()]);
                      setNewRootInput('');
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-lg bg-[#FF9F0A] text-white font-mono text-xs sm:text-sm font-bold hover:bg-[#FFB340] transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Root</span>
                </button>
              </div>
            </div>

            {formPolyResult.sol ? (
              <div className="flex flex-col gap-2">
                <div className="p-3 bg-black/60 rounded-2xl border border-[#2C2C2E] flex flex-col items-center justify-center gap-1 text-center">
                  <span className="text-[10px] sm:text-xs text-gray-400 font-mono uppercase">Formulated Degree {formPolyResult.sol.degree} Polynomial</span>
                  <span className="font-mono text-sm sm:text-base font-bold text-[#30D158] break-all">
                    {formPolyResult.sol.equationString}
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-gray-300 mt-1 break-all">
                    Factored: <strong className="text-white">{formPolyResult.sol.factoredString}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-black/40 rounded-xl text-center text-xs text-[#FF453A] font-mono">
                {formPolyResult.error}
              </div>
            )}
          </div>
        )}

        {/* 7. LINEAR SOLVER */}
        {activeSolver === 'linear' && (
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-center gap-2 p-3 bg-black rounded-2xl border border-[#242424] min-h-[90px]">
              <NumInput value={linA} onChange={setLinA} placeholder="a" className="w-16 sm:w-20 md:w-24" />
              <span className="font-mono text-sm sm:text-base font-bold text-white">x +</span>
              <NumInput value={linB} onChange={setLinB} placeholder="b" className="w-16 sm:w-20 md:w-24" />
              <span className="font-mono text-sm sm:text-base font-bold text-white">=</span>
              <NumInput value={linC} onChange={setLinC} placeholder="c" className="w-16 sm:w-20 md:w-24" />
            </div>

            {linearResult.sol ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex flex-col items-center justify-center p-3 bg-black/60 rounded-xl border border-[#2C2C2E]">
                  <span className="text-[10px] sm:text-xs text-gray-400 font-mono font-medium">Solution x</span>
                  <span className="font-mono text-base sm:text-lg font-bold text-[#30D158]">
                    {linearResult.sol.formattedX}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-black/60 rounded-xl border border-[#2C2C2E]">
                  <span className="text-[10px] sm:text-xs text-gray-400 font-mono font-medium">Decimal</span>
                  <span className="font-mono text-base sm:text-lg font-bold text-white">
                    {formatResult(linearResult.sol.solution)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-black/40 rounded-xl text-center text-xs text-[#FF453A] font-mono">
                {linearResult.error}
              </div>
            )}
          </div>
        )}

        {/* 8. SYSTEM 2X2 SOLVER */}
        {activeSolver === 'system' && (
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-2 p-3 bg-black rounded-2xl border border-[#242424]">
              {/* Row 1 */}
              <div className="flex items-center justify-center gap-2">
                <NumInput value={sysA1} onChange={setSysA1} className="w-14 sm:w-18 md:w-22" />
                <span className="font-mono text-xs sm:text-sm font-bold text-white">x +</span>
                <NumInput value={sysB1} onChange={setSysB1} className="w-14 sm:w-18 md:w-22" />
                <span className="font-mono text-xs sm:text-sm font-bold text-white">y =</span>
                <NumInput value={sysC1} onChange={setSysC1} className="w-14 sm:w-18 md:w-22" />
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-center gap-2">
                <NumInput value={sysA2} onChange={setSysA2} className="w-14 sm:w-18 md:w-22" />
                <span className="font-mono text-xs sm:text-sm font-bold text-white">x +</span>
                <NumInput value={sysB2} onChange={setSysB2} className="w-14 sm:w-18 md:w-22" />
                <span className="font-mono text-xs sm:text-sm font-bold text-white">y =</span>
                <NumInput value={sysC2} onChange={setSysC2} className="w-14 sm:w-18 md:w-22" />
              </div>
            </div>

            {sysResult.sol ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex flex-col items-center justify-center p-3 bg-black/60 rounded-xl border border-[#2C2C2E]">
                  <span className="text-[10px] sm:text-xs text-gray-400 font-mono font-medium">Solution x</span>
                  <span className="font-mono text-base sm:text-lg font-bold text-[#30D158]">
                    {formatResult(sysResult.sol.x)}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-black/60 rounded-xl border border-[#2C2C2E]">
                  <span className="text-[10px] sm:text-xs text-gray-400 font-mono font-medium">Solution y</span>
                  <span className="font-mono text-base sm:text-lg font-bold text-[#30D158]">
                    {formatResult(sysResult.sol.y)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-black/40 rounded-xl text-center text-xs text-[#FF453A] font-mono">
                {sysResult.error}
              </div>
            )}
          </div>
        )}

        {/* 9. PROPORTION SOLVER */}
        {activeSolver === 'proportion' && (
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-center gap-3 p-3 bg-black rounded-2xl border border-[#242424] min-h-[100px]">
              {/* Ratio 1: A / B */}
              <div className="flex flex-col items-center gap-1">
                <NumInput value={propA} onChange={setPropA} className="w-16 sm:w-20 md:w-24" />
                <div className="w-full h-0.5 bg-gray-500 rounded-full" />
                <NumInput value={propB} onChange={setPropB} className="w-16 sm:w-20 md:w-24" />
              </div>

              <span className="font-mono text-lg sm:text-xl font-bold text-white">=</span>

              {/* Ratio 2: C / x */}
              <div className="flex flex-col items-center gap-1">
                <NumInput value={propC} onChange={setPropC} className="w-16 sm:w-20 md:w-24" />
                <div className="w-full h-0.5 bg-gray-500 rounded-full" />
                <div className="w-16 sm:w-20 md:w-24 h-9 sm:h-10 md:h-11 bg-[#FF9F0A]/20 border border-[#FF9F0A] rounded-lg flex items-center justify-center font-mono text-sm sm:text-base font-bold text-[#FF9F0A]">
                  x
                </div>
              </div>
            </div>

            {propResult.val !== undefined ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex flex-col items-center justify-center p-3 bg-black/60 rounded-xl border border-[#2C2C2E]">
                  <span className="text-[10px] sm:text-xs text-gray-400 font-mono font-medium">Value of x</span>
                  <span className="font-mono text-base sm:text-lg font-bold text-[#30D158]">
                    {formatResult(propResult.val)}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-black/60 rounded-xl border border-[#2C2C2E]">
                  <span className="text-[10px] sm:text-xs text-gray-400 font-mono font-medium">Exact Fraction</span>
                  <span className="font-mono text-sm sm:text-base font-bold text-white">
                    {propResult.frac.numerator}/{propResult.frac.denominator}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-black/40 rounded-xl text-center text-xs text-[#FF453A] font-mono">
                {propResult.error}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#2C2C2E]/60 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setShowGraph(!showGraph)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all border font-semibold text-xs sm:text-sm shadow-sm ${
              showGraph
                ? 'bg-[#FF9F0A]/20 text-[#FF9F0A] border-[#FF9F0A]/50 font-bold'
                : 'bg-[#242424] hover:bg-[#333333] text-gray-300 hover:text-white border-[#333333]'
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span>{showGraph ? 'Hide Graph' : 'Show Graph'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                let textToCopy = '';
                if (activeSolver === 'quadratic' && quadResult.sol) {
                  textToCopy = `x₁ = ${quadResult.sol.roots.r1}, x₂ = ${quadResult.sol.roots.r2}`;
                } else if (activeSolver === 'cubic' && cubicResult.sol) {
                  textToCopy = `x₁ = ${cubicResult.sol.roots.r1}, x₂ = ${cubicResult.sol.roots.r2}, x₃ = ${cubicResult.sol.roots.r3}`;
                } else if (activeSolver === 'sim_lin_quad' && simLinQuadResult.sol) {
                  textToCopy = simLinQuadResult.sol.intersections.map((p, i) => `P${i+1}(${p.formattedX}, ${p.formattedY})`).join('; ');
                } else if (activeSolver === 'sim_lin_poly' && simLinPolyResult.sol) {
                  textToCopy = simLinPolyResult.sol.intersections.map((p, i) => `P${i+1}(${p.formattedX}, ${p.formattedY})`).join('; ');
                } else if (activeSolver === 'formulate_quad' && formQuadResult.sol) {
                  textToCopy = formQuadResult.sol.equationString;
                } else if (activeSolver === 'formulate_poly' && formPolyResult.sol) {
                  textToCopy = formPolyResult.sol.equationString;
                } else if (activeSolver === 'linear' && linearResult.sol) {
                  textToCopy = `x = ${linearResult.sol.formattedX}`;
                } else if (activeSolver === 'system' && sysResult.sol) {
                  textToCopy = `x = ${formatResult(sysResult.sol.x)}, y = ${formatResult(sysResult.sol.y)}`;
                } else if (activeSolver === 'proportion' && propResult.val !== undefined) {
                  textToCopy = `x = ${formatResult(propResult.val)}`;
                }
                handleCopy(textToCopy);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#242424] hover:bg-[#333333] text-gray-300 hover:text-white rounded-full transition-colors border border-[#333333] text-xs sm:text-sm font-semibold shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-[#30D158]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                let val = '0';
                if (activeSolver === 'quadratic' && quadResult.sol?.roots.val1 !== undefined) {
                  val = String(quadResult.sol.roots.val1);
                } else if (activeSolver === 'cubic' && cubicResult.sol?.roots.val1 !== undefined) {
                  val = String(cubicResult.sol.roots.val1);
                } else if (activeSolver === 'sim_lin_quad' && simLinQuadResult.sol?.intersections[0]?.x !== undefined) {
                  val = String(simLinQuadResult.sol.intersections[0].x);
                } else if (activeSolver === 'sim_lin_poly' && simLinPolyResult.sol?.intersections[0]?.x !== undefined) {
                  val = String(simLinPolyResult.sol.intersections[0].x);
                } else if (activeSolver === 'linear' && linearResult.sol) {
                  val = String(linearResult.sol.solution);
                } else if (activeSolver === 'system' && sysResult.sol) {
                  val = String(sysResult.sol.x);
                } else if (activeSolver === 'proportion' && propResult.val !== undefined) {
                  val = String(propResult.val);
                }
                handleSendToCalc(val);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#242424] hover:bg-[#333333] text-gray-300 hover:text-white rounded-full transition-colors border border-[#333333] text-xs sm:text-sm font-semibold shadow-sm"
            >
              <Calculator className="w-4 h-4 text-[#FF9F0A]" />
              <span>Use in Calc</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Equation Graph */}
      {showGraph && graphData.curves.length > 0 && (
        <EquationGraph
          curves={graphData.curves}
          points={graphData.points}
          title={graphData.title}
        />
      )}
    </div>
  );
};
