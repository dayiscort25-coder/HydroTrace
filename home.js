// HomePage Component - Carousel scenarios, TLW chart, compact results, responsive
function HomePage({ onNavigate, onRunScenario, user }) {
  var h = React.createElement;
  var RC = window.Recharts || {};
  var LineChart = RC.LineChart; var Line = RC.Line; var Area = RC.Area; var AreaChart = RC.AreaChart;
  var XAxis = RC.XAxis; var YAxis = RC.YAxis; var CartesianGrid = RC.CartesianGrid;
  var Tooltip = RC.Tooltip; var ResponsiveContainer = RC.ResponsiveContainer; var Legend = RC.Legend;
  var _s = React.useState;

  // Fetch user simulation history
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
  var defaultScenarios = [
    { name: 'Lluvia Intensa Corta', duration: '0.75 h', intensity: '120 mm/h', metals: 'Zn, Cu, Pb', icon: '🌧', params: { intensity: 120, duration: 0.75, dryDays: 5 }, source: 'default' },
    { name: 'Tormenta Urbana', duration: '4 h', intensity: '35 mm/h', metals: 'Zn, Pb', icon: '⛈', params: { intensity: 35, duration: 4, dryDays: 7 }, source: 'default' },
    { name: 'Llovizna Continua', duration: '12 h', intensity: '5 mm/h', metals: 'Cu, Zn', icon: '🌦', params: { intensity: 5, duration: 12, dryDays: 3 }, source: 'default' },
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

  // ===== TLW EXAMPLE CHART DATA =====
  var tlwData = [];
  if (hasHistory && history[0].results && history[0].results.cum) {
    // Use latest simulation cumulative data
    var cum = history[0].results.cum;
    for (var t = 0; t < (cum.length || 20); t++) {
      tlwData.push({ min: t * 5, T1: cum[t] ? cum[t].T1 || 0 : 0, T2: cum[t] ? cum[t].T2 || 0 : 0, T3: cum[t] ? cum[t].T3 || 0 : 0 });
    }
  }
  if (tlwData.length === 0) {
    // Example TLW data for novice users
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

  // ===== KPIs (compact) =====
  var kpis;
  if (hasHistory) {
    var last = history[0]; var lcfg = last.config || {};
    kpis = [
      { label: 'Simulaciones', value: String(history.length), sub: 'total' },
      { label: 'Última', value: new Date(last.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }), sub: last.simulation_type === 'multi' ? 'Multi' : 'Evento' },
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
    h('div', { className: 'p-6 space-y-5 max-w-[1400px] mx-auto' },

      // ===== HERO (responsive) =====
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

      // ===== SCENARIOS CAROUSEL =====
      h('div', null,
        h('div', { className: 'flex items-center justify-between mb-3' },
          h('h2', { className: 'text-lg font-bold text-slate-900' }, 'Escenarios Disponibles'),
          h('div', { className: 'flex items-center gap-2' },
            historyScenarios.length > 0 && h('span', { className: 'text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-full mr-2' }, historyScenarios.length + ' del historial'),
            h('button', {
              onClick: function() { setCarouselIdx(Math.max(0, carouselIdx - 1)); },
              disabled: carouselIdx === 0,
              className: 'w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all text-sm font-bold'
            }, '‹'),
            h('button', {
              onClick: function() { setCarouselIdx(Math.min(maxIdx, carouselIdx + 1)); },
              disabled: carouselIdx >= maxIdx,
              className: 'w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all text-sm font-bold'
            }, '›')
          )
        ),
        h('div', { className: 'grid grid-cols-3 gap-3', style: { transition: 'all 0.3s ease' } },
          visibleScenarios.map(function(s, i) {
            var shortName = s.name.length > 30 ? s.name.substring(0, 28) + '...' : s.name;
            return h('div', { key: carouselIdx + '-' + i, className: 'bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all relative animate-fadeIn' },
              s.source === 'history' && h('div', { className: 'absolute top-2.5 right-2.5 bg-blue-50 text-[#3B82F6] text-[8px] font-bold px-2 py-0.5 rounded-full' }, 'HISTORIAL'),
              h('div', { className: 'flex items-center gap-2.5 mb-3' },
                h('div', { className: 'w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-base' }, s.icon),
                h('h3', { className: 'font-bold text-slate-900 text-xs leading-tight flex-1' }, shortName)
              ),
              h('div', { className: 'text-[11px] text-slate-500 space-y-1 mb-3' },
                h('div', { className: 'flex justify-between' }, h('span', null, 'Duración:'), h('span', { className: 'font-medium text-slate-700' }, s.duration)),
                h('div', { className: 'flex justify-between' }, h('span', null, s.source === 'history' ? 'Metales:' : 'Intensidad:'), h('span', { className: 'font-medium text-slate-700' }, s.source === 'history' ? s.metals : s.intensity)),
                s.date && h('div', { className: 'flex justify-between' }, h('span', null, 'Fecha:'), h('span', { className: 'font-medium text-slate-700' }, s.date))
              ),
              h('button', { onClick: function() { onRunScenario(s.params); }, className: 'w-full border border-[#3B82F6] text-[#3B82F6] py-1.5 rounded-lg text-[11px] font-semibold hover:bg-blue-50 transition-colors' }, s.source === 'history' ? 'Reejecutar' : 'Ejecutar')
            );
          })
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

      // ===== COMPACT KPIs =====
      h('div', null,
        h('h2', { className: 'text-lg font-bold text-slate-900 mb-3' }, hasHistory ? 'Resultados Recientes' : 'Escenarios de Ejemplo'),
        h('div', { className: 'grid grid-cols-3 gap-2', style: { gridTemplateColumns: 'repeat(6, 1fr)' } },
          kpis.map(function(k, i) {
            return h('div', { key: i, className: 'bg-white rounded-lg border border-slate-200 p-3 text-center' },
              h('div', { className: 'text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 truncate' }, k.label),
              h('div', { className: 'text-sm font-bold text-[#1E3A5F] truncate' }, k.value),
              h('div', { className: 'text-[9px] text-slate-400 mt-0.5' }, k.sub)
            );
          })
        )
      )
    )
  );
}

window.HomePage = HomePage;
