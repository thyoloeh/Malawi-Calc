import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  MousePointer, 
  Layers
} from 'lucide-react';
import { formatResult } from '../utils/mathUtils';

export interface GraphCurve {
  id: string;
  name: string;
  color: string;
  dashArray?: string;
  fn: (x: number) => number;
  label?: string;
}

export interface KeyPoint {
  x: number;
  y: number;
  label: string;
  type: 'origin' | 'x-intercept' | 'y-intercept' | 'vertex' | 'intersection' | 'root';
  color?: string;
}

interface EquationGraphProps {
  curves: GraphCurve[];
  points?: KeyPoint[];
  title?: string;
  defaultXRange?: [number, number];
  defaultYRange?: [number, number];
  className?: string;
}

export const EquationGraph: React.FC<EquationGraphProps> = ({
  curves,
  points = [],
  title = 'Equation Graph',
  defaultXRange = [-10, 10],
  defaultYRange = [-10, 10],
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Viewport bounds [xMin, xMax] and [yMin, yMax]
  const [xRange, setXRange] = useState<[number, number]>(defaultXRange);
  const [yRange, setYRange] = useState<[number, number]>(defaultYRange);

  // Drag / Pan state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Hover crosshair coordinate in math space
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<KeyPoint | null>(null);
  const [highlightedCurveId, setHighlightedCurveId] = useState<string | null>(null);

  // Toggles for markers and display
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showPointLabels, setShowPointLabels] = useState<boolean>(true);
  const [showProjections, setShowProjections] = useState<boolean>(true);
  const [showOrigin, setShowOrigin] = useState<boolean>(true);
  const [showIntercepts, setShowIntercepts] = useState<boolean>(true);

  // Auto-fit function to center all points and reasonable range
  const autoFit = useCallback(() => {
    const allX = points.map((p) => p.x).concat([0]);
    const allY = points.map((p) => p.y).concat([0]);

    if (allX.length > 0 && allY.length > 0) {
      let minX = Math.min(...allX);
      let maxX = Math.max(...allX);
      let minY = Math.min(...allY);
      let maxY = Math.max(...allY);

      // Add symmetric padding and ensure span is at least 6
      const spanX = Math.max(maxX - minX, 6);
      const spanY = Math.max(maxY - minY, 6);
      const padX = spanX * 0.4;
      const padY = spanY * 0.4;

      minX = minX - padX;
      maxX = maxX + padX;
      minY = minY - padY;
      maxY = maxY + padY;

      // Keep origin in view
      if (minX > -1) minX = -2;
      if (maxX < 1) maxX = 2;
      if (minY > -1) minY = -2;
      if (maxY < 1) maxY = 2;

      setXRange([Math.round(minX * 10) / 10, Math.round(maxX * 10) / 10]);
      setYRange([Math.round(minY * 10) / 10, Math.round(maxY * 10) / 10]);
    } else {
      setXRange(defaultXRange);
      setYRange(defaultYRange);
    }
  }, [points, defaultXRange, defaultYRange]);

  // Initial auto fit on curve or point changes
  useEffect(() => {
    autoFit();
  }, [curves.length, points.length]);

  // Viewport dimensions in SVG coordinates
  const width = 600;
  const height = 340;
  const margin = { top: 22, right: 24, bottom: 25, left: 28 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Coordinate transforms: Math (x, y) -> SVG (px, py)
  const xToPx = useCallback((x: number) => {
    const [xMin, xMax] = xRange;
    return margin.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
  }, [xRange, margin.left, plotWidth]);

  const yToPy = useCallback((y: number) => {
    const [yMin, yMax] = yRange;
    return margin.top + plotHeight - ((y - yMin) / (yMax - yMin)) * plotHeight;
  }, [yRange, margin.top, plotHeight]);

  // SVG (px, py) -> Math (x, y)
  const pxToX = useCallback((px: number) => {
    const [xMin, xMax] = xRange;
    return xMin + ((px - margin.left) / plotWidth) * (xMax - xMin);
  }, [xRange, margin.left, plotWidth]);

  const pyToY = useCallback((py: number) => {
    const [yMin, yMax] = yRange;
    return yMax - ((py - margin.top) / plotHeight) * (yMax - yMin);
  }, [yRange, margin.top, plotHeight]);

  // Zoom controls
  const handleZoom = (factor: number) => {
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;
    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;
    const newHalfX = ((xMax - xMin) * factor) / 2;
    const newHalfY = ((yMax - yMin) * factor) / 2;

    setXRange([centerX - newHalfX, centerX + newHalfX]);
    setYRange([centerY - newHalfY, centerY + newHalfY]);
  };

  // Center on Origin
  const handleCenterOrigin = () => {
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;
    const spanX = (xMax - xMin) / 2;
    const spanY = (yMax - yMin) / 2;
    setXRange([-spanX, spanX]);
    setYRange([-spanY, spanY]);
  };

  // Mouse Drag / Pan Handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const px = ((e.clientX - rect.left) / rect.width) * width;
      const py = ((e.clientY - rect.top) / rect.height) * height;
      const mathX = pxToX(px);
      const mathY = pyToY(py);
      setHoverCoord({ x: mathX, y: mathY });
    }

    if (isDragging && dragStart && rect) {
      const dxPx = e.clientX - dragStart.x;
      const dyPx = e.clientY - dragStart.y;

      const dxMath = (dxPx / rect.width) * (xRange[1] - xRange[0]);
      const dyMath = (dyPx / rect.height) * (yRange[1] - yRange[0]);

      setXRange([xRange[0] - dxMath, xRange[1] - dxMath]);
      setYRange([yRange[0] + dyMath, yRange[1] + dyMath]);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.15 : 0.85;
    handleZoom(factor);
  };

  // Touch Drag / Pan Handlers for Mobile
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (touchStart && e.touches.length === 1 && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const dxPx = e.touches[0].clientX - touchStart.x;
      const dyPx = e.touches[0].clientY - touchStart.y;

      const dxMath = (dxPx / rect.width) * (xRange[1] - xRange[0]);
      const dyMath = (dyPx / rect.height) * (yRange[1] - yRange[0]);

      setXRange([xRange[0] - dxMath, xRange[1] - dxMath]);
      setYRange([yRange[0] + dyMath, yRange[1] + dyMath]);
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  // Generate grid ticks based on range
  const { xTicks, yTicks, stepX, stepY } = useMemo(() => {
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;
    const spanX = xMax - xMin;
    const spanY = yMax - yMin;

    const calcStep = (span: number) => {
      const rough = span / 8;
      const power = Math.pow(10, Math.floor(Math.log10(rough)));
      const norm = rough / power;
      let step;
      if (norm < 1.5) step = 1 * power;
      else if (norm < 3.5) step = 2 * power;
      else if (norm < 7.5) step = 5 * power;
      else step = 10 * power;
      return step || 1;
    };

    const sX = calcStep(spanX);
    const sY = calcStep(spanY);

    const firstX = Math.ceil(xMin / sX) * sX;
    const ticksX: number[] = [];
    for (let x = firstX; x <= xMax; x += sX) {
      ticksX.push(Math.round(x * 1000) / 1000);
    }

    const firstY = Math.ceil(yMin / sY) * sY;
    const ticksY: number[] = [];
    for (let y = firstY; y <= yMax; y += sY) {
      ticksY.push(Math.round(y * 1000) / 1000);
    }

    return { xTicks: ticksX, yTicks: ticksY, stepX: sX, stepY: sY };
  }, [xRange, yRange]);

  // Compute Curve Paths
  const curvePaths = useMemo(() => {
    const samples = 260;
    const [xMin, xMax] = xRange;
    const dx = (xMax - xMin) / samples;

    return curves.map((curve) => {
      let pathStr = '';
      let isFirst = true;

      for (let i = 0; i <= samples; i++) {
        const x = xMin + i * dx;
        try {
          const y = curve.fn(x);
          if (isNaN(y) || !isFinite(y)) {
            isFirst = true;
            continue;
          }

          const px = xToPx(x);
          const py = yToPy(y);

          // Clip extreme vertical values to prevent SVG overflow
          if (py < -300 || py > height + 300) {
            isFirst = true;
            continue;
          }

          if (isFirst) {
            pathStr += `M ${px.toFixed(1)} ${py.toFixed(1)} `;
            isFirst = false;
          } else {
            pathStr += `L ${px.toFixed(1)} ${py.toFixed(1)} `;
          }
        } catch {
          isFirst = true;
        }
      }

      return {
        id: curve.id,
        name: curve.name,
        color: curve.color,
        dashArray: curve.dashArray,
        path: pathStr,
        label: curve.label
      };
    });
  }, [curves, xRange, xToPx, yToPy, height]);

  // Origin point
  const originPx = xToPx(0);
  const originPy = yToPy(0);
  const isOriginInView = originPx >= margin.left && originPx <= width - margin.right &&
                         originPy >= margin.top && originPy <= height - margin.bottom;

  // Filter and deduplicate all display points
  const combinedPoints: KeyPoint[] = useMemo(() => {
    const pts: KeyPoint[] = [];

    // Add supplied points with formatting
    points.forEach((p) => {
      if (Math.abs(p.x) < 1e-9 && Math.abs(p.y) < 1e-9) return; // Avoid duplicate origin
      pts.push(p);
    });

    return pts;
  }, [points]);

  const xIntercepts = combinedPoints.filter(p => p.type === 'x-intercept' || p.type === 'root');
  const yIntercepts = combinedPoints.filter(p => p.type === 'y-intercept');
  const otherPoints = combinedPoints.filter(p => p.type !== 'x-intercept' && p.type !== 'root' && p.type !== 'y-intercept');

  return (
    <div className={`w-full bg-[#161618] rounded-2xl border border-[#2C2C2E] overflow-hidden flex flex-col shadow-xl ${className}`}>
      {/* Graph Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#1C1C1E] border-b border-[#2C2C2E] gap-1.5">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#FF9F0A]" />
          <span className="text-xs sm:text-sm font-bold text-white font-mono tracking-wide truncate max-w-[140px] sm:max-w-none">{title}</span>
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {/* Toggle Origin Button */}
          <button
            type="button"
            onClick={() => setShowOrigin(!showOrigin)}
            className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors border ${
              showOrigin ? 'bg-white/15 text-white border-white/40' : 'bg-[#242424] text-gray-400 border-[#333333]'
            }`}
            title="Toggle Origin Marker (0, 0)"
          >
            Origin
          </button>

          {/* Toggle Intercepts Button */}
          <button
            type="button"
            onClick={() => setShowIntercepts(!showIntercepts)}
            className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors border ${
              showIntercepts ? 'bg-[#30D158]/20 text-[#30D158] border-[#30D158]/40' : 'bg-[#242424] text-gray-400 border-[#333333]'
            }`}
            title="Toggle X & Y Intercepts"
          >
            Intercepts
          </button>

          {/* Toggle Drop Projection Lines */}
          <button
            type="button"
            onClick={() => setShowProjections(!showProjections)}
            className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors border ${
              showProjections ? 'bg-[#FF9F0A]/20 text-[#FF9F0A] border-[#FF9F0A]/40' : 'bg-[#242424] text-gray-400 border-[#333333]'
            }`}
            title="Toggle Dashed Projections to Axes"
          >
            Guides
          </button>

          {/* Zoom & Navigation Actions */}
          <button
            type="button"
            title="Center on Origin (0,0)"
            onClick={handleCenterOrigin}
            className="px-2 py-1 rounded bg-[#242424] hover:bg-[#333333] text-gray-300 hover:text-white text-xs font-mono font-bold border border-[#333333] transition-colors"
          >
            (0,0)
          </button>
          <button
            type="button"
            title="Auto Fit & Center"
            onClick={autoFit}
            className="p-1.5 rounded bg-[#242424] hover:bg-[#333333] text-gray-300 hover:text-white transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Zoom In"
            onClick={() => handleZoom(0.8)}
            className="p-1.5 rounded bg-[#242424] hover:bg-[#333333] text-gray-300 hover:text-white transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Zoom Out"
            onClick={() => handleZoom(1.25)}
            className="p-1.5 rounded bg-[#242424] hover:bg-[#333333] text-gray-300 hover:text-white transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Toggle Labels"
            onClick={() => setShowPointLabels(!showPointLabels)}
            className={`p-1.5 rounded transition-colors ${
              showPointLabels ? 'bg-[#FF9F0A]/20 text-[#FF9F0A]' : 'bg-[#242424] text-gray-400'
            }`}
          >
            {showPointLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            title="Reset View"
            onClick={() => {
              setXRange(defaultXRange);
              setYRange(defaultYRange);
            }}
            className="p-1.5 rounded bg-[#242424] hover:bg-[#333333] text-gray-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main SVG Graph Canvas */}
      <div 
        ref={containerRef}
        className="relative w-full bg-black select-none cursor-crosshair overflow-hidden touch-none"
        style={{ height: '260px' }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseLeave={() => {
            setIsDragging(false);
            setHoverCoord(null);
          }}
          onWheel={handleWheel}
        >
          <defs>
            <marker
              id="axis-arrow-x"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#FF9F0A" />
            </marker>
            <marker
              id="axis-arrow-y"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#FF9F0A" />
            </marker>
          </defs>

          {/* Plot background clipping region */}
          <clipPath id="plot-clip">
            <rect
              x={margin.left}
              y={margin.top}
              width={plotWidth}
              height={plotHeight}
            />
          </clipPath>

          {/* 1. GRID LINES */}
          {showGrid && (
            <g className="opacity-30">
              {/* Vertical Grid lines */}
              {xTicks.map((xVal) => {
                const px = xToPx(xVal);
                if (px < margin.left || px > width - margin.right) return null;
                const isZero = Math.abs(xVal) < 1e-6;
                return (
                  <g key={`x-grid-${xVal}`}>
                    <line
                      x1={px}
                      y1={margin.top}
                      x2={px}
                      y2={height - margin.bottom}
                      stroke={isZero ? '#555555' : '#2A2A2E'}
                      strokeWidth={isZero ? 1.5 : 0.8}
                      strokeDasharray={isZero ? undefined : '2,2'}
                    />
                    {!isZero && (
                      <text
                        x={px}
                        y={Math.min(Math.max(originPy + 12, margin.top + 10), height - margin.bottom - 4)}
                        fill="#71717A"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {xVal}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Horizontal Grid lines */}
              {yTicks.map((yVal) => {
                const py = yToPy(yVal);
                if (py < margin.top || py > height - margin.bottom) return null;
                const isZero = Math.abs(yVal) < 1e-6;
                return (
                  <g key={`y-grid-${yVal}`}>
                    <line
                      x1={margin.left}
                      y1={py}
                      x2={width - margin.right}
                      y2={py}
                      stroke={isZero ? '#555555' : '#2A2A2E'}
                      strokeWidth={isZero ? 1.5 : 0.8}
                      strokeDasharray={isZero ? undefined : '2,2'}
                    />
                    {!isZero && (
                      <text
                        x={Math.max(Math.min(originPx - 4, width - margin.right - 4), margin.left + 4)}
                        y={py + 3}
                        fill="#71717A"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {yVal}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* 2. PRIMARY AXES (X & Y) WITH ARROWS AND LABELS */}
          <g>
            {/* X-Axis */}
            {originPy >= margin.top && originPy <= height - margin.bottom && (
              <g>
                <line
                  x1={margin.left}
                  y1={originPy}
                  x2={width - margin.right + 8}
                  y2={originPy}
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  markerEnd="url(#axis-arrow-x)"
                />
                {/* X axis end label */}
                <text
                  x={width - margin.right + 16}
                  y={originPy + 3}
                  fill="#FF9F0A"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  X
                </text>
              </g>
            )}

            {/* Y-Axis */}
            {originPx >= margin.left && originPx <= width - margin.right && (
              <g>
                <line
                  x1={originPx}
                  y1={height - margin.bottom}
                  x2={originPx}
                  y2={margin.top - 8}
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  markerEnd="url(#axis-arrow-y)"
                />
                {/* Y axis top label */}
                <text
                  x={originPx}
                  y={margin.top - 12}
                  fill="#FF9F0A"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Y
                </text>
              </g>
            )}
          </g>

          {/* 3. PROJECTION GUIDE LINES (Dashed drop lines to axes) */}
          {showProjections && (
            <g clipPath="url(#plot-clip)" className="opacity-75">
              {combinedPoints.map((pt, idx) => {
                if (pt.type === 'origin') return null;
                const px = xToPx(pt.x);
                const py = yToPy(pt.y);
                const isXInt = pt.type === 'x-intercept' || pt.type === 'root';
                const isYInt = pt.type === 'y-intercept';

                // For non-intercept points (like vertex/intersection), drop lines to both axes
                if (!isXInt && !isYInt && isOriginInView) {
                  return (
                    <g key={`proj-${idx}`}>
                      <line
                        x1={px}
                        y1={py}
                        x2={px}
                        y2={originPy}
                        stroke={pt.color || '#BF5AF2'}
                        strokeWidth="1"
                        strokeDasharray="3,3"
                      />
                      <line
                        x1={px}
                        y1={py}
                        x2={originPx}
                        y2={py}
                        stroke={pt.color || '#BF5AF2'}
                        strokeWidth="1"
                        strokeDasharray="3,3"
                      />
                    </g>
                  );
                }

                // For x-intercept, draw small vertical tick marker through axis
                if (isXInt) {
                  return (
                    <line
                      key={`proj-x-${idx}`}
                      x1={px}
                      y1={originPy - 6}
                      x2={px}
                      y2={originPy + 6}
                      stroke="#30D158"
                      strokeWidth="2"
                    />
                  );
                }

                // For y-intercept, draw small horizontal tick marker through axis
                if (isYInt) {
                  return (
                    <line
                      key={`proj-y-${idx}`}
                      x1={originPx - 6}
                      y1={py}
                      x2={originPx + 6}
                      y2={py}
                      stroke="#FF9F0A"
                      strokeWidth="2"
                    />
                  );
                }
                return null;
              })}
            </g>
          )}

          {/* 4. GRAPH CURVE LINES (Clipped inside plot area) */}
          <g clipPath="url(#plot-clip)">
            {curvePaths.map((curve) => {
              const isHighlight = highlightedCurveId === curve.id;
              return (
                <g key={curve.id} className="cursor-pointer" onClick={() => setHighlightedCurveId(isHighlight ? null : curve.id)}>
                  {/* Invisible wider hit area for easy hover/tap */}
                  <path
                    d={curve.path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="14"
                  />
                  {/* Main visible curve path */}
                  <path
                    d={curve.path}
                    fill="none"
                    stroke={curve.color}
                    strokeWidth={isHighlight ? '4' : '2.6'}
                    strokeDasharray={curve.dashArray}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all"
                    opacity={highlightedCurveId && !isHighlight ? 0.35 : 1}
                  />
                </g>
              );
            })}
          </g>

          {/* 5. CLEARLY MARKED ORIGIN (0, 0) */}
          {showOrigin && isOriginInView && (
            <g className="cursor-pointer" onClick={() => setSelectedPoint({ x: 0, y: 0, label: 'Origin (0, 0)', type: 'origin' })}>
              {/* Outer glowing target ring */}
              <circle
                cx={originPx}
                cy={originPy}
                r="7"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />
              {/* Crosshair target lines */}
              <line x1={originPx - 9} y1={originPy} x2={originPx + 9} y2={originPy} stroke="#FFFFFF" strokeWidth="1" />
              <line x1={originPx} y1={originPy - 9} x2={originPx} y2={originPy + 9} stroke="#FFFFFF" strokeWidth="1" />
              {/* Center Dot */}
              <circle
                cx={originPx}
                cy={originPy}
                r="3.5"
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth="1"
              />
              {/* Clearly marked Origin Label Badge */}
              <g>
                <rect
                  x={originPx + 6}
                  y={originPy + 5}
                  width="44"
                  height="15"
                  rx="3.5"
                  fill="#000000"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  opacity="0.95"
                />
                <text
                  x={originPx + 28}
                  y={originPy + 16}
                  fill="#FFFFFF"
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  O(0, 0)
                </text>
              </g>
            </g>
          )}

          {/* 6. CLEARLY MARKED X-INTERCEPTS & Y-INTERCEPTS & KEY POINTS */}
          {showIntercepts && (
            <g clipPath="url(#plot-clip)">
              {combinedPoints.map((pt, idx) => {
                if (pt.type === 'origin') return null;
                const px = xToPx(pt.x);
                const py = yToPy(pt.y);

                // Check if inside plot
                if (px < margin.left - 15 || px > width - margin.right + 15 ||
                    py < margin.top - 15 || py > height - margin.bottom + 15) {
                  return null;
                }

                const isXInt = pt.type === 'x-intercept' || pt.type === 'root';
                const isYInt = pt.type === 'y-intercept';
                const isInter = pt.type === 'intersection';
                const isVert = pt.type === 'vertex';

                // High contrast color coding
                const ptColor = isXInt ? '#30D158' : isYInt ? '#FF9F0A' : isInter ? '#BF5AF2' : isVert ? '#0A84FF' : '#FFD60A';

                return (
                  <g 
                    key={`point-${idx}-${pt.x}-${pt.y}`}
                    className="cursor-pointer group"
                    onClick={() => setSelectedPoint(pt)}
                  >
                    {/* Pulsing halo */}
                    <circle
                      cx={px}
                      cy={py}
                      r="9"
                      fill={ptColor}
                      opacity="0.25"
                      className="animate-pulse"
                    />
                    {/* Diamond badge for intercepts or circle for other */}
                    {isXInt || isYInt ? (
                      <polygon
                        points={`${px},${py - 6} ${px + 6},${py} ${px},${py + 6} ${px - 6},${py}`}
                        fill={ptColor}
                        stroke="#000000"
                        strokeWidth="1.5"
                      />
                    ) : (
                      <circle
                        cx={px}
                        cy={py}
                        r="5"
                        fill={ptColor}
                        stroke="#000000"
                        strokeWidth="1.5"
                      />
                    )}
                    {/* Inner center dot */}
                    <circle
                      cx={px}
                      cy={py}
                      r="2"
                      fill="#FFFFFF"
                    />

                    {/* Prominently visible coordinate badge label */}
                    {showPointLabels && (
                      <g className="transition-transform group-hover:scale-110">
                        <rect
                          x={px - 32}
                          y={isXInt ? py + 9 : isYInt ? py - 20 : py - 18}
                          width="64"
                          height="15"
                          rx="4"
                          fill="#18181B"
                          stroke={ptColor}
                          strokeWidth="1.2"
                          opacity="0.96"
                        />
                        <text
                          x={px}
                          y={isXInt ? py + 20 : isYInt ? py - 9 : py - 7}
                          fill="#FFFFFF"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {isXInt ? `x: ${formatResult(pt.x, 2)}` : isYInt ? `y: ${formatResult(pt.y, 2)}` : `(${formatResult(pt.x, 2)}, ${formatResult(pt.y, 2)})`}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* 7. HOVER CROSSHAIR INSPECTOR */}
          {hoverCoord && (
            <g className="pointer-events-none opacity-60">
              <line
                x1={xToPx(hoverCoord.x)}
                y1={margin.top}
                x2={xToPx(hoverCoord.x)}
                y2={height - margin.bottom}
                stroke="#FF9F0A"
                strokeWidth="0.8"
                strokeDasharray="3,3"
              />
              <line
                x1={margin.left}
                y1={yToPy(hoverCoord.y)}
                x2={width - margin.right}
                y2={yToPy(hoverCoord.y)}
                stroke="#FF9F0A"
                strokeWidth="0.8"
                strokeDasharray="3,3"
              />
            </g>
          )}
        </svg>

        {/* Hover Coordinate Floating HUD Badge */}
        {hoverCoord && (
          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-black/85 backdrop-blur-md rounded-md border border-[#333333] text-[9px] font-mono text-gray-300 flex items-center gap-1.5 pointer-events-none shadow-md">
            <MousePointer className="w-2.5 h-2.5 text-[#FF9F0A]" />
            <span>x: <strong className="text-white">{formatResult(hoverCoord.x, 3)}</strong></span>
            <span className="text-gray-500">|</span>
            <span>y: <strong className="text-white">{formatResult(hoverCoord.y, 3)}</strong></span>
          </div>
        )}

        {/* Drag Hint on canvas */}
        <div className="absolute bottom-1 right-2 text-[8px] font-mono text-gray-500 pointer-events-none opacity-70">
          Pan / Zoom active
        </div>
      </div>

      {/* Graph Legend & Intercepts Summary Bar */}
      <div className="p-3 bg-[#1C1C1E] border-t border-[#2C2C2E] flex flex-col gap-2">
        {/* Curve List */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider shrink-0 font-bold">Lines:</span>
          {curves.map((curve) => {
            const isHighlight = highlightedCurveId === curve.id;
            return (
              <button
                key={curve.id}
                type="button"
                onClick={() => setHighlightedCurveId(isHighlight ? null : curve.id)}
                className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg border transition-all ${
                  isHighlight
                    ? 'bg-white/10 border-white text-white shadow-sm'
                    : 'bg-black/40 border-[#2A2A2E] text-gray-300 hover:text-white'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: curve.color }} />
                <span className="text-xs font-mono font-medium">{curve.label || curve.name}</span>
              </button>
            );
          })}
        </div>

        {/* Clearly Marked Intercepts & Points Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1.5 border-t border-[#242424]">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider shrink-0 mr-0.5 font-bold">Markers:</span>

          {/* Origin Pill */}
          <button
            type="button"
            onClick={handleCenterOrigin}
            className="flex items-center gap-1 px-2 py-1 bg-black/60 hover:bg-[#242424] rounded-lg border border-white/40 text-xs font-mono shrink-0 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="text-gray-300">Origin:</span>
            <strong className="text-white">(0, 0)</strong>
          </button>

          {/* X-Intercepts List */}
          {xIntercepts.map((p, idx) => (
            <button
              key={`xint-${idx}`}
              type="button"
              onClick={() => {
                setXRange([p.x - 3, p.x + 3]);
                setYRange([-3, 3]);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#30D158]/50 bg-[#30D158]/15 text-[#30D158] text-xs font-mono shrink-0 transition-all hover:scale-105"
            >
              <span className="font-semibold">{p.label}:</span>
              <span className="font-bold">({formatResult(p.x, 2)}, 0)</span>
            </button>
          ))}

          {/* Y-Intercepts List */}
          {yIntercepts.map((p, idx) => (
            <button
              key={`yint-${idx}`}
              type="button"
              onClick={() => {
                setXRange([-3, 3]);
                setYRange([p.y - 3, p.y + 3]);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#FF9F0A]/50 bg-[#FF9F0A]/15 text-[#FF9F0A] text-xs font-mono shrink-0 transition-all hover:scale-105"
            >
              <span className="font-semibold">{p.label}:</span>
              <span className="font-bold">(0, {formatResult(p.y, 2)})</span>
            </button>
          ))}

          {/* Other Points (Vertices, Intersections) */}
          {otherPoints.map((p, idx) => {
            const isInter = p.type === 'intersection';
            const isVert = p.type === 'vertex';
            const badgeBg = isInter ? 'border-[#BF5AF2]/40 bg-[#BF5AF2]/10 text-[#BF5AF2]' :
                            isVert ? 'border-[#0A84FF]/40 bg-[#0A84FF]/10 text-[#0A84FF]' :
                            'border-gray-500 bg-gray-800 text-gray-300';
            return (
              <button
                key={`other-${idx}`}
                type="button"
                onClick={() => {
                  setXRange([p.x - 3, p.x + 3]);
                  setYRange([p.y - 3, p.y + 3]);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-mono shrink-0 transition-all hover:scale-105 ${badgeBg}`}
              >
                <span className="font-semibold">{p.label}:</span>
                <span className="font-bold">({formatResult(p.x, 2)}, {formatResult(p.y, 2)})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
