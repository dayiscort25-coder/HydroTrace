// HomePage Component - TLW bar chart beside simulation text, pastel cards with borders, justified text
function HomePage({ onNavigate, onRunScenario, user }) {
  var h = React.createElement;
  var RC = window.Recharts || {};
  var BarChart = RC.BarChart; var Bar = RC.Bar;
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
  var cardStyles = [
    { bg: '#EFF6FF', border: '#93C5FD', icon: '#DBEAFE', btn: '#3B82F6' },
    { bg: '#ECFDF5', border: '#6EE7B7', icon: '#D1FAE5', btn: '#10B981' },
    { bg: '#FFFBEB', border: '#FCD34D', icon: '#FEF3C7', btn: '#F59E0B' },
    { bg: '#F5F3FF', border: '#C4B5FD', icon: '#EDE9FE', btn: '#8B5CF6' },
    { bg: '#FFF1F2', border: '#FDA4AF', icon: '#FFE4E6', btn: '#F43F5E' },
    { bg: '#ECFEFF', border: '#67E8F9', icon: '#CFFAFE', btn: '#06B6D4' },
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
      params: {
        simulationType: item.simulation_type || 'single',
        intensity: cfg.intensity || 30, duration: cfg.duration || 1, dryDays: cfg.dryDays || 5,
        area: cfg.area || 5000, material: cfg.material || 'Asfalto', coefC: cfg.coefC || 0.85,
        slope: cfg.slope || 2.5, length: cfg.length || 100, width: cfg.width || 50,
        title: item.title || '', address: cfg.address || '',
        metals_used_data: item.metals_used_data || null,
        events: cfg.events || null,
        results: item.results || null,
        hydroMode: cfg.hydroMode || 'intensity', precipVal: cfg.precipVal || 30,
        pattern: cfg.pattern || 'variable'
      },
      source: 'history',
      date: new Date(item.created_at).toLocaleDateString('es-CO')
    };
  });

  var allScenarios = historyScenarios.concat(defaultScenarios);
  var visibleCount = 3;
  var maxIdx = Math.max(0, allScenarios.length - visibleCount);
  var visibleScenarios = allScenarios.slice(carouselIdx, carouselIdx + visibleCount);

  // ===== TLW BAR CHART DATA (T1, T2, T3 components) =====
  var tlwBarData;
  if (hasHistory && history[0].results && history[0].results.tlwBarData) {
    tlwBarData = history[0].results.tlwBarData;
  } else {
    // Example TLW bar data for demonstration
    tlwBarData = [
      { name: 'Zn', T1: 42.5, T2: 18.3, T3: 8.7 },
      { name: 'Cu', T1: 28.1, T2: 12.6, T3: 5.2 },
      { name: 'Pb', T1: 15.8, T2: 7.4, T3: 3.1 },
    ];
  }

  // ===== KPIs (colorized) =====
  var kpiStyles = [
    { bg: '#EFF6FF', border: '#93C5FD', text: '#1D4ED8', label: '#3B82F6' },
    { bg: '#ECFDF5', border: '#6EE7B7', text: '#047857', label: '#10B981' },
    { bg: '#FFFBEB', border: '#FCD34D', text: '#B45309', label: '#F59E0B' },
    { bg: '#F5F3FF', border: '#C4B5FD', text: '#6D28D9', label: '#8B5CF6' },
    { bg: '#FFF1F2', border: '#FDA4AF', text: '#BE123C', label: '#F43F5E' },
    { bg: '#ECFEFF', border: '#67E8F9', text: '#0E7490', label: '#06B6D4' },
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
          h('p', { className: 'text-slate-500 text-sm mb-5 leading-relaxed', style: { textAlign: 'justify' } }, 'HydroTrace es una herramienta de análisis orientada a la evaluación del transporte de metales pesados en escorrentía urbana. Integra variables hidrológicas y características del terreno para analizar cómo diferentes eventos de lluvia influyen en la movilización de contaminantes en sedimentos viales.'),
          h('button', { onClick: function() { onNavigate('single'); }, className: 'bg-[#3B82F6] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-md' }, 'Iniciar Simulación')
        )
      ),

      // ===== SCENARIOS CAROUSEL (emoji top, pastel colors, defined borders) =====
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
            var cs = cardStyles[(carouselIdx + i) % cardStyles.length];
            var shortName = s.name.length > 35 ? s.name.substring(0, 33) + '...' : s.name;
            return h('div', { key: carouselIdx + '-' + i, className: 'sc-card rounded-xl p-5 hover:shadow-lg transition-all relative animate-fadeIn', style: { backgroundColor: cs.bg, border: '2px solid ' + cs.border } },
              s.source === 'history' && h('div', { className: 'absolute top-3 right-3 bg-white/80 text-[#3B82F6] text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm' }, 'HISTORIAL'),
              // Emoji on TOP, title BELOW
              h('div', { className: 'w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 mx-auto', style: { backgroundColor: cs.icon } }, s.icon),
              h('h3', { className: 'font-bold text-sm leading-tight text-center mb-4', style: { color: '#1e293b' } }, shortName),
              h('div', { className: 'text-[11px] space-y-1.5 mb-4', style: { color: '#475569' } },
                h('div', { className: 'flex justify-between' }, h('span', null, 'Duración:'), h('span', { className: 'font-medium', style: { color: '#1e293b' } }, s.duration)),
                h('div', { className: 'flex justify-between' }, h('span', null, s.source === 'history' ? 'Metales:' : 'Intensidad:'), h('span', { className: 'font-medium', style: { color: '#1e293b' } }, s.source === 'history' ? s.metals : s.intensity)),
                s.date && h('div', { className: 'flex justify-between' }, h('span', null, 'Fecha:'), h('span', { className: 'font-medium', style: { color: '#1e293b' } }, s.date))
              ),
              h('button', { onClick: function() { onRunScenario(s.params); }, className: 'w-full py-2 rounded-lg text-xs font-semibold transition-colors text-white', style: { backgroundColor: cs.btn } }, s.source === 'history' ? 'Reejecutar' : 'Ejecutar Escenario')
            );
          })
        )
      ),

      // ===== SIMULACIÓN DINÁMICA — Text + TLW Bar Chart =====
      h('div', { className: 'bg-white rounded-xl border border-slate-200 p-6' },
        h('div', { className: 'flex gap-8 hero-flex' },
          // Left: TLW Bar Chart (T1, T2, T3)
          h('div', { className: 'w-1/2' },
            h('div', { className: 'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2' }, 'Análisis TLW — Carga Total de Lavado'),
            ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 240 },
              h(BarChart, { data: tlwBarData },
                h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
                h(XAxis, { dataKey: 'name', tick: { fontSize: 11 } }),
                h(YAxis, { tick: { fontSize: 11 }, label: { value: 'g/ha', angle: -90, position: 'insideLeft', style: { fontSize: 10 } } }),
                h(Tooltip, { contentStyle: { fontSize: 11, borderRadius: 8 } }),
                h(Legend, { wrapperStyle: { fontSize: 10 } }),
                h(Bar, { dataKey: 'T1', name: 'T1: RDS < 250µm', fill: '#3B82F6', radius: [3, 3, 0, 0] }),
                h(Bar, { dataKey: 'T2', name: 'T2: Lixiviación < 25µm', fill: '#10B981', radius: [3, 3, 0, 0] }),
                h(Bar, { dataKey: 'T3', name: 'T3: Residual > 250µm', fill: '#F59E0B', radius: [3, 3, 0, 0] })
              )
            ),
            !hasHistory && h('div', { className: 'text-center mt-1' },
              h('span', { className: 'bg-amber-50 text-amber-600 text-[9px] font-bold px-3 py-1 rounded-full' }, 'DATOS DE EJEMPLO')
            )
          ),
          // Right: Original text content (justified)
          h('div', { className: 'w-1/2 flex flex-col justify-center' },
            h('div', { className: 'flex gap-2 mb-3 flex-wrap' },
              ['BUILD-UP', 'WASH-OFF', 'METALES PESADOS'].map(function(b) {
                return h('span', { key: b, className: 'bg-blue-50 text-[#3B82F6] text-[10px] font-bold px-3 py-1 rounded-full' }, b);
              })
            ),
            h('h2', { className: 'text-2xl font-bold text-slate-900 mb-3' }, 'Simulación Dinámica de Escorrentía Urbana'),
            h('p', { className: 'text-slate-500 text-sm leading-relaxed mb-4', style: { textAlign: 'justify' } }, 'Nuestros algoritmos simulan la acumulación de material particulado y metales pesados en superficies impermeables durante períodos secos, y su posterior lavado durante eventos de tormenta. Analice el transporte de Plomo, Zinc y Cobre con resolución sub-métrica.'),
            h('button', { onClick: function() { onNavigate('single'); }, className: 'bg-[#1E3A5F] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#15304f] transition-colors w-fit flex items-center gap-2' }, 'Configurar Parámetros')
          )
        )
      ),

      // ===== RESULTADOS RECIENTES (colorized pastel with borders) =====
      h('div', null,
        h('h2', { className: 'text-xl font-bold text-slate-900 mb-3' }, hasHistory ? 'Resultados Recientes' : 'Escenarios de Ejemplo'),
        h('div', { className: 'grid gap-3', style: { gridTemplateColumns: 'repeat(6, 1fr)' } },
          kpis.map(function(k, i) {
            var ks = kpiStyles[i % kpiStyles.length];
            return h('div', { key: i, className: 'rounded-xl p-3.5 text-center', style: { backgroundColor: ks.bg, border: '1.5px solid ' + ks.border } },
              h('div', { className: 'text-[9px] font-bold uppercase tracking-wider mb-1 truncate', style: { color: ks.label } }, k.label),
              h('div', { className: 'text-base font-bold truncate', style: { color: ks.text } }, k.value),
              h('div', { className: 'text-[9px] text-slate-400 mt-0.5' }, k.sub)
            );
          })
        )
      )
    )
  );
}

window.HomePage = HomePage;
