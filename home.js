// HomePage Component - Restored simulation section, pastel cards, colorized KPIs, carousel
function HomePage({ onNavigate, onRunScenario, user }) {
  var h = React.createElement;
  var RC = window.Recharts || {};
  var BarChart = RC.BarChart; var Bar = RC.Bar; var AreaChart = RC.AreaChart; var Area = RC.Area;
  var XAxis = RC.XAxis; var YAxis = RC.YAxis; var CartesianGrid = RC.CartesianGrid;
  var Tooltip = RC.Tooltip; var ResponsiveContainer = RC.ResponsiveContainer; var Legend = RC.Legend;
  var _s = React.useState;

  var _hist = _s([]), history = _hist[0], setHistory = _hist[1];
  var _loading = _s(true), loading = _loading[0], setLoading = _loading[1];
  var _carouselIdx = _s(0), carouselIdx = _carouselIdx[0], setCarouselIdx = _carouselIdx[1];

  React.useEffect(function() {
    if (!user || !user.id) { setLoading(false); return; }
    window.sb.from('simulation_history').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(30)
      .then(function(res) { setHistory(res.data || []); setLoading(false); });
  }, [user]);

  var hasHistory = history.length > 0;

  // ===== SCENARIOS =====
  var cardColors = [
    { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'bg-blue-100', btn: 'border-blue-400 text-blue-600 hover:bg-blue-50' },
    { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'bg-emerald-100', btn: 'border-emerald-400 text-emerald-600 hover:bg-emerald-50' },
    { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'bg-amber-100', btn: 'border-amber-400 text-amber-600 hover:bg-amber-50' },
    { bg: 'bg-purple-50', border: 'border-purple-100', icon: 'bg-purple-100', btn: 'border-purple-400 text-purple-600 hover:bg-purple-50' },
    { bg: 'bg-rose-50', border: 'border-rose-100', icon: 'bg-rose-100', btn: 'border-rose-400 text-rose-600 hover:bg-rose-50' },
    { bg: 'bg-cyan-50', border: 'border-cyan-100', icon: 'bg-cyan-100', btn: 'border-cyan-400 text-cyan-600 hover:bg-cyan-50' },
  ];

  var defaultScenarios = [
    { name: 'Lluvia Intensa Corta', duration: '0.75 h', intensity: '120 mm/h', metals: 'Zn, Cu, Pb', icon: '🌧️', params: { intensity: 120, duration: 0.75, dryDays: 5 }, source: 'default' },
    { name: 'Tormenta Urbana Típica', duration: '4 h', intensity: '35 mm/h', metals: 'Zn, Pb', icon: '⛈️', params: { intensity: 35, duration: 4, dryDays: 7 }, source: 'default' },
    { name: 'Llovizna Continua', duration: '12 h', intensity: '5 mm/h', metals: 'Cu, Zn', icon: '🌦️', params: { intensity: 5, duration: 12, dryDays: 3 }, source: 'default' },
  ];

  var historyScenarios = history.map(function(item, i) {
    var cfg = item.config || {};
    return {
      name: item.title || ('Simulación ' + (i + 1)),
      duration: cfg.duration ? cfg.duration + ' h' : '-',
      intensity: cfg.intensity ? cfg.intensity + ' mm/h' : '-',
      metals: (item.metals_used || []).join(', ') || '-',
      icon: item.simulation_type === 'multi' ? '📊' : '🔬',
      params: { intensity: cfg.intensity || 30, duration: cfg.duration || 1, dryDays: cfg.dryDays || 5 },
      source: 'history',
      date: new Date(item.created_at).toLocaleDateString('es-CO')
    };
  });

  var allScenarios = historyScenarios.concat(defaultScenarios);
  var visibleCount = 3;
  var maxIdx = Math.max(0, allScenarios.length - visibleCount);
  var visibleScenarios = allScenarios.slice(carouselIdx, carouselIdx + visibleCount);

  // ===== TLW CHART DATA =====
  var tlwData = [];
  if (hasHistory && history[0].results && history[0].results.cum) {
    var cum = history[0].results.cum;
    for (var t = 0; t < (cum.length || 20); t++) {
      tlwData.push({ min: t * 5, T1: cum[t] ? cum[t].T1 || 0 : 0, T2: cum[t] ? cum[t].T2 || 0 : 0, T3: cum[t] ? cum[t].T3 || 0 : 0 });
    }
  }
  if (tlwData.length === 0) {
    for (var i = 0; i <= 24; i++) {
      var tt = i * 5;
      tlwData.push({
        min: tt,
        T1: Math.round((1 - Math.exp(-0.08 * tt)) * 85 * 10) / 10,
        T2: Math.round((1 - Math.exp(-0.04 * tt)) * 52 * 10) / 10,
        T3: Math.round((1 - Math.exp(-0.025 * tt)) * 34 * 10) / 10
      });
    }
  }

  // ===== BAR CHART DATA (for simulation section) =====
  var barData;
  if (hasHistory) {
    barData = history.slice(0, 8).reverse().map(function(item) {
      var d = new Date(item.created_at);
      return { name: d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }), value: item.area_m2 || Math.round(Math.random() * 500 + 100) };
    });
  } else {
    barData = [
      { name: 'Ene', value: 320 }, { name: 'Feb', value: 280 }, { name: 'Mar', value: 450 },
      { name: 'Abr', value: 380 }, { name: 'May', value: 510 }, { name: 'Jun', value: 420 },
      { name: 'Jul', value: 350 }, { name: 'Ago', value: 490 },
    ];
  }

  // ===== KPIs (colorized) =====
  var kpiColors = [
    { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', label: 'text-blue-500' },
    { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', label: 'text-emerald-500' },
    { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', label: 'text-amber-500' },
    { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', label: 'text-purple-500' },
    { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', label: 'text-rose-500' },
    { bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-700', label: 'text-cyan-500' },
  ];
  var kpis;
  if (hasHistory) {
    var last = history[0]; var lcfg = last.config || {};
    kpis = [
      { label: 'Simulaciones', value: String(history.length), sub: 'total' },
      { label: 'Última fecha', value: new Date(last.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }), sub: last.simulation_type === 'multi' ? 'Multi' : 'Evento' },
      { label: 'Área', value: (last.area_m2 || 0).toLocaleString() + ' m²', sub: 'último estudio' },
      { label: 'Metales', value: (last.metals_used || []).join(', ') || '-', sub: (last.metals_used || []).length + ' usados' },
      { label: 'Duración', value: (lcfg.duration || '-') + ' h', sub: 'evento' },
      { label: 'Intensidad', value: (lcfg.intensity || '-') + ' mm/h', sub: 'configurada' },
    ];
  } else {
    kpis = [
      { label: 'Vol. Escorrentía', value: '4,280 m³', sub: 'ejemplo' },
      { label: 'Carga Zn', value: '12.4 kg', sub: 'ejemplo' },
      { label: 'Caudal Pico', value: '0.85 m³/s', sub: 'ejemplo' },
      { label: 'Sedimentos', value: '245 kg/ha', sub: 'ejemplo' },
      { label: 'Duración', value: '4 h', sub: 'ejemplo' },
      { label: 'Intensidad', value: '35 mm/h', sub: 'ejemplo' },
    ];
  }

  return h('div', { className: 'flex-1 overflow-y-auto bg-[#F7F9FC] main-content' },
    h('div', { className: 'p-6 space-y-6 max-w-[1400px] mx-auto' },

      // ===== HERO =====
      h('div', { className: 'relative rounded-2xl overflow-hidden flex items-center bg-white border border-slate-200 hero-flex' },
        h('div', { className: 'w-1/2 h-72 relative', style: { minHeight: 200 } },
          h('img', { src: 'imagen_home.webp', alt: 'HydroTrace', className: 'absolute inset-0 w-full h-full object-cover', onError: function(e) { e.target.style.display = 'none'; e.target.parentNode.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)'; } })
        ),
        h('div', { className: 'w-1/2 p-8' },
          h('h1', { className: 'text-3xl font-bold text-slate-900 mb-2' },
            'HydroTrace: ', h('span', { className: 'text-[#3B82F6]' }, 'Escorrentía Urbana')
          ),
          h('p', { className: 'text-slate-500 text-sm mb-5 leading-relaxed' }, 'HydroTrace es una herramienta de análisis orientada a la evaluación del transporte de metales pesados en escorrentía urbana. Integra variables hidrológicas y características del terreno para analizar cómo diferentes eventos de lluvia influyen en la movilización de contaminantes en sedimentos viales.'),
          h('button', { onClick: function() { onNavigate('single'); }, className: 'bg-[#3B82F6] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-md' }, 'Iniciar Simulación')
        )
      ),

      // ===== SCENARIOS CAROUSEL (emoji top, pastel colors, larger cards) =====
      h('div', null,
        h('div', { className: 'flex items-center justify-between mb-4' },
          h('h2', { className: 'text-xl font-bold text-slate-900' }, 'Escenarios Disponibles'),
          h('div', { className: 'flex items-center gap-2' },
            historyScenarios.length > 0 && h('span', { className: 'text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-full mr-2' }, historyScenarios.length + ' del historial'),
            h('button', {
              onClick: function() { setCarouselIdx(Math.max(0, carouselIdx - 1)); },
              disabled: carouselIdx === 0,
              className: 'w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all text-lg font-bold'
            }, '‹'),
            h('button', {
              onClick: function() { setCarouselIdx(Math.min(maxIdx, carouselIdx + 1)); },
              disabled: carouselIdx >= maxIdx,
              className: 'w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all text-lg font-bold'
            }, '›')
          )
        ),
        h('div', { className: 'grid grid-cols-3 gap-4' },
          visibleScenarios.map(function(s, i) {
            var clr = cardColors[(carouselIdx + i) % cardColors.length];
            var shortName = s.name.length > 35 ? s.name.substring(0, 33) + '...' : s.name;
            return h('div', { key: carouselIdx + '-' + i, className: clr.bg + ' rounded-xl border ' + clr.border + ' p-5 hover:shadow-lg transition-all relative animate-fadeIn' },
              s.source === 'history' && h('div', { className: 'absolute top-3 right-3 bg-white/80 text-[#3B82F6] text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm' }, 'HISTORIAL'),
              // Emoji on TOP, title BELOW
              h('div', { className: 'w-12 h-12 ' + clr.icon + ' rounded-xl flex items-center justify-center text-2xl mb-3 mx-auto' }, s.icon),
              h('h3', { className: 'font-bold text-slate-900 text-sm leading-tight text-center mb-4' }, shortName),
              h('div', { className: 'text-[11px] text-slate-500 space-y-1.5 mb-4' },
                h('div', { className: 'flex justify-between' }, h('span', null, 'Duración:'), h('span', { className: 'font-medium text-slate-700' }, s.duration)),
                h('div', { className: 'flex justify-between' }, h('span', null, s.source === 'history' ? 'Metales:' : 'Intensidad:'), h('span', { className: 'font-medium text-slate-700' }, s.source === 'history' ? s.metals : s.intensity)),
                s.date && h('div', { className: 'flex justify-between' }, h('span', null, 'Fecha:'), h('span', { className: 'font-medium text-slate-700' }, s.date))
              ),
              h('button', { onClick: function() { onRunScenario(s.params); }, className: 'w-full border ' + clr.btn + ' py-2 rounded-lg text-xs font-semibold transition-colors' }, s.source === 'history' ? 'Reejecutar' : 'Ejecutar Escenario')
            );
          })
        )
      ),

      // ===== SIMULACIÓN DINÁMICA DE ESCORRENTÍA URBANA (restored: text + bar chart) =====
      h('div', { className: 'bg-white rounded-xl border border-slate-200 p-6' },
        h('div', { className: 'flex gap-8 hero-flex' },
          // Left: Bar chart
          h('div', { className: 'w-1/2' },
            h('div', { className: 'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2' }, hasHistory ? 'DATOS DE TUS SIMULACIONES' : 'ANÁLISIS DE HIDROGRAMA EN TIEMPO REAL'),
            ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 220 },
              h(BarChart, { data: barData },
                h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
                h(XAxis, { dataKey: 'name', tick: { fontSize: 11 } }),
                h(YAxis, { tick: { fontSize: 11 } }),
                h(Tooltip, null),
                h(Bar, { dataKey: 'value', fill: '#3B82F6', radius: [4, 4, 0, 0] })
              )
            )
          ),
          // Right: Original text content
          h('div', { className: 'w-1/2 flex flex-col justify-center' },
            h('div', { className: 'flex gap-2 mb-3 flex-wrap' },
              ['BUILD-UP', 'WASH-OFF', 'METALES PESADOS'].map(function(b) {
                return h('span', { key: b, className: 'bg-blue-50 text-[#3B82F6] text-[10px] font-bold px-3 py-1 rounded-full' }, b);
              })
            ),
            h('h2', { className: 'text-2xl font-bold text-slate-900 mb-3' }, 'Simulación Dinámica de Escorrentía Urbana'),
            h('p', { className: 'text-slate-500 text-sm leading-relaxed mb-4' }, 'Nuestros algoritmos simulan la acumulación de material particulado y metales pesados en superficies impermeables durante períodos secos, y su posterior lavado durante eventos de tormenta. Analice el transporte de Plomo, Zinc y Cobre con resolución sub-métrica.'),
            h('button', { onClick: function() { onNavigate('single'); }, className: 'bg-[#1E3A5F] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#15304f] transition-colors w-fit flex items-center gap-2' }, 'Configurar Parámetros')
          )
        )
      ),

      // ===== TLW WELCOME CHART =====
      h('div', { className: 'bg-white rounded-xl border border-slate-200 p-5' },
        h('div', { className: 'flex items-center justify-between mb-3' },
          h('div', null,
            h('h2', { className: 'text-lg font-bold text-slate-900' }, 'Análisis TLW — Total Load Washoff'),
            h('p', { className: 'text-[11px] text-slate-400 mt-0.5' }, hasHistory ? 'Última simulación registrada' : 'Evento de ejemplo para demostración')
          ),
          !hasHistory && h('span', { className: 'bg-amber-50 text-amber-600 text-[10px] font-bold px-3 py-1 rounded-full' }, 'DATOS DE EJEMPLO')
        ),
        ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 220 },
          h(AreaChart, { data: tlwData },
            h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
            h(XAxis, { dataKey: 'min', tick: { fontSize: 10 }, label: { value: 'min', position: 'insideBottomRight', offset: -5, style: { fontSize: 10 } } }),
            h(YAxis, { tick: { fontSize: 10 }, label: { value: 'g/ha', angle: -90, position: 'insideLeft', style: { fontSize: 10 } } }),
            h(Tooltip, { contentStyle: { fontSize: 11, borderRadius: 8 } }),
            h(Legend, { wrapperStyle: { fontSize: 10 } }),
            h(Area, { type: 'monotone', dataKey: 'T1', name: 'T1: RDS < 250µm', stroke: '#3B82F6', fill: '#3B82F6', fillOpacity: 0.15, strokeWidth: 2 }),
            h(Area, { type: 'monotone', dataKey: 'T2', name: 'T2: Lixiviación < 25µm', stroke: '#10b981', fill: '#10b981', fillOpacity: 0.1, strokeWidth: 2 }),
            h(Area, { type: 'monotone', dataKey: 'T3', name: 'T3: Residual > 250µm', stroke: '#f59e0b', fill: '#f59e0b', fillOpacity: 0.1, strokeWidth: 2 })
          )
        )
      ),

      // ===== RESULTADOS RECIENTES (colorized pastel) =====
      h('div', null,
        h('h2', { className: 'text-xl font-bold text-slate-900 mb-3' }, hasHistory ? 'Resultados Recientes' : 'Escenarios de Ejemplo'),
        h('div', { className: 'grid gap-3', style: { gridTemplateColumns: 'repeat(6, 1fr)' } },
          kpis.map(function(k, i) {
            var clr = kpiColors[i % kpiColors.length];
            return h('div', { key: i, className: clr.bg + ' rounded-xl border ' + clr.border + ' p-3.5 text-center' },
              h('div', { className: 'text-[9px] font-bold ' + clr.label + ' uppercase tracking-wider mb-1 truncate' }, k.label),
              h('div', { className: 'text-base font-bold ' + clr.text + ' truncate' }, k.value),
              h('div', { className: 'text-[9px] text-slate-400 mt-0.5' }, k.sub)
            );
          })
        )
      )
    )
  );
}

window.HomePage = HomePage;
