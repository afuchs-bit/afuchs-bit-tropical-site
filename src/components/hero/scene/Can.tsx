"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { MathUtils, type Group } from "three";
import { activeCan, canPresets } from "@/config/can";
import { getFlavor } from "@/content/flavors";
import type { SceneAssets } from "./assets";
import { createCanParts, disposeCanParts } from "./can/canGeometry";
import { FINISH, createCanMaterials, disposeCanMaterials } from "./can/canMaterials";
import { LUMA_CEILING } from "./lib/materialPatch";
import { scenePalette } from "./lib/palette";
import { pointer } from "./lib/pointer";
import { stage } from "./lib/stage";
import { view } from "./lib/viewport";

/**
 * The can (direction §4, §6, §7.4).
 *
 * Rest: tilted 9°, yaw ±14° and pitch ±5° after a fine pointer (damped,
 * frame-rate independent), breathing ±4° over 9 s; touch devices sway only.
 * Reveal: rises out of the light (−0.4 → 0 units, outExpo) while its
 * exposure falls from over-bright white to normal; the rim glow peaks at
 * T.rimPeak. Switch: a 180° turn; the next label is mixed in on the far half
 * only (see canMaterials), the finish moves between satin and condensation.
 */
const TILT = MathUtils.degToRad(-9);
const YAW = MathUtils.degToRad(14);
const PITCH = MathUtils.degToRad(5);
const BREATH = MathUtils.degToRad(4);
const SWAY = MathUtils.degToRad(7);
const BREATH_PERIOD = 9;
const FOLLOW = 3.2;
const RISE = 0.4;
/** Emissive white at full over-bright; the ceiling opens so it blooms. */
const OVER_BRIGHT = 5;

export function Can({ assets, segments }: { assets: SceneAssets; segments: number }) {
  const gl = useThree((s) => s.gl);
  const preset = canPresets[activeCan];
  const parts = useMemo(() => createCanParts(preset, segments), [preset, segments]);
  const materials = useMemo(
    () =>
      createCanMaterials(
        assets.labels[stage.to],
        assets.condensation,
        Math.min(8, gl.capabilities.getMaxAnisotropy()),
      ),
    [assets, gl],
  );
  useEffect(() => () => disposeCanParts(parts), [parts]);
  useEffect(() => () => disposeCanMaterials(materials), [materials]);

  const outer = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const follow = useRef({ yaw: 0, pitch: 0 });

  useFrame(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const dt = stage.dt;
    const t = stage.elapsed;

    // Pointer (fine pointers only), damped toward its target.
    const f = follow.current;
    let yawTarget = 0;
    let pitchTarget = 0;
    if (stage.motion && pointer.fine && pointer.inside) {
      yawTarget = MathUtils.clamp(((pointer.x - view.left) / view.width) * 2 - 1, -1, 1) * YAW;
      pitchTarget = MathUtils.clamp(((pointer.y - view.top) / view.height) * 2 - 1, -1, 1) * PITCH;
    }
    f.yaw = MathUtils.damp(f.yaw, yawTarget, FOLLOW, dt);
    f.pitch = MathUtils.damp(f.pitch, pitchTarget, FOLLOW, dt);

    const breathe = Math.sin((t / BREATH_PERIOD) * Math.PI * 2);
    const idle = pointer.fine ? BREATH * breathe : SWAY * breathe;

    // Each switch turns the can by half a revolution (reduced motion: never).
    const settled = stage.motion ? stage.switches - (stage.turn < 1 ? 1 : 0) : 0;
    const spin = Math.PI * (settled + (stage.turn < 1 ? stage.turn : 0));

    o.position.y = -RISE * (1 - stage.canRise);
    o.rotation.set(f.pitch + BREATH * 0.35 * Math.cos((t / BREATH_PERIOD) * Math.PI * 2), 0, TILT);
    i.rotation.y = spin + f.yaw + idle;

    // Labels: the old one faces the camera, the new one waits on the far half.
    const m = materials;
    const u = m.labelUniforms;
    const facing = settled % 2 === 0 ? 0.5 : 0;
    const incoming = stage.from !== stage.to && stage.motion ? (facing + 0.5) % 1 : facing;
    m.label.map = assets.labels[stage.from];
    u.uMapNew.value = assets.labels[stage.to];
    u.uOffOld.value = 0.5 - facing;
    u.uOffNew.value = 0.5 - incoming;
    u.uCenterNew.value = incoming;
    u.uHalf.value = stage.labelHalf;
    u.uFill.value = stage.labelFill;

    // Finish follows the light of the switch.
    const a = FINISH[getFlavor(stage.from).scene.canFinish];
    const b = FINISH[getFlavor(stage.to).scene.canFinish];
    const k = stage.colorMix;
    const lerp = (x: number, y: number) => x + (y - x) * k;
    m.label.roughness = lerp(a.labelRoughness, b.labelRoughness);
    m.label.clearcoat = lerp(a.clearcoat, b.clearcoat);
    m.label.clearcoatRoughness = lerp(a.clearcoatRoughness, b.clearcoatRoughness);
    m.label.clearcoatNormalScale.setScalar(lerp(a.droplets, b.droplets));
    m.label.sheen = Math.max(0.01, lerp(a.sheen, b.sheen));
    m.metal.roughness = lerp(a.metalRoughness, b.metalRoughness);
    m.metal.normalScale.setScalar(lerp(a.metalDroplets, b.metalDroplets));

    // Out of the light: over-bright white, opacity, the bloom ceiling opened.
    const over = stage.overBright;
    m.metal.emissiveIntensity = OVER_BRIGHT * over;
    m.label.emissiveIntensity = OVER_BRIGHT * over;
    m.ceiling.value = over > 0.001 ? LUMA_CEILING + 40 * over : LUMA_CEILING;
    m.metal.opacity = stage.canOpacity;
    m.label.opacity = stage.canOpacity;
    m.rim.opacity = stage.canOpacity;
    o.visible = stage.canOpacity > 0;

    const glow = scenePalette(stage.to).glow;
    m.rim.color.setRGB(glow[0] * stage.rim, glow[1] * stage.rim, glow[2] * stage.rim);
  });

  return (
    <group ref={outer}>
      <group ref={inner}>
        <mesh geometry={parts.body} material={materials.metal} />
        <mesh geometry={parts.label} material={materials.label} />
        <mesh geometry={parts.tab} material={materials.metal} />
        <mesh geometry={parts.rim} material={materials.rim} />
      </group>
    </group>
  );
}
