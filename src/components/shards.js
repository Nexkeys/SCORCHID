import * as THREE from 'three'

/**
 * Shard system: the "disassemble / reassemble" effect.
 *
 * shardGeometry() splits a geometry into independent triangles and tags every
 * vertex with its triangle's centroid (aCentroid) and a per-triangle random
 * vector (aRand). shardMaterial() patches a built-in three.js material so a
 * single uniform, uShards (0 = whole, 1 = fully scattered), flies each
 * triangle out along its own direction while it tumbles around its centroid.
 *
 * Everything happens in the vertex shader: no extra draw calls, no CPU work
 * per frame beyond writing one float per material.
 */

export function shardGeometry(source) {
  const geometry = source.index ? source.toNonIndexed() : source
  if (geometry !== source) source.dispose()

  const pos = geometry.attributes.position
  const count = pos.count
  const centroid = new Float32Array(count * 3)
  const rand = new Float32Array(count * 3)

  for (let i = 0; i < count; i += 3) {
    const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3
    const cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3
    const cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3
    const r1 = Math.random()
    const r2 = Math.random()
    const r3 = Math.random()
    for (let k = 0; k < 3; k += 1) {
      const o = (i + k) * 3
      centroid[o] = cx
      centroid[o + 1] = cy
      centroid[o + 2] = cz
      rand[o] = r1
      rand[o + 1] = r2
      rand[o + 2] = r3
    }
  }

  geometry.setAttribute('aCentroid', new THREE.BufferAttribute(centroid, 3))
  geometry.setAttribute('aRand', new THREE.BufferAttribute(rand, 3))
  return geometry
}

const SHARD_HEADER = /* glsl */ `
uniform float uShards;
attribute vec3 aCentroid;
attribute vec3 aRand;
vec3 shardRotate(vec3 v, vec3 axis, float a) {
  float s = sin(a);
  float c = cos(a);
  return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
}
`

// beginnormal_vertex runs before begin_vertex in every lit built-in shader,
// so the shared shard variables are declared here and reused below.
const SHARD_NORMAL = /* glsl */ `
#include <beginnormal_vertex>
float shardT = clamp(uShards * (0.55 + aRand.x * 0.9), 0.0, 1.0);
vec3 shardAxis = normalize(aRand * 2.0 - 1.0 + vec3(0.001));
float shardAngle = shardT * (2.0 + aRand.y * 6.0);
objectNormal = shardRotate(objectNormal, shardAxis, shardAngle);
`

const SHARD_VERTEX = /* glsl */ `
#include <begin_vertex>
vec3 shardLocal = shardRotate(transformed - aCentroid, shardAxis, shardAngle) * (1.0 - 0.4 * shardT);
vec3 shardDir = normalize(aCentroid + (aRand - 0.5) * 1.4 + vec3(0.0001));
transformed = aCentroid + shardLocal + shardDir * shardT * (1.6 + aRand.z * 2.4);
`

/**
 * Create a material of class Ctor (MeshStandardMaterial, MeshPhysicalMaterial,
 * ...) with the shard patch applied. The uniform lives on
 * material.userData.uShards so it is writable before the first compile.
 */
export function shardMaterial(Ctor, params) {
  const material = new Ctor(params)
  const uShards = { value: 0 }
  material.userData.uShards = uShards
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uShards = uShards
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${SHARD_HEADER}`)
      .replace('#include <beginnormal_vertex>', SHARD_NORMAL)
      .replace('#include <begin_vertex>', SHARD_VERTEX)
  }
  return material
}
