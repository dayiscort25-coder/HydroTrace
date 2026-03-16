// HMDS v3.4 - Calculation Engine (ported from Python)
// All math functions exactly matching the Python reference

const DM = {
  Pb: { LW:55.2, ML:62.0, LE:18.5, Ler:15.3, Bmax:120, kb:0.40, kw:0.15, n:1.2 },
  Zn: { LW:70.1, ML:48.0, LE:25.3, Ler:28.1, Bmax:350, kb:0.50, kw:0.18, n:1.1 },
  Cu: { LW:58.4, ML:55.0, LE:20.8, Ler:19.6, Bmax:85,  kb:0.35, kw:0.14, n:1.3 },
  Cr: { LW:45.6, ML:42.0, LE:12.4, Ler:10.8, Bmax:45,  kb:0.30, kw:0.12, n:1.0 },
  Ni: { LW:52.3, ML:50.0, LE:22.1, Ler:20.5, Bmax:55,  kb:0.38, kw:0.13, n:1.1 },
  Cd: { LW:68.7, ML:65.0, LE:30.2, Ler:25.4, Bmax:8,   kb:0.45, kw:0.20, n:1.4 },
  Fe: { LW:40.2, ML:38.0, LE:8.5,  Ler:12.3, Bmax:800, kb:0.25, kw:0.10, n:0.9 },
  Mn: { LW:63.8, ML:56.0, LE:21.7, Ler:22.7, Bmax:200, kb:0.42, kw:0.16, n:1.2 },
  Co: { LW:48.5, ML:44.0, LE:15.6, Ler:14.2, Bmax:25,  kb:0.32, kw:0.11, n:1.0 },
  Ba: { LW:42.8, ML:40.0, LE:10.2, Ler:18.9, Bmax:150, kb:0.28, kw:0.09, n:0.8 },
};

const SM = { 'Asfalto': 0.85, 'Concreto': 0.80, 'Adoquín': 0.60, 'Sup. mixta': 0.70 };

const METAL_COLORS = {
  Pb: '#EF4444', Zn: '#3B82F6', Cu: '#10B981', Cr: '#F59E0B', Ni: '#8B5CF6',
  Cd: '#06B6D4', Fe: '#F97316', Mn: '#6B7280', Co: '#14B8A6', Ba: '#EC4899',
};

function calcTLW(LW, ML, LE, Ler) {
  const T1 = (LW * ML) / 100;
  const T2 = LE * (1 - LW / 100) * (ML / 100);
  const T3 = Ler * (1 - ML / 100);
  const TLW = T1 + T2 + T3;
  return { T1, T2, T3, TLW,
    p1: TLW > 0 ? (T1/TLW)*100 : 0,
    p2: TLW > 0 ? (T2/TLW)*100 : 0,
    p3: TLW > 0 ? (T3/TLW)*100 : 0 };
}

function buildUp(Bmax, kb, t) {
  return Bmax * (1 - Math.exp(-kb * t));
}

function buildUpFrom(Bprev, Bmax, kb, dt) {
  return Bprev + (Bmax - Bprev) * (1 - Math.exp(-kb * dt));
}

function washoffInst(B, kw, I, n) {
  return B * (1 - Math.exp(-kw * Math.pow(I, n)));
}

function washoffDynamic(B0, kw, n, timeArray, intensityArray) {
  const N = timeArray.length;
  const Brem = new Array(N).fill(0);
  const Wrate = new Array(N).fill(0);
  const Wcum = new Array(N).fill(0);
  Brem[0] = B0;
  for (let i = 1; i < N; i++) {
    const dt = timeArray[i] - timeArray[i-1];
    const dW = Brem[i-1] * (1 - Math.exp(-kw * Math.pow(intensityArray[i], n) * dt));
    Wrate[i] = dt > 0 ? dW / dt : 0;
    Wcum[i] = Wcum[i-1] + dW;
    Brem[i] = Brem[i-1] - dW;
  }
  return { Brem, Wrate, Wcum };
}

function hydro(C, I, A, duration, slope, L) {
  const Qp = (C * I * A) / 3.6e6;
  const Vt = C * (I / 1000) * A * duration;
  const tc = L > 0 ? 0.0195 * Math.pow(L, 0.77) * Math.pow(Math.max(slope, 1e-4), -0.385) : 0;
  return { Qp, Vt, tc };
}

function intensitySeries(Ip, duration, dt = 0.02, pattern = 'variable') {
  const t = []; const I = [];
  for (let ti = 0; ti <= duration; ti += dt) { t.push(ti); }
  const tp = 0.4 * duration;
  for (const ti of t) {
    if (pattern === 'constant') I.push(Ip);
    else I.push(ti <= tp ? Ip * ti / tp : Ip * Math.max(1 - (ti - tp) / (duration - tp), 0));
  }
  return { t, I };
}

window.HydroEngine = { DM, SM, METAL_COLORS, calcTLW, buildUp, buildUpFrom, washoffInst, washoffDynamic, hydro, intensitySeries };
