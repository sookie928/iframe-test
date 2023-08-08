import * as THREE from 'three'

export const createSphere = (camera: any) => {
  const sphereGeom = new THREE.SphereGeometry(0.1, 32, 16)

  // create custom material from the shader code above
  //   that is within specially labeled script tags
  const customMaterial = new THREE.ShaderMaterial({
    uniforms: {
      c: {type: 'f', value: 0.25},
      p: {type: 'f', value: 3.8},
      glowColor: {type: 'c', value: new THREE.Color(0xff0000)},
      viewVector: {type: 'v3', value: camera.position}
    } as any,
    vertexShader: `uniform vec3 viewVector;
    uniform float c;
    uniform float p;
    varying float intensity;
    void main()
    {
        vec3 vNormal = normalize( normalMatrix * normal *-1.0);
      vec3 vNormel = normalize( normalMatrix * viewVector );
      intensity = pow( c - dot(vNormal, vNormel), p );

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
    fragmentShader: `uniform vec3 glowColor;
    varying float intensity;
    void main()
    {
      vec3 glow = glowColor * intensity;
        gl_FragColor = vec4( glow, 1.0 );
    }`,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  })
  const mesh = new THREE.Mesh(sphereGeom, customMaterial)
  mesh.renderOrder = 0
  mesh.name = 'Marker'
  return mesh
}
