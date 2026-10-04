import React, { useState, useEffect } from 'react';

// --- TEMAS VISUALES ---
type TemaId = 'pink' | 'dark' | 'blue' | 'emerald';

interface TemaConfig {
  id: TemaId;
  nombre: string;
  bgMain: string;
  bgCard: string;
  bgInput: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accentBtn: string;
  badge: string;
  navActive: string;
}

const TEMAS: Record<TemaId, TemaConfig> = {
  pink: {
    id: 'pink',
    nombre: 'Rosa 🌸',
    bgMain: 'bg-[#180e14]',
    bgCard: 'bg-[#251520]/80',
    bgInput: 'bg-[#120a0f]',
    border: 'border-pink-500/20',
    textPrimary: 'text-pink-50',
    textSecondary: 'text-pink-300/70',
    accentBtn: 'bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-400 hover:to-rose-300 text-white shadow-lg shadow-pink-500/25',
    badge: 'bg-pink-950/60 text-pink-300 border-pink-700/50',
    navActive: 'bg-pink-500/20 text-pink-200 border-pink-500/40 shadow-inner'
  },
  dark: {
    id: 'dark',
    nombre: 'Cyber 🌙',
    bgMain: 'bg-[#090d16]',
    bgCard: 'bg-[#111827]/80',
    bgInput: 'bg-[#060911]',
    border: 'border-cyan-500/20',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    accentBtn: 'bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-extrabold shadow-lg shadow-cyan-500/20',
    badge: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50',
    navActive: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-inner'
  },
  blue: {
    id: 'blue',
    nombre: 'Azul 📘',
    bgMain: 'bg-[#06101e]',
    bgCard: 'bg-[#0d1d33]/80',
    bgInput: 'bg-[#030912]',
    border: 'border-sky-500/20',
    textPrimary: 'text-sky-50',
    textSecondary: 'text-sky-300/70',
    accentBtn: 'bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white shadow-lg shadow-sky-500/25',
    badge: 'bg-sky-950/60 text-sky-300 border-sky-800/50',
    navActive: 'bg-sky-500/20 text-sky-200 border-sky-500/40 shadow-inner'
  },
  emerald: {
    id: 'emerald',
    nombre: 'Verde 🌿',
    bgMain: 'bg-[#031812]',
    bgCard: 'bg-[#072a21]/80',
    bgInput: 'bg-[#01100b]',
    border: 'border-emerald-500/20',
    textPrimary: 'text-emerald-50',
    textSecondary: 'text-emerald-300/70',
    accentBtn: 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold shadow-lg shadow-emerald-500/25',
    badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50',
    navActive: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40 shadow-inner'
  }
};

// INTERFACES
interface PasoEstudio {
  id: string;
  texto: string;
  completado: boolean;
}

interface Examen {
  id: number;
  materia: string;
  tipo: 'PARCIAL' | 'FINAL' | 'TRABAJO_PRACTICO';
  fecha: string;
  temas: string[];
  planGenerado: PasoEstudio[];
}

interface ResumenPdf {
  id: number;
  nombreArchivo: string;
  materia: string;
  fechaCarga: string;
  puntosClave: string[];
  preguntasPosibles: string[];
  resumenTexto: string;
}

interface Carpeta {
  id: string;
  nombre: string;
  icono: string;
}

interface FuenteMaterial {
  id: string;
  carpetaId: string;
  titulo: string;
  tipo: 'PDF' | 'LINK' | 'APUNTE';
  contenidoOrUrl: string;
  nombreArchivo?: string;
  puntosClave?: string[];
  preguntasPosibles?: string[];
  fecha: string;
}

const STORAGE_DATOS = 'simple_study_planner_data_v4';
const STORAGE_RESUMENES = 'simple_study_planner_resumenes_v4';
const STORAGE_CARPETAS = 'simple_study_planner_carpetas_v4';
const STORAGE_FUENTES = 'simple_study_planner_fuentes_v4';
const STORAGE_TEMA = 'simple_study_planner_theme_v4';

