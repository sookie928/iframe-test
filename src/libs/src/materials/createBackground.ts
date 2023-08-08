import * as THREE from 'three';

function createBackground(opt: any) {
  const geometry = new THREE.PlaneGeometry(2, 2, 1);
  const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    depthTest: false,
    uniforms: {
      color1: { type: 'c', value: new THREE.Color().setHex(opt.color1, THREE.LinearSRGBColorSpace) },
      color2: { type: 'c', value: new THREE.Color().setHex(opt.color2, THREE.LinearSRGBColorSpace) },
      aspectCorrection: { type: 'i', value: opt.aspectCorrection },
      aspect: { type: 'f', value: opt.aspect },
      offset: {
        type: 'v2',
        value: new THREE.Vector2(...opt.offset),
      },
      scale: { type: 'v2', value: new THREE.Vector2(...opt.scale) },
      smoother: { type: 'v2', value: new THREE.Vector2(...opt.smoother) },
    } as any,
    vertexShader: `varying vec2 vUv;
				void main(){
					vUv = vec2(position.x, position.y) * 0.5 + 0.5;
					gl_Position = vec4(position, 1.0);
				}`,
    fragmentShader: `varying vec2 vUv;
				uniform vec3 color1;
				uniform vec3 color2;
				uniform bool aspectCorrection;
				uniform float aspect;
				uniform vec2 offset;
				uniform vec2 scale;
				uniform vec2 smoother;
				void main(){
					vec2 q = vec2(vUv - 0.5);
					if (aspectCorrection) {
						q.x *= aspect;
					}
					q /= scale;
					q -= offset;
					float dst = length(q);
					dst = smoothstep(smoother.x, smoother.y, dst);
					gl_FragColor.rgb = mix(color1, color2, dst);
					gl_FragColor.a = 1.0;
				}`,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'background';
  mesh.frustumCulled = false;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return mesh;
}

export { createBackground };
