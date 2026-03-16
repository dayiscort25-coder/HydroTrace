// HomePage Component - Dynamic: Supabase data + hero text + user history
function HomePage({ onNavigate, onRunScenario, user }) {
  var h = React.createElement;
  var RC = window.Recharts || {};
  var BarChart = RC.BarChart; var Bar = RC.Bar; var XAxis = RC.XAxis; var YAxis = RC.YAxis;
  var CartesianGrid = RC.CartesianGrid; var Tooltip = RC.Tooltip; var ResponsiveContainer = RC.ResponsiveContainer;
  var _s = React.useState;

  // Fetch user's simulation history from Supabase
  var _hist = _s([]), history = _hist[0], setHistory = _hist[1];
  var _loading = _s(true), loading = _loading[0], setLoading = _loading[1];

  React.useEffect(function() {
    if (!user || !user.id) { setLoading(false); return; }
    window.sb.from('simulation_history').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(20)
      .then(function(res) {
        setHistory(res.data || []);
        setLoading(false);
      });
  }, [user]);

  var hasHistory = history.length > 0;

  // Default scenarios (always shown)
  var defaultScenarios = [
    { name: 'Lluvia Intensa Corta', duration: '45 min', intensity: '120 mm/h', region: 'Centro Urbano', icon: '🌧️', params: { intensity: 120, duration: 0.75, dryDays: 5 }, source: 'default' },
    { name: 'Tormenta Urbana Típica', duration: '4 horas', intensity: '35 mm/h', region: 'Residencial', icon: '⛈️', params: { intensity: 35, duration: 4, dryDays: 7 }, source: 'default' },
    { name: 'Llovizna Continua', duration: '12 horas', intensity: '5 mm/h', region: 'Suburbano', icon: '🌦️', params: { intensity: 5, duration: 12, dryDays: 3 }, source: 'default' },
  ];

  // Build user history scenarios from saved simulations
  var historyScenarios = history.slice(0, 3).map(function(item) {
    var cfg = item.config || {};
    var isMulti = item.simulation_type === 'multi';
    return {
      name: item.title || (isMulti ? 'Multieventos' : 'Evento Único'),
      duration: cfg.duration ? cfg.duration + ' h' : '-',
      intensity: cfg.intensity ? cfg.intensity + ' mm/h' : '-',
      region: (item.metals_used || []).join(', ') || '-',
      icon: isMulti ? '📊' : '🔬',
      params: { intensity: cfg.intensity || 30, duration: cfg.duration || 1, dryDays: cfg.dryDays || 5 },
      source: 'history',
      date: new Date(item.created_at).toLocaleDateString('es-CO')
    };
  });

  // Combine: user historical events first, then defaults
  var allScenarios = historyScenarios.concat(defaultScenarios);

  // KPIs: derive from history if available, otherwise use example data
  var kpis;
  if (hasHistory) {
    var lastSim = history[0];
    var cfg = lastSim.config || {};
    var res = lastSim.results || {};
    kpis = [
      { label: 'SIMULACIONES REALIZADAS', value: String(history.length), badge: hasHistory ? 'Activo' : '', badgeColor: 'bg-green-100 text-green-700' },
      { label: 'ÚLTIMA SIMULACIÓN', value: new Date(lastSim.created_at).toLocaleDateString('es-CO'), badge: lastSim.simulation_type === 'multi' ? 'Multieventos' : 'Evento Único', badgeColor: 'bg-blue-100 text-blue-700' },
      { label: 'ÁREA EVALUADA', value: (lastSim.area_m2 || 0).toLocaleString() + ' m²', badge: 'Último estudio', badgeColor: 'bg-gray-100 text-gray-600' },
      { label: 'METALES ANALIZADOS', value: (lastSim.metals_used || []).join(', ') || '-', badge: String((lastSim.metals_used || []).length) + ' metales', badgeColor: 'bg-purple-100 text-purple-700' },
    ];
  } else {
    kpis = [
      { label: 'VOLUMEN ESCORRENTÍA (EJ.)', value: '4,280 m³', badge: 'Dato de ejemplo', badgeColor: 'bg-gray-100 text-gray-600' },
      { label: 'CARGA METÁLICA Zn (EJ.)', value: '12.4 kg', badge: 'Dato de ejemplo', badgeColor: 'bg-gray-100 text-gray-600' },
      { label: 'CAUDAL PICO (EJ.)', value: '0.85 m³/s', badge: 'Dato de ejemplo', badgeColor: 'bg-gray-100 text-gray-600' },
      { label: 'CARGA SEDIMENTOS (EJ.)', value: '245 kg/ha', badge: 'Dato de ejemplo', badgeColor: 'bg-gray-100 text-gray-600' },
    ];
  }

  // Chart data: from history or example
  var chartData;
  if (hasHistory) {
    chartData = history.slice(0, 8).reverse().map(function(item, i) {
      var d = new Date(item.created_at);
      return { name: d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }), value: item.area_m2 || Math.round(Math.random() * 500 + 100) };
    });
  } else {
    chartData = [
      { name: 'Ene', value: 320 }, { name: 'Feb', value: 280 }, { name: 'Mar', value: 450 },
      { name: 'Abr', value: 380 }, { name: 'May', value: 510 }, { name: 'Jun', value: 420 },
      { name: 'Jul', value: 350 }, { name: 'Ago', value: 490 },
    ];
  }

  return h('div', { className: 'flex-1 overflow-y-auto bg-[#F7F9FC]' },
    h('div', { className: 'p-6 space-y-6' },
      // Hero with image — UPDATED TEXT
      h('div', { className: 'relative rounded-2xl overflow-hidden flex items-center bg-white border border-slate-200' },
        h('div', { className: 'w-1/2 h-72 relative' },
          h('img', { src: 'imagen_home.webp', alt: 'HydroTrace', className: 'absolute inset-0 w-full h-full object-cover', onError: function(e) { e.target.style.display = 'none'; e.target.parentNode.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)'; } })
        ),
        h('div', { className: 'w-1/2 p-8' },
          h('h1', { className: 'text-3xl font-bold text-slate-900 mb-2' },
            'HydroTrace: ',
            h('span', { className: 'text-[#3B82F6]' }, 'Escorrentía Urbana'),
            h('br'),
            'y Simulación de Metales Pesados'
          ),
          h('p', { className: 'text-slate-500 text-sm mb-6 leading-relaxed' }, 'HydroTrace es una herramienta de análisis orientada a la evaluación del transporte de metales pesados en escorrentía urbana. Integra variables hidrológicas y características del terreno para analizar cómo diferentes eventos de lluvia influyen en la movilización de contaminantes en sedimentos viales.'),
          h('div', { className: 'flex gap-3' },
            h('button', { onClick: function() { onNavigate('single'); }, className: 'bg-[#3B82F6] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-md' }, 'Iniciar Simulación')
          )
        )
      ),

      // Scenarios — includes user history + defaults
      h('div', null,
        h('div', { className: 'flex items-center justify-between mb-4' },
          h('h2', { className: 'text-xl font-bold text-slate-900' }, 'Escenarios Disponibles'),
          historyScenarios.length > 0 && h('span', { className: 'text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full' }, historyScenarios.length + ' de tu historial')
        ),
        h('div', { className: 'grid grid-cols-3 gap-4' },
          allScenarios.slice(0, 6).map(function(s, i) {
            return h('div', { key: i, className: 'bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow relative' },
              s.source === 'history' && h('div', { className: 'absolute top-3 right-3 bg-blue-50 text-[#3B82F6] text-[9px] font-bold px-2 py-0.5 rounded-full' }, 'HISTORIAL'),
              h('div', { className: 'w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl mb-4' }, s.icon),
              h('h3', { className: 'font-bold text-slate-900 mb-3 text-sm leading-tight pr-14' }, s.name),
              h('div', { className: 'space-y-2 text-sm mb-4' },
                h('div', { className: 'flex justify-between' }, h('span', { className: 'text-slate-500' }, 'Duración:'), h('span', { className: 'font-medium text-slate-700' }, s.duration)),
                h('div', { className: 'flex justify-between' }, h('span', { className: 'text-slate-500' }, s.source === 'history' ? 'Metales:' : 'Intensidad:'), h('span', { className: 'font-medium text-slate-700' }, s.source === 'history' ? s.region : s.intensity)),
                s.date && h('div', { className: 'flex justify-between' }, h('span', { className: 'text-slate-500' }, 'Fecha:'), h('span', { className: 'font-medium text-slate-700' }, s.date))
              ),
              h('button', { onClick: function() { onRunScenario(s.params); }, className: 'w-full border border-[#3B82F6] text-[#3B82F6] py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors' }, s.source === 'history' ? 'Reejecutar' : 'Ejecutar Escenario')
            );
          })
        )
      ),

      // Dynamic Simulation Section
      h('div', { className: 'bg-white rounded-xl border border-slate-200 p-6' },
        h('div', { className: 'flex gap-8' },
          h('div', { className: 'w-1/2' },
            h('div', { className: 'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2' }, hasHistory ? 'DATOS DE TUS SIMULACIONES' : 'ANÁLISIS DE HIDROGRAMA EN TIEMPO REAL'),
            ResponsiveContainer && h(ResponsiveContainer, { width: '100%', height: 200 },
              h(BarChart, { data: chartData },
                h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
                h(XAxis, { dataKey: 'name', tick: { fontSize: 11 } }),
                h(YAxis, { tick: { fontSize: 11 } }),
                h(Tooltip, null),
                h(Bar, { dataKey: 'value', fill: '#3B82F6', radius: [4, 4, 0, 0] })
              )
            )
          ),
          h('div', { className: 'w-1/2 flex flex-col justify-center' },
            h('div', { className: 'flex gap-2 mb-3' },
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

      // KPIs — dynamic or example
      h('div', null,
        h('h2', { className: 'text-xl font-bold text-slate-900 mb-4' }, hasHistory ? 'Resumen de Resultados Recientes' : 'Escenarios de Ejemplo'),
        h('div', { className: 'grid grid-cols-4 gap-4' },
          kpis.map(function(k, i) {
            return h('div', { key: i, className: 'bg-white rounded-xl border border-slate-200 p-4' },
              h('div', { className: 'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1' }, k.label),
              h('div', { className: 'text-2xl font-bold text-[#1E3A5F] mb-2' }, k.value),
              h('span', { className: 'text-[11px] font-semibold px-2 py-0.5 rounded-full ' + k.badgeColor }, k.badge)
            );
          })
        )
      )
    )
  );
}

window.HomePage = HomePage;
