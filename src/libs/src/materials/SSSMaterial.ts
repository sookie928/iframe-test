import {MeshStandardMaterial, ShaderLib, Vector2} from 'three'

import {extendMaterial} from './ExtendMaterial.module'

const getIce = (opt: any) => {
  const uniforms = Object.assign({}, ShaderLib.standard.uniforms, opt)
  const {
    alphaMap,
    ambientLightColor,
    aoMap,
    aoMapIntensity,
    bumpMap,
    bumpScale,
    diffuse,
    directionalLightShadows,
    directionalLights,
    directionalShadowMap,
    directionalShadowMatrix,
    displacementBias,
    displacementMap,
    displacementScale,
    emissive,
    emissiveMap,
    envMap,
    envMapIntensity,
    flipEnvMap,
    fogColor,
    fogDensity,
    fogFar,
    fogNear,
    hemisphereLights,
    ior,
    lightMap,
    lightMapIntensity,
    lightProbe,
    ltc_1,
    ltc_2,
    map,
    metalness,
    metalnessMap,
    normalMap,
    normalScale,
    opacity,
    pointLightShadows,
    pointLights,
    pointShadowMap,
    pointShadowMatrix,
    rectAreaLights,
    reflectivity,
    refractionRatio,
    roughness,
    roughnessMap,
    shininess,
    specular,
    specularMap,
    spotLightShadows,
    spotLights,
    spotShadowMap,
    spotShadowMatrix,
    thicknessAmbient,
    thicknessAttenuation,
    thicknessColor,
    thicknessDistortion,
    thicknessMap,
    thicknessPower,
    thicknessScale,
    uv2Transform,
    uvTransform
  } = uniforms

  return extendMaterial(MeshStandardMaterial, {
    // vertexShader: THREE.ShaderChunk.meshphysical_vert,
    fragment: {
      '#define STANDARD': `#define USE_TRANSLUCENCY
      #ifdef USE_TRANSLUCENCY
        uniform sampler2D thicknessMap;
        uniform float thicknessPower;
        uniform float thicknessScale;
        uniform float thicknessDistortion;
        uniform float thicknessAttenuation;
        uniform float thicknessAmbient;
        uniform vec2 thicknessRepeat;
        uniform vec3 thicknessColor;
      #endif
      `,
      '#include <clipping_planes_pars_fragment>': `float punctualLightIntensityToIrradianceFactor( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {

        if( decayExponent > 0.0 ) {

    #if defined ( PHYSICALLY_CORRECT_LIGHTS )

          // based upon Frostbite 3 Moving to Physically-based Rendering
          // page 32, equation 26: E[window1]
          // http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr_v2.pdf
          // this is intended to be used on spot and point lights who are represented as luminous intensity
          // but who must be converted to luminous irradiance for surface lighting calculation
          float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
          float maxDistanceCutoffFactor = pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
          return distanceFalloff * maxDistanceCutoffFactor;

    #else

          return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );

    #endif

        }

        return 1.0;
    }

    vec3 BRDF_Diffuse_Lambert( const in vec3 diffuseColor ) {

      return RECIPROCAL_PI * diffuseColor;

    } `,
      'varying vec3 vViewPosition;': 'uniform float envMapIntensity;',
      '#include <lights_fragment_end>': `
      #ifdef USE_TRANSLUCENCY
        vec3 thickness = thicknessColor * texture2D(thicknessMap, vUv * thicknessRepeat).r;
        vec3 N = geometry.normal;
        vec3 V = normalize(geometry.viewDir);
        float thicknessCutoff = 0.75;
        float thicknessDecay = 1.0;

        #if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )

          for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

            pointLight = pointLights[ i ];

            vec3 vLightDir = pointLight.position - geometry.position;
            vec3 L = normalize(vLightDir);

            float lightDist = length(vLightDir);
            // float lightAtten = punctualLightIntensityToIrradianceFactor(lightDist, pointLight.distance, pointLight.decay);
            float lightAtten = thicknessAttenuation;

            vec3 LTLight = normalize(L + (N * thicknessDistortion));
            float LTDot = pow(saturate(dot(V, -LTLight)), thicknessPower) * thicknessScale;
            vec3 LT = lightAtten * (LTDot + thicknessAmbient) * thickness;
            reflectedLight.directDiffuse += material.diffuseColor * pointLight.color * LT;
          }

        #endif

        #if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )

          for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {

            rectAreaLight = rectAreaLights[ i ];

            vec3 vLightDir = rectAreaLight.position - geometry.position;
            vec3 L = normalize(vLightDir);

            float lightDist = length(vLightDir);
            // float lightAtten = punctualLightIntensityToIrradianceFactor(lightDist, thicknessCutoff, thicknessDecay);
            float lightAtten = thicknessAttenuation;

            vec3 LTLight = normalize(L + (N * thicknessDistortion));
            float LTDot = pow(saturate(dot(V, -LTLight)), thicknessPower) * thicknessScale;
            vec3 LT = lightAtten * (LTDot + thicknessAmbient) * thickness;
            reflectedLight.directDiffuse += material.diffuseColor * rectAreaLight.color * LT;
          }

        #endif
      #endif
    `
    },
    defines: {
      STANDARD: ''
    },
    lights: true,
    extensions: {
      derivatives: true
    },
    // lights: true,
    uniforms: {
      alphaMap,
      // alphaTest,
      ambientLightColor,
      aoMap,
      aoMapIntensity,
      bumpMap,
      bumpScale,
      diffuse,
      directionalLightShadows,
      directionalLights,
      directionalShadowMap,
      directionalShadowMatrix,
      displacementBias,
      displacementMap,
      displacementScale,
      emissive,
      emissiveMap,
      envMap,
      envMapIntensity,
      flipEnvMap,
      fogColor,
      fogDensity,
      fogFar,
      fogNear,
      hemisphereLights,
      ior,
      lightMap,
      lightMapIntensity,
      lightProbe,
      ltc_1,
      ltc_2,
      map,
      metalness,
      metalnessMap,
      normalMap,
      normalScale,
      opacity,
      pointLightShadows,
      pointLights,
      pointShadowMap,
      pointShadowMatrix,
      rectAreaLights,
      reflectivity,
      refractionRatio,
      roughness,
      roughnessMap,
      shininess,
      specular,
      specularMap,
      spotLightShadows,
      spotLights,
      spotShadowMap,
      spotShadowMatrix,
      thicknessAmbient,
      thicknessAttenuation,
      thicknessColor,
      thicknessDistortion,
      thicknessMap,
      thicknessPower,
      thicknessScale,
      uv2Transform,
      uvTransform,
      thicknessRepeat: {type: 'v3', value: new Vector2(1, 1)}
    }
  })
  //  return new THREE.MeshStandardMaterial();
}

export {getIce}
