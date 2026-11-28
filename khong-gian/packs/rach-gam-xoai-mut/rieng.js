// Rạch Gầm – Xoài Mút 1785 · phần biên đạo riêng của trận (pack.json › script), chạy trên bộ máy sa bàn 1.1.
// Chỉ gồm lịch bắn của đại bác hai bờ, pháo thần công trên đại thuyền, đạn trúng thuyền Xiêm theo lời bình, nhà lá bị đốt
// và lửa khói trên thuyền cháy — gắn với chỉ số cảnh, tên nhóm quân của trận này. Mọi hàm hiệu ứng là của bộ máy (E).
// Chuyển nguyên văn từ hàm fxTick của sa bàn Rạch Gầm V2.0.
export default function (E) {
  const { THREE, fxAdd, fxBoom, fxKhaiHoa, fxCotNuoc, fxTrung, fxSplash, amShot, nvGround, NV_PHAO } = E;
  const _np = new THREE.Vector3();
  let last = "";
  return {
    fxTick(i, u, dt, u0) {
      const { S, appMode, playing, userCam, st, D, meta, EX, FX, NV, camera, controls } = E;
      if (!FX.pools.flash) return;
      const key = appMode + ":" + i; if (key !== last) { last = key; FX.cannonT = i === 6 ? 1.1 : 1; }
      const VP = S.voice && S.voice.phao, uP = VP ? VP[1] : 0.18, XT = NV.boatT && NV.boatT.xi_doan;
      const chay = appMode !== "film" || playing;
      // V1.4 · phát pháo lệnh: nổ ngay sau câu "Một tiếng pháo bất ngờ vang lên!", đúng khẩu pháo máy đang quay cận
      if (VP && i === VP[0] && u0 < uP && u >= uP && chay) { fxKhaiHoa(VP[2], VP[3], 0); fxBoom(VP[2], VP[3] - 3.2, true); FX.rung = Math.max(FX.rung || 0, 0.45); }
      // V1.4 · những phát đạn có lịch (quan.json → xi_doan.trung): rơi đúng lúc câu đọc nhắc tới, đúng thuyền máy đang quay
      const XG = FX.xi || (FX.xi = (NV.groups || []).find((q) => q.id === "xi_doan"));
      if (XG && XG.trung && XT && chay) { const a = i + u0, b = i + u; for (const e of XG.trung) { if (e[0] <= a) continue; if (e[0] > b) break; if (XT[e[1]]) fxTrung(XT[e[1]], e[1], e[2], e[3], e[4]); } }
      // thuyền Xiêm mà máy quay đang bám cận (nếu có): đạn bắn vu vơ sẽ dồn về quanh nó
      let focus = -1;
      if (appMode === "film" && !userCam) { const KK = S.scenes[i].keys || []; let c = KK[0]; for (const q of KK) if (q.t <= st) c = q; if (c && c.g === "xi_doan" && c.d < 130) focus = c.k || 0; }
      // đại bác hai bờ: im tới pháo lệnh C07, dồn dập C08–C10, thưa dần C11; nhịp nhanh hẳn ở những câu đọc nói về pháo
      const live = (i === 6 && u > uP + 0.02) || i === 7 || i === 8 || i === 9 || (i === 10 && u < 0.6);
      if (live && D.inst.usung.length) {
        FX.cannonT -= dt;
        if (FX.cannonT < 0) {
          let ga = i === 9 ? 0.5 : 1.2, gb = i === 9 ? 1.2 : 2.5;
          for (const q of (S.voice && S.voice.nhip) || []) if (q[0] === i && u >= q[1] && u <= q[2]) { ga = q[3]; gb = q[4] - q[3]; }
          FX.cannonT = ga + Math.random() * gb;
          const U = D.inst.usung, n = U.length / 5; let k = Math.floor(Math.random() * n) * 5;
          if (appMode === "film" && !userCam && Math.random() < 0.75) {     // máy đang quay một cụm pháo: phần lớn phát bắn nằm trong khung hình
            const cx = controls.target.x, cy = -controls.target.z, gan = [];
            for (let j = 0; j < n; j++) if (Math.hypot(U[j * 5] - cx, U[j * 5 + 1] - cy) < 300) gan.push(j * 5);
            if (gan.length) k = gan[Math.floor(Math.random() * gan.length)];
          }
          const X = U[k], Y = U[k + 1], yw = U[k + 3];
          fxKhaiHoa(X, Y, yw);
          let tx = X + (Math.random() - 0.5) * 300, ty = Y - 300 - Math.random() * 300, hit = null, quanh = false;
          if (XT && XT.length) {
            let kk = Math.floor(Math.random() * XT.length);
            if (focus >= 0 && Math.random() < 0.6) { kk = Math.max(0, Math.min(XT.length - 1, focus + Math.floor(Math.random() * 9) - 4)); quanh = true; }
            hit = XT[kk];
            if (hit && !hit.hide) { const a = Math.random() * 6.283, r = quanh ? 14 + Math.random() * 22 : 12 + Math.random() * 30; tx = hit.X + Math.cos(a) * r; ty = hit.Y + Math.sin(a) * r; }
          }
          setTimeout(() => {
            if (hit && !quanh && hit.sink < 0.5 && Math.random() < 0.3) fxBoom(hit.X, hit.Y, true);
            else { if (quanh) fxCotNuoc(tx, ty, 0.75); else fxSplash(tx, ty); if (quanh) { const d = camera.position.distanceTo(_np.set(tx, meta.water * EX, -ty)); if (d < 160) FX.rung = Math.max(FX.rung || 0, 0.2 * (1 - d / 160)); } }
          }, 600 + Math.random() * 600);
          const d = camera.position.distanceTo(_np.set(X, nvGround(X, Y), -Y));
          if (typeof amShot === "function" && d < 2500) amShot("daibac", 0.55 * Math.max(0.12, 1 - d / 2500));
        }
      }
      // V1.5 · pháo thần công hai sườn đại thuyền Tây Sơn bắn vào thuyền Xiêm ở gần (C08–C11)
      if (chay && i >= 7 && i <= 10 && XT && NV.kinds.bdt) {
        let cK = null; if (appMode === "film" && !userCam) for (const q of S.scenes[i].keys || []) if (q.t <= st) cK = q;
        const GG = NV.kinds.bdt, tm = FX.tc || (FX.tc = {}), now = performance.now() / 1000;
        for (const gid of ["ts_dai_rg", "ts_dai_cl"]) {
          const TB = NV.boatT[gid]; if (!TB) continue;
          TB.forEach((b, k) => {
            if (!b || b.hide) return;
            const key = gid + k, foc = cK && cK.g === gid && (cK.k || 0) === k;
            if (tm[key] === undefined || tm[key] > now + 8) tm[key] = now + Math.random() * (foc ? 0.6 : 4);
            if (now < tm[key]) return;
            tm[key] = now + (foc ? 0.9 + Math.random() * 1.1 : 3 + Math.random() * 4);
            let best = null, bd = 360, bk = -1;
            for (let j = 0; j < XT.length; j++) { const x = XT[j]; if (!x || x.hide || x.sink > 0.6) continue; const d = Math.hypot(x.X - b.X, x.Y - b.Y); if (d < bd) { bd = d; best = x; bk = j; } }
            if (!best) return;
            const cs = Math.cos(b.yaw), sn = Math.sin(b.yaw), sd = (best.X - b.X) * cs + (best.Y - b.Y) * sn >= 0 ? 1 : -1;
            const a = NV_PHAO[Math.floor(Math.random() * 3)] * (GG.dai || 18), R = (GG.rong || 8.8) / 2 + 1.5;
            const X = b.X + sn * a + cs * sd * R, Y = b.Y - cs * a + sn * sd * R;
            fxKhaiHoa(X, Y, b.yaw + sd * Math.PI / 2, b.y + (GG.deck || 2.6) * EX + 0.55);
            const dc = camera.position.distanceTo(_np.set(X, b.y, -Y));
            if (dc < 1800) amShot("daibac", 0.5 * Math.max(0.12, 1 - dc / 1800));
            if (foc && dc < 300) FX.rung = Math.max(FX.rung || 0, 0.22);
            const tgt = best, tk = bk;
            setTimeout(() => { if (Math.random() < 0.35) fxTrung(tgt, tk, 1, 0, 0); else { const an = Math.random() * 6.283, r = 8 + Math.random() * 16; fxCotNuoc(tgt.X + Math.cos(an) * r, tgt.Y + Math.sin(an) * r, 0.7); } }, 300 + bd * 1.2);
          });
        }
      }
      // V1.5 · nhà lá bị đốt khi quân Xiêm vào cướp làng (quan.json → lua: [x, y, cảnh, u bắt đầu, độ lớn])
      if (NV.lua && NV.lua.length) {
        FX.emitL = (FX.emitL || 0) + dt;
        while (FX.emitL > 0.07) {
          FX.emitL -= 0.07;
          for (const [hx, hy, si, u0, k] of NV.lua) {
            if (si !== i || u < u0) continue;
            const dc = camera.position.distanceTo(_np.set(hx, camera.position.y, -hy)); if (dc > 2500) continue;
            const gy = nvGround(hx, hy) + 2, n = Math.max(1, Math.round((dc < 300 ? 4 : 1.5) * k));
            for (let r = 0; r < n; r++) fxAdd("lua", hx + (Math.random() - 0.5) * 8, gy + Math.random() * 3, -(hy + (Math.random() - 0.5) * 8), (Math.random() - 0.5) * 0.5, 2.5 + Math.random() * 2.5, (Math.random() - 0.5) * 0.5, 0.7 + Math.random() * 0.6, 1, 0.5 + Math.random() * 0.25, 0.15, 0.9);
            if (Math.random() < 0.22 * k) fxAdd("khoiCot", hx + (Math.random() - 0.5) * 4, gy + 4, -hy, 0.6 + Math.random() * 0.6, 3.5 + Math.random() * 2, (Math.random() - 0.5) * 0.6, 12 + Math.random() * 6, 0.16, 0.14, 0.13, 0.55);
          }
        }
      }
      // thuyền cháy: lửa + cột khói đen (V1.4: từ C07, theo lịch cháy của từng thuyền)
      FX.emit += dt;
      while (FX.emit > 0.06) {
        FX.emit -= 0.06;
        if (!XT || i < 6 || i > 11) break;
        let soChay = 0; for (const b of XT) if (b.fire && b.sink <= 0.82) soChay++;
        const pKhoi = 0.18 * Math.min(1, 16 / Math.max(1, soChay)), thua = soChay > 34;   // chia đều ngân sách khói cho mọi thuyền đang cháy
        for (const b of XT) {
          if (!b.fire || b.hide || b.sink > 0.82) continue;
          const dc = camera.position.distanceTo(_np.set(b.X, b.y, -b.Y)); if (dc > 6000) continue;
          const fy = b.y + 3 + (b.sink ? 2.5 * b.sink : 0), gan = dc < 240, sn = Math.sin(b.yaw), cs = Math.cos(b.yaw);
          for (let r = 0; r < (gan ? 5 : thua ? 1 : 2); r++) {
            const al = (Math.random() - 0.5) * (gan ? 15 : 8), lt = (Math.random() - 0.5) * (gan ? 5 : 8), cao = gan && Math.random() < 0.35 ? 2 + Math.random() * 9 : 0;   // gần máy: lửa bám dọc thân và leo lên buồm
            fxAdd("lua", b.X + sn * al + cs * lt, fy + cao, -(b.Y - cs * al + sn * lt), (Math.random() - 0.5) * 0.6, 3 + Math.random() * 3, (Math.random() - 0.5) * 0.6, 0.8 + Math.random() * 0.6, 1, 0.5 + Math.random() * 0.25, 0.15, 0.9);
          }
          if (Math.random() < (gan ? 0.3 : pKhoi)) fxAdd("khoiCot", b.X + (Math.random() - 0.5) * 4, fy + 6, -b.Y + (Math.random() - 0.5) * 4, 0.8 + Math.random() * 0.8, 4 + Math.random() * 2, (Math.random() - 0.5) * 0.8, 14 + Math.random() * 6, 0.16, 0.14, 0.13, 0.55);
        }
      }
    },
  };
}
