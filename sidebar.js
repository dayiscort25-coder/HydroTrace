// Sidebar Component - dark mode in user dropdown, no emojis
function Sidebar({ currentPage, onNavigate, user, onLogout, darkMode, toggleDark }) {
  var h = React.createElement;
  var _s = React.useState(false), userMenuOpen = _s[0], setUserMenuOpen = _s[1];

  var menuItems = [
    { id: 'home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
    { id: 'single', label: 'Simular', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'multi', label: 'Multieventos', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
    { id: 'historial', label: 'Historial', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return h('div', { className: 'w-60 bg-white border-r border-slate-200 flex flex-col h-full flex-shrink-0' },
    // Logo
    h('div', { className: 'p-5 flex items-center gap-3' },
      h('div', { className: 'w-9 h-9 bg-[#3B82F6] rounded-lg flex items-center justify-center flex-shrink-0' },
        h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'white', stroke: 'white', strokeWidth: 1 },
          h('path', { d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' })
        )
      ),
      h('div', { className: 'min-w-0' },
        h('div', { className: 'font-bold text-slate-900 text-sm leading-tight' }, 'HydroTrace'),
        h('div', { className: 'text-[10px] text-slate-400 font-medium' }, 'Plataforma Hidrológica')
      )
    ),
    // Menu
    h('nav', { className: 'flex-1 px-3 mt-2' },
      menuItems.map(function (item) {
        return h('button', {
          key: item.id,
          onClick: function () { onNavigate(item.id); },
          className: 'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-1 ' +
            (currentPage === item.id ? 'bg-[#EFF6FF] text-[#3B82F6]' : 'text-slate-600 hover:bg-slate-50')
        },
          h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', className: 'flex-shrink-0' },
            h('path', { d: item.icon })
          ),
          h('span', { className: 'truncate text-left' }, item.label)
        );
      })
    ),
    // User Footer with dropdown (includes dark mode toggle)
    h('div', { className: 'p-4 border-t border-slate-200 relative' },
      h('div', { className: 'flex items-center gap-3 cursor-pointer', onClick: function () { setUserMenuOpen(!userMenuOpen); } },
        h('div', { className: 'w-9 h-9 bg-[#3B82F6] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0' }, user?.initials || 'JD'),
        h('div', { className: 'flex-1 min-w-0' },
          h('div', { className: 'text-sm font-semibold text-slate-900 truncate' }, user?.name || 'Usuario'),
          h('div', { className: 'text-[10px] text-slate-500 uppercase tracking-wider truncate' }, user?.role || 'INVESTIGADOR')
        ),
        h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: '#94a3b8', strokeWidth: 2, className: 'flex-shrink-0', style: { transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' } },
          h('path', { d: 'M7 10l5 5 5-5' })
        )
      ),
      userMenuOpen && h('div', { className: 'absolute bottom-full left-3 right-3 mb-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50' },
        // Profile
        h('button', { className: 'w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2', onClick: function () { setUserMenuOpen(false); onNavigate('perfil'); } },
          h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, h('path', { d: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z' })),
          'Perfil'
        ),
        // Dark mode toggle (no emojis)
        h('button', { className: 'w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2', onClick: function () { toggleDark(); } },
          h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
            darkMode
              ? h('path', { d: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' })
              : h('path', { d: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' })
          ),
          darkMode ? 'Modo Claro' : 'Modo Oscuro'
        ),
        h('div', { className: 'border-t border-slate-100 my-1' }),
        // Logout
        h('button', { className: 'w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2', onClick: function () { setUserMenuOpen(false); if (onLogout) onLogout(); } },
          h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, h('path', { d: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9' })),
          'Cerrar sesion'
        )
      )
    )
  );
}

window.Sidebar = Sidebar;
