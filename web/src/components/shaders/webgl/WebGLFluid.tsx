'use client';

import { useEffect, useRef, useCallback } from 'react';

interface WebGLFluidProps {
  colors?: string[];
  className?: string;
  interactive?: boolean;
  speed?: number;
  quality?: 'low' | 'medium' | 'high';
}

// WebGL Fluid Simulation Shader
// Based on fluid dynamics with mouse interaction
const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  varying vec2 v_uv;
  
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_speed;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform vec3 u_color4;
  uniform int u_quality; // 0=low, 1=med, 2=high
  
  // Simplex noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  float fbm(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 8; i++) {
      if (i >= octaves) break;
      value += amplitude * snoise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }
  
  void main() {
    vec2 uv = v_uv;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 p = uv * aspect;
    
    float t = u_time * u_speed * 0.15;
    
    // Quality-based octave count
    int octaves = u_quality == 0 ? 3 : u_quality == 1 ? 5 : 7;
    
    // Fluid motion with noise
    float n1 = fbm(p * 1.5 + vec2(t, t * 0.7), octaves);
    float n2 = fbm(p * 2.0 + vec2(-t * 0.8, t * 0.3) + n1 * 0.5, octaves);
    float n3 = fbm(p * 0.8 + n2 * 0.3 + vec2(t * 0.2, -t * 0.4), octaves);
    
    // Mouse interaction — create attraction point
    float mouseInfluence = 0.0;
    if (u_quality > 0) {
      vec2 mouse = u_mouse * aspect;
      float mouseDist = length(p - mouse);
      mouseInfluence = smoothstep(0.5, 0.0, mouseDist) * 0.3;
    }
    
    // Color mixing based on noise values
    vec3 col = mix(u_color1, u_color2, smoothstep(-0.5, 0.5, n1));
    col = mix(col, u_color3, smoothstep(-0.3, 0.5, n2) * (0.6 + mouseInfluence));
    col = mix(col, u_color4 * 1.2, smoothstep(-0.2, 0.6, n3) * 0.35);
    
    // Add subtle brightness variation
    float brightness = 0.85 + 0.15 * snoise(p * 3.0 + t * 0.5);
    col *= brightness;
    
    // Vignette
    float vignette = 1.0 - smoothstep(0.4, 1.4, length(uv - 0.5) * 2.0);
    col *= vignette * 0.3 + 0.7;
    
    // Clamp and output
    col = clamp(col, 0.0, 1.0);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ] : [0, 0, 0];
}

export default function WebGLFluid({
  colors = ['#0c4a6e', '#0369a1', '#0284c7', '#38bdf8'],
  className = '',
  interactive = false,
  speed = 1,
  quality = 'medium',
}: WebGLFluidProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const startTimeRef = useRef(Date.now());

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: quality === 'high' ? 'high-performance' : 'low-power',
    });
    if (!gl) return false;

    glRef.current = gl;

    // Compile shaders
    const vertShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertShader, vertexShaderSource);
    gl.compileShader(vertShader);
    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
      console.error('Vertex shader error:', gl.getShaderInfoLog(vertShader));
      return false;
    }

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragShader, fragmentShaderSource);
    gl.compileShader(fragShader);
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader error:', gl.getShaderInfoLog(fragShader));
      return false;
    }

    // Create program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return false;
    }

    programRef.current = program;
    gl.useProgram(program);

    // Set up geometry (full-screen quad)
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    return true;
  }, [quality]);

  const render = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;
    if (!gl || !program || !canvas) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);

    const t = (Date.now() - startTimeRef.current) / 1000;

    // Set uniforms
    gl.uniform1f(gl.getUniformLocation(program, 'u_time'), t);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), w, h);
    gl.uniform2f(gl.getUniformLocation(program, 'u_mouse'), mouseRef.current.x, mouseRef.current.y);
    gl.uniform1f(gl.getUniformLocation(program, 'u_speed'), speed * 0.15);

    const qVal = quality === 'low' ? 0 : quality === 'medium' ? 1 : 2;
    gl.uniform1i(gl.getUniformLocation(program, 'u_quality'), qVal);

    // Color uniforms
    const c = colors;
    gl.uniform3fv(gl.getUniformLocation(program, 'u_color1'), hexToRgb(c[0] || '#0c4a6e'));
    gl.uniform3fv(gl.getUniformLocation(program, 'u_color2'), hexToRgb(c[1] || '#0369a1'));
    gl.uniform3fv(gl.getUniformLocation(program, 'u_color3'), hexToRgb(c[2] || '#0284c7'));
    gl.uniform3fv(gl.getUniformLocation(program, 'u_color4'), hexToRgb(c[3] || '#38bdf8'));

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    animRef.current = requestAnimationFrame(render);
  }, [colors, speed, quality]);

  useEffect(() => {
    if (!initGL()) return;
    startTimeRef.current = Date.now();
    render();

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [initGL, render]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !interactive) return;

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height; // Flip Y for GL
    };

    const handleTouch = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current.x = (touch.clientX - rect.left) / rect.width;
      mouseRef.current.y = 1.0 - (touch.clientY - rect.top) / rect.height;
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleTouch, { passive: true });
    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('touchmove', handleTouch);
    };
  }, [interactive]);

  // Pause when not visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animRef.current) {
          animRef.current = requestAnimationFrame(render);
        } else if (!entry.isIntersecting) {
          cancelAnimationFrame(animRef.current);
          animRef.current = 0;
        }
      },
      { threshold: 0 }
    );
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ opacity: 1 }}
    />
  );
}
