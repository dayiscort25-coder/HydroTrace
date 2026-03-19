// SingleSimulation Component - Duration in hours, TLW renamed, Supabase save, state persistence
function SingleSimulation({ preloadedParams, savedState, onSaveState }) {
  var h = React.createElement;
  var RC = window.Recharts || {};
  var LineChart = RC.LineChart; var Line = RC.Line; var BarChart = RC.BarChart; var Bar = RC.Bar;
  var AreaChart = RC.AreaChart; var Area = RC.Area; var ComposedChart = RC.ComposedChart;
  var XAxis = RC.XAxis; var YAxis = RC.YAxis; var CartesianGrid = RC.CartesianGrid;
  var Tooltip = RC.Tooltip; var Legend = RC.Legend; var ResponsiveContainer = RC.ResponsiveContainer;
  var PieChart = RC.PieChart; var Pie = RC.Pie; var Cell = RC.Cell;
  var E = window.HydroEngine;

  var init = savedState || {};
  var _s = React.useState;
  var _area = _s(init.area || '5000'), area = _area[0], setArea = _area[1];
  var _len = _s(init.length || '100'), length = _len[0], setLength = _len[1];
  var _wid = _s(init.width || '25'), width = _wid[0], setWidth = _wid[1];
  var _mat = _s(init.material || 'Asfalto'), material = _mat[0], setMaterial = _mat[1];
  var _coef = _s(init.coefC || '0.85'), coefC = _coef[0], setCoefC = _coef[1];
  var _hm = _s(init.hydroMode || 'intensity'), hydroMode = _hm[0], setHydroMode = _hm[1];
  var _iv = _s(preloadedParams?.intensity ? String(preloadedParams.intensity) : (init.intensityVal || '35.5')), intensityVal = _iv[0], setIntensityVal = _iv[1];
  var _pv = _s(init.precipVal || '30'), precipVal = _pv[0], setPrecipVal = _pv[1];
  var _dur = _s(preloadedParams?.duration ? String(preloadedParams.duration) : (init.duration || '1')), duration = _dur[0], setDuration = _dur[1];
  var _sl = _s(init.slope || '2.5'), slope = _sl[0], setSlope = _sl[1];
  var _dd = _s(preloadedParams?.dryDays ? String(preloadedParams.dryDays) : (init.dryDays || '5')), dryDays = _dd[0], setDryDays = _dd[1];
  var _pat = _s(init.pattern || 'variable'), pattern = _pat[0], setPattern = _pat[1];
  var _res = _s(init.results || null), results = _res[0], setResults = _res[1];
  var _run = _s(false), running = _run[0], setRunning = _run[1];
  var _pt = _s('Mn\t63.8\t56\t21.7\t22.7'), pasteText = _pt[0], setPasteText = _pt[1];
  var _pm = _s(''), pasteMsg = _pm[0], setPasteMsg = _pm[1];
  var _sn = _s(init.simName || ''), simName = _sn[0], setSimName = _sn[1];
  var _sm = _s(''), saveMsg = _sm[0], setSaveMsg = _sm[1];
  var _addr = _s(init.address || ''), eventAddress = _addr[0], setEventAddress = _addr[1];

  var defaultMetals = Object.entries(E.DM).map(function (e) { return { name: e[0], LW: String(e[1].LW), ML: String(e[1].ML), LE: String(e[1].LE), Ler: String(e[1].Ler), Bmax: String(e[1].Bmax), kb: String(e[1].kb), kw: String(e[1].kw), n: String(e[1].n), active: true }; });
  var _met = _s(init.metals || defaultMetals), metals = _met[0], setMetals = _met[1];

  // Save state when navigating away
  React.useEffect(function () {
    return function () {
      if (onSaveState) onSaveState({ area: area, length: length, width: width, material: material, coefC: coefC, hydroMode: hydroMode, intensityVal: intensityVal, precipVal: precipVal, duration: duration, slope: slope, dryDays: dryDays, pattern: pattern, metals: metals, results: results, simName: simName, address: eventAddress });
    };
  }, [area, length, width, material, coefC, hydroMode, intensityVal, precipVal, duration, slope, dryDays, pattern, metals, results, simName, eventAddress]);

  React.useEffect(function () {
    if (preloadedParams) {
      if (preloadedParams.intensity) setIntensityVal(String(preloadedParams.intensity));
      if (preloadedParams.duration) setDuration(String(preloadedParams.duration));
      if (preloadedParams.dryDays) setDryDays(String(preloadedParams.dryDays));
    }
  }, []);

  var handleMaterialChange = function (mat) { setMaterial(mat); setCoefC(String(E.SM[mat])); };
  var updateMetal = function (idx, field, value) { var u = metals.slice(); if (field === 'active') u[idx] = Object.assign({}, u[idx], { active: value }); else { var o = {}; o[field] = value; u[idx] = Object.assign({}, u[idx], o); } setMetals(u); };
  var resetMetals = function () { setMetals(defaultMetals); };

  // Parse pasted text
  var handlePasteData = function () {
    try {
      var lines = pasteText.trim().split('\n').filter(function (l) { return l.trim(); });
      if (!lines.length) { setPasteMsg('Sin datos'); return; }
      var colNames = ['Metal', 'LW', 'ML', 'LE', 'Ler', 'Bmax', 'kb', 'kw', 'n'];
      var count = 0;
      var updated = metals.slice();
      lines.forEach(function (line) {
        var sep = line.indexOf('\t') >= 0 ? '\t' : (line.indexOf(',') >= 0 ? ',' : (line.indexOf(';') >= 0 ? ';' : null));
        var parts = sep ? line.split(sep).map(function (s) { return s.trim(); }) : line.split(/\s+/);
        if (parts.length < 2) return;
        var metalName = parts[0];
        var idx = updated.findIndex(function (m) { return m.name === metalName; });
        if (idx < 0) return;
        for (var i = 1; i < parts.length && i < colNames.length; i++) {
          var val = parts[i].replace(',', '.').trim();
          if (val === '-' || val === '--' || val === '' || val === 'NA') continue;
          var num = parseFloat(val);
          if (!isNaN(num)) { var o = {}; o[colNames[i]] = String(num); updated[idx] = Object.assign({}, updated[idx], o); }
        }
        updated[idx] = Object.assign({}, updated[idx], { active: true });
        count++;
      });
      setMetals(updated);
      setPasteMsg(count + ' metales cargados');
    } catch (e) { setPasteMsg('Error: ' + e.message); }
  };

  var runSimulation = function () {
    setRunning(true);
    setTimeout(function () {
      try {
        var A = parseFloat(area) || 5000;
        var Lc = Math.sqrt(A);
        var C = parseFloat(coefC) || 0.85;
        var durH = parseFloat(duration) || 1;
        var Ip = hydroMode === 'intensity' ? (parseFloat(intensityVal) || 30) : ((parseFloat(precipVal) || 30) / durH);
        var slopeD = (parseFloat(slope) || 2) / 100;
        var dd = parseFloat(dryDays) || 5;
        var pat = pattern;
        var activeMetals = metals.filter(function (m) { return m.active; });
        if (activeMetals.length === 0) { setRunning(false); return; }

        var hr = E.hydro(C, Ip, A, durH, slopeD, Lc);
        var ser = E.intensitySeries(Ip, durH, 0.02, pat);
        var step = Math.max(1, Math.floor(ser.t.length / 300));
        var idx = []; for (var i = 0; i < ser.t.length; i += step) idx.push(i);

        var tlw = {}, B0 = {}, wd = {}, imp = {};
        activeMetals.forEach(function (m) {
          var p = { LW: parseFloat(m.LW) || 0, ML: parseFloat(m.ML) || 0, LE: parseFloat(m.LE) || 0, Ler: parseFloat(m.Ler) || 0, Bmax: parseFloat(m.Bmax) || 0, kb: parseFloat(m.kb) || 0, kw: parseFloat(m.kw) || 0, n: parseFloat(m.n) || 1 };
          tlw[m.name] = E.calcTLW(p.LW, p.ML, p.LE, p.Ler);
          B0[m.name] = E.buildUp(p.Bmax, p.kb, dd);
          var w = E.washoffDynamic(B0[m.name], p.kw, p.n, ser.t, ser.I);
          wd[m.name] = { Brem: w.Brem, Wrate: w.Wrate, Wcum: w.Wcum, total: w.Wcum[w.Wcum.length - 1], eff: B0[m.name] > 0 ? w.Wcum[w.Wcum.length - 1] / B0[m.name] * 100 : 0 };
          var VL = hr.Vt * 1000;
          imp[m.name] = { load_mg: (tlw[m.name].TLW / 100) * B0[m.name] * A, conc: VL > 0 ? (tlw[m.name].TLW / 100) * B0[m.name] * A / VL : 0 };
        });

        var ms = activeMetals.map(function (m) { return m.name; });
        var dm = ms.reduce(function (a, b) { return tlw[a].TLW > tlw[b].TLW ? a : b; });
        var ts_s = ms.reduce(function (s, m) { return s + tlw[m].T1; }, 0);
        var td_s = ms.reduce(function (s, m) { return s + tlw[m].T2 + tlw[m].T3; }, 0);
        var fraccion = ts_s > td_s ? 'Sólida' : 'Disuelta';
        var riesgo = tlw[dm].TLW > 60 ? 'ALTO' : (tlw[dm].TLW > 30 ? 'MEDIO' : 'BAJO');

        // Build chart data
        var washData = idx.map(function (i) { var pt = { time: +(ser.t[i] * 60).toFixed(1) }; ms.forEach(function (m) { pt[m] = +wd[m].Brem[i].toFixed(4); }); return pt; });
        var rateData = idx.map(function (i) { var pt = { time: +(ser.t[i] * 60).toFixed(1) }; ms.forEach(function (m) { pt[m] = +wd[m].Wrate[i].toFixed(4); }); return pt; });
        var cumData = idx.map(function (i) { var pt = { time: +(ser.t[i] * 60).toFixed(1) }; ms.forEach(function (m) { pt[m] = +wd[m].Wcum[i].toFixed(4); }); return pt; });
        var hietoData = idx.map(function (i) { return { time: +(ser.t[i] * 60).toFixed(1), I: +ser.I[i].toFixed(2) }; });

        // Hydro data
        var Qa = idx.map(function (i) { return { time: +(ser.t[i] * 60).toFixed(1), Q: +(C * (ser.I[i] / 1000) * A / 3600 * 1000).toFixed(4) }; });

        // Build-up curve data
        var dmax = Math.max(30, dd * 2.5);
        var buData = [];
        for (var d2 = 0; d2 <= dmax; d2 += dmax / 100) {
          var pt = { day: +d2.toFixed(1) };
          activeMetals.forEach(function (m) {
            var p = { Bmax: parseFloat(m.Bmax) || 0, kb: parseFloat(m.kb) || 0 };
            pt[m.name] = +E.buildUp(p.Bmax, p.kb, d2).toFixed(2);
          });
          buData.push(pt);
        }

        // TLW bar data
        var tlwBarData = ms.map(function (m) { return { name: m, T1: +tlw[m].T1.toFixed(3), T2: +tlw[m].T2.toFixed(3), T3: +tlw[m].T3.toFixed(3), TLW: +tlw[m].TLW.toFixed(3) }; });

        // Impact bar data
        var impBar = ms.map(function (m) { return { name: m, load: +imp[m].load_mg.toFixed(2), fill: E.METAL_COLORS[m] || '#6B7280' }; });

        // Solid vs dissolved pie
        var pieData = [{ name: 'Sólida', value: +ts_s.toFixed(2) }, { name: 'Disuelta', value: +td_s.toFixed(2) }];

        setResults({
          Qp: hr.Qp, Vt: hr.Vt, tc: hr.tc, A: A, Ip: Ip, slopeD: slopeD, dd: dd, durH: durH, C: C, Lc: Lc,
          tlw: tlw, B0: B0, wd: wd, imp: imp, dm: dm, fraccion: fraccion, riesgo: riesgo, ms: ms, activeMetals: activeMetals,
          washData: washData, rateData: rateData, cumData: cumData, hietoData: hietoData, Qa: Qa, buData: buData, tlwBarData: tlwBarData, impBar: impBar, pieData: pieData
        });
      } catch (e) { console.error(e); }
      setRunning(false);
    }, 600);
  };

  var numInput = function (label, value, onChange, placeholder) {
    return h('div', null,
      h('label', { className: 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1' }, label),
      h('input', { type: 'text', inputMode: 'decimal', value: value, onChange: function (e) { onChange(e.target.value); }, placeholder: placeholder || '', className: 'w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none' })
    );
  };

  var metalInput = function (value, onChange) {
    return h('input', { type: 'text', inputMode: 'decimal', value: value, onChange: function (e) { onChange(e.target.value); }, className: 'w-full h-7 px-1 text-center text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-300 focus:outline-none' });
  };

  var MC = E.METAL_COLORS;

  return h('div', { className: 'flex-1 overflow-y-auto bg-[#F7F9FC]' },
    // Header
    h('div', { className: 'bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20' },
      h('div', null,
        h('h1', { className: 'text-2xl font-bold text-slate-900' }, 'Simulación Evento Único'),
        h('p', { className: 'text-sm text-slate-500' }, 'Defina los parámetros geométricos, hidrológicos y químicos para el estudio de escorrentía.')
      ),
      h('button', { onClick: runSimulation, disabled: running, className: 'bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg transition-colors disabled:opacity-50' }, running ? 'Calculando...' : 'Ejecutar simulación')
    ),

    h('div', { className: 'p-6 space-y-6' },
      // Simulation Title + Address
      h('div', { className: 'bg-white rounded-xl border border-slate-200 p-4 space-y-3' },
        h('div', { className: 'flex items-center gap-4' },
          h('div', { className: 'w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0' }, '📝'),
          h('div', { className: 'flex-1' },
            h('label', { className: 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1' }, 'Título de la simulación'),
            h('input', {
              type: 'text', value: simName, onChange: function(e) { setSimName(e.target.value); },
              placeholder: 'Ej: Estudio Calle 26 — Campaña Octubre 2025',
              className: 'w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none'
            })
          )
        ),
        h('div', { className: 'flex items-center gap-4' },
          h('div', { className: 'w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0' }, '📍'),
          h('div', { className: 'flex-1' },
            h('label', { className: 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1' }, 'Dirección del evento'),
            h('input', {
              type: 'text', value: eventAddress, onChange: function(e) { setEventAddress(e.target.value); },
              placeholder: 'Ej: Cra 7 con Calle 72, Bogotá',
              className: 'w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none'
            })
          )
        )
      ),
      // Config grid
      h('div', { className: 'grid grid-cols-2 gap-6' },
        // Geometry
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'font-bold text-slate-900 mb-4' }, 'Geometría del área de estudio'),
          h('div', { className: 'grid grid-cols-2 gap-3' },
            numInput('Área total (m²)', area, setArea, 'Ej: 5000'),
            numInput('Longitud de vía (m)', length, setLength, 'Ej: 100'),
            numInput('Ancho de vía (m)', width, setWidth, 'Ej: 25'),
            h('div', null,
              h('label', { className: 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1' }, 'Material superficie'),
              h('select', { value: material, onChange: function (e) { handleMaterialChange(e.target.value); }, className: 'w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none' },
                Object.keys(E.SM).map(function (m) { return h('option', { key: m, value: m }, m); })
              )
            ),
            numInput('Coef. escorrentía', coefC, setCoefC, '0.85')
          )
        ),
        // Hydrology
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'font-bold text-slate-900 mb-4' }, 'Parámetros hidrológicos'),
          h('div', { className: 'flex gap-2 mb-4' },
            h('button', { onClick: function () { setHydroMode('intensity'); }, className: 'flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ' + (hydroMode === 'intensity' ? 'bg-[#3B82F6] text-white' : 'bg-slate-100 text-slate-600') }, 'Intensidad (mm/h)'),
            h('button', { onClick: function () { setHydroMode('precip'); }, className: 'flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ' + (hydroMode === 'precip' ? 'bg-[#3B82F6] text-white' : 'bg-slate-100 text-slate-600') }, 'Precipitación Total (mm)')
          ),
          h('div', { className: 'grid grid-cols-2 gap-3' },
            hydroMode === 'intensity' ? numInput('Intensidad (mm/h)', intensityVal, setIntensityVal, '35.5') : numInput('Precipitación (mm)', precipVal, setPrecipVal, '30'),
            numInput('Duración (horas)', duration, setDuration, '1'),
            numInput('Pendiente (%)', slope, setSlope, '2.5'),
            numInput('Días secos anteced.', dryDays, setDryDays, '5'),
            h('div', null,
              h('label', { className: 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1' }, 'Patrón'),
              h('select', { value: pattern, onChange: function (e) { setPattern(e.target.value); }, className: 'w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none' },
                h('option', { value: 'variable' }, 'Variable'), h('option', { value: 'constant' }, 'Constante')
              )
            )
          )
        )
      ),

      // Metals table
      h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
        h('div', { className: 'flex items-center justify-between mb-4' },
          h('h3', { className: 'font-bold text-slate-900' }, 'Metales a simular'),
          h('button', { onClick: resetMetals, className: 'text-sm text-orange-600 font-semibold hover:underline' }, 'Restaurar valores')
        ),
        h('div', { className: 'overflow-x-auto' },
          h('table', { className: 'w-full text-sm' },
            h('thead', null,
              h('tr', { className: 'bg-slate-50' },
                (function() {
                  var tips = { Metal: 'Metal pesado analizado', LW: 'Porcentaje de RDS < 250µm susceptible al transporte por escorrentía', ML: 'Porcentaje de metales pesados asociados a RDS < 250µm', LE: 'Porcentaje de lixiviación de metales pesados (< 250µm)', Ler: 'Mediana de los valores de lixiviación por cada metal', Bmax: 'Acumulación máxima de masa (mg/m²)', kb: 'Tasa de acumulación (1/día)', kw: 'Coeficiente de lavado', n: 'Exponente de intensidad', Activo: 'Incluir en simulación' };
                  return ['Metal', 'LW', 'ML', 'LE', 'Ler', 'Bmax', 'kb', 'kw', 'n', 'Activo'].map(function (c) {
                    return h('th', { key: c, title: tips[c] || '', className: 'px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center cursor-help' },
                      c, c !== 'Metal' && c !== 'Activo' ? h('span', { className: 'ml-0.5 text-blue-400 text-[8px]' }, '?') : null
                    );
                  });
                })()
              )
            ),
            h('tbody', null,
              metals.map(function (m, idx) {
                return h('tr', { key: m.name, className: 'border-t border-slate-100 hover:bg-slate-50' },
                  h('td', { className: 'px-2 py-1.5 font-bold text-center', style: { color: MC[m.name] || '#333' } }, m.name),
                  ['LW', 'ML', 'LE', 'Ler', 'Bmax', 'kb', 'kw', 'n'].map(function (f) {
                    return h('td', { key: f, className: 'px-1 py-1' }, metalInput(m[f], function (v) { updateMetal(idx, f, v); }));
                  }),
                  h('td', { className: 'px-2 py-1 text-center' },
                    h('input', { type: 'checkbox', checked: m.active, onChange: function (e) { updateMetal(idx, 'active', e.target.checked); }, className: 'w-4 h-4 accent-[#3B82F6]' })
                  )
                );
              })
            )
          )
        )
      ),

      // Data paste section
      h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
        h('h3', { className: 'font-bold text-slate-900 mb-3' }, 'Carga masiva de parámetros'),
        h('p', { className: 'text-xs text-slate-500 mb-3' }, 'Pegue datos tabulados (formato: Metal, LW, ML, LE, Ler, Bmax, kb, kw, n). Use "-" para omitir valores.'),
        h('textarea', { value: pasteText, onChange: function (e) { setPasteText(e.target.value); }, rows: 4, className: 'w-full p-3 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-300 focus:outline-none resize-y', placeholder: 'Mn\t63.8\t56\t21.7\t22.7' }),
        h('div', { className: 'flex items-center gap-3 mt-3' },
          h('button', { onClick: handlePasteData, className: 'bg-[#3B82F6] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600' }, 'Subir Datos'),
          h('label', { className: 'border border-slate-300 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer inline-flex items-center gap-1' },
            h('input', { type: 'file', accept: '.xlsx,.xls,.csv', onChange: function (ev) { var f = ev.target.files[0]; if (!f) return; var r = new FileReader(); r.onload = function (e) { try { var wb = XLSX.read(e.target.result, { type: 'binary' }); var ws = wb.Sheets[wb.SheetNames[0]]; setPasteText(XLSX.utils.sheet_to_csv(ws)); setPasteMsg('Excel cargado. Presione Subir Datos.'); } catch (err) { setPasteMsg('Error: ' + err.message); } }; r.readAsBinaryString(f); }, className: 'hidden' }),
            'Subir Excel'
          ),
          pasteMsg && h('span', { className: 'text-sm font-semibold ' + (pasteMsg.indexOf('Error') >= 0 ? 'text-red-600' : 'text-green-600') }, pasteMsg)
        )
      ),

      // RESULTS
      results && h('div', { className: 'space-y-6 animate-fadeIn' },
        h('div', { className: 'flex items-center gap-3 mt-4' },
          h('div', { className: 'w-1 h-8 bg-[#3B82F6] rounded' }),
          h('h2', { className: 'text-xl font-bold text-slate-900' }, 'Resultados de Simulación'),
          h('span', { className: 'bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase' }, 'Completado')
        ),

        // KPIs
        h('div', { className: 'grid grid-cols-4 gap-3' },
          [
            { label: 'ÁREA', value: parseFloat(area).toLocaleString() + ' m²' },
            { label: 'INTENSIDAD', value: results.Ip.toFixed(1) + ' mm/h' },
            { label: 'VOL. ESCORRENTÍA', value: results.Vt.toFixed(4) + ' m³' },
            { label: 'CAUDAL PICO', value: (results.Qp * 1000).toFixed(4) + ' L/s' },
            { label: 'TIEMPO CONC. (tc)', value: results.tc.toFixed(2) + ' min' },
            { label: 'METAL DOMINANTE', value: results.dm, hl: true },
            { label: 'FRACCIÓN', value: results.fraccion },
            { label: 'NIVEL DE RIESGO', value: results.riesgo, badge: results.riesgo === 'ALTO' ? 'bg-red-100 text-red-700' : results.riesgo === 'MEDIO' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700' }
          ].map(function (k, i) {
            return h('div', { key: i, className: 'bg-white rounded-xl border p-4 ' + (k.hl ? 'border-red-300' : 'border-slate-200') },
              h('div', { className: 'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1' }, k.label),
              k.badge ? h('span', { className: 'text-lg font-bold px-3 py-1 rounded-full ' + k.badge }, k.value) : h('div', { className: 'text-xl font-bold ' + (k.hl ? 'text-red-600' : 'text-[#1E3A5F]') }, k.value)
            );
          })
        ),

        // CHART 1: TLW Analysis
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'font-bold text-slate-900 mb-2' }, 'Gráfica 1: Análisis TLW — Total Load Washoff'),
          h('p', { className: 'text-xs text-slate-500 mb-3' }, 'Carga total de lavado descompuesta en 3 componentes por metal. Cada barra apilada muestra la contribución absoluta de la fracción de transporte mecánico y lixiviación.'),
          ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 250 },
            h(BarChart, { data: results.tlwBarData },
              h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
              h(XAxis, { dataKey: 'name', tick: { fontSize: 11, fontWeight: 'bold' } }),
              h(YAxis, { tick: { fontSize: 10 }, label: { value: 'TLW (%/m²)', angle: -90, position: 'insideLeft', fontSize: 10 } }),
              h(Tooltip, null), h(Legend, null),
              h(Bar, { dataKey: 'T1', stackId: 'a', fill: '#5dade2', name: 'T1: Transporte RDS < 250 µm' }),
              h(Bar, { dataKey: 'T2', stackId: 'a', fill: '#58d68d', name: 'T2: Lixiviación RDS < 250 µm' }),
              h(Bar, { dataKey: 'T3', stackId: 'a', fill: '#f5b041', name: 'T3: Lixiviación RDS > 250 µm' })
            )
          )
        ),

        // CHART 2: Build-up
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'font-bold text-slate-900 mb-2' }, 'Gráfica 2: Build-up — Acumulación en superficie'),
          h('p', { className: 'text-xs text-slate-500 mb-3' }, 'Muestra cómo se acumula la masa de cada metal (mg/m²) en la superficie durante los días secos previos al evento. Sigue el modelo exponencial B(t) = Bmax × (1 − e^(−kb·t)), donde Bmax es la capacidad máxima y kb la tasa de acumulación diaria.'),
          ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 250 },
            h(LineChart, { data: results.buData },
              h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
              h(XAxis, { dataKey: 'day', tick: { fontSize: 10 }, label: { value: 'Días secos', position: 'bottom', fontSize: 10 } }),
              h(YAxis, { tick: { fontSize: 10 }, label: { value: 'mg/m²', angle: -90, position: 'insideLeft', fontSize: 10 } }),
              h(Tooltip, null), h(Legend, null),
              results.ms.map(function (m) { return h(Line, { key: m, type: 'monotone', dataKey: m, stroke: MC[m] || '#6B7280', strokeWidth: 2, dot: false }); })
            )
          )
        ),

        // CHART 3: Wash-off (4 panels as 2x2)
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'font-bold text-slate-900 mb-2' }, 'Gráfica 3: Wash-off — Cinética de lavado durante el evento'),
          h('p', { className: 'text-xs text-slate-500 mb-3' }, 'Cuatro paneles: (1) Hietograma: distribución temporal de la lluvia. (2) Masa Remanente: cantidad de contaminante que permanece en superficie. (3) Tasa de lavado: velocidad de arrastre instantánea. (4) Masa acumulada removida: total de material transportado por la escorrentía. Modelo: dW = B(t)·(1 − e^(−kw·I(t)^n·dt))'),
          h('div', { className: 'grid grid-cols-2 gap-4' },
            // Hietograma
            h('div', null,
              h('div', { className: 'text-xs font-semibold text-slate-600 mb-1' }, 'Hietograma'),
              ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 150 },
                h(AreaChart, { data: results.hietoData },
                  h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
                  h(XAxis, { dataKey: 'time', tick: { fontSize: 9 } }),
                  h(YAxis, { tick: { fontSize: 9 } }),
                  h(Tooltip, null),
                  h(Area, { dataKey: 'I', fill: '#93c5fd', stroke: '#2e86c1', fillOpacity: 0.3 })
                )
              )
            ),
            // Remanente
            h('div', null,
              h('div', { className: 'text-xs font-semibold text-slate-600 mb-1' }, 'Masa Remanente (mg/m²)'),
              ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 150 },
                h(LineChart, { data: results.washData },
                  h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
                  h(XAxis, { dataKey: 'time', tick: { fontSize: 9 } }),
                  h(YAxis, { tick: { fontSize: 9 } }),
                  h(Tooltip, null),
                  results.ms.map(function (m) { return h(Line, { key: m, type: 'monotone', dataKey: m, stroke: MC[m], strokeWidth: 1.5, dot: false }); })
                )
              )
            ),
            // Tasa
            h('div', null,
              h('div', { className: 'text-xs font-semibold text-slate-600 mb-1' }, 'Tasa de lavado (mg/m²/h)'),
              ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 150 },
                h(LineChart, { data: results.rateData },
                  h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
                  h(XAxis, { dataKey: 'time', tick: { fontSize: 9 } }),
                  h(YAxis, { tick: { fontSize: 9 } }),
                  h(Tooltip, null),
                  results.ms.map(function (m) { return h(Line, { key: m, type: 'monotone', dataKey: m, stroke: MC[m], strokeWidth: 1.5, dot: false }); })
                )
              )
            ),
            // Acumulado
            h('div', null,
              h('div', { className: 'text-xs font-semibold text-slate-600 mb-1' }, 'Masa acumulada removida (mg/m²)'),
              ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 150 },
                h(LineChart, { data: results.cumData },
                  h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
                  h(XAxis, { dataKey: 'time', tick: { fontSize: 9 } }),
                  h(YAxis, { tick: { fontSize: 9 } }),
                  h(Tooltip, null),
                  results.ms.map(function (m) { return h(Line, { key: m, type: 'monotone', dataKey: m, stroke: MC[m], strokeWidth: 1.5, dot: false }); })
                )
              )
            )
          )
        ),

        // CHART 4: Sólida vs Disuelta
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'font-bold text-slate-900 mb-2' }, 'Gráfica 4: Fracción transportada — Sólida vs Disuelta'),
          h('p', { className: 'text-xs text-slate-500 mb-3' }, 'Compara la fracción sólida (partículas finas < 250 µm transportadas mecánicamente) con la fracción disuelta (lixiviación). Esta relación determina qué tipo de tratamiento es más efectivo: sedimentación física o tratamiento químico/avanzado.'),
          h('div', { className: 'grid grid-cols-2 gap-4' },
            // Bar
            ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 200 },
              h(BarChart, { data: results.ms.map(function (m) { return { name: m, Solida: +results.tlw[m].p1.toFixed(1), Disuelta: +(results.tlw[m].p2 + results.tlw[m].p3).toFixed(1) }; }) },
                h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
                h(XAxis, { dataKey: 'name', tick: { fontSize: 10, fontWeight: 'bold' } }),
                h(YAxis, { tick: { fontSize: 10 } }), h(Tooltip, null), h(Legend, null),
                h(Bar, { dataKey: 'Solida', fill: '#ec7063' }),
                h(Bar, { dataKey: 'Disuelta', fill: '#5dade2' })
              )
            ),
            // Pie
            PieChart && ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 200 },
              h(PieChart, null,
                h(Pie, { data: results.pieData, cx: '50%', cy: '50%', outerRadius: 70, dataKey: 'value', label: function (e) { return e.name + ' ' + ((e.value / (results.pieData[0].value + results.pieData[1].value)) * 100).toFixed(1) + '%'; } },
                  h(Cell, { fill: '#ec7063' }), h(Cell, { fill: '#5dade2' })
                ), h(Tooltip, null)
              )
            )
          )
        ),

        // CHART 5: Hidrograma
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'font-bold text-slate-900 mb-2' }, 'Gráfica 5: Hidrograma — Respuesta hidrológica'),
          h('p', { className: 'text-xs text-slate-500 mb-3' }, 'Panel superior: hietograma invertido (distribución de lluvia en el tiempo). Panel inferior: caudal (L/s) generado por la escorrentía. Calculado mediante el método racional: Q = C·I·A/3,600,000 y tc = 0.0195·L⁰·⁷⁷·S⁻⁰·³⁸⁵'),
          h('div', { className: 'grid grid-cols-1 gap-2' },
            ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 150 },
              h(AreaChart, { data: results.hietoData },
                h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
                h(XAxis, { dataKey: 'time', tick: { fontSize: 9 } }),
                h(YAxis, { tick: { fontSize: 9 }, reversed: true, label: { value: 'mm/h', angle: -90, position: 'insideLeft', fontSize: 9 } }),
                h(Tooltip, null),
                h(Area, { dataKey: 'I', fill: '#93c5fd', stroke: '#2e86c1', fillOpacity: 0.3 })
              )
            ),
            ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 150 },
              h(LineChart, { data: results.Qa },
                h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
                h(XAxis, { dataKey: 'time', tick: { fontSize: 9 }, label: { value: 'min', position: 'bottom', fontSize: 9 } }),
                h(YAxis, { tick: { fontSize: 9 }, label: { value: 'L/s', angle: -90, position: 'insideLeft', fontSize: 9 } }),
                h(Tooltip, null),
                h(Line, { type: 'monotone', dataKey: 'Q', stroke: '#e74c3c', strokeWidth: 2, dot: false, name: 'Caudal (L/s)' })
              )
            )
          )
        ),

        // CHART 6: Impacto de Carga por Metal
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'font-bold text-slate-900 mb-2' }, 'Gráfica 6: Impacto ambiental — Carga contaminante por metal'),
          h('p', { className: 'text-xs text-slate-500 mb-3' }, 'Carga total (mg) que cada metal aporta al cuerpo receptor hídrico durante el evento. Se calcula como: Carga = (TLW/100) × B₀ × Área, donde B₀ es la masa acumulada inicial.'),
          ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 220 },
            h(BarChart, { data: results.impBar },
              h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
              h(XAxis, { dataKey: 'name', tick: { fontSize: 11, fontWeight: 'bold' } }),
              h(YAxis, { tick: { fontSize: 10 }, label: { value: 'mg', angle: -90, position: 'insideLeft', fontSize: 10 } }),
              h(Tooltip, null),
              h(Bar, { dataKey: 'load', radius: [6, 6, 0, 0], name: 'Carga (mg)' },
                results.impBar.map(function (entry, i) { return h(Cell, { key: i, fill: entry.fill }); })
              )
            )
          )
        ),

        // TLW + Wash-off Table
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'font-bold text-slate-900 mb-3' }, 'Tabla: Análisis TLW + Wash-off'),
          h('div', { className: 'overflow-x-auto' },
            h('table', { className: 'w-full text-sm' },
              h('thead', null,
                h('tr', { className: 'bg-gradient-to-r from-[#2e86c1] to-[#5dade2] text-white' },
                  ['Metal', 'T1', 'T2', 'T3', 'TLW', 'T1%', 'T2%', 'T3%', 'B0', 'Lavado', 'Efic%'].map(function (c) { return h('th', { key: c, className: 'px-2 py-2 text-[10px] font-bold text-center' }, c); })
                )
              ),
              h('tbody', null,
                results.ms.map(function (m, i) {
                  var r = results.tlw[m], w = results.wd[m];
                  return h('tr', { key: m, className: i % 2 === 0 ? 'bg-blue-50/30' : '' },
                    h('td', { className: 'px-2 py-1.5 font-bold text-center', style: { color: MC[m] } }, m),
                    h('td', { className: 'px-2 py-1.5 text-center' }, r.T1.toFixed(3)),
                    h('td', { className: 'px-2 py-1.5 text-center' }, r.T2.toFixed(3)),
                    h('td', { className: 'px-2 py-1.5 text-center' }, r.T3.toFixed(3)),
                    h('td', { className: 'px-2 py-1.5 text-center font-bold' }, r.TLW.toFixed(3)),
                    h('td', { className: 'px-2 py-1.5 text-center' }, r.p1.toFixed(1) + '%'),
                    h('td', { className: 'px-2 py-1.5 text-center' }, r.p2.toFixed(1) + '%'),
                    h('td', { className: 'px-2 py-1.5 text-center' }, r.p3.toFixed(1) + '%'),
                    h('td', { className: 'px-2 py-1.5 text-center' }, results.B0[m].toFixed(2)),
                    h('td', { className: 'px-2 py-1.5 text-center' }, w.total.toFixed(2)),
                    h('td', { className: 'px-2 py-1.5 text-center' },
                      h('span', { className: 'px-2 py-0.5 rounded-full text-[10px] font-bold ' + (w.eff > 80 ? 'bg-green-100 text-green-700' : w.eff > 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700') }, w.eff.toFixed(1) + '%')
                    )
                  );
                })
              )
            )
          )
        ),

        // Impact Table
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'font-bold text-slate-900 mb-3' }, 'Tabla: Impacto Ambiental'),
          h('div', { className: 'overflow-x-auto' },
            h('table', { className: 'w-full text-sm' },
              h('thead', null,
                h('tr', { className: 'bg-gradient-to-r from-[#2e86c1] to-[#5dade2] text-white' },
                  ['Metal', 'Carga (mg)', 'Carga (g)', 'Conc. (mg/L)'].map(function (c) { return h('th', { key: c, className: 'px-3 py-2 text-[10px] font-bold text-center' }, c); })
                )
              ),
              h('tbody', null,
                results.ms.map(function (m, i) {
                  var d = results.imp[m];
                  return h('tr', { key: m, className: i % 2 === 0 ? 'bg-blue-50/30' : '' },
                    h('td', { className: 'px-3 py-1.5 font-bold text-center', style: { color: MC[m] } }, m),
                    h('td', { className: 'px-3 py-1.5 text-center' }, d.load_mg.toFixed(4)),
                    h('td', { className: 'px-3 py-1.5 text-center' }, (d.load_mg / 1000).toFixed(6)),
                    h('td', { className: 'px-3 py-1.5 text-center' }, d.conc.toFixed(6))
                  );
                })
              )
            )
          )
        ),

        // METHODOLOGY
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'text-lg font-bold text-slate-900 mb-2' }, 'Metodología de Cálculo'),
          h('p', { className: 'text-sm text-slate-500 mb-4 leading-relaxed', style: { textAlign: 'justify' } }, 'A continuación se describe el proceso de cálculo paso a paso. Cada etapa tiene un objetivo específico dentro del análisis integral del transporte de metales pesados en escorrentía urbana.'),
          h('div', { className: 'space-y-4 text-sm text-slate-700 leading-relaxed' },
            // Step 1
            h('div', { className: 'bg-blue-50 rounded-lg p-4 border-l-4 border-[#3B82F6]' },
              h('h4', { className: 'font-bold text-[#2471A3] mb-1' }, 'Etapa 1: Cálculo TLW — Total Load Washoff'),
              h('p', { className: 'text-xs text-slate-500 mb-2 italic' }, 'Objetivo: Determinar qué porcentaje de la carga contaminante depositada en la superficie puede ser movilizada por la escorrentía.'),
              h('p', { className: 'mb-2' }, 'Índice que representa el porcentaje total de carga contaminante que puede ser lavada por metro cuadrado. Se descompone en 3 fracciones:'),
              h('div', { className: 'bg-white rounded p-3 font-mono text-xs space-y-1 border border-blue-200' },
                h('div', null, 'T₁ = (LW × ML) / 100  → Transporte RDS < 250 µm (partículas finas arrastradas mecánicamente)'),
                h('div', null, 'T₂ = LE × (1 - LW/100) × (ML/100)  → Lixiviación RDS < 250 µm (disolución de finos)'),
                h('div', null, 'T₃ = Ler × (1 - ML/100)  → Lixiviación RDS > 250 µm (disolución de gruesos)'),
                h('div', { className: 'font-bold mt-1' }, 'TLW = T₁ + T₂ + T₃  (%/m²)')
              )
            ),
            // Step 2
            h('div', { className: 'bg-green-50 rounded-lg p-4 border-l-4 border-green-500' },
              h('h4', { className: 'font-bold text-green-700 mb-1' }, 'Etapa 2: Hidrología — Respuesta de la cuenca'),
              h('p', { className: 'text-xs text-slate-500 mb-2 italic' }, 'Objetivo: Calcular el caudal pico, el volumen total de escorrentía y el tiempo de concentración de la cuenca ante el evento de lluvia definido.'),
              h('div', { className: 'bg-white rounded p-3 font-mono text-xs space-y-1 border border-green-200' },
                h('div', null, 'Caudal pico: Q = C × I × A / 3,600,000  (m³/s)'),
                h('div', null, 'Volumen: V = C × (I/1000) × A × duración  (m³)'),
                h('div', null, 'Tiempo concentración: tc = 0.0195 × L⁰·⁷⁷ × S⁻⁰·³⁸⁵  (min)')
              ),
              results && h('p', { className: 'mt-2 text-xs' },
                'Q = ' + results.C + ' × ' + results.Ip.toFixed(1) + ' × ' + results.A + ' / 3600000 = ', h('b', null, (results.Qp * 1000).toFixed(4) + ' L/s'),
                ' | V = ', h('b', null, results.Vt.toFixed(4) + ' m³'),
                ' | tc = ', h('b', null, results.tc.toFixed(2) + ' min')
              )
            ),
            // Step 3
            h('div', { className: 'bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500' },
              h('h4', { className: 'font-bold text-yellow-700 mb-1' }, 'Etapa 3: Build-up — Acumulación en período seco'),
              h('p', { className: 'text-xs text-slate-500 mb-2 italic' }, 'Objetivo: Estimar la masa de contaminantes acumulada en la superficie durante el período seco previo al evento de lluvia.'),
              h('div', { className: 'bg-white rounded p-3 font-mono text-xs border border-yellow-200' },
                h('div', null, 'B(t) = Bmax × (1 - e^(-kb × t))'),
                h('div', { className: 'mt-1 text-slate-500' }, 'Bmax = masa máxima acumulable (mg/m²), kb = tasa de acumulación (1/día), t = días secos')
              )
            ),
            // Step 4
            h('div', { className: 'bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500' },
              h('h4', { className: 'font-bold text-orange-700 mb-1' }, 'Etapa 4: Wash-off — Lavado durante el evento'),
              h('p', { className: 'text-xs text-slate-500 mb-2 italic' }, 'Objetivo: Simular la cinética de remoción de contaminantes en función de la intensidad de lluvia a lo largo del evento.'),
              h('div', { className: 'bg-white rounded p-3 font-mono text-xs border border-orange-200 space-y-1' },
                h('div', null, 'dW = B(t) × (1 - e^(-kw × I(t)^n × dt))'),
                h('div', { className: 'text-slate-500' }, 'B(t) = masa remanente, kw = coef. lavado, I(t) = intensidad, n = exponente, dt = paso tiempo'),
                h('div', { className: 'mt-1' }, 'Eficiencia: η = (Lavado_total / B₀) × 100%')
              )
            ),
            // Step 5
            h('div', { className: 'bg-red-50 rounded-lg p-4 border-l-4 border-red-500' },
              h('h4', { className: 'font-bold text-red-700 mb-1' }, 'Etapa 5: Impacto Ambiental'),
              h('p', { className: 'text-xs text-slate-500 mb-2 italic' }, 'Objetivo: Calcular la carga total de contaminantes movilizados y su concentración media en el volumen de escorrentía generado.'),
              h('div', { className: 'bg-white rounded p-3 font-mono text-xs border border-red-200 space-y-1' },
                h('div', null, 'Carga (mg) = (TLW / 100) × B₀ × Área'),
                h('div', null, 'Concentración (mg/L) = Carga (mg) / Volumen (litros)')
              )
            )
          )
        ),

        // Steps summary
        h('div', { className: 'grid grid-cols-4 gap-4' },
          [
            { step: '1', title: 'Acumulación', desc: 'Cálculo de masa acumulada previa mediante modelos exponenciales basados en días secos.' },
            { step: '2', title: 'Escorrentía', desc: 'Modelado hidrológico mediante el método racional para determinar caudal pico y volúmenes.' },
            { step: '3', title: 'Lavado (Wash-off)', desc: 'Simulación de la cinética de transporte en función de la intensidad del evento.' },
            { step: '4', title: 'Impacto Final', desc: 'Integración de cargas totales y determinación de concentraciones medias.' },
          ].map(function (s) {
            return h('div', { key: s.step, className: 'bg-white rounded-xl border border-slate-200 p-4' },
              h('div', { className: 'w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center text-white font-bold text-sm mb-3' }, s.step),
              h('div', { className: 'font-bold text-slate-900 text-sm mb-1' }, s.title),
              h('div', { className: 'text-xs text-slate-500 leading-relaxed' }, s.desc)
            );
          })
        )
      ),

      // Save to Supabase after results
      results && h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5 text-center' },
        h('h3', { className: 'font-bold text-slate-900 mb-3' }, 'Guardar Simulación en Historial'),
        h('button', {
          onClick: function() {
            var ms = results.ms;
            var title = simName.trim() || ('Evento Único - ' + ms.join(', ') + ' (' + new Date().toLocaleDateString('es-CO') + ')');
            window.saveSimulation && window.saveSimulation('single', title,
              { area: area, intensity: results.Ip, duration: duration, dryDays: dryDays, slope: slope, material: material, address: eventAddress },
              { tlw: results.tlw, imp: results.imp, dm: results.dm, riesgo: results.riesgo },
              ms, parseFloat(area) || 0
            ).then(function() { setSaveMsg('Guardado exitosamente'); setSimName(''); });
          }, className: 'bg-[#1E3A5F] text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-[#15304f] transition-colors'
        }, 'Guardar en Historial'),
        saveMsg && h('p', { className: 'text-green-600 text-sm font-semibold mt-2 animate-fadeIn' }, saveMsg)
      ),

      // Footer
      // Export buttons
      results && h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5 text-center' },
        h('h3', { className: 'font-bold text-slate-900 mb-3' }, 'Exportar Resultados'),
        h('div', { className: 'flex justify-center gap-3' },
          // PDF
          h('button', {
            onClick: function() {
              try {
                var doc = new window.jspdf.jsPDF();
                doc.setFontSize(18); doc.setTextColor(30, 58, 95); doc.text('HydroTrace \u2014 Reporte de Simulaci\u00f3n', 14, 20);
                doc.setFontSize(10); doc.setTextColor(100); doc.text('Fecha: ' + new Date().toLocaleDateString('es-CO') + '  |  Tipo: Evento \u00danico', 14, 28);
                doc.setDrawColor(59, 130, 246); doc.line(14, 31, 196, 31);
                var y = 38; doc.setFontSize(12); doc.setTextColor(30, 58, 95); doc.text('Par\u00e1metros de Entrada', 14, y); y += 8;
                doc.setFontSize(9); doc.setTextColor(60);
                doc.text('T\u00edtulo: ' + (simName || 'Sin nombre'), 14, y); y += 5;
                if (eventAddress) { doc.text('Direcci\u00f3n: ' + eventAddress, 14, y); y += 5; }
                doc.text('\u00c1rea: ' + area + ' m\u00b2  |  Material: ' + material + '  |  Coef. C: ' + coefC, 14, y); y += 5;
                doc.text('Intensidad: ' + intensityVal + ' mm/h  |  Duraci\u00f3n: ' + duration + ' h  |  D\u00edas secos: ' + dryDays, 14, y); y += 5;
                doc.text('Pendiente: ' + slope + '%  |  Longitud: ' + length + ' m  |  Ancho: ' + width + ' m', 14, y); y += 10;
                doc.setFontSize(12); doc.setTextColor(30, 58, 95); doc.text('Resultados Hidrol\u00f3gicos', 14, y); y += 7;
                doc.setFontSize(9); doc.setTextColor(60);
                var Qp = results.Qp != null ? (results.Qp * 1000).toFixed(4) : '-';
                var Vt = results.Vt != null ? results.Vt.toFixed(4) : '-';
                var tc = results.tc != null ? results.tc.toFixed(2) : '-';
                doc.text('Caudal pico: ' + Qp + ' L/s  |  Volumen: ' + Vt + ' m\u00b3  |  tc: ' + tc + ' min', 14, y); y += 10;
                doc.setFontSize(12); doc.setTextColor(30, 58, 95); doc.text('An\u00e1lisis TLW por Metal', 14, y); y += 7;
                doc.setFontSize(9); doc.setTextColor(60);
                if (results.ms && results.tlw) {
                  results.ms.forEach(function(m) {
                    var t = results.tlw[m];
                    if (t) { doc.text(m + ':  T1=' + (t.T1 != null ? t.T1.toFixed(3) : '-') + '  T2=' + (t.T2 != null ? t.T2.toFixed(3) : '-') + '  T3=' + (t.T3 != null ? t.T3.toFixed(3) : '-') + '  TLW=' + (t.TLW != null ? t.TLW.toFixed(3) : '-') + '%', 14, y); y += 5; }
                  });
                }
                y += 5; doc.setFontSize(12); doc.setTextColor(30, 58, 95); doc.text('Impacto Ambiental', 14, y); y += 7;
                doc.setFontSize(9); doc.setTextColor(60);
                doc.text('Metal dominante: ' + (results.dm || '-') + '  |  Nivel de riesgo: ' + (results.riesgo || '-'), 14, y); y += 5;
                if (results.ms && results.imp) {
                  results.ms.forEach(function(m) {
                    var imp = results.imp[m];
                    if (imp) { doc.text(m + ':  Carga=' + (imp.load_mg != null ? imp.load_mg.toFixed(2) : '-') + ' mg  |  Conc=' + (imp.conc_mgL != null ? imp.conc_mgL.toFixed(4) : '-') + ' mg/L', 14, y); y += 5; }
                  });
                }
                y += 8; doc.setFontSize(8); doc.setTextColor(150); doc.text('\u00a9 2026 HydroTrace Platform', 14, y);
                doc.save('HydroTrace_Reporte_' + (simName || 'Simulacion').replace(/\s+/g, '_') + '.pdf');
              } catch(e) { alert('Error al generar PDF: ' + e.message); }
            }, className: 'bg-[#3B82F6] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors inline-flex items-center gap-2'
          },
            h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, h('path', { d: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3' })),
            'PDF'
          ),
          // Excel
          h('button', {
            onClick: function() {
              try {
                var wb = XLSX.utils.book_new();
                var params = [['Par\u00e1metro', 'Valor'], ['T\u00edtulo', simName || 'Sin nombre'], ['Direcci\u00f3n', eventAddress || '-'], ['\u00c1rea (m\u00b2)', area], ['Material', material], ['Coef. C', coefC], ['Intensidad (mm/h)', intensityVal], ['Duraci\u00f3n (h)', duration], ['D\u00edas secos', dryDays], ['Pendiente (%)', slope]];
                var ws1 = XLSX.utils.aoa_to_sheet(params);
                XLSX.utils.book_append_sheet(wb, ws1, 'Par\u00e1metros');
                if (results.ms && results.tlw) {
                  var tlwRows = [['Metal', 'T1', 'T2', 'T3', 'TLW (%)']];
                  results.ms.forEach(function(m) { var t = results.tlw[m]; if (t) { tlwRows.push([m, t.T1, t.T2, t.T3, t.TLW]); } });
                  var ws2 = XLSX.utils.aoa_to_sheet(tlwRows);
                  XLSX.utils.book_append_sheet(wb, ws2, 'TLW');
                }
                if (results.ms && results.imp) {
                  var impRows = [['Metal', 'Carga (mg)', 'Conc (mg/L)']];
                  results.ms.forEach(function(m) { var imp = results.imp[m]; if (imp) { impRows.push([m, imp.load_mg, imp.conc_mgL]); } });
                  var ws3 = XLSX.utils.aoa_to_sheet(impRows);
                  XLSX.utils.book_append_sheet(wb, ws3, 'Impacto');
                }
                XLSX.writeFile(wb, 'HydroTrace_' + (simName || 'Reporte').replace(/\s+/g, '_') + '.xlsx');
              } catch(e) { alert('Error al generar Excel: ' + e.message); }
            }, className: 'bg-[#10B981] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-600 transition-colors inline-flex items-center gap-2'
          },
            h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, h('path', { d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' }), h('path', { d: 'M14 2v6h6M8 13h8M8 17h8M8 9h2' })),
            'Excel'
          )
        )
      ),

      h('div', { className: 'text-center text-xs text-slate-400 py-6 border-t border-slate-200 mt-6' }, '© 2026 HYDROTRACE PLATFORM')
    )
  );
}

window.SingleSimulation = SingleSimulation;
