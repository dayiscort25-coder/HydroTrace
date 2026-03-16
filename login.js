// LoginPage Component - 3 screens: login, register, recover password
// Uses Fondo_incial.jpg, Supabase auth, Google OAuth
function LoginPage({ onLogin }) {
  var h = React.createElement;
  var _s = React.useState;
  // view: 'login' | 'register' | 'recover'
  var _v = _s('login'), view = _v[0], setView = _v[1];

  // Login state
  var _e = _s(''), email = _e[0], setEmail = _e[1];
  var _p = _s(''), password = _p[0], setPassword = _p[1];
  var _sp = _s(false), showPass = _sp[0], setShowPass = _sp[1];
  var _err = _s(''), error = _err[0], setError = _err[1];
  var _ld = _s(false), loading = _ld[0], setLoading = _ld[1];

  // Register state
  var _rn = _s(''), regName = _rn[0], setRegName = _rn[1];
  var _re = _s(''), regEmail = _re[0], setRegEmail = _re[1];
  var _rp = _s(''), regPass = _rp[0], setRegPass = _rp[1];
  var _rp2 = _s(''), regPass2 = _rp2[0], setRegPass2 = _rp2[1];
  var _rmsg = _s(''), regMsg = _rmsg[0], setRegMsg = _rmsg[1];

  // Recover state
  var _rc = _s(''), recEmail = _rc[0], setRecEmail = _rc[1];
  var _rm = _s(''), recMsg = _rm[0], setRecMsg = _rm[1];

  // Handle login — uses Supabase Auth first, then profile table fallback
  var handleLogin = function(ev) {
    ev.preventDefault();
    setLoading(true); setError('');
    // Try Supabase Auth sign-in first
    window.sb.auth.signInWithPassword({ email: email, password: password })
      .then(function(authRes) {
        if (!authRes.error && authRes.data && authRes.data.user) {
          // Auth succeeded — fetch profile
          return window.sb.from('profiles').select('*').eq('email', email).single()
            .then(function(pRes) {
              setLoading(false);
              if (pRes.data) {
                var u = pRes.data;
                onLogin({ id: u.id, name: u.full_name, email: u.email, role: u.role, phone: u.phone, location: u.location, accountLevel: u.account_level, memberSince: u.member_since ? new Date(u.member_since).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }) : '', initials: (u.full_name || 'U').split(' ').map(function(w){return w[0];}).join('').substring(0,2).toUpperCase() });
              } else {
                // Profile not found — create one from auth user
                var au = authRes.data.user;
                onLogin({ id: au.id, name: au.user_metadata?.full_name || au.email.split('@')[0], email: au.email, role: 'INVESTIGADOR', phone: '', location: '', accountLevel: 'Nivel Básico', memberSince: '', initials: au.email.substring(0,2).toUpperCase() });
              }
            });
        }
        // Auth failed — try direct profile table lookup (for demo/legacy accounts)
        return window.sb.from('profiles').select('*').eq('email', email).single()
          .then(function(res) {
            setLoading(false);
            if (res.error || !res.data) { setError('Correo no encontrado. Verifica tus credenciales.'); return; }
            var u = res.data;
            if (u.password_hash && u.password_hash !== '' && u.password_hash !== password) {
              setError('Contraseña incorrecta.'); return;
            }
            onLogin({ id: u.id, name: u.full_name, email: u.email, role: u.role, phone: u.phone, location: u.location, accountLevel: u.account_level, memberSince: u.member_since ? new Date(u.member_since).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }) : '', initials: (u.full_name || 'U').split(' ').map(function(w){return w[0];}).join('').substring(0,2).toUpperCase() });
          });
      });
  };

  // Handle register — uses Supabase Auth signUp + profile insert
  var handleRegister = function(ev) {
    ev.preventDefault();
    setRegMsg('');
    if (!regName || !regEmail || !regPass) { setRegMsg('Todos los campos son obligatorios.'); return; }
    if (regPass !== regPass2) { setRegMsg('Las contraseñas no coinciden.'); return; }
    if (regPass.length < 6) { setRegMsg('La contraseña debe tener al menos 6 caracteres.'); return; }
    setLoading(true);
    // Sign up via Supabase Auth
    window.sb.auth.signUp({ email: regEmail, password: regPass, options: { data: { full_name: regName } } })
      .then(function(authRes) {
        // Also create profile in the profiles table
        return window.sb.from('profiles').insert({
          email: regEmail, password_hash: regPass, full_name: regName,
          role: 'INVESTIGADOR', account_level: 'Nivel Básico'
        }).select().single();
      })
      .then(function(res) {
        setLoading(false);
        if (res.error) {
          if (res.error.message.indexOf('duplicate') >= 0 || res.error.message.indexOf('unique') >= 0) {
            setRegMsg('Este correo ya está registrado.');
          } else { setRegMsg('Error: ' + res.error.message); }
          return;
        }
        setRegMsg('¡Cuenta creada exitosamente! Redirigiendo...');
        setTimeout(function() {
          var u = res.data;
          onLogin({
            id: u.id, name: u.full_name, email: u.email, role: u.role,
            phone: u.phone || '', location: u.location || '', accountLevel: u.account_level,
            memberSince: new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
            initials: (u.full_name || 'U').split(' ').map(function(w){return w[0];}).join('').substring(0,2).toUpperCase()
          });
        }, 1500);
      });
  };

  // Handle password recovery — uses Supabase Auth resetPasswordForEmail
  var handleRecover = function(ev) {
    ev.preventDefault();
    setRecMsg('');
    if (!recEmail) { setRecMsg('Ingresa tu correo electrónico.'); return; }
    setLoading(true);
    window.sb.auth.resetPasswordForEmail(recEmail, {
      redirectTo: window.location.origin
    }).then(function(res) {
      setLoading(false);
      if (res.error) {
        setRecMsg('Error al enviar: ' + res.error.message);
        return;
      }
      setRecMsg('Se han enviado las instrucciones de recuperación a tu correo electrónico. Revisa tu bandeja de entrada y la carpeta de spam.');
    });
  };

  // Handle Google login
  var handleGoogleLogin = function () {
    setError(''); setRegMsg('');
    window.sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    }).then(function (res) {
      if (res.error) { setError('Error con Google: ' + res.error.message); }
    });
  };

  // ===== SHARED: Logo =====
  var logoBlock = h('div', { className: 'flex items-center gap-3 mb-12' },
    h('div', { className: 'w-11 h-11 bg-[#6287DE] flex items-center justify-center rounded-xl text-white shadow-lg' },
      h('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
        h('path', { d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' })
      )
    ),
    h('h2', { className: 'text-slate-900 text-2xl font-black tracking-tight' }, 'HydroTrace')
  );

  // ===== SHARED: Right Panel (Fondo_incial.jpg, no monitor widget) =====
  var rightPanel = h('div', { className: 'hidden lg:block lg:w-1/2 relative overflow-hidden' },
    h('img', {
      src: 'Fondo_incial.jpg', alt: 'Escorrentía urbana',
      className: 'absolute inset-0 w-full h-full object-cover'
    }),
    h('div', { className: 'absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 z-10' })
  );

  // ===== Eye icon for password toggle =====
  var eyeIcon = function (show, onClick) {
    return h('svg', {
      className: 'absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors',
      width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, onClick: onClick
    },
      h('path', { d: show ? 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22' : 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
      !show && h('circle', { cx: 12, cy: 12, r: 3 })
    );
  };

  // ===== Google button =====
  var googleBtn = h('button', {
    type: 'button', onClick: handleGoogleLogin,
    className: 'w-full h-14 border border-slate-200 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 active:bg-slate-100 transition-colors'
  },
    h('svg', { width: 20, height: 20, viewBox: '0 0 24 24' },
      h('path', { d: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z', fill: '#4285F4' }),
      h('path', { d: 'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z', fill: '#34A853' }),
      h('path', { d: 'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z', fill: '#FBBC05' }),
      h('path', { d: 'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z', fill: '#EA4335' })
    ),
    h('span', { className: 'text-sm font-semibold text-slate-700' }, view === 'register' ? 'Registrarse con Google' : 'Google')
  );

  // ===== Input field helper =====
  var fieldInput = function (type, value, onChange, placeholder, icon) {
    return h('div', { className: 'relative' },
      h('input', {
        type: type, value: value, onChange: function (e) { onChange(e.target.value); },
        className: 'w-full h-14 px-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6287DE]/30 focus:border-[#6287DE] outline-none text-slate-900 placeholder:text-slate-400 transition-all',
        placeholder: placeholder
      }),
      icon
    );
  };

  // ===== Error/Msg banner =====
  var msgBanner = function (text, isError) {
    if (!text) return null;
    return h('div', { className: 'px-4 py-3 rounded-xl text-sm font-medium animate-fadeIn ' + (isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200') }, text);
  };

  // =============================================
  // VIEW: LOGIN
  // =============================================
  if (view === 'login') {
    return h('div', { className: 'flex h-screen w-full bg-[#FAFBFD]' },
      // Left
      h('div', { className: 'w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-16 xl:p-20 relative z-10' },
        logoBlock,
        h('div', { className: 'max-w-md w-full mx-auto lg:mx-0 flex-1 flex flex-col justify-center' },
          h('h1', { className: 'text-slate-900 text-5xl font-black mb-3 leading-[1.1]', style: { letterSpacing: '-0.04em' } }, 'Bienvenido a', h('br'), 'HydroTrace'),
          h('p', { className: 'text-slate-500 text-base mb-10 leading-relaxed' }, 'Simulación y análisis avanzado de escorrentía urbana y metales pesados.'),

          h('form', { onSubmit: handleLogin, className: 'space-y-5' },
            msgBanner(error, true),
            // Email
            h('div', { className: 'space-y-2' },
              h('label', { className: 'text-slate-800 text-xs font-bold uppercase tracking-wider' }, 'Correo electrónico'),
              fieldInput('email', email, setEmail, 'ejemplo@hydrotrace.com',
                h('svg', { className: 'absolute right-4 top-1/2 -translate-y-1/2 text-slate-400', width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 },
                  h('rect', { x: 2, y: 4, width: 20, height: 16, rx: 2 }), h('path', { d: 'M22 7l-10 6L2 7' })
                )
              )
            ),
            // Password
            h('div', { className: 'space-y-2' },
              h('div', { className: 'flex justify-between items-center' },
                h('label', { className: 'text-slate-800 text-xs font-bold uppercase tracking-wider' }, 'Contraseña'),
                h('button', { type: 'button', onClick: function () { setView('recover'); setError(''); }, className: 'text-[#6287DE] text-xs font-bold hover:underline' }, '¿Olvidó su contraseña?')
              ),
              fieldInput(showPass ? 'text' : 'password', password, setPassword, '••••••••',
                eyeIcon(showPass, function () { setShowPass(!showPass); })
              )
            ),
            // Submit
            h('button', { type: 'submit', disabled: loading, className: 'w-full h-14 bg-[#6287DE] hover:bg-[#5070c0] text-white rounded-xl font-bold text-base shadow-lg shadow-[#6287DE]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60' },
              loading ? 'Verificando...' : 'Iniciar Sesión',
              !loading && h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5 }, h('path', { d: 'M5 12h14M12 5l7 7-7 7' }))
            ),
            // Register link
            h('p', { className: 'text-center text-sm text-slate-500 mt-2' },
              '¿No tiene una cuenta? ',
              h('button', { type: 'button', onClick: function () { setView('register'); setError(''); }, className: 'text-[#6287DE] font-bold hover:underline' }, 'Regístrese')
            )
          ),

          // Divider + Google
          h('div', { className: 'mt-8 flex items-center gap-4 text-slate-300' },
            h('div', { className: 'h-px flex-1 bg-slate-200' }),
            h('span', { className: 'text-xs font-semibold uppercase tracking-widest text-slate-400' }, 'o'),
            h('div', { className: 'h-px flex-1 bg-slate-200' })
          ),
          h('div', { className: 'mt-6' }, googleBtn)
        ),
        // Footer
        h('footer', { className: 'text-xs text-slate-400 mt-8' }, '© 2024 HydroTrace Technologies. Todos los derechos reservados.')
      ),
      // Right
      rightPanel
    );
  }

  // =============================================
  // VIEW: REGISTER
  // =============================================
  if (view === 'register') {
    return h('div', { className: 'flex h-screen w-full bg-[#FAFBFD]' },
      h('div', { className: 'w-full lg:w-1/2 flex flex-col p-8 lg:p-16 xl:p-20 relative z-10 overflow-y-auto' },
        logoBlock,
        h('div', { className: 'max-w-md w-full mx-auto lg:mx-0' },
          h('h1', { className: 'text-slate-900 text-4xl font-black mb-2 leading-tight', style: { letterSpacing: '-0.03em' } }, 'Crear Cuenta'),
          h('p', { className: 'text-slate-500 text-sm mb-8 leading-relaxed' }, 'Únete a HydroTrace para monitorear la escorrentía urbana y proteger los cuerpos de agua.'),

          h('form', { onSubmit: handleRegister, className: 'space-y-5' },
            msgBanner(regMsg, regMsg.indexOf('Error') >= 0 || regMsg.indexOf('obligat') >= 0 || regMsg.indexOf('coinciden') >= 0 || regMsg.indexOf('registrad') >= 0 || regMsg.indexOf('6 car') >= 0),
            // Name
            h('div', { className: 'space-y-2' },
              h('label', { className: 'text-slate-800 text-sm font-semibold' }, 'Nombre Completo'),
              fieldInput('text', regName, setRegName, 'Ingresa tu nombre completo', null)
            ),
            // Email
            h('div', { className: 'space-y-2' },
              h('label', { className: 'text-slate-800 text-sm font-semibold' }, 'Correo Electrónico'),
              fieldInput('email', regEmail, setRegEmail, 'nombre@ejemplo.com', null)
            ),
            // Passwords (2 cols)
            h('div', { className: 'grid grid-cols-2 gap-4' },
              h('div', { className: 'space-y-2' },
                h('label', { className: 'text-slate-800 text-sm font-semibold' }, 'Contraseña'),
                fieldInput('password', regPass, setRegPass, 'Crear contraseña', null)
              ),
              h('div', { className: 'space-y-2' },
                h('label', { className: 'text-slate-800 text-sm font-semibold' }, 'Confirmar Contraseña'),
                fieldInput('password', regPass2, setRegPass2, 'Repetir contraseña', null)
              )
            ),
            // Submit
            h('button', { type: 'submit', disabled: loading, className: 'w-full h-14 bg-[#6287DE] hover:bg-[#5070c0] text-white rounded-xl font-bold text-base shadow-lg shadow-[#6287DE]/25 transition-all disabled:opacity-60' },
              loading ? 'Creando cuenta...' : 'Crear Cuenta'
            ),
            // Divider
            h('div', { className: 'flex items-center gap-4 text-slate-300' },
              h('div', { className: 'h-px flex-1 bg-slate-200' }),
              h('span', { className: 'text-xs font-semibold uppercase tracking-widest text-slate-400' }, 'O continuar con'),
              h('div', { className: 'h-px flex-1 bg-slate-200' })
            ),
            googleBtn,
            // Login link
            h('p', { className: 'text-center text-sm text-slate-500 mt-2' },
              '¿Ya tienes una cuenta? ',
              h('button', { type: 'button', onClick: function () { setView('login'); setRegMsg(''); }, className: 'text-[#6287DE] font-bold hover:underline' }, 'Iniciar sesión')
            )
          )
        ),
        h('footer', { className: 'text-xs text-slate-400 mt-8' }, '© 2024 HydroTrace Technologies. Todos los derechos reservados.')
      ),
      rightPanel
    );
  }

  // =============================================
  // VIEW: RECOVER PASSWORD
  // =============================================
  if (view === 'recover') {
    return h('div', { className: 'flex h-screen w-full bg-[#FAFBFD]' },
      h('div', { className: 'w-full lg:w-1/2 flex flex-col p-8 lg:p-16 xl:p-20 relative z-10' },
        logoBlock,
        h('div', { className: 'max-w-md w-full mx-auto lg:mx-0 mt-8' },
          h('h1', { className: 'text-slate-900 text-4xl font-black mb-3 leading-tight', style: { letterSpacing: '-0.03em' } }, 'Recuperar', h('br'), 'Contraseña'),
          h('p', { className: 'text-slate-500 text-sm mb-8 leading-relaxed' }, 'Introduce tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.'),

          h('form', { onSubmit: handleRecover, className: 'space-y-5' },
            msgBanner(recMsg, recMsg.indexOf('No encontramos') >= 0),
            h('div', { className: 'space-y-2' },
              h('label', { className: 'text-slate-800 text-sm font-semibold' }, 'Correo Electrónico'),
              fieldInput('email', recEmail, setRecEmail, 'ejemplo@correo.com', null)
            ),
            h('button', { type: 'submit', disabled: loading, className: 'w-full h-14 bg-[#6287DE] hover:bg-[#5070c0] text-white rounded-xl font-bold text-base shadow-lg shadow-[#6287DE]/25 transition-all disabled:opacity-60' },
              loading ? 'Enviando...' : 'Enviar Instrucciones'
            ),
            // Back link
            h('button', { type: 'button', onClick: function () { setView('login'); setRecMsg(''); }, className: 'flex items-center gap-2 text-sm text-slate-500 hover:text-[#6287DE] transition-colors mt-4 font-medium' },
              h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, h('path', { d: 'M19 12H5M12 19l-7-7 7-7' })),
              'Volver al inicio de sesión'
            )
          )
        ),
        h('div', { className: 'flex-1' }),
        h('footer', { className: 'text-xs text-slate-400 mt-8' }, '© 2024 HydroTrace Technologies. Todos los derechos reservados.')
      ),
      rightPanel
    );
  }
}

window.LoginPage = LoginPage;
