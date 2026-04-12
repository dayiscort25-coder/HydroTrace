# Manual Integral de la Plataforma HydroTrace (2026)

**Versión:** 3.4  
**Fecha:** Abril 2026  
**Plataforma:** [https://hydrotrace.vercel.app](https://hydrotrace.vercel.app)

---

## 1. Introducción y Propósito

### 1.1 ¿Qué es HydroTrace?

HydroTrace es una plataforma web de simulación orientada al **análisis del transporte de metales pesados en escorrentía urbana**. Integra variables hidrológicas, características del terreno y propiedades fisicoquímicas de contaminantes para evaluar cómo los eventos de lluvia movilizan metales pesados depositados en sedimentos viales (Road-Deposited Sediments — RDS).

La herramienta implementa el modelo **HMDS (Heavy Metal Dynamic Simulation)**, que combina:

- **Acumulación** exponencial de masa contaminante en períodos secos.
- **Lavado** (washoff) dinámico durante eventos de precipitación.
- **Análisis TLW** (Total Load Washoff) que descompone el transporte según mecanismos de fraccionamiento por tamaño de partícula y lixiviación.

### 1.2 Público Objetivo

| Perfil | Uso principal |
|---|---|
| Ingenieros ambientales | Evaluación de cargas contaminantes en cuencas urbanas |
| Investigadores académicos | Validación de modelos de transporte y publicación científica |
| Gestores de riesgo ambiental | Identificación de zonas críticas y metales dominantes |
| Estudiantes de posgrado | Proyectos de grado en hidrología urbana |

### 1.3 Importancia en la Gestión del Riesgo Ambiental

Los sedimentos viales son el principal vector de contaminación difusa en áreas urbanas. HydroTrace permite:

- Cuantificar la carga total movilizada por metal y por evento.
- Identificar el metal dominante y su nivel de riesgo (BAJO/MEDIO/ALTO).
- Comparar escenarios con distintas condiciones climáticas y de superficie.
- Generar reportes técnicos (PDF/Excel) para entrega a entidades reguladoras.

---

## 2. Guía de Usuario

### 2.1 Acceso a la Plataforma

**Métodos de autenticación:**

1. **Correo + contraseña:** Registro con email. Se almacena de forma segura en Supabase Auth.
2. **Google OAuth:** Inicio de sesión con un clic mediante cuenta de Google.

Al iniciar sesión, el sistema verifica si existe un perfil asociado. Si no existe, se crea automáticamente con los datos del proveedor de autenticación.

### 2.2 Navegación Principal

La barra lateral (sidebar) contiene las siguientes secciones:

| Sección | Descripción |
|---|---|
| 🏠 **Home** | Dashboard con KPIs del último estudio, escenarios rápidos y gráfica TLW |
| 🔬 **Simular** | Simulación de evento único de precipitación |
| 📊 **Multieventos** | Simulación de secuencia temporal de múltiples eventos |
| 📋 **Historial** | Registro de todas las simulaciones guardadas |
| 👤 **Perfil** | Gestión de datos del usuario |

### 2.3 Módulo: Simulación Evento Único

Este módulo permite analizar un solo evento de precipitación. El flujo de trabajo es:

**Paso 1 — Identificación:**
- **Título:** Nombre descriptivo de la simulación.
- **Dirección del evento:** Ubicación geográfica del área de estudio.

**Paso 2 — Parámetros del terreno:**

| Parámetro | Unidad | Descripción |
|---|---|---|
| Área | m² | Superficie de la cuenca o zona de estudio |
| Longitud | m | Longitud del cauce principal |
| Ancho | m | Ancho promedio de la cuenca |
| Material | — | Tipo de superficie (Asfalto, Concreto, Adoquín, Sup. mixta) |
| Coef. C | — | Coeficiente de escorrentía (se auto-rellena según el material) |
| Pendiente | % | Pendiente media del terreno |

**Paso 3 — Parámetros hidrológicos:**

| Parámetro | Unidad | Descripción |
|---|---|---|
| Intensidad | mm/h | Intensidad de la lluvia |
| Duración | h | Duración del evento |
| Días secos | días | Período de acumulación previo al evento |
| Patrón | — | Distribución temporal: "variable" o "constant" |

**Paso 4 — Configuración de metales:**

La tabla de metales permite activar/desactivar metales individuales y modificar sus parámetros cinéticos (LW, ML, LE, Ler, Bmax, kb, kw, n). Los valores por defecto están calibrados con datos de la literatura.

**Paso 5 — Ejecutar y analizar resultados.**

### 2.4 Módulo: Simulación Multieventos

Este módulo permite simular una **secuencia temporal** de eventos de precipitación, modelando la acumulación progresiva de sedimentos entre eventos y el lavado acumulado.

**Diferencias clave con Evento Único:**

| Aspecto | Evento Único | Multieventos |
|---|---|---|
| Eventos | 1 | N (configurables) |
| Acumulación | Desde cero (días secos) | Progresiva entre eventos |
| Resultados | Por metal | Por metal × por evento |
| Gráficas | Dinámicas en el tiempo del evento | Evolución temporal multi-evento |

**Configuración de eventos:**
Cada evento se define con: Tipo (Intensidad/Precipitación), Valor, Duración, Patrón, Pendiente y Días secos previos.

**Carga masiva desde Excel:**
Se puede pegar directamente una tabla desde Excel con el formato: `Tipo | Valor | Duración | Patrón | Pendiente | Días secos`, separados por tabuladores.

### 2.5 Historial y Gestión de Escenarios

- **Guardar:** Tras ejecutar, el botón "Guardar en Historial" almacena todos los parámetros y resultados en Supabase.
- **Eliminar:** Selección individual o masiva con checkboxes + botón de eliminación.
- **Reejecutar desde Home:** Los escenarios guardados aparecen como tarjetas en "Escenarios Disponibles". Al hacer clic, el sistema detecta automáticamente el tipo (Único/Multi) y redirige a la pestaña correcta con todos los datos pre-cargados.

---

## 3. Marco Teórico y Memoria de Cálculo

### 3.1 Definición de Variables

#### Variables de fraccionamiento (TLW)

| Variable | Nombre completo | Descripción |
|---|---|---|
| **LW** | Load Washable | Porcentaje de RDS < 250 µm susceptible al transporte por escorrentía |
| **ML** | Metal Load | Porcentaje de metales pesados asociados a la fracción < 250 µm |
| **LE** | Leachable Extract | Porcentaje de lixiviación de metales pesados en la fracción fina (< 250 µm) |
| **Ler** | Leachable Residual | Mediana de los valores de lixiviación por cada metal en la fracción gruesa |

#### Variables cinéticas

| Variable | Nombre completo | Unidad | Descripción |
|---|---|---|---|
| **Bmax** | Acumulación máxima | mg/m² | Masa máxima que puede acumularse por unidad de área |
| **kb** | Tasa de acumulación | 1/día | Velocidad de acumulación de sedimentos en período seco |
| **kw** | Coeficiente de lavado | — | Eficiencia de remoción por unidad de intensidad |
| **n** | Exponente de intensidad | — | Sensibilidad del lavado a la intensidad de la lluvia |

#### Variables hidrológicas

| Variable | Nombre | Unidad | Descripción |
|---|---|---|---|
| **C** | Coef. de escorrentía | — | Fracción de precipitación convertida en escorrentía |
| **I** | Intensidad | mm/h | Intensidad instantánea de la precipitación |
| **A** | Área | m² | Superficie de la cuenca |
| **S** | Pendiente | % | Pendiente media |
| **L** | Longitud | m | Longitud del cauce principal |

### 3.2 Fórmulas Matemáticas

#### 3.2.1 Análisis TLW (Total Load Washoff)

El TLW descompone el transporte en tres mecanismos según el tamaño de partícula:

**T1 — Transporte de partículas finas (< 250 µm):**

$$T_1 = \frac{LW \times ML}{100}$$

Representa la fracción de sedimento fino que es lavable y contiene metales pesados.

**T2 — Lixiviación de la fracción fina:**

$$T_2 = LE \times \left(1 - \frac{LW}{100}\right) \times \frac{ML}{100}$$

Cuantifica los metales que se disuelven de la fracción fina no transportada directamente.

**T3 — Lixiviación residual de la fracción gruesa (> 250 µm):**

$$T_3 = Ler \times \left(1 - \frac{ML}{100}\right)$$

Representa los metales lixiviados de la fracción gruesa que no se transporta como partícula.

**TLW — Carga total de lavado:**

$$TLW = T_1 + T_2 + T_3$$

> **Justificación:** La separación en tres componentes permite distinguir entre transporte particulado (T1), disolución de finos (T2) y disolución de gruesos (T3). Esto es fundamental para diseñar sistemas de tratamiento: T1 se controla con sedimentación, mientras que T2 y T3 requieren tratamiento químico.

#### 3.2.2 Acumulación de Masa (Build-Up)

**Modelo exponencial asintótico:**

$$B(t) = B_{max} \times \left(1 - e^{-k_b \times t}\right)$$

Donde:
- $B(t)$: masa acumulada tras $t$ días secos (mg/m²)
- $B_{max}$: capacidad máxima de acumulación
- $k_b$: tasa de acumulación

**Acumulación incremental** (para multieventos, desde un estado previo $B_{prev}$):

$$B(t) = B_{prev} + (B_{max} - B_{prev}) \times \left(1 - e^{-k_b \times \Delta t}\right)$$

> **Justificación:** El modelo exponencial refleja que la acumulación tiene un límite superior (capacidad de carga de la superficie). Los primeros días acumulan rápidamente, luego la tasa disminuye al acercarse a Bmax.

#### 3.2.3 Lavado Instantáneo (Washoff)

**Fracción removida en un paso de tiempo:**

$$W = B \times \left(1 - e^{-k_w \times I^n}\right)$$

Donde:
- $W$: masa lavada (mg/m²)
- $B$: masa disponible antes del lavado
- $I$: intensidad instantánea (mm/h)
- $k_w$: coeficiente de lavado
- $n$: exponente de intensidad

> **Justificación:** La formulación exponencial garantiza que $W \leq B$ (no se puede lavar más de lo que hay). El exponente $n$ permite modelar la no-linealidad: $n > 1$ indica que intensidades altas son desproporcionadamente más efectivas.

#### 3.2.4 Lavado Dinámico (Washoff Dynamic)

Para la serie temporal de intensidad $I(t)$:

$$\Delta W_i = B_{rem,i-1} \times \left(1 - e^{-k_w \times I_i^n \times \Delta t}\right)$$

$$B_{rem,i} = B_{rem,i-1} - \Delta W_i$$

$$W_{cum,i} = W_{cum,i-1} + \Delta W_i$$

$$\dot{W}_i = \frac{\Delta W_i}{\Delta t}$$

Donde $B_{rem}$ es la masa remanente, $W_{cum}$ es la masa acumulada lavada, y $\dot{W}$ es la tasa de lavado.

#### 3.2.5 Hidrología

**Caudal pico (Método Racional):**

$$Q_p = \frac{C \times I \times A}{3.6 \times 10^6} \quad [m^3/s]$$

**Volumen total de escorrentía:**

$$V_t = C \times \frac{I}{1000} \times A \times D \quad [m^3]$$

Donde $D$ es la duración en horas.

**Tiempo de concentración (Kirpich):**

$$t_c = 0.0195 \times L^{0.77} \times S^{-0.385} \quad [min]$$

#### 3.2.6 Carga Total Movilizada por Metal

**Carga total movilizada por metal $m$:**

$$\text{Carga}_m = \frac{TLW_m}{100} \times B_0(m) \times A \quad [mg]$$

#### 3.2.7 Serie de Intensidad (Hietograma Sintético)

**Patrón "variable"** (pico adelantado al 40% de la duración):

$$I(t) = \begin{cases} I_p \times \frac{t}{t_p} & \text{si } t \leq t_p \\[6pt] I_p \times \max\left(1 - \frac{t - t_p}{D - t_p},\; 0\right) & \text{si } t > t_p \end{cases}$$

Donde $t_p = 0.4 \times D$ es el tiempo al pico.

**Patrón "constant":** $I(t) = I_p$ para todo $t$.

### 3.3 Parámetros por Defecto (Metales)

Los valores por defecto están basados en la literatura de referencia para sedimentos viales urbanos:

| Metal | LW (%) | ML (%) | LE (%) | Ler (%) | Bmax (mg/m²) | kb (1/d) | kw | n |
|---|---|---|---|---|---|---|---|---|
| Pb | 55.2 | 62.0 | 18.5 | 15.3 | 120 | 0.40 | 0.15 | 1.2 |
| Zn | 70.1 | 48.0 | 25.3 | 28.1 | 350 | 0.50 | 0.18 | 1.1 |
| Cu | 58.4 | 55.0 | 20.8 | 19.6 | 85 | 0.35 | 0.14 | 1.3 |
| Cr | 45.6 | 42.0 | 12.4 | 10.8 | 45 | 0.30 | 0.12 | 1.0 |
| Ni | 52.3 | 50.0 | 22.1 | 20.5 | 55 | 0.38 | 0.13 | 1.1 |
| Cd | 68.7 | 65.0 | 30.2 | 25.4 | 8 | 0.45 | 0.20 | 1.4 |
| Fe | 40.2 | 38.0 | 8.5 | 12.3 | 800 | 0.25 | 0.10 | 0.9 |
| Mn | 63.8 | 56.0 | 21.7 | 22.7 | 200 | 0.42 | 0.16 | 1.2 |
| Co | 48.5 | 44.0 | 15.6 | 14.2 | 25 | 0.32 | 0.11 | 1.0 |
| Ba | 42.8 | 40.0 | 10.2 | 18.9 | 150 | 0.28 | 0.09 | 0.8 |

### 3.4 Coeficientes de Escorrentía por Material

| Material | Coef. C |
|---|---|
| Asfalto | 0.85 |
| Concreto | 0.80 |
| Adoquín | 0.60 |
| Sup. mixta | 0.70 |

---

## 4. Interpretación de Resultados

### 4.1 Gráficas Principales (Evento Único)

La simulación genera 6+ gráficas interactivas:

| Gráfica | Eje X | Eje Y | Interpretación |
|---|---|---|---|
| **Hietograma** | Tiempo (min) | Intensidad (mm/h) | Distribución temporal de la lluvia. El pico indica el momento de mayor erosión |
| **Hidrograma** | Tiempo (min) | Caudal (L/s) | Respuesta hidrológica de la cuenca. Permite verificar el caudal pico y su sincronía con la lluvia |
| **Masa Remanente** | Tiempo (min) | Masa (mg/m²) | Muestra cómo disminuye la masa disponible en superficie durante el evento. Curvas más empinadas = lavado más eficiente |
| **Tasa de Lavado** | Tiempo (min) | Tasa (mg/m²/h) | Velocidad instantánea de remoción. El pico coincide con el máximo de intensidad |
| **Lavado Acumulado** | Tiempo (min) | Masa acumulada (mg/m²) | Total acumulado removido. La asíntota indica el máximo posible para las condiciones dadas |
| **Curva de Acumulación** | Días | Masa (mg/m²) | Cómo se acumula la masa en período seco. Permite verificar que los días secos previos configurados son razonables |

### 4.2 Gráficas Adicionales

| Gráfica | Descripción |
|---|---|
| **Barras TLW** | Descomposición T1/T2/T3 por metal. Permite comparar qué mecanismo domina |
| **Barras de Carga** | Carga total movilizada (mg) por metal. Identifica el contaminante dominante |
| **Diagrama de Torta** | Proporción sólida vs. disuelta del total transportado |

### 4.3 Componentes T1, T2 y T3 del Análisis TLW

| Componente | Mecanismo | Partículas | Control recomendado |
|---|---|---|---|
| **T1** | Transporte de partículas finas con metales adsorbidos | < 250 µm | Trampas de sedimentos, filtros |
| **T2** | Lixiviación/disolución de metales desde finos no transportados | < 250 µm (fracción disuelta) | Tratamiento químico, humedales |
| **T3** | Lixiviación desde partículas gruesas inmóviles | > 250 µm (fracción disuelta) | Sistemas de adsorción, bioretención |

**Regla de interpretación:**
- Si $T_1 > T_2 + T_3$ → La fracción **sólida** domina → se recomienda tratamiento físico (sedimentación).
- Si $T_2 + T_3 > T_1$ → La fracción **disuelta** domina → se requiere tratamiento químico o biológico.

### 4.4 Nivel de Riesgo

El sistema clasifica automáticamente el riesgo según el TLW del metal dominante:

| TLW del metal dominante | Nivel | Color |
|---|---|---|
| > 60% | **ALTO** | 🔴 Rojo |
| 30% – 60% | **MEDIO** | 🟡 Amarillo |
| < 30% | **BAJO** | 🟢 Verde |

### 4.5 Reportes Descargables

**PDF:**
- Parámetros de entrada (título, dirección, área, material, etc.)
- Resultados hidrológicos (Qp, Vt, tc)
- Tabla TLW por metal (T1, T2, T3, TLW%)
- Tabla de impacto ambiental (Carga mg por metal)
- Capturas de las gráficas (generadas con html2canvas)
- Pie de página con copyright

**Excel:**
- Hoja "Parámetros": todos los inputs
- Hoja "TLW": tabla T1/T2/T3/TLW por metal
- Hoja "Impacto": carga por metal

---

## 5. Configuración de Perfil y Seguridad

### 5.1 Gestión del Perfil

Desde la sección **Perfil** se puede:
- Ver y editar el nombre de usuario.
- Visualizar el correo asociado y la fecha de registro.
- Cerrar sesión de forma segura.

### 5.2 Persistencia de Datos

Toda la información se almacena en **Supabase** (PostgreSQL):

| Tabla | Contenido |
|---|---|
| `profiles` | Datos del usuario (nombre, email, fecha de registro) |
| `simulations` | Simulaciones guardadas (título, tipo, parámetros, resultados, metales) |

**Seguridad:**
- Las contraseñas se gestionan mediante Supabase Auth (hash bcrypt).
- La comunicación con la base de datos usa la API key pública (`anon key`), protegida por Row Level Security (RLS).
- La sesión se mantiene mediante tokens JWT con expiración automática.

### 5.3 Row Level Security (RLS)

Cada usuario solo puede acceder a sus propias simulaciones. Las políticas RLS de Supabase garantizan que:
- `SELECT`: Solo registros donde `user_id = auth.uid()`
- `INSERT`: Solo si `user_id = auth.uid()`
- `DELETE`: Solo registros propios

---

## Apéndice: Glosario

| Término | Definición |
|---|---|
| RDS | Road-Deposited Sediments — sedimentos depositados en la vía |
| TLW | Total Load Washoff — carga total de lavado |
| Build-up | Proceso de acumulación de sedimentos en período seco |
| Washoff | Proceso de remoción de sedimentos durante la lluvia |
| Hietograma | Gráfica de distribución temporal de la lluvia |
| Hidrograma | Gráfica de caudal en función del tiempo |

---

*© 2026 HydroTrace Technologies. Todos los derechos reservados.*
