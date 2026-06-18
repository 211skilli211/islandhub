'use client';
import { useEffect, useRef } from 'react';

/**
 * ShaderHero — Pure WebGL ocean shader background.
 * No Three.js or R3F needed — raw WebGL for minimal bundle size.
 * Reads shader config from styleConfig: { shaderColors: [...], shaderSpeed, shaderIntensity }
 */
export default function ShaderHero({ colors = [], speed = 1, intensity = 1 }: {
  colors?: string[];
  speed?: number;
  intensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;

    // Parse hex colors to RGB
    const parseHex = (hex: string): [number, number, number] => {
      const h = hex.replace('#', '');
      return [
        parseInt(h.substring(0, 2), 16) / 255,
        parseInt(h.substring(2, 4), 16) / 255,
        parseInt(h.substring(4, 6), 16) / 255,
      ];
    };

    const palette = colors.length >= 3
      ? colors.slice(0, 4).map(parseHex)
      : [
          [0.008, 0.035, 0.090],
          [0.039, 0.086, 0.157],
          [0.024, 0.714, 0.831],
          [0.984, 0.749, 0.141],
        ];

    const vertexShaderSrc = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSrc = `
      precision mediump float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec3 u_color0;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      uniform float u_intensity;

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

      void main() {
        vec2 uv = v_uv;
        float aspect = u_resolution.x / u_resolution.y;
        uv.x *= aspect;
        float t = u_time * 0.15;

        float wave1 = snoise(uv * 3.0 + vec2(t, t * 0.7)) * 0.5;
        float wave2 = snoise(uv * 5.0 + vec2(-t * 0.5, t * 0.8)) * 0.3;
        float wave3 = snoise(uv * 8.0 + vec2(t * 0.3, -t * 0.4)) * 0.15;
        float elevation = (wave1 + wave2 + wave3) * u_intensity;

        vec3 deep = u_color0;
        vec3 abyss = u_color1;
        vec3 seafoam = u_color2;
        vec3 shimmer = u_color3;

        float t1 = smoothstep(-0.5, 0.5, elevation);
        vec3 color = mix(abyss, seafoam, t1);

        float foam = pow(max(elevation, 0.0), 2.5) * 2.0;
        color += shimmer * foam;

        float trough = max(-elevation - 0.2, 0.0);
        color = mix(color, deep, trough * 0.5);

        vec2 center = v_uv - 0.5;
        float vignette = 1.0 - dot(center, center) * 1.2;
        color *= vignette;
        color = mix(color * 0.6, color, v_uv.y);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const compileShader = (type: number, source: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vertexShaderSrc);
    const fs = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSrc);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uInt = gl.getUniformLocation(program, 'u_intensity');
    const c0 = gl.getUniformLocation(program, 'u_color0');
    const c1 = gl.getUniformLocation(program, 'u_color1');
    const c2 = gl.getUniformLocation(program, 'u_color2');
    const c3 = gl.getUniformLocation(program, 'u_color3');

    gl.uniform1f(uInt, intensity);
    gl.uniform3fv(c0, palette[0]);
    gl.uniform3fv(c1, palette[1]);
    gl.uniform3fv(c2, palette[2]);
    gl.uniform3fv(c3, palette[3]);

    let raf: number;
    const render = (time: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform1f(uTime, time * 0.001 * speed);
      gl.uniform2f(uRes, w, h);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => cancelAnimationFrame(raf);
  }, [colors, speed, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  );
}
