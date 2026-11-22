// ------------------------------------------------------------------ V10.4: mặt trời theo giờ trong cảnh
// Hướng mặt trời: cảnh tối dần → chiều, lặn phía tây; cảnh sáng dần (tờ mờ → rạng đông) → mọc phía đông; còn lại ban ngày cao phía nam.
// Độ cao mặt trời đi theo độ tối (nightCur): trời càng tối mặt trời càng thấp, quá ~0,6 là đã xuống dưới chân trời.
const TROI = { dir: new THREE.Vector3(), warm: new THREE.Color(1.0, 0.56, 0.3), hz: new THREE.Color(0.9, 0.6, 0.45), c: new THREE.Color() };
function troiHuong() {
  if (!S) return 0;
  const sc = S.scenes[appMode === "explore" ? exploreI : cur]; if (!sc) return 0;
  if (sc.troi !== undefined) return sc.troi;
  const N = sc.nights; if (!N) return (sc.night || 0) > 0.3 ? 1 : 0;
  const a = N[0][1], b = N[N.length - 1][1];
  return b < a - 0.05 ? 1 : b > a + 0.05 ? -1 : a > 0.3 ? 1 : 0;
}
function troiApply(n) {
  if (typeof S === "undefined") return;
  const h = troiHuong(), D = THREE.MathUtils.degToRad;
  const el = D(52 - 66 * Math.min(1, n / 0.78)), az = D(h === 1 ? 105 : h === -1 ? 255 : 160);
  TROI.dir.set(Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az));
  skyU.uSunDir.value.copy(TROI.dir); sun.position.copy(TROI.dir).multiplyScalar(8000);
  const up = THREE.MathUtils.smoothstep(el, -0.2, 0.03), low = up * (1 - THREE.MathUtils.smoothstep(el, 0.05, 0.45));
  sun.color.lerp(TROI.warm, low * 0.85);
  sun.intensity *= 0.6 + 0.4 * THREE.MathUtils.smoothstep(el, -0.05, 0.35) + 0.25 * low;
  scene.fog.color.lerp(TROI.hz, low * 0.4 * (1 - 0.5 * n)); scene.background.copy(scene.fog.color);
  TROI.c.copy(TROI.hz).lerp(scene.fog.color, 0.4); TROI.c.getRGB(_rgb, THREE.SRGBColorSpace);
  skyU.uHor.value.lerp(new THREE.Vector3(_rgb.r, _rgb.g, _rgb.b), low * 0.35);
}
window.__troi = () => [nightCur, TROI.dir.toArray().map((v) => +v.toFixed(3)), troiHuong(), sun.intensity, scene.fog.color.getHexString()];
