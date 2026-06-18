'use client';

import { useEffect, useRef, useCallback } from 'react';

interface WebGLParticlesProps {
  colors?: string[];
  count?: number;
  className?: string;
  interactive?: boolean;
  speed?: number;
  mouseRadius?: number;
  connectionDistance?: number;
}

// GPU-accelerated particle system using WebGL
const vertexShaderAttribs = `
  attribute vec2 a_position;
  attribute float a_size;
  attribute float a_alpha;
  
  varying float v_alpha;
  varying vec2 v_pos;
  
  void main() {
    v_alpha = a_alpha;
    v_pos = a_position;
    gl_Position = vec4(a_position, 0.0, 1.0);
    gl_PointSize = a_size;
  }
`;

const fragmentShaderPoints = `
  precision highp float;
  varying float v_alpha;
  varying vec2 v_pos;
  uniform vec3 u_color;
  
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    glow = pow(glow, 1.5);
    
    gl_FragColor = vec4(u_color, v_alpha * glow);
  }
`;

const fragmentShaderLines = `
  precision highp float;
  uniform vec3 u_color;
  uniform float u_alpha;
  
  void main() {
    gl_FragColor = vec4(u_color, u_alpha);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ] : [0.027, 0.557, 0.933]; // default cyan
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseVx: number;
  baseVy: number;
}

export default function WebGLParticles({
  colors = ['#06b6d4'],
  count = 120,
  className = '',
  interactive = false,
  speed = 0.5,
  mouseRadius = 0.15,
  connectionDistance = 0.12,
}: WebGLParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -999, y: -999, active: false });
  const particlesRef = useRef<Particle[]>([]);

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    const aspect = w / h;
    for (let i = 0; i < count; i++) {
      const vx = (Math.random() - 0.5) * speed * 0.002;
      const vy = (Math.random() - 0.5) * speed * 0.002;
      particles.push({
        x: (Math.random() * 2 - 1) * aspect,
        y: Math.random() * 2 - 1,
        vx, vy,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.6 + 0.2,
        baseVx: vx,
        baseVy: vy,
      });
    }
    particlesRef.current = particles;
  }, [count, speed]);

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: false,
      powerPreference: count > 200 ? 'high-performance' : 'low-power',
    });
    if (!gl) return false;

    glRef.current = gl;

    // Enable blending for particles
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return true;
  }, [count]);

  const render = useCallback(() => {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    if (!gl || !canvas) {
      animRef.current = requestAnimationFrame(render);
      return;
    }

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      initParticles(w, h);
    }
    gl.viewport(0, 0, w, h);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const particles = particlesRef.current;
    const mouse = mouseRef.current;
    const aspect = w / h;

    // Update particles
    for (const p of particles) {
      if (interactive && mouse.active) {
        const mx = (mouse.x / w) * 2 * aspect - aspect;
        const my = -((mouse.y / h) * 2 - 1);
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius * 2 && dist > 0.001) {
          const force = (mouseRadius * 2 - dist) / (mouseRadius * 2) * 0.003;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      p.vx += (p.baseVx - p.vx) * 0.02;
      p.vy += (p.baseVy - p.vy) * 0.02;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -aspect) p.x = aspect;
      if (p.x > aspect) p.x = -aspect;
      if (p.y < -1) p.y = 1;
      if (p.y > 1) p.y = -1;
    }

    // Draw particles
    const pointColor = hexToRgb(colors[0] || '#06b6d4');

    // Point rendering
    const pointPositions: number[] = [];
    const pointSizes: number[] = [];
    const pointAlphas: number[] = [];

    for (const p of particles) {
      pointPositions.push(p.x, p.y);
      pointSizes.push(p.size * (w / 800));
      pointAlphas.push(p.alpha);
    }

    // Draw points using gl.POINTS
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointPositions), gl.STREAM_DRAW);

    // Simple point shader
    const vertSrc = `
      attribute vec2 a_pos;
      attribute float a_size;
      attribute float a_alpha;
      varying float v_alpha;
      void main() {
        v_alpha = a_alpha;
        gl_Position = vec4(a_pos, 0.0, 1.0);
        gl_PointSize = a_size;
      }
    `;
    const fragSrc = `
      precision highp float;
      varying float v_alpha;
      uniform vec3 u_color;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float g = pow(1.0 - d * 2.0, 1.5);
        gl_FragColor = vec4(u_color, v_alpha * g);
      }
    `;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vertSrc);
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fragSrc);
    gl.compileShader(fs);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const posLoc = gl.getAttribLocation(prog, 'a_pos');
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointSizes), gl.STREAM_DRAW);
    const sizeLoc = gl.getAttribLocation(prog, 'a_size');
    gl.enableVertexAttribArray(sizeLoc);
    gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, 0, 0);

    const alphaBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointAlphas), gl.STREAM_DRAW);
    const alphaLoc = gl.getAttribLocation(prog, 'a_alpha');
    gl.enableVertexAttribArray(alphaLoc);
    gl.vertexAttribPointer(alphaLoc, 1, gl.FLOAT, false, 0, 0);

    gl.uniform3f(gl.getUniformLocation(prog, 'u_color'), pointColor[0], pointColor[1], pointColor[2]);
    gl.drawArrays(gl.POINTS, 0, particles.length);

    // Draw connections
    gl.lineWidth(0.5);
    const linePositions: number[] = [];
    const connectionDistGL = connectionDistance * aspect;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDistGL && linePositions.length < 6000) {
          const alpha = 0.06 * (1 - dist / connectionDistGL);
          linePositions.push(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
        }
      }
    }

    if (linePositions.length > 0) {
      const lineVertSrc = `
        attribute vec2 a_pos;
        void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
      `;
      const lineFragSrc = `
        precision highp float;
        uniform vec3 u_color;
        uniform float u_alpha;
        void main() { gl_FragColor = vec4(u_color, u_alpha); }
      `;
      const lvs = gl.createShader(gl.VERTEX_SHADER)!;
      gl.shaderSource(lvs, lineVertSrc);
      gl.compileShader(lvs);
      const lfs = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(lfs, lineFragSrc);
      gl.compileShader(lfs);
      const lprog = gl.createProgram()!;
      gl.attachShader(lprog, lvs);
      gl.attachShader(lprog, lfs);
      gl.linkProgram(lprog);
      gl.useProgram(lprog);

      const lineBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linePositions), gl.STREAM_DRAW);
      const lPosLoc = gl.getAttribLocation(lprog, 'a_pos');
      gl.enableVertexAttribArray(lPosLoc);
      gl.vertexAttribPointer(lPosLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform3f(gl.getUniformLocation(lprog, 'u_color'), pointColor[0], pointColor[1], pointColor[2]);
      gl.uniform1f(gl.getUniformLocation(lprog, 'u_alpha'), 0.08);
      gl.drawArrays(gl.LINES, 0, linePositions.length / 2);
    }

    gl.deleteBuffer(posBuffer);

    animRef.current = requestAnimationFrame(render);
  }, [colors, interactive, speed, mouseRadius, connectionDistance, initParticles]);

  useEffect(() => {
    if (!initGL()) return;
    initParticles(canvasRef.current?.clientWidth || 800, canvasRef.current?.clientHeight || 600);
    render();

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [initGL, initParticles, render]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !interactive) return;

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouch = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current.x = touch.clientX - rect.left;
      mouseRef.current.y = touch.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseleave', handleLeave);
    canvas.addEventListener('touchmove', handleTouch, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseleave', handleLeave);
      canvas.removeEventListener('touchmove', handleTouch);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ opacity: 0.7 }}
    />
  );
}