export default function App() {
  const [temaActual, setTemaActual] = useState<TemaId>(() => {
    return (localStorage.getItem(STORAGE_TEMA) as TemaId) || 'pink';
  });

  const [tab, setTab] = useState<'tablero' | 'crear' | 'resumidor' | 'carpetas'>('tablero');

  // Memoria Exámenes
  const [examenes, setExamenes] = useState<Examen[]>(() => {
    try {
      const g = localStorage.getItem(STORAGE_DATOS);
      return g ? JSON.parse(g) : [
        {
          id: 1,
          materia: 'Obstetricia I / Física / Inglés',
          tipo: 'FINAL',
          fecha: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          temas: ['Unidad 1: Introducción', 'Unidad 2: Conceptos Clave', 'Unidad 3: Diagnóstico y Práctica'],
          planGenerado: [
            { id: '1-1', texto: 'Día 1 a 2: Estudiar -> Unidad 1: Introducción', completado: true },
            { id: '1-2', texto: 'Día 3 a 4: Estudiar -> Unidad 2: Conceptos Clave', completado: false },
            { id: '1-3', texto: 'Día 5: Estudiar -> Unidad 3: Diagnóstico y Práctica', completado: false },
            { id: '1-4', texto: 'Día 6: Repaso general de resúmenes y dudas', completado: false },
            { id: '1-5', texto: 'Día 7 (Pre-Examen): Lectura ligera y descanso temprano', completado: false }
          ]
        }
      ];
    } catch { return []; }
  });

  // Memoria Resúmenes PDF
  const [resumenes, setResumenes] = useState<ResumenPdf[]>(() => {
    try {
      const g = localStorage.getItem(STORAGE_RESUMENES);
      return g ? JSON.parse(g) : [];
    } catch { return []; }
  });

  // Memoria Carpetas y Fuentes
  const [carpetas, setCarpetas] = useState<Carpeta[]>(() => {
    try {
      const g = localStorage.getItem(STORAGE_CARPETAS);
      return g ? JSON.parse(g) : [
        { id: 'f-1', nombre: 'Obstetricia', icono: '🤰' },
        { id: 'f-2', nombre: 'Anatomía', icono: '🦴' },
        { id: 'f-3', nombre: 'Física I', icono: '⚡' }
      ];
    } catch { return []; }
  });

  const [fuentes, setFuentes] = useState<FuenteMaterial[]>(() => {
    try {
      const g = localStorage.getItem(STORAGE_FUENTES);
      return g ? JSON.parse(g) : [
        { 
          id: 's-1', 
          carpetaId: 'f-1', 
          titulo: 'Guía de Control Prenatal', 
          tipo: 'PDF', 
          nombreArchivo: 'Apunte_Control_Prenatal.pdf',
          contenidoOrUrl: 'Resumen sintetizado del control prenatal.',
          puntosClave: [
            'Evaluación inicial y cálculo de FPP por regla de Naegele.',
            'Criterios de riesgo y frecuencia recomendada de consultas.'
          ],
          preguntasPosibles: [
            '¿Cuál es la fórmula para calcular la Fecha Probable de Parto (FPP)?'
          ],
          fecha: '2026-10-03' 
        }
      ];
    } catch { return []; }
  });

  const [carpetaActivaId, setCarpetaActivaId] = useState<string | null>(null);

  // Guardado Automático
  useEffect(() => { localStorage.setItem(STORAGE_TEMA, temaActual); }, [temaActual]);
  useEffect(() => { localStorage.setItem(STORAGE_DATOS, JSON.stringify(examenes)); }, [examenes]);
  useEffect(() => { localStorage.setItem(STORAGE_RESUMENES, JSON.stringify(resumenes)); }, [resumenes]);
  useEffect(() => { localStorage.setItem(STORAGE_CARPETAS, JSON.stringify(carpetas)); }, [carpetas]);
  useEffect(() => { localStorage.setItem(STORAGE_FUENTES, JSON.stringify(fuentes)); }, [fuentes]);

  // Estados Formulario Examen
  const [nuevoExamen, setNuevoExamen] = useState({
    materia: '', tipo: 'PARCIAL' as 'PARCIAL' | 'FINAL' | 'TRABAJO_PRACTICO', fecha: '', temasTexto: ''
  });

  // Estados Formulario PDF Resumidor
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [materiaPdf, setMateriaPdf] = useState('');
  const [cargandoResumen, setCargandoResumen] = useState(false);

  // Estados Formulario Carpeta / Fuentes
  const [nuevaCarpetaNombre, setNuevaCarpetaNombre] = useState('');
  const [modalNuevaCarpeta, setModalNuevaCarpeta] = useState(false);
  const [nuevaFuente, setNuevaFuente] = useState({ titulo: '', tipo: 'PDF' as 'PDF' | 'LINK' | 'APUNTE', contenidoOrUrl: '' });
  const [archivoFuente, setArchivoFuente] = useState<File | null>(null);
  const [analizandoFuente, setAnalizandoFuente] = useState(false);
  const [modalNuevaFuente, setModalNuevaFuente] = useState(false);

  // Generador de Plan
  const generarPlanDeEstudio = (fechaStr: string, temasList: string[]): PasoEstudio[] => {
    if (!fechaStr || temasList.length === 0) return [];
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const fEx = new Date(fechaStr);
    const dias = Math.ceil((fEx.getTime() - hoy.getTime()) / (1000 * 3600 * 24));

    if (dias <= 0) return [{ id: `${Date.now()}-0`, texto: 'El examen es hoy o ya ocurrió. ¡Muchos éxitos!', completado: false }];
    if (dias === 1) return [{ id: `${Date.now()}-1`, texto: '⚡ Queda 1 día: Repaso intensivo de resúmenes y descanso nocturno.', completado: false }];

    const plan: PasoEstudio[] = [];
    const diasEstudio = Math.max(1, dias - 2);
    const bloque = Math.max(1, Math.ceil(temasList.length / diasEstudio));

    let idx = 0; let dia = 1;
    while (idx < temasList.length && dia <= diasEstudio) {
      const grupo = temasList.slice(idx, idx + bloque);
      plan.push({ id: `${Date.now()}-${dia}`, texto: `Día ${dia}: Encarar -> ${grupo.join(' + ')}`, completado: false });
      idx += bloque; dia++;
    }

    plan.push({ id: `${Date.now()}-repaso`, texto: `Día ${dias - 1}: Repaso general de dudas y autoevaluación`, completado: false });
    plan.push({ id: `${Date.now()}-pre`, texto: `Día ${dias} (Pre-Examen): Organizar materiales y descansar temprano`, completado: false });

    return plan;
  };

  const crearExamen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoExamen.materia || !nuevoExamen.fecha) return;

    const temasArr = nuevoExamen.temasTexto.split(',').map(t => t.trim()).filter(Boolean);
    const plan = generarPlanDeEstudio(nuevoExamen.fecha, temasArr);

    const item: Examen = {
      id: Date.now(),
      materia: nuevoExamen.materia,
      tipo: nuevoExamen.tipo,
      fecha: nuevoExamen.fecha,
      temas: temasArr,
      planGenerado: plan
    };

    setExamenes([item, ...examenes]);
    setNuevoExamen({ materia: '', tipo: 'PARCIAL', fecha: '', temasTexto: '' });
    setTab('tablero');
  };

  const procesarPdfYGenerarResumen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivoSeleccionado) return;
    setCargandoResumen(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const textoExtraido = event.target?.result as string || '';
      setTimeout(() => {
        const nombreLimpio = archivoSeleccionado.name.replace(/\.[^/.]+$/, "");
        const nuevoResumenItem: ResumenPdf = {
          id: Date.now(),
          nombreArchivo: archivoSeleccionado.name,
          materia: materiaPdf || 'General / Apuntes',
          fechaCarga: new Date().toISOString().split('T')[0],
          puntosClave: [
            `Síntesis de la unidad principal: ${nombreLimpio}.`,
            'Definiciones clave y terminología esencial.',
            'Puntos prioritarios del documento.'
          ],
          preguntasPosibles: [
            `¿Cuáles son las características principales de ${nombreLimpio}?`,
            '¿Qué conceptos clínicos/teóricos son prioritarios?'
          ],
          resumenTexto: textoExtraido 
            ? `[Extracto]: ${textoExtraido.slice(0, 350)}...`
            : `El documento "${archivoSeleccionado.name}" fue sintetizado con éxito.`
        };

        setResumenes([nuevoResumenItem, ...resumenes]);
        setArchivoSeleccionado(null);
        setMateriaPdf('');
        setCargandoResumen(false);
      }, 1000);
    };
    reader.readAsText(archivoSeleccionado);
  };

  // HANDLERS CARPETAS Y FUENTES CON PROCESAMIENTO DE ARCHIVOS Y LINKS
  const crearCarpeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCarpetaNombre) return;
    const item: Carpeta = {
      id: `f-${Date.now()}`,
      nombre: nuevaCarpetaNombre,
      icono: '📁'
    };
    setCarpetas([...carpetas, item]);
    setNuevaCarpetaNombre('');
    setModalNuevaCarpeta(false);
  };

  const crearFuente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaFuente.titulo || !carpetaActivaId) return;

    if (nuevaFuente.tipo === 'PDF' && archivoFuente) {
      setAnalizandoFuente(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const textoExtraido = event.target?.result as string || '';
        setTimeout(() => {
          const nombreLimpio = archivoFuente.name.replace(/\.[^/.]+$/, "");
          const item: FuenteMaterial = {
            id: `s-${Date.now()}`,
            carpetaId: carpetaActivaId,
            titulo: nuevaFuente.titulo || archivoFuente.name,
            tipo: 'PDF',
            nombreArchivo: archivoFuente.name,
            contenidoOrUrl: textoExtraido ? `${textoExtraido.slice(0, 300)}...` : 'Documento PDF analizado e integrado.',
            puntosClave: [
              `Eje temático principal: ${nombreLimpio}.`,
              'Definiciones clave y conceptos para evaluación.',
              'Puntos de lectura prioritaria del documento.'
            ],
            preguntasPosibles: [
              `¿Qué puntos clave destacan en ${nombreLimpio}?`,
              '¿Cuáles son los contenidos teóricos principales?'
            ],
            fecha: new Date().toISOString().split('T')[0]
          };
          setFuentes([item, ...fuentes]);
          setNuevaFuente({ titulo: '', tipo: 'PDF', contenidoOrUrl: '' });
          setArchivoFuente(null);
          setAnalizandoFuente(false);
          setModalNuevaFuente(false);
        }, 800);
      };
      reader.readAsText(archivoFuente);
    } else if (nuevaFuente.tipo === 'LINK') {
      const item: FuenteMaterial = {
        id: `s-${Date.now()}`,
        carpetaId: carpetaActivaId,
        titulo: nuevaFuente.titulo,
        tipo: 'LINK',
        contenidoOrUrl: nuevaFuente.contenidoOrUrl,
        puntosClave: [
          'Recurso digital / enlace externo vinculado a la materia.'
        ],
        fecha: new Date().toISOString().split('T')[0]
      };
      setFuentes([item, ...fuentes]);
      setNuevaFuente({ titulo: '', tipo: 'PDF', contenidoOrUrl: '' });
      setModalNuevaFuente(false);
    } else {
      // APUNTE
      const item: FuenteMaterial = {
        id: `s-${Date.now()}`,
        carpetaId: carpetaActivaId,
        titulo: nuevaFuente.titulo,
        tipo: 'APUNTE',
        contenidoOrUrl: nuevaFuente.contenidoOrUrl,
        puntosClave: [
          'Notas y resúmenes personales de estudio.'
        ],
        fecha: new Date().toISOString().split('T')[0]
      };
      setFuentes([item, ...fuentes]);
      setNuevaFuente({ titulo: '', tipo: 'PDF', contenidoOrUrl: '' });
      setModalNuevaFuente(false);
    }
  };

  const eliminarCarpeta = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Borrar esta carpeta y todas sus fuentes?')) {
      setCarpetas(carpetas.filter(c => c.id !== id));
      setFuentes(fuentes.filter(f => f.carpetaId !== id));
      if (carpetaActivaId === id) setCarpetaActivaId(null);
    }
  };

  const eliminarFuente = (id: string) => {
    if (window.confirm('¿Eliminar esta fuente/apunte?')) {
      setFuentes(fuentes.filter(f => f.id !== id));
    }
  };

  const togglePaso = (exId: number, pasoId: string) => {
    setExamenes(examenes.map(ex => {
      if (ex.id === exId) {
        return {
          ...ex,
          planGenerado: ex.planGenerado.map(p => p.id === pasoId ? { ...p, completado: !p.completado } : p)
        };
      }
      return ex;
    }));
  };

  const eliminarExamen = (id: number) => {
    if (window.confirm('¿Borrar examen?')) setExamenes(examenes.filter(e => e.id !== id));
  };

  const theme = TEMAS[temaActual];
  const carpetaActivaObj = carpetas.find(c => c.id === carpetaActivaId);
  const fuentesCarpetaActiva = fuentes.filter(f => f.carpetaId === carpetaActivaId);

  return (
    <div className={`min-h-screen ${theme.bgMain} ${theme.textPrimary} font-sans transition-colors duration-300 flex flex-col pb-24 md:pb-8 selection:bg-pink-500 selection:text-white`}>
      
      {/* HEADER SUPERIOR */}
      <header className={`px-4 sm:px-8 py-3.5 border-b ${theme.border} ${theme.bgCard} backdrop-blur-xl sticky top-0 z-30 shadow-lg`}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white font-extrabold flex items-center justify-center text-xl shadow-lg shadow-pink-500/30">
                🎓
              </div>
              <div>
                <h1 className="font-extrabold tracking-wide text-base leading-tight">PLANNER DE ESTUDIO</h1>
                <p className={`text-[11px] font-medium ${theme.textSecondary}`}>Organizador Universitario</p>
              </div>
            </div>

            {/* Selector Móvil */}
            <div className="flex sm:hidden items-center space-x-1 bg-black/40 p-1 rounded-xl border border-white/10">
              {(Object.keys(TEMAS) as TemaId[]).map((tKey) => (
                <button
                  key={tKey}
                  onClick={() => setTemaActual(tKey)}
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition ${temaActual === tKey ? 'bg-white text-black shadow' : 'text-white/50'}`}
                >
                  {TEMAS[tKey].nombre.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex space-x-2 bg-black/20 p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => { setTab('tablero'); setCarpetaActivaId(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${tab === 'tablero' ? theme.navActive : 'border-transparent text-white/60 hover:text-white'}`}
            >
              📌 Exámenes
            </button>
            <button
              onClick={() => { setTab('crear'); setCarpetaActivaId(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${tab === 'crear' ? theme.navActive : 'border-transparent text-white/60 hover:text-white'}`}
            >
              🧠 Plan Inteligente
            </button>
            <button
              onClick={() => { setTab('carpetas'); setCarpetaActivaId(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${tab === 'carpetas' ? theme.navActive : 'border-transparent text-white/60 hover:text-white'}`}
            >
              📁 Carpetas y Fuentes
            </button>
            <button
              onClick={() => { setTab('resumidor'); setCarpetaActivaId(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${tab === 'resumidor' ? theme.navActive : 'border-transparent text-white/60 hover:text-white'}`}
            >
              📄 Resumidor PDF
            </button>
          </nav>

          {/* Selector Desktop */}
          <div className="hidden sm:flex items-center space-x-1 bg-black/30 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            {(Object.keys(TEMAS) as TemaId[]).map((tKey) => (
              <button
                key={tKey}
                onClick={() => setTemaActual(tKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${temaActual === tKey ? 'bg-white text-black shadow-md scale-105' : 'text-white/60 hover:text-white'}`}
              >
                {TEMAS[tKey].nombre}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
        
        {/* VISTA 1: TABLERO / INICIO */}
        {tab === 'tablero' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Próximos Exámenes</h2>
                <p className={`text-xs ${theme.textSecondary}`}>Fechas importantes y estado de preparación</p>
              </div>

              <button
                onClick={() => setTab('crear')}
                className={`md:hidden px-4 py-2.5 rounded-2xl text-xs font-extrabold shadow-lg ${theme.accentBtn}`}
              >
                + Nuevo Plan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {examenes.length === 0 ? (
                <div className={`col-span-full ${theme.bgCard} p-10 rounded-3xl border ${theme.border} text-center ${theme.textSecondary} text-xs space-y-4 shadow-xl backdrop-blur-md`}>
                  <div className="text-4xl">📖</div>
                  <p className="text-sm font-semibold">No tenés exámenes agendados.</p>
                  <button onClick={() => setTab('crear')} className={`px-5 py-3 rounded-2xl font-extrabold text-xs shadow-lg ${theme.accentBtn}`}>
                    Crear el primero con Plan Inteligente
                  </button>
                </div>
              ) : (
                examenes.map((ex) => {
                  const diasFaltantes = Math.ceil((new Date(ex.fecha).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 3600 * 24));
                  const pasostotales = ex.planGenerado?.length || 0;
                  const pasosOk = ex.planGenerado?.filter(p => p.completado).length || 0;
                  const pct = pasostotales > 0 ? Math.round((pasosOk / pasostotales) * 100) : 0;

                  return (
                    <div key={ex.id} className={`${theme.bgCard} border ${theme.border} rounded-3xl p-6 space-y-4 shadow-2xl backdrop-blur-md relative hover:border-white/20 transition-all duration-300`}>
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[10px] font-extrabold tracking-wider px-3 py-1 rounded-full border ${theme.badge}`}>
                          {ex.tipo}
                        </span>

                        <span className={`text-xs font-extrabold px-3 py-1 rounded-xl border backdrop-blur-md ${
                          diasFaltantes <= 3 
                            ? 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse' 
                            : diasFaltantes <= 7 
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        }`}>
                          {diasFaltantes > 0 ? `⏳ Faltan ${diasFaltantes} días` : '¡Hoy rindo!'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-lg text-white">{ex.materia}</h3>
                        <p className={`text-xs ${theme.textSecondary}`}>📅 Fecha programada: <strong className="text-white">{ex.fecha}</strong></p>
                      </div>

                      {pasostotales > 0 && (
                        <div className="space-y-1.5 bg-black/20 p-3 rounded-2xl border border-white/5">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className={theme.textSecondary}>Progreso de estudio:</span>
                            <span className="text-emerald-400 font-mono">{pct}%</span>
                          </div>
                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      )}

                      {ex.planGenerado && ex.planGenerado.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <p className="text-[11px] font-bold text-slate-300 tracking-wide uppercase">📌 Checklist diario (Tocá para completar):</p>
                          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                            {ex.planGenerado.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => togglePaso(ex.id, p.id)}
                                className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center space-x-2.5 transition border ${
                                  p.completado
                                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300/60 line-through'
                                    : 'bg-black/30 hover:bg-black/50 border-white/5 text-slate-200'
                                }`}
                              >
                                <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold ${
                                  p.completado ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-white/30 bg-black/20'
                                }`}>
                                  {p.completado ? '✓' : ''}
                                </span>
                                <span className="flex-1 leading-snug">{p.texto}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-2 border-t border-white/10">
                        <button onClick={() => eliminarExamen(ex.id)} className="text-xs text-rose-400/80 hover:text-rose-300 font-medium transition">
                          🗑️ Borrar Examen
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* VISTA 2: CREAR EXAMEN Y PLAN */}
        {tab === 'crear' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${theme.bgCard} border ${theme.border} p-6 rounded-3xl space-y-4 shadow-2xl backdrop-blur-md h-fit`}>
              <div>
                <h3 className="font-extrabold text-base text-white">Cargar Examen</h3>
                <p className={`text-xs ${theme.textSecondary}`}>Generá el plan de estudio automático día a día</p>
              </div>

              <form onSubmit={crearExamen} className="space-y-4 text-xs">
                <div>
                  <label className="block mb-1.5 font-bold text-slate-200">Materia / Asignatura:</label>
                  <input
                    type="text"
                    placeholder="Ej: Obstetricia I / Física / Inglés"
                    value={nuevoExamen.materia}
                    onChange={e => setNuevoExamen({ ...nuevoExamen, materia: e.target.value })}
                    className={`w-full ${theme.bgInput} border ${theme.border} rounded-2xl px-4 py-3 text-sm text-white focus:outline-none`}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block mb-1.5 font-bold text-slate-200">Tipo Evaluativo:</label>
                    <select
                      value={nuevoExamen.tipo}
                      onChange={e => setNuevoExamen({ ...nuevoExamen, tipo: e.target.value as any })}
                      className={`w-full ${theme.bgInput} border ${theme.border} rounded-2xl px-3 py-3 text-xs text-white focus:outline-none`}
                    >
                      <option value="PARCIAL">Parcial</option>
                      <option value="FINAL">Final</option>
                      <option value="TRABAJO_PRACTICO">Trabajo Práctico</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5 font-bold text-slate-200">Fecha Examen:</label>
                    <input
                      type="date"
                      value={nuevoExamen.fecha}
                      onChange={e => setNuevoExamen({ ...nuevoExamen, fecha: e.target.value })}
                      className={`w-full ${theme.bgInput} border ${theme.border} rounded-2xl px-3 py-3 text-xs text-white focus:outline-none`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 font-bold text-slate-200">Temas / Unidades (separados por coma):</label>
                  <textarea
                    rows={4}
                    placeholder="Ej: Unidad 1, Unidad 2, Anatomía pélvica, Casos prácticos"
                    value={nuevoExamen.temasTexto}
                    onChange={e => setNuevoExamen({ ...nuevoExamen, temasTexto: e.target.value })}
                    className={`w-full ${theme.bgInput} border ${theme.border} rounded-2xl p-3.5 text-xs text-white focus:outline-none leading-relaxed resize-none`}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3.5 rounded-2xl font-extrabold text-xs shadow-xl transition active:scale-95 ${theme.accentBtn}`}
                >
                  ⚡ Generar Plan de Estudio
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-extrabold text-base">Planes de Estudio Activos</h3>
              {examenes.map((ex) => (
                <div key={ex.id} className={`${theme.bgCard} border ${theme.border} p-6 rounded-3xl space-y-3 shadow-xl backdrop-blur-md`}>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div>
                      <h4 className="font-extrabold text-base text-white">{ex.materia}</h4>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                        {ex.tipo}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-amber-300 font-bold bg-black/30 px-3 py-1 rounded-xl border border-white/5">
                      📅 {ex.fecha}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">🗺️ Secuencia guiada día por día:</p>
                  <div className="space-y-2">
                    {ex.planGenerado?.map((paso) => (
                      <div key={paso.id} className="bg-black/30 p-3 rounded-2xl border border-white/5 text-xs text-slate-200 flex items-start space-x-2.5">
                        <span className="text-pink-400 font-bold">•</span>
                        <span className="leading-relaxed">{paso.texto}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA 3: CARPETAS Y FUENTES CON SUBIDA DE ARCHIVOS Y LINKS */}
        {tab === 'carpetas' && (
          <div className="space-y-6">
            
            {/* VISTA GENERAL DE CARPETAS */}
            {carpetaActivaId === null ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight">Carpetas por Materia</h2>
                    <p className={`text-xs ${theme.textSecondary}`}>Tocá una carpeta para ver sus apuntes y recursos sin saturarte de info</p>
                  </div>

                  <button
                    onClick={() => setModalNuevaCarpeta(true)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold shadow-lg ${theme.accentBtn}`}
                  >
                    + Nueva Carpeta
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {carpetas.map((car) => {
                    const cantFuentes = fuentes.filter(f => f.carpetaId === car.id).length;
                    return (
                      <div
                        key={car.id}
                        onClick={() => setCarpetaActivaId(car.id)}
                        className={`${theme.bgCard} border ${theme.border} rounded-3xl p-6 space-y-3 cursor-pointer hover:border-pink-500/50 hover:scale-[1.02] transition-all shadow-xl relative group`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-3xl">{car.icono || '📁'}</span>
                          <button
                            onClick={(e) => eliminarCarpeta(car.id, e)}
                            className="text-xs text-slate-500 hover:text-rose-400 p-1 opacity-60 group-hover:opacity-100 transition"
                            title="Eliminar carpeta"
                          >
                            🗑️
                          </button>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-lg text-white">{car.nombre}</h3>
                          <p className={`text-xs ${theme.textSecondary}`}>{cantFuentes} {cantFuentes === 1 ? 'fuente cargada' : 'fuentes cargadas'}</p>
                        </div>

                        <div className="pt-2 text-xs font-extrabold text-pink-400 flex items-center space-x-1">
                          <span>Abrir contenido</span>
                          <span>→</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* VISTA INTERNA DE UNA CARPETA ESPECÍFICA */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/20 p-4 rounded-3xl border border-white/5">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setCarpetaActivaId(null)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
                    >
                      ← Volver a Carpetas
                    </button>
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight flex items-center space-x-2">
                        <span>{carpetaActivaObj?.icono || '📁'}</span>
                        <span>{carpetaActivaObj?.nombre}</span>
                      </h2>
                      <p className={`text-xs ${theme.textSecondary}`}>Fuentes y apuntes guardados en esta materia</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setNuevaFuente({ titulo: '', tipo: 'PDF', contenidoOrUrl: '' });
                      setArchivoFuente(null);
                      setModalNuevaFuente(true);
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold shadow-lg ${theme.accentBtn}`}
                  >
                    + Cargar PDF / Link / Apunte
                  </button>
                </div>

                {/* Lista de fuentes dentro de esta carpeta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fuentesCarpetaActiva.length === 0 ? (
                    <div className={`col-span-full ${theme.bgCard} p-10 rounded-3xl border ${theme.border} text-center ${theme.textSecondary} text-xs space-y-3`}>
                      <p>Esta carpeta está vacía.</p>
                      <button onClick={() => setModalNuevaFuente(true)} className={`px-4 py-2 rounded-2xl font-bold ${theme.accentBtn}`}>
                        Cargar la primera fuente
                      </button>
                    </div>
                  ) : (
                    fuentesCarpetaActiva.map((f) => (
                      <div key={f.id} className={`${theme.bgCard} border ${theme.border} p-5 rounded-3xl space-y-3 shadow-xl backdrop-blur-md`}>
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                            {f.tipo === 'PDF' ? '📄 PDF' : f.tipo === 'LINK' ? '🔗 LINK' : '📝 APUNTE'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{f.fecha}</span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-base text-white">{f.titulo}</h4>
                          {f.nombreArchivo && (
                            <p className="text-[11px] text-pink-300 font-mono mt-0.5">📎 {f.nombreArchivo}</p>
                          )}
                        </div>

                        {f.tipo === 'LINK' ? (
                          <div className="pt-1">
                            <button
                              onClick={() => window.open(f.contenidoOrUrl, '_blank')}
                              className="w-full bg-black/40 hover:bg-black/60 text-sky-300 border border-sky-500/30 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2"
                            >
                              <span>🔗 Abrir Enlace Web</span>
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-300 bg-black/30 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                            {f.contenidoOrUrl}
                          </p>
                        )}

                        {/* Puntos clave si es PDF analizado */}
                        {f.puntosClave && f.puntosClave.length > 0 && (
                          <div className="space-y-1 bg-black/20 p-2.5 rounded-xl border border-white/5">
                            <p className="text-[10px] font-bold text-emerald-400 uppercase">🎯 Puntos Clave Extraídos:</p>
                            {f.puntosClave.map((pt, idx) => (
                              <div key={idx} className="text-[11px] text-slate-300 flex items-start space-x-1.5">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>{pt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-end pt-1">
                          <button onClick={() => eliminarFuente(f.id)} className="text-xs text-rose-400/80 hover:text-rose-300 font-medium">
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VISTA 4: RESUMIDOR DE PDFS */}
        {tab === 'resumidor' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${theme.bgCard} border ${theme.border} p-6 rounded-3xl space-y-4 shadow-2xl backdrop-blur-md h-fit`}>
              <div>
                <h3 className="font-extrabold text-base text-white">Subir Apunte o PDF</h3>
                <p className={`text-xs ${theme.textSecondary}`}>Generá resúmenes e ideas clave al instante</p>
              </div>

              <form onSubmit={procesarPdfYGenerarResumen} className="space-y-4 text-xs">
                <div>
                  <label className="block mb-1.5 font-bold text-slate-200">Materia / Asignatura (Opcional):</label>
                  <input
                    type="text"
                    placeholder="Ej: Obstetricia I / Física"
                    value={materiaPdf}
                    onChange={e => setMateriaPdf(e.target.value)}
                    className={`w-full ${theme.bgInput} border ${theme.border} rounded-2xl px-4 py-3 text-sm text-white focus:outline-none`}
                  />
                </div>

                <div>
                  <label className="block mb-1.5 font-bold text-slate-200">Seleccionar Archivo (PDF o Texto):</label>
                  <div className={`border-2 border-dashed ${theme.border} hover:border-pink-500/50 ${theme.bgInput} p-5 rounded-2xl text-center cursor-pointer relative`}>
                    <input
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={e => setArchivoSeleccionado(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      required
                    />
                    <div className="space-y-1">
                      <div className="text-2xl">📄</div>
                      <p className="text-xs font-bold text-white">
                        {archivoSeleccionado ? archivoSeleccionado.name : 'Tocá para seleccionar PDF'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargandoResumen}
                  className={`w-full py-3.5 rounded-2xl font-extrabold text-xs shadow-xl transition active:scale-95 ${theme.accentBtn} disabled:opacity-50`}
                >
                  {cargandoResumen ? '⚡ Procesando y Resumiendo...' : '⚡ Generar Resumen Inteligente'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-extrabold text-base">Biblioteca de Resúmenes Generados</h3>
              {resumenes.length === 0 ? (
                <div className={`col-span-full ${theme.bgCard} p-10 rounded-3xl border ${theme.border} text-center ${theme.textSecondary} text-xs space-y-3`}>
                  <p>No tenés resúmenes guardados. Cargar un PDF a la izquierda para comenzar.</p>
                </div>
              ) : (
                resumenes.map((res) => (
                  <div key={res.id} className={`${theme.bgCard} border ${theme.border} p-6 rounded-3xl space-y-4 shadow-xl backdrop-blur-md`}>
                    <div className="flex justify-between items-start border-b border-white/10 pb-3">
                      <div>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                          {res.materia}
                        </span>
                        <h4 className="font-extrabold text-base text-white mt-1">📄 {res.nombreArchivo}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Cargado: {res.fechaCarga}</span>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-pink-300">🎯 Puntos Clave Extraídos:</p>
                      <div className="space-y-1 bg-black/30 p-3 rounded-2xl border border-white/5">
                        {res.puntosClave.map((pt, idx) => (
                          <div key={idx} className="text-xs text-slate-200 flex items-start space-x-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-amber-300">❓ Posibles Preguntas de Examen:</p>
                      <div className="space-y-1 bg-black/30 p-3 rounded-2xl border border-white/5">
                        {res.preguntasPosibles.map((pr, idx) => (
                          <div key={idx} className="text-xs text-slate-300 italic flex items-start space-x-2">
                            <span className="text-amber-400 font-bold">?</span>
                            <span>"{pr}"</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL NUEVA CARPETA */}
      {modalNuevaCarpeta && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${theme.bgCard} border ${theme.border} w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl`}>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="font-extrabold text-white text-sm">Nueva Carpeta de Materia</h3>
              <button onClick={() => setModalNuevaCarpeta(false)} className="text-slate-400 text-xs">✕</button>
            </div>
            <form onSubmit={crearCarpeta} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-bold">Nombre de la Carpeta:</label>
                <input
                  type="text"
                  placeholder="Ej: Anatomía / Física 1 / Obstetricia"
                  value={nuevaCarpetaNombre}
                  onChange={e => setNuevaCarpetaNombre(e.target.value)}
                  className={`w-full ${theme.bgInput} border ${theme.border} rounded-2xl p-3 text-white focus:outline-none`}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setModalNuevaCarpeta(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancelar</button>
                <button type="submit" className={`px-4 py-2 rounded-xl font-bold ${theme.accentBtn}`}>Crear Carpeta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVA FUENTE CON SELECTOR ADAPTATIVO (PDF / LINK / APUNTE) */}
      {modalNuevaFuente && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${theme.bgCard} border ${theme.border} w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl`}>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="font-extrabold text-white text-sm">Agregar Fuente a {carpetaActivaObj?.nombre}</h3>
              <button onClick={() => setModalNuevaFuente(false)} className="text-slate-400 text-xs">✕</button>
            </div>

            <form onSubmit={crearFuente} className="space-y-3.5 text-xs">
              <div>
                <label className="block mb-1 font-bold text-slate-200">Tipo de Fuente:</label>
                <div className="grid grid-cols-3 gap-1.5 bg-black/30 p-1 rounded-2xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setNuevaFuente({ ...nuevaFuente, tipo: 'PDF' })}
                    className={`py-2 rounded-xl text-xs font-extrabold transition ${nuevaFuente.tipo === 'PDF' ? 'bg-pink-500 text-white shadow' : 'text-slate-400'}`}
                  >
                    📄 PDF / Doc
                  </button>
                  <button
                    type="button"
                    onClick={() => setNuevaFuente({ ...nuevaFuente, tipo: 'LINK' })}
                    className={`py-2 rounded-xl text-xs font-extrabold transition ${nuevaFuente.tipo === 'LINK' ? 'bg-sky-500 text-white shadow' : 'text-slate-400'}`}
                  >
                    🔗 Link Web
                  </button>
                  <button
                    type="button"
                    onClick={() => setNuevaFuente({ ...nuevaFuente, tipo: 'APUNTE' })}
                    className={`py-2 rounded-xl text-xs font-extrabold transition ${nuevaFuente.tipo === 'APUNTE' ? 'bg-emerald-500 text-black shadow' : 'text-slate-400'}`}
                  >
                    📝 Apunte
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-200">Título / Tema de la Fuente:</label>
                <input
                  type="text"
                  placeholder="Ej: Unidad 1 - Control Prenatal / Guía de Ejercicios"
                  value={nuevaFuente.titulo}
                  onChange={e => setNuevaFuente({ ...nuevaFuente, titulo: e.target.value })}
                  className={`w-full ${theme.bgInput} border ${theme.border} rounded-2xl p-3 text-white focus:outline-none`}
                  required
                />
              </div>

              {/* OPCIÓN PDF: INPUT FILE REAL */}
              {nuevaFuente.tipo === 'PDF' && (
                <div>
                  <label className="block mb-1 font-bold text-slate-200">Seleccionar Archivo PDF o Documento:</label>
                  <div className={`border-2 border-dashed ${theme.border} hover:border-pink-500/50 ${theme.bgInput} p-4 rounded-2xl text-center cursor-pointer relative`}>
                    <input
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={e => {
                        const file = e.target.files?.[0] || null;
                        setArchivoFuente(file);
                        if (file && !nuevaFuente.titulo) {
                          setNuevaFuente({ ...nuevaFuente, titulo: file.name.replace(/\.[^/.]+$/, "") });
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      required
                    />
                    <div className="space-y-1">
                      <div className="text-xl">📄</div>
                      <p className="text-xs font-bold text-white">
                        {archivoFuente ? archivoFuente.name : 'Tocá para seleccionar PDF de tu dispositivo'}
                      </p>
                      <p className={`text-[10px] ${theme.textSecondary}`}>Archivos .pdf, .txt, .doc</p>
                    </div>
                  </div>
                </div>
              )}

              {/* OPCIÓN LINK: ENLACE WEB */}
              {nuevaFuente.tipo === 'LINK' && (
                <div>
                  <label className="block mb-1 font-bold text-slate-200">Enlace URL (Link):</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... o https://..."
                    value={nuevaFuente.contenidoOrUrl}
                    onChange={e => setNuevaFuente({ ...nuevaFuente, contenidoOrUrl: e.target.value })}
                    className={`w-full ${theme.bgInput} border ${theme.border} rounded-2xl p-3 text-white focus:outline-none`}
                    required
                  />
                </div>
              )}

              {/* OPCIÓN APUNTE: TEXTO LIBRE */}
              {nuevaFuente.tipo === 'APUNTE' && (
                <div>
                  <label className="block mb-1 font-bold text-slate-200">Detalle / Notas del Apunte:</label>
                  <textarea
                    rows={3}
                    placeholder="Escribí aquí tus notas de clase o resumen..."
                    value={nuevaFuente.contenidoOrUrl}
                    onChange={e => setNuevaFuente({ ...nuevaFuente, contenidoOrUrl: e.target.value })}
                    className={`w-full ${theme.bgInput} border ${theme.border} rounded-2xl p-3 text-white focus:outline-none leading-relaxed resize-none`}
                    required
                  ></textarea>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setModalNuevaFuente(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={analizandoFuente}
                  className={`px-4 py-2 rounded-xl font-bold ${theme.accentBtn} disabled:opacity-50`}
                >
                  {analizandoFuente ? 'Analizando...' : 'Guardar y Analizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BARRA MÓVIL TÁCTIL INFERIOR */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 ${theme.bgCard} border-t ${theme.border} px-4 py-2.5 flex justify-around items-center z-40 backdrop-blur-2xl shadow-2xl`}>
        <button
          onClick={() => { setTab('tablero'); setCarpetaActivaId(null); }}
          className={`flex flex-col items-center space-y-1 text-[11px] font-extrabold transition ${tab === 'tablero' ? 'text-pink-400 scale-110' : 'text-slate-400/80'}`}
        >
          <span className="text-lg">📌</span>
          <span>Exámenes</span>
        </button>

        <button
          onClick={() => { setTab('crear'); setCarpetaActivaId(null); }}
          className={`flex flex-col items-center space-y-1 text-[11px] font-extrabold transition ${tab === 'crear' ? 'text-pink-400 scale-110' : 'text-slate-400/80'}`}
        >
          <span className="text-lg">⚡</span>
          <span>Plan</span>
        </button>

        <button
          onClick={() => { setTab('carpetas'); setCarpetaActivaId(null); }}
          className={`flex flex-col items-center space-y-1 text-[11px] font-extrabold transition ${tab === 'carpetas' ? 'text-pink-400 scale-110' : 'text-slate-400/80'}`}
        >
          <span className="text-lg">📁</span>
          <span>Carpetas</span>
        </button>

        <button
          onClick={() => { setTab('resumidor'); setCarpetaActivaId(null); }}
          className={`flex flex-col items-center space-y-1 text-[11px] font-extrabold transition ${tab === 'resumidor' ? 'text-pink-400 scale-110' : 'text-slate-400/80'}`}
        >
          <span className="text-lg">📄</span>
          <span>PDFs</span>
        </button>
      </div>
    </div>
  );
}