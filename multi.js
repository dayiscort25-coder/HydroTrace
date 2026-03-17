// MultiSimulation Component - Smart grouping, state persistence, Supabase save, TLW renamed
function MultiSimulation({ savedState, onSaveState }) {
  var h = React.createElement;
  var RC = window.Recharts || {};
  var LineChart = RC.LineChart; var Line = RC.Line; var BarChart = RC.BarChart; var Bar = RC.Bar;
  var AreaChart = RC.AreaChart; var Area = RC.Area;
  var XAxis = RC.XAxis; var YAxis = RC.YAxis; var CartesianGrid = RC.CartesianGrid;
  var Tooltip = RC.Tooltip; var Legend = RC.Legend; var ResponsiveContainer = RC.ResponsiveContainer;
  var Cell = RC.Cell;
  var E = window.HydroEngine;
  var MC = E.METAL_COLORS;

  var init = savedState || {};
  var _s = React.useState;
  var _a = _s(init.area || '5000'), area = _a[0], setArea = _a[1];
  var _m = _s(init.material || 'Asfalto'), material = _m[0], setMaterial = _m[1];
  var _c = _s(init.coefC || '0.85'), coefC = _c[0], setCoefC = _c[1];
  var _r = _s(init.results || null), results = _r[0], setResults = _r[1];
  var _run = _s(false), running = _run[0], setRunning = _run[1];
  var _pt = _s(''), pasteText = _pt[0], setPasteText = _pt[1];
  var _pm = _s(''), pasteMsg = _pm[0], setPasteMsg = _pm[1];
  var _sn = _s(''), simName = _sn[0], setSimName = _sn[1];
  var _sm2 = _s(''), saveMsg = _sm2[0], setSaveMsg = _sm2[1];

  var _ev = _s(init.events || [
    { id: 1, type: 'Intensidad', value: '12.5', duration: '1', pattern: 'Uniforme', slope: '2.0', dryDays: '3' },
    { id: 2, type: 'Precipitación', value: '34.0', duration: '2', pattern: 'Bloque', slope: '2.0', dryDays: '1' },
  ]), events = _ev[0], setEvents = _ev[1];

  var defM = init.metals || (function () {
    var arr = [
      { name: 'Zn', LW: '70.1', ML: '48', LE: '25.3', Ler: '28.1', Bmax: '350', kb: '0.50', kw: '0.18', n: '1.1', active: true },
      { name: 'Cu', LW: '58.4', ML: '55', LE: '20.8', Ler: '19.6', Bmax: '85', kb: '0.35', kw: '0.14', n: '1.3', active: true },
    ];
    Object.entries(E.DM).forEach(function (e) {
      if (e[0] !== 'Zn' && e[0] !== 'Cu') {
        arr.push({ name: e[0], LW: String(e[1].LW), ML: String(e[1].ML), LE: String(e[1].LE), Ler: String(e[1].Ler), Bmax: String(e[1].Bmax), kb: String(e[1].kb), kw: String(e[1].kw), n: String(e[1].n), active: false });
      }
    });
    return arr;
  })();
  var _met = _s(defM), metals = _met[0], setMetals = _met[1];

  // State preservation
  React.useEffect(function () {
    return function () {
      if (onSaveState) onSaveState({ area: area, material: material, coefC: coefC, events: events, metals: metals, results: results });
    };
  }, [area, material, coefC, events, metals, results]);

  var addEvent = function () {
    var newId = events.length > 0 ? Math.max.apply(null, events.map(function (e) { return e.id; })) + 1 : 1;
    setEvents(events.concat([{ id: newId, type: 'Intensidad', value: '10', duration: '1', pattern: 'Uniforme', slope: '2.0', dryDays: '2' }]));
  };
  var removeEvent = function (id) { setEvents(events.filter(function (e) { return e.id !== id; })); };
  var updateEvent = function (id, field, value) {
    setEvents(events.map(function (e) { if (e.id !== id) return e; var o = {}; o[field] = value; return Object.assign({}, e, o); }));
  };
  var updateMetal = function (idx, field, value) {
    var u = metals.slice(); if (field === 'active') u[idx] = Object.assign({}, u[idx], { active: value }); else { var o = {}; o[field] = value; u[idx] = Object.assign({}, u[idx], o); } setMetals(u);
  };
  var handleMaterialChange = function (mat) { setMaterial(mat); setCoefC(String(E.SM[mat])); };

  // Smart paste handler: format Metal,LW,ML,LE,Ler,Bmax,kb,kw,n,dias_secos,precipitacion_mm,duracion_h
  // Groups metals with same hydro params as same event
  var handlePasteData = function () {
    try {
      var lines = pasteText.trim().split('\n').filter(function (l) { return l.trim(); });
      if (!lines.length) { setPasteMsg('Sin datos'); return; }
      var cnt = 0;
      var updated = metals.slice();
      var eventGroups = {}; // key = 'precip|duration|dryDays|slope' -> metals
      lines.forEach(function (line) {
        var sep = line.indexOf('\t') >= 0 ? '\t' : (line.indexOf(',') >= 0 ? ',' : (line.indexOf(';') >= 0 ? ';' : null));
        var parts = sep ? line.split(sep).map(function (s) { return s.trim(); }) : line.split(/\s+/);
        if (parts.length < 2) return;
        var mName = parts[0];
        var idx = updated.findIndex(function (m) { return m.name === mName; });
        if (idx < 0) {
          var std = E.DM[mName] || {};
          updated.push({ name: mName, LW: String(std.LW || 0), ML: String(std.ML || 0), LE: String(std.LE || 0), Ler: String(std.Ler || 0), Bmax: String(std.Bmax || 0), kb: String(std.kb || 0), kw: String(std.kw || 0), n: String(std.n || 1), active: true });
          idx = updated.length - 1;
        }
        var fields = ['LW', 'ML', 'LE', 'Ler', 'Bmax', 'kb', 'kw', 'n'];
        for (var i = 1; i < parts.length && i <= fields.length; i++) {
          var val = parts[i].replace(',', '.').trim();
          if (val === '-' || val === '--' || val === '' || val === 'NA') {
            var std = E.DM[mName];
            if (std && std[fields[i - 1]] !== undefined) {
              var o = {}; o[fields[i - 1]] = String(std[fields[i - 1]]); updated[idx] = Object.assign({}, updated[idx], o);
            }
          } else {
            var num = parseFloat(val);
            if (!isNaN(num)) { var o = {}; o[fields[i - 1]] = String(num); updated[idx] = Object.assign({}, updated[idx], o); }
          }
        }
        updated[idx] = Object.assign({}, updated[idx], { active: true });
        // Extract hydro params if present (fields 9=dias_secos, 10=precipitacion, 11=duracion_h)
        var ds = parts.length > 9 ? parts[9].trim() : '';
        var pp = parts.length > 10 ? parts[10].trim() : '';
        var dh = parts.length > 11 ? parts[11].trim() : '';
        if (ds && pp && dh) {
          var key = pp + '|' + dh + '|' + ds;
          if (!eventGroups[key]) eventGroups[key] = { metals: [], precip: pp, duration: dh, dryDays: ds };
          if (eventGroups[key].metals.indexOf(mName) < 0) eventGroups[key].metals.push(mName);
        }
        cnt++;
      });
      setMetals(updated);

      // Smart event grouping: create events from groups
      var gKeys = Object.keys(eventGroups);
      if (gKeys.length > 0) {
        var newEvents = gKeys.map(function (k, i) {
          var g = eventGroups[k];
          return { id: i + 1, type: 'Precipitación', value: g.precip, duration: g.duration, pattern: 'Uniforme', slope: '2.0', dryDays: g.dryDays };
        });
        setEvents(newEvents);
        setPasteMsg(cnt + ' metales procesados, ' + gKeys.length + ' eventos detectados automáticamente');
      } else {
        setPasteMsg(cnt + ' metales procesados');
      }
    } catch (e) { setPasteMsg('Error: ' + e.message); }
  };

  // Excel upload handler
  var handleExcelUpload = function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (evt) {
      try {
        var wb = XLSX.read(evt.target.result, { type: 'binary' });
        var ws = wb.Sheets[wb.SheetNames[0]];
        var data = XLSX.utils.sheet_to_csv(ws);
        setPasteText(data);
        setPasteMsg('Excel cargado. Presione Subir Datos.');
      } catch (err) { setPasteMsg('Error leyendo Excel: ' + err.message); }
    };
    reader.readAsBinaryString(file);
  };

  var numInput = function (label, value, onChange) {
    return h('div', null,
      h('label', { className: 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1' }, label),
      h('input', { type: 'text', inputMode: 'decimal', value: value, onChange: function (e) { onChange(e.target.value); }, className: 'w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:outline-none' })
    );
  };

  var runSimulation = function () {
    setRunning(true);
    setTimeout(function () {
      try {
        var A = parseFloat(area) || 5000;
        var C = parseFloat(coefC) || 0.85;
        var activeMetals = metals.filter(function (m) { return m.active; });
        if (activeMetals.length === 0 || events.length === 0) { setRunning(false); return; }

        var ml = activeMetals.map(function (m) { return m.name; });
        var act = {};
        activeMetals.forEach(function (m) {
          var std = E.DM[m.name] || {};
          act[m.name] = {
            LW: parseFloat(m.LW) || std.LW || 0, ML: parseFloat(m.ML) || std.ML || 0,
            LE: parseFloat(m.LE) || std.LE || 0, Ler: parseFloat(m.Ler) || std.Ler || 0,
            Bmax: parseFloat(m.Bmax) || std.Bmax || 0, kb: parseFloat(m.kb) || std.kb || 0,
            kw: parseFloat(m.kw) || std.kw || 0, n: parseFloat(m.n) || std.n || 1
          };
        });

        var tlw_r = {};
        ml.forEach(function (m) { tlw_r[m] = E.calcTLW(act[m].LW, act[m].ML, act[m].LE, act[m].Ler); });

        var tl_days = [], tl_mass = {}, tl_cum = {};
        ml.forEach(function (m) { tl_mass[m] = []; tl_cum[m] = []; });
        var mass = {}, cum = {};
        ml.forEach(function (m) { mass[m] = 0; cum[m] = 0; });
        var cd = 0, et = [];

        events.forEach(function (ev, ei) {
          var dd = parseFloat(ev.dryDays) || 0;
          var ns = Math.max(Math.round(dd / 0.1), 1);
          var dr = dd / ns;
          for (var s = 0; s <= ns; s++) {
            tl_days.push(cd + s * dr);
            ml.forEach(function (m) {
              if (s > 0) mass[m] = E.buildUpFrom(mass[m], act[m].Bmax, act[m].kb, dr);
              tl_mass[m].push(mass[m]);
              tl_cum[m].push(cum[m]);
            });
          }
          cd += dd;
          var durH = parseFloat(ev.duration) || 1;
          var Ie = ev.type === 'Intensidad' ? (parseFloat(ev.value) || 0) : (durH > 0 ? (parseFloat(ev.value) || 0) / durH : 0);
          var row = { Evento: ei + 1, Dias_secos: dd, Valor: ev.value, Dur_min: ev.duration, I: Ie.toFixed(1) };
          ml.forEach(function (m) {
            var Bp = mass[m];
            var W = E.washoffInst(Bp, act[m].kw, Ie, act[m].n);
            var ld = (tlw_r[m].TLW / 100) * W * A;
            mass[m] = Bp - W;
            cum[m] += ld / 1000;
            row[m + '_lav'] = W; row[m + '_cg'] = ld / 1000; row[m + '_Bp'] = Bp;
            row[m + '_eff'] = Bp > 0 ? (W / Bp * 100).toFixed(1) : '0.0';
          });
          tl_days.push(cd);
          ml.forEach(function (m) { tl_mass[m].push(mass[m]); tl_cum[m].push(cum[m]); });
          et.push(row);
        });

        var step = Math.max(1, Math.floor(tl_days.length / 300));
        var massChartData = [];
        for (var i = 0; i < tl_days.length; i += step) {
          var pt = { day: +tl_days[i].toFixed(2) };
          ml.forEach(function (m) { pt[m] = +tl_mass[m][i].toFixed(2); });
          massChartData.push(pt);
        }
        var cumChartData = [];
        for (var i = 0; i < tl_days.length; i += step) {
          var pt = { day: +tl_days[i].toFixed(2) };
          ml.forEach(function (m) { pt[m] = +tl_cum[m][i].toFixed(4); });
          cumChartData.push(pt);
        }

        var totalVol = events.reduce(function (s, ev) {
          var durH = parseFloat(ev.duration) || 1;
          var Ie = ev.type === 'Intensidad' ? (parseFloat(ev.value) || 0) : (durH > 0 ? (parseFloat(ev.value) || 0) / durH : 0);
          return s + C * (Ie / 1000) * A * durH;
        }, 0);
        var maxQ = Math.max.apply(null, events.map(function (ev) {
          var durH = parseFloat(ev.duration) || 1;
          var Ie = ev.type === 'Intensidad' ? (parseFloat(ev.value) || 0) : (durH > 0 ? (parseFloat(ev.value) || 0) / durH : 0);
          return (C * Ie * A) / 3.6e6 * 1000;
        }));

        // TLW bar data
        var tlwBar = ml.map(function (m) { return { name: m, T1: +tlw_r[m].T1.toFixed(3), T2: +tlw_r[m].T2.toFixed(3), T3: +tlw_r[m].T3.toFixed(3) }; });

        // Total load bar per metal
        var loadBar = ml.map(function (m) { return { name: m, load: +cum[m].toFixed(4), fill: MC[m] || '#6B7280' }; });

        setResults({ ml: ml, act: act, tlw_r: tlw_r, et: et, massChartData: massChartData, cumChartData: cumChartData, cum: cum, mass: mass, A: A, totalVol: totalVol, maxQ: maxQ, cd: cd, nEvents: events.length, tlwBar: tlwBar, loadBar: loadBar });
      } catch (e) { console.error(e); }
      setRunning(false);
    }, 500);
  };

  return h('div', { className: 'flex-1 overflow-y-auto bg-[#F7F9FC]' },
    // Header
    h('div', { className: 'bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20' },
      h('div', null,
        h('h1', { className: 'text-2xl font-bold text-slate-900' }, 'Simulación Multieventos'),
        h('p', { className: 'text-sm text-slate-500' }, 'Defina los parámetros de los eventos y la geometría del área para la ejecución múltiple de transporte de contaminantes.')
      ),
      h('button', { onClick: runSimulation, disabled: running, className: 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg transition-colors disabled:opacity-50' }, running ? 'Calculando...' : 'Ejecutar Simulación')
    ),

    h('div', { className: 'p-6 space-y-6' },
      // Simulation Title (FIRST)
      h('div', { className: 'bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4' },
        h('div', { className: 'w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0' }, '📝'),
        h('div', { className: 'flex-1' },
          h('label', { className: 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1' }, 'Título de la simulación'),
          h('input', {
            type: 'text', value: simName, onChange: function(e) { setSimName(e.target.value); },
            placeholder: 'Ej: Campaña Zona Norte — Multieventos Diciembre',
            className: 'w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:outline-none'
          })
        )
      ),
      // Geometry
      h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
        h('h3', { className: 'font-bold text-slate-900 mb-4' }, 'Geometría del área de estudio'),
        h('div', { className: 'grid grid-cols-3 gap-4' },
          numInput('Área total (m²)', area, setArea),
          h('div', null,
            h('label', { className: 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1' }, 'Material de superficie'),
            h('select', { value: material, onChange: function (e) { handleMaterialChange(e.target.value); }, className: 'w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:outline-none' },
              Object.keys(E.SM).map(function (m) { return h('option', { key: m, value: m }, m); })
            )
          ),
          numInput('Coeficiente de escorrentía', coefC, setCoefC)
        )
      ),

      // Events Table
      h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
        h('div', { className: 'flex items-center justify-between mb-4' },
          h('h3', { className: 'font-bold text-slate-900' }, 'Parámetros Hidrológicos (Eventos)'),
          h('button', { onClick: addEvent, className: 'border border-[#6D28D9] text-[#6D28D9] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors' }, '+ Añadir Evento')
        ),
        h('div', { className: 'overflow-x-auto' },
          h('table', { className: 'w-full text-sm' },
            h('thead', null,
              h('tr', { className: 'bg-slate-50' },
                ['#', 'Tipo', 'Valor', 'Duración (h)', 'Patrón', 'Pendiente (%)', 'Días Secos', ''].map(function (c) { return h('th', { key: c, className: 'px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center' }, c); })
              )
            ),
            h('tbody', null,
              events.map(function (ev, i) {
                return h('tr', { key: ev.id, className: 'border-t border-slate-100' },
                  h('td', { className: 'px-3 py-2 text-center font-bold text-slate-700' }, i + 1),
                  h('td', { className: 'px-2 py-1' },
                    h('select', { value: ev.type, onChange: function (e) { updateEvent(ev.id, 'type', e.target.value); }, className: 'w-full h-8 px-2 text-xs border border-slate-200 rounded focus:outline-none' },
                      h('option', { value: 'Intensidad' }, 'Intensidad (mm/h)'), h('option', { value: 'Precipitación' }, 'Precipitación (mm)')
                    )
                  ),
                  h('td', { className: 'px-2 py-1' }, h('input', { type: 'text', inputMode: 'decimal', value: ev.value, onChange: function (e) { updateEvent(ev.id, 'value', e.target.value); }, className: 'w-full h-8 px-2 text-xs text-center border border-slate-200 rounded focus:outline-none' })),
                  h('td', { className: 'px-2 py-1' }, h('input', { type: 'text', inputMode: 'decimal', value: ev.duration, onChange: function (e) { updateEvent(ev.id, 'duration', e.target.value); }, className: 'w-full h-8 px-2 text-xs text-center border border-slate-200 rounded focus:outline-none' })),
                  h('td', { className: 'px-3 py-2 text-center text-xs' }, ev.pattern),
                  h('td', { className: 'px-2 py-1' }, h('input', { type: 'text', inputMode: 'decimal', value: ev.slope, onChange: function (e) { updateEvent(ev.id, 'slope', e.target.value); }, className: 'w-full h-8 px-2 text-xs text-center border border-slate-200 rounded focus:outline-none' })),
                  h('td', { className: 'px-2 py-1' }, h('input', { type: 'text', inputMode: 'decimal', value: ev.dryDays, onChange: function (e) { updateEvent(ev.id, 'dryDays', e.target.value); }, className: 'w-full h-8 px-2 text-xs text-center border border-slate-200 rounded focus:outline-none' })),
                  h('td', { className: 'px-3 py-2 text-center' },
                    events.length > 1 && h('button', { onClick: function () { removeEvent(ev.id); }, className: 'text-red-500 hover:text-red-700 font-bold text-xs' }, 'X')
                  )
                );
              })
            )
          )
        )
      ),

      // Metals Table
      h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
        h('div', { className: 'flex items-center justify-between mb-4' },
          h('h3', { className: 'font-bold text-slate-900' }, 'Metales a simular (Cinética de lavado)'),
          h('button', { className: 'border border-slate-300 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50' }, 'Subir Excel')
        ),
        h('div', { className: 'overflow-x-auto' },
          h('table', { className: 'w-full text-sm' },
            h('thead', null,
              h('tr', { className: 'bg-slate-50' },
                ['Metal', 'LW', 'ML', 'LE', 'Ler', 'Bmax', 'kb', 'kw', 'n', 'Activo'].map(function (c) { return h('th', { key: c, className: 'px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center' }, c); })
              )
            ),
            h('tbody', null,
              metals.map(function (m, idx) {
                return h('tr', { key: m.name, className: 'border-t border-slate-100 hover:bg-slate-50' },
                  h('td', { className: 'px-2 py-1.5 font-bold text-center text-sm', style: { color: MC[m.name] || '#333' } }, m.name),
                  ['LW', 'ML', 'LE', 'Ler', 'Bmax', 'kb', 'kw', 'n'].map(function (f) {
                    return h('td', { key: f, className: 'px-1 py-1' },
                      h('input', { type: 'text', inputMode: 'decimal', value: m[f], onChange: function (e) { updateMetal(idx, f, e.target.value); }, className: 'w-full h-7 px-1 text-center text-xs border border-slate-200 rounded focus:ring-1 focus:ring-purple-300 focus:outline-none' })
                    );
                  }),
                  h('td', { className: 'px-2 py-1 text-center' },
                    h('input', { type: 'checkbox', checked: m.active, onChange: function (e) { updateMetal(idx, 'active', e.target.checked); }, className: 'w-4 h-4 accent-[#6D28D9]' })
                  )
                );
              })
            )
          )
        )
      ),

      // Data paste
      h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
        h('h3', { className: 'font-bold text-slate-900 mb-3' }, 'Carga masiva de parámetros'),
        h('p', { className: 'text-xs text-slate-500 mb-3' }, 'Formato: Metal, LW, ML, LE, Ler, Bmax, kb, kw, n, días_secos, precipitación_mm, duración_h. Use "-" para valores desconocidos (se aplicarán valores estándar). Si se incluyen parámetros hidrológicos, el sistema detecta automáticamente los eventos.'),
        h('textarea', { value: pasteText, onChange: function (e) { setPasteText(e.target.value); }, rows: 4, className: 'w-full p-3 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-purple-300 focus:outline-none resize-y', placeholder: 'Zn\t70.1\t48\t25.3\t28.1\t350\t0.5\t0.18\t1.1\t3\t30\t1\nCu\t58.4\t55\t20.8\t19.6\t-\t-\t-\t-\t3\t30\t1\nMn\t63.8\t56\t21.7\t22.7\t-\t-\t-\t-\t5\t50\t2' }),
        h('div', { className: 'flex items-center gap-3 mt-3' },
          h('button', { onClick: handlePasteData, className: 'bg-[#6D28D9] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#5B21B6]' }, 'Subir Datos'),
          h('label', { className: 'border border-slate-300 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer inline-flex items-center gap-1' },
            h('input', { type: 'file', accept: '.xlsx,.xls,.csv', onChange: handleExcelUpload, className: 'hidden' }),
            'Subir Excel'
          ),
          pasteMsg && h('span', { className: 'text-sm font-semibold ' + (pasteMsg.indexOf('Error') >= 0 ? 'text-red-600' : 'text-green-600') }, pasteMsg)
        )
      ),

      // RESULTS
      results && h('div', { className: 'space-y-6 animate-fadeIn' },
        h('div', { className: 'flex items-center gap-3' },
          h('div', { className: 'w-1 h-8 bg-[#6D28D9] rounded' }),
          h('h2', { className: 'text-xl font-bold text-slate-900' }, 'Resultados Multieventos'),
          h('span', { className: 'bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase' }, 'Completado')
        ),

        // KPIs
        h('div', { className: 'grid grid-cols-4 gap-3' },
          [
            { label: 'ÁREA DE ESTUDIO', value: parseFloat(area).toLocaleString() + ' m²' },
            { label: 'VOLUMEN TOTAL', value: results.totalVol.toFixed(4) + ' m³' },
            { label: 'CAUDAL PICO', value: results.maxQ.toFixed(4) + ' L/s' },
            { label: 'EVENTOS SIMULADOS', value: String(results.nEvents) },
          ].map(function (k, i) {
            return h('div', { key: i, className: 'bg-white rounded-xl border border-slate-200 p-4' },
              h('div', { className: 'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1' }, k.label),
              h('div', { className: 'text-xl font-bold text-[#1E3A5F]' }, k.value)
            );
          })
        ),

        // Chart 1: TLW bar
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'font-bold text-slate-900 mb-2' }, 'Gráfica 1: Análisis TLW por Metal'),
          h('p', { className: 'text-xs text-slate-500 mb-3' }, 'Distribución del Total Load Washoff en 3 componentes.'),
          ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 220 },
            h(BarChart, { data: results.tlwBar },
              h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
              h(XAxis, { dataKey: 'name', tick: { fontSize: 11, fontWeight: 'bold' } }),
              h(YAxis, { tick: { fontSize: 10 } }), h(Tooltip, null), h(Legend, null),
              h(Bar, { dataKey: 'T1', stackId: 'a', fill: '#5dade2', name: 'T1: Transporte RDS < 250 µm' }),
              h(Bar, { dataKey: 'T2', stackId: 'a', fill: '#58d68d', name: 'T2: Lixiviación RDS < 250 µm' }),
              h(Bar, { dataKey: 'T3', stackId: 'a', fill: '#f5b041', name: 'T3: Lixiviación RDS > 250 µm' })
            )
          )
        ),

        // Chart 2: Mass timeline
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'font-bold text-slate-900 mb-2' }, 'Gráfica 2: Build-up y Wash-off'),
          h('p', { className: 'text-xs text-slate-500 mb-3' }, 'Masa remanente en superficie a lo largo del tiempo. Caídas verticales = eventos de lavado.'),
          ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 300 },
            h(LineChart, { data: results.massChartData },
              h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
              h(XAxis, { dataKey: 'day', tick: { fontSize: 10 }, label: { value: 'Días', position: 'bottom', fontSize: 10 } }),
              h(YAxis, { tick: { fontSize: 10 }, label: { value: 'mg/m²', angle: -90, position: 'insideLeft', fontSize: 10 } }),
              h(Tooltip, null), h(Legend, null),
              results.ml.map(function (m) { return h(Line, { key: m, type: 'monotone', dataKey: m, stroke: MC[m] || '#6B7280', strokeWidth: 2, dot: false }); })
            )
          )
        ),

        // Chart 3: Cumulative load
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'font-bold text-slate-900 mb-2' }, 'Gráfica 3: Carga Acumulada en el Receptor'),
          h('p', { className: 'text-xs text-slate-500 mb-3' }, 'Masa total acumulada removida (g) que llega al cuerpo receptor después de cada evento.'),
          ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 250 },
            h(LineChart, { data: results.cumChartData },
              h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
              h(XAxis, { dataKey: 'day', tick: { fontSize: 10 }, label: { value: 'Días', position: 'bottom', fontSize: 10 } }),
              h(YAxis, { tick: { fontSize: 10 }, label: { value: 'g', angle: -90, position: 'insideLeft', fontSize: 10 } }),
              h(Tooltip, null), h(Legend, null),
              results.ml.map(function (m) { return h(Line, { key: m, type: 'monotone', dataKey: m, stroke: MC[m] || '#6B7280', strokeWidth: 2, dot: false }); })
            )
          )
        ),

        // Chart 4: Total load bar
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'font-bold text-slate-900 mb-2' }, 'Gráfica 4: Carga Total por Metal'),
          h('p', { className: 'text-xs text-slate-500 mb-3' }, 'Carga acumulada final (g) transportada al receptor por cada metal.'),
          ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 220 },
            h(BarChart, { data: results.loadBar },
              h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
              h(XAxis, { dataKey: 'name', tick: { fontSize: 11, fontWeight: 'bold' } }),
              h(YAxis, { tick: { fontSize: 10 } }), h(Tooltip, null),
              h(Bar, { dataKey: 'load', radius: [6, 6, 0, 0], name: 'Carga (g)' },
                results.loadBar.map(function (entry, i) { return h(Cell, { key: i, fill: entry.fill }); })
              )
            )
          )
        ),

        // Events Table
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'font-bold text-slate-900 mb-3' }, 'Tabla: Resultados por Evento'),
          h('div', { className: 'overflow-x-auto' },
            h('table', { className: 'w-full text-sm' },
              h('thead', null,
                h('tr', { className: 'bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white' },
                  ['Evento', 'I(mm/h)', 'D.Secos', 'Dur(min)'].concat(results.ml.map(function (m) { return m + ' Carga(g)'; })).concat(results.ml.map(function (m) { return m + ' Efic%'; })).map(function (c) { return h('th', { key: c, className: 'px-2 py-2 text-[10px] font-bold text-center whitespace-nowrap' }, c); })
                )
              ),
              h('tbody', null,
                results.et.map(function (row, i) {
                  return h('tr', { key: i, className: i % 2 === 0 ? 'bg-purple-50/30' : '' },
                    h('td', { className: 'px-2 py-1.5 text-center font-bold' }, row.Evento),
                    h('td', { className: 'px-2 py-1.5 text-center' }, row.I),
                    h('td', { className: 'px-2 py-1.5 text-center' }, row.Dias_secos),
                    h('td', { className: 'px-2 py-1.5 text-center' }, row.Dur_min),
                    results.ml.map(function (m) { return h('td', { key: m + 'c', className: 'px-2 py-1.5 text-center' }, (row[m + '_cg'] || 0).toFixed(6)); }),
                    results.ml.map(function (m) {
                      return h('td', { key: m + 'e', className: 'px-2 py-1.5 text-center' },
                        h('span', { className: 'px-2 py-0.5 rounded-full text-[10px] font-bold ' + (parseFloat(row[m + '_eff'] || 0) > 50 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700') }, (row[m + '_eff'] || '0.0') + '%')
                      );
                    })
                  );
                })
              )
            )
          )
        ),

        // Save button only (title is at the top)
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5 text-center' },
          h('h3', { className: 'font-bold text-slate-900 mb-3' }, 'Guardar Simulación en Historial'),
          h('button', {
            onClick: function() {
              var title = simName.trim() || ('Multieventos - ' + results.ml.join(', ') + ' (' + new Date().toLocaleDateString('es-CO') + ')');
              window.saveSimulation && window.saveSimulation('multi', title,
                { area: area, material: material, nEvents: results.nEvents },
                { cum: results.cum, totalVol: results.totalVol },
                results.ml, parseFloat(area) || 0
              ).then(function() { setSaveMsg('Guardado exitosamente'); setSimName(''); });
            }, className: 'bg-[#1E3A5F] text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-[#15304f] transition-colors'
          }, 'Guardar en Historial'),
          saveMsg && h('p', { className: 'text-green-600 text-sm font-semibold mt-2 animate-fadeIn' }, saveMsg)
        ),

        // METHODOLOGY
        h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
          h('h3', { className: 'text-lg font-bold text-slate-900 mb-4' }, 'Metodología de Cálculo'),
          h('div', { className: 'space-y-4 text-sm text-slate-700 leading-relaxed' },
            h('div', { className: 'bg-purple-50 rounded-lg p-4 border-l-4 border-[#6D28D9]' },
              h('h4', { className: 'font-bold text-[#6D28D9] mb-2' }, 'Build-up Multievento (Acumulación continua)'),
              h('div', { className: 'bg-white rounded p-3 font-mono text-xs border border-purple-200 space-y-1' },
                h('div', null, 'B(t+dt) = B(t) + (Bmax - B(t)) × (1 - e^(-kb × dt))'),
                h('div', { className: 'text-slate-500' }, 'La masa remanente después de cada evento se utiliza como punto inicial para la siguiente acumulación.')
              )
            ),
            h('div', { className: 'bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500' },
              h('h4', { className: 'font-bold text-orange-700 mb-2' }, 'Wash-off Instantáneo por Evento'),
              h('div', { className: 'bg-white rounded p-3 font-mono text-xs border border-orange-200 space-y-1' },
                h('div', null, 'W = B × (1 - e^(-kw × I^n))'),
                h('div', null, 'Carga = (TLW / 100) × W × Área'),
                h('div', { className: 'text-slate-500' }, 'I = intensidad (mm/h), kw = coef. lavado, n = exponente, B = masa acumulada previa')
              )
            ),
            h('div', { className: 'bg-blue-50 rounded-lg p-4 border-l-4 border-[#3B82F6]' },
              h('h4', { className: 'font-bold text-[#2471A3] mb-2' }, 'Análisis TLW'),
              h('div', { className: 'bg-white rounded p-3 font-mono text-xs border border-blue-200 space-y-1' },
                h('div', null, 'T₁ = (LW × ML) / 100  |  T₂ = LE × (1 - LW/100) × (ML/100)  |  T₃ = Ler × (1 - ML/100)'),
                h('div', { className: 'font-bold' }, 'TLW = T₁ + T₂ + T₃')
              )
            )
          )
        ),

        // Steps
        h('div', { className: 'grid grid-cols-3 gap-4' },
          [
            { step: '1', title: 'Fase de Acumulación', desc: 'Cálculo de la masa total en superficie basado en días secos y tasa Bmax/kb.' },
            { step: '2', title: 'Fase de Lavado', desc: 'Integración de la intensidad del evento y coeficientes kw/n para determinar remoción.' },
            { step: '3', title: 'Análisis Multievento', desc: 'Evaluación de la masa remanente tras cada evento y acumulación en el receptor.' },
          ].map(function (s) {
            return h('div', { key: s.step, className: 'bg-white rounded-xl border border-slate-200 p-4' },
              h('div', { className: 'w-8 h-8 bg-[#6D28D9] rounded-lg flex items-center justify-center text-white font-bold text-sm mb-3' }, s.step),
              h('div', { className: 'font-bold text-slate-900 text-sm mb-1' }, s.title),
              h('div', { className: 'text-xs text-slate-500 leading-relaxed' }, s.desc)
            );
          })
        )
      ),

      // Footer
      h('div', { className: 'text-center text-xs text-slate-400 py-6 border-t border-slate-200 mt-6' }, '© 2024 HYDROTRACE PLATFORM - V3.4')
    )
  );
}

window.MultiSimulation = MultiSimulation;
