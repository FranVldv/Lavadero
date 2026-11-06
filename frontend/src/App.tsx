import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  TrendingUp,
  Package,
  Wrench,
  LogOut,
  Plus,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Shield,
  Check,
  Zap,
  Car,
  Search,
  CheckCircle2,
  ChevronRight,
  Send,
  Sparkles
} from 'lucide-react';

// API Configuration
const API_URL = 'http://localhost:3000/api/v1';

// Initial Mock Data for graceful degradation (Simulation Mode)
const MOCK_CLIENTES = [
  { _id: 'c1', nombre: 'Juan Pérez', telefono: '5491133334444' },
  { _id: 'c2', nombre: 'María Rodríguez', telefono: '5491155556666' },
  { _id: 'c3', nombre: 'Carlos López', telefono: '5491177778888' }
];

const MOCK_VEHICULOS = [
  { _id: 'v1', patente: 'AE123ZZ', marca: 'Toyota', modelo: 'Corolla', cliente: { _id: 'c1', nombre: 'Juan Pérez', telefono: '5491133334444' } },
  { _id: 'v2', patente: 'AF456AA', marca: 'Volkswagen', modelo: 'Gol', cliente: { _id: 'c2', nombre: 'María Rodríguez', telefono: '5491155556666' } },
  { _id: 'v3', patente: 'AD789BC', marca: 'Ford', modelo: 'Ranger', cliente: { _id: 'c3', nombre: 'Carlos López', telefono: '5491177778888' } }
];

const MOCK_SERVICIOS = [
  { _id: 's1', nombre: 'Lavado Básico', descripcion: 'Lavado exterior y aspirado simple', precio: 5000, duracion: 35 },
  { _id: 's2', nombre: 'Lavado Completo', descripcion: 'Lavado exterior, aspirado profundo y siliconas', precio: 8000, duracion: 50 },
  { _id: 's3', nombre: 'Limpieza de Tapizados', descripcion: 'Lavado completo + remoción de manchas en asientos', precio: 15000, duracion: 90 }
];

const MOCK_PRODUCTOS_PRONOSTICO = [
  { _id: 'p1', nombre: 'Shampoo Neutro / Activo', stockActual: 4.5, stockMinimo: 2, unidad: 'L', lavadosRestantes: 18, estado: 'ALERTA' },
  { _id: 'p2', nombre: 'Silicona Líquida Cubiertas', stockActual: 1.2, stockMinimo: 1.5, unidad: 'L', lavadosRestantes: 8, estado: 'CRITICO' },
  { _id: 'p3', nombre: 'Cera Líquida de Brillo', stockActual: 6.0, stockMinimo: 2, unidad: 'L', lavadosRestantes: 35, estado: 'OPTIMO' },
  { _id: 'p4', nombre: 'Desengrasante Motor/Chasis', stockActual: 3.8, stockMinimo: 2, unidad: 'L', lavadosRestantes: 22, estado: 'OPTIMO' }
];

const MOCK_TURNOS = [
  { _id: 't1', nombreCliente: 'Juan Pérez', telefonoCliente: '5491133334444', patente: 'AE123ZZ', fecha: '2026-11-06', franja: 'manana', estado: 'confirmado', notas: 'Auto: Toyota Corolla' },
  { _id: 't2', nombreCliente: 'María Rodríguez', telefonoCliente: '5491155556666', patente: 'AF456AA', fecha: '2026-11-06', franja: 'tarde', estado: 'confirmado', notas: 'Auto: Volkswagen Gol' }
];

// Órdenes en boxes en vivo
const MOCK_ORDENES_INICIALES = [
  {
    _id: 'o1',
    patente: 'AE123ZZ',
    nombreCliente: 'Juan Pérez',
    telefonoCliente: '5491133334444',
    box: 'Box 1',
    etapa: 'lavado', // 'ingresado' | 'lavado' | 'secado' | 'terminado'
    categoriaVehiculo: 'auto',
    servicio: { _id: 's2', nombre: 'Lavado Completo', precio: 8000 },
    total: 8000,
    tiempoEstimadoMinutos: 45,
    iniciadoMinutosAtras: 22,
    estado: 'en_proceso',
    metodoPago: 'efectivo',
    notas: 'Toyota Corolla Blanco'
  },
  {
    _id: 'o2',
    patente: 'AF456AA',
    nombreCliente: 'María Rodríguez',
    telefonoCliente: '5491155556666',
    box: 'Box 2',
    etapa: 'secado',
    categoriaVehiculo: 'auto',
    servicio: { _id: 's1', nombre: 'Lavado Básico', precio: 5000 },
    total: 5000,
    tiempoEstimadoMinutos: 35,
    iniciadoMinutosAtras: 31,
    estado: 'en_proceso',
    metodoPago: 'transferencia',
    notas: 'Volkswagen Gol'
  },
  {
    _id: 'o3',
    patente: 'AD789BC',
    nombreCliente: 'Carlos López',
    telefonoCliente: '5491177778888',
    box: 'Box 3',
    etapa: 'ingresado',
    categoriaVehiculo: 'camioneta',
    servicio: { _id: 's3', nombre: 'Limpieza de Tapizados', precio: 15000 },
    total: 15000,
    tiempoEstimadoMinutos: 90,
    iniciadoMinutosAtras: 5,
    estado: 'en_proceso',
    metodoPago: 'efectivo',
    notas: 'Ford Ranger'
  }
];

const MOCK_GASTOS_INICIALES = [
  { _id: 'g1', concepto: 'Almuerzo operarios (Empanadas)', monto: 4500, categoria: 'comida', hora: '13:30' },
  { _id: 'g2', concepto: 'Compra de 2 bolsas de franelas', monto: 3200, categoria: 'insumos', hora: '11:15' }
];

const DEFAULT_DISPONIBILIDAD = [
  { fecha: '2026-11-09', diaNombre: 'lunes', franjas: [{ franja: 'manana', label: 'Mañana', horario: '08:00 - 12:00', disponible: true }, { franja: 'tarde', label: 'Tarde', horario: '16:00 - 20:00', disponible: true }] },
  { fecha: '2026-11-10', diaNombre: 'martes', franjas: [{ franja: 'manana', label: 'Mañana', horario: '08:00 - 12:00', disponible: true }, { franja: 'tarde', label: 'Tarde', horario: '16:00 - 20:00', disponible: false }] },
  { fecha: '2026-11-11', diaNombre: 'miércoles', franjas: [{ franja: 'manana', label: 'Mañana', horario: '08:00 - 12:00', disponible: false }, { franja: 'tarde', label: 'Tarde', horario: '16:00 - 20:00', disponible: true }] },
  { fecha: '2026-11-12', diaNombre: 'jueves', franjas: [{ franja: 'manana', label: 'Mañana', horario: '08:00 - 12:00', disponible: true }, { franja: 'tarde', label: 'Tarde', horario: '16:00 - 20:00', disponible: true }] },
  { fecha: '2026-11-13', diaNombre: 'viernes', franjas: [{ franja: 'manana', label: 'Mañana', horario: '08:00 - 12:00', disponible: true }, { franja: 'tarde', label: 'Tarde', horario: '16:00 - 20:00', disponible: true }] }
];

export default function App() {
  // Navigation & Session State
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [publicSubTab, setPublicSubTab] = useState<'reservar' | 'tracking'>('reservar');
  const [currentTab, setCurrentTab] = useState('asistente'); // Por defecto abre en Asistente del Dueño
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState<{ nombre: string; role: string } | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );

  // Connection State
  const [apiOnline, setApiOnline] = useState(false);

  // App Data State
  const [clientes, setClientes] = useState(MOCK_CLIENTES);
  const [vehiculos, setVehiculos] = useState(MOCK_VEHICULOS);
  const [servicios, setServicios] = useState(MOCK_SERVICIOS);
  const [turnos, setTurnos] = useState(MOCK_TURNOS);
  const [ordenes, setOrdenes] = useState(MOCK_ORDENES_INICIALES);
  const [pronosticoInsumos, setPronosticoInsumos] = useState(MOCK_PRODUCTOS_PRONOSTICO);
  const [gastosCaja, setGastosCaja] = useState(MOCK_GASTOS_INICIALES);

  // Public Booking State
  const [refFecha] = useState('2026-11-09');
  const [disponibilidad, setDisponibilidad] = useState(DEFAULT_DISPONIBILIDAD);
  const [selectedSlot, setSelectedSlot] = useState<{ fecha: string; franja: string; label: string } | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Tracking Público de Cliente
  const [trackingPatenteInput, setTrackingPatenteInput] = useState('');
  const [trackingResultado, setTrackingResultado] = useState<any>(null);
  const [trackingError, setTrackingError] = useState('');
  const [trackingBuscando, setTrackingBuscando] = useState(false);

  // Modales Asistente del Dueño
  const [showIngresoAutoModal, setShowIngresoAutoModal] = useState(false);
  const [showGastoModal, setShowGastoModal] = useState(false);
  const [showCierreModal, setShowCierreModal] = useState(false);
  const [cierreRealContado, setCierreRealContado] = useState('');
  const [cierreObservaciones, setCierreObservaciones] = useState('');
  const [resumenCierreGenerado, setResumenCierreGenerado] = useState<string | null>(null);
  const [notifToast, setNotifToast] = useState<string | null>(null);

  // Form Inputs Ingreso Rápido
  const [formIngreso, setFormIngreso] = useState({
    patente: '',
    nombreCliente: '',
    telefonoCliente: '',
    modelo: '',
    servicioId: 's1',
    box: 'Box 1',
    categoriaVehiculo: 'auto'
  });

  // Form Inputs Gasto Rápido
  const [formGasto, setFormGasto] = useState({
    concepto: '',
    monto: '',
    categoria: 'comida'
  });

  // Auth Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(false);

  // Mostrar toast temporal
  const triggerToast = (msg: string) => {
    setNotifToast(msg);
    setTimeout(() => setNotifToast(null), 4000);
  };

  // Check API connectivity
  const checkApiStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/turnos/semana?fecha=${refFecha}`);
      if (res.ok || res.status === 400 || res.status === 200) {
        setApiOnline(true);
      } else {
        setApiOnline(false);
      }
    } catch {
      setApiOnline(false);
    }
  };

  useEffect(() => {
    checkApiStatus();
  }, [refFecha]);

  useEffect(() => {
    if (apiOnline) {
      fetchDisponibilidad();
      if (token) {
        fetchDataFromApi();
      }
    }
  }, [apiOnline, token, refFecha]);

  const fetchDisponibilidad = async () => {
    try {
      const res = await fetch(`${API_URL}/turnos/semana?fecha=${refFecha}`);
      if (res.ok) setDisponibilidad(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDataFromApi = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [resCli, resVeh, resSer, resTur, resOrd, resPron, resCaja] = await Promise.all([
        fetch(`${API_URL}/clientes`),
        fetch(`${API_URL}/vehiculos`),
        fetch(`${API_URL}/servicios`),
        fetch(`${API_URL}/turnos`, { headers }),
        fetch(`${API_URL}/ordenes`, { headers }),
        fetch(`${API_URL}/productos/pronostico`, { headers }),
        fetch(`${API_URL}/caja/hoy`, { headers })
      ]);

      if (resCli.ok) setClientes(await resCli.json());
      if (resVeh.ok) setVehiculos(await resVeh.json());
      if (resSer.ok) setServicios(await resSer.json());
      if (resTur.ok) setTurnos(await resTur.json());
      if (resOrd.ok) {
        const ords = await resOrd.json();
        if (ords.length > 0) setOrdenes(ords);
      }
      if (resPron.ok) setPronosticoInsumos(await resPron.json());
      if (resCaja.ok) {
        const cData = await resCaja.json();
        if (cData.gastos) setGastosCaja(cData.gastos);
      }
    } catch (err) {
      console.error("Modo simulación activo", err);
    }
  };

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!apiOnline) {
      if (email === 'admin@lavadero.com' && password === 'admin123') {
        const dummyUser = { nombre: 'Dueño / Encargado', role: 'admin' };
        setToken('dummy-jwt-token');
        setUser(dummyUser);
        localStorage.setItem('token', 'dummy-jwt-token');
        localStorage.setItem('user', JSON.stringify(dummyUser));
      } else {
        setAuthError('Credenciales inválidas. Usa admin@lavadero.com / admin123 para el modo simulado.');
      }
      return;
    }

    try {
      const endpoint = isSetupMode ? 'setup' : 'login';
      const body = isSetupMode ? { email, password, nombre: 'Administrador' } : { email, password };
      const res = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error en la petición');

      if (isSetupMode) {
        setAuthSuccess('¡Admin configurado! Ya puedes iniciar sesión.');
        setIsSetupMode(false);
      } else {
        setToken(data.access_token);
        const loggedUser = { nombre: data.nombre, role: data.role };
        setUser(loggedUser);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        fetchDataFromApi();
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setViewMode('public');
  };

  // AVANZAR ETAPA DE BOX (1 TOQUE)
  const handleAvanzarEtapa = async (ordenId: string) => {
    const ordenActual = ordenes.find(o => o._id === ordenId);
    if (!ordenActual) return;

    const secuencia: Record<string, string> = {
      ingresado: 'lavado',
      lavado: 'secado',
      secado: 'terminado'
    };
    const siguienteEtapa = secuencia[ordenActual.etapa] || 'terminado';

    if (apiOnline && token) {
      try {
        await fetch(`${API_URL}/ordenes/${ordenId}/etapa`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ etapa: siguienteEtapa })
        });
      } catch (err) {
        console.error(err);
      }
    }

    // Actualizar estado local
    setOrdenes(ordenes.map(o => {
      if (o._id === ordenId) {
        return {
          ...o,
          etapa: siguienteEtapa,
          estado: siguienteEtapa === 'terminado' ? 'completada' : 'en_proceso'
        };
      }
      return o;
    }));

    if (siguienteEtapa === 'terminado') {
      triggerToast(`🚗 ¡Vehículo ${ordenActual.patente} LISTO! Se notificó al cliente por WhatsApp.`);
      // Descontar insumos en la simulación
      setPronosticoInsumos(prev =>
        prev.map(p => ({
          ...p,
          lavadosRestantes: Math.max(0, p.lavadosRestantes - 1),
          stockActual: Math.max(0, Number((p.stockActual - 0.1).toFixed(2)))
        }))
      );
    } else {
      triggerToast(`Box actualizado: ${ordenActual.patente} pasó a ${siguienteEtapa.toUpperCase()}`);
    }
  };

  // INGRESO RÁPIDO DE AUTO (3 TOQUES)
  const handleIngresoAutoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serv = servicios.find(s => s._id === formIngreso.servicioId) || servicios[0];
    const nuevaOrden: any = {
      _id: 'o_' + Date.now(),
      patente: formIngreso.patente.toUpperCase(),
      nombreCliente: formIngreso.nombreCliente || 'Cliente',
      telefonoCliente: formIngreso.telefonoCliente,
      box: formIngreso.box,
      etapa: 'ingresado',
      categoriaVehiculo: formIngreso.categoriaVehiculo,
      servicio: serv,
      total: serv.precio,
      tiempoEstimadoMinutos: serv.duracion || 45,
      iniciadoMinutosAtras: 0,
      estado: 'en_proceso',
      metodoPago: 'efectivo',
      notas: formIngreso.modelo || 'Vehículo'
    };

    setOrdenes([nuevaOrden, ...ordenes]);
    setShowIngresoAutoModal(false);
    triggerToast(`🚘 Auto ${formIngreso.patente.toUpperCase()} asignado a ${formIngreso.box}`);
    setFormIngreso({
      patente: '',
      nombreCliente: '',
      telefonoCliente: '',
      modelo: '',
      servicioId: 's1',
      box: 'Box 1',
      categoriaVehiculo: 'auto'
    });
  };

  // GASTO RÁPIDO DE CAJA CHICA
  const handleRegistrarGasto = (concepto: string, monto: number, categoria = 'comida') => {
    const nuevoGasto = {
      _id: 'g_' + Date.now(),
      concepto,
      monto,
      categoria,
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    };
    setGastosCaja([nuevoGasto, ...gastosCaja]);
    setShowGastoModal(false);
    triggerToast(`💸 Gasto registrado: -$${monto.toLocaleString()} (${concepto})`);
  };

  // CIERRE DIARIO Y ARQUEO
  const handleCerrarDia = () => {
    const efectivoReal = Number(cierreRealContado) || 0;
    const ingresosEfectivo = ordenes
      .filter(o => o.estado === 'completada' && o.metodoPago !== 'transferencia')
      .reduce((acc, o) => acc + (o.total || 0), 0);
    const ingresosTransferencia = ordenes
      .filter(o => o.estado === 'completada' && o.metodoPago === 'transferencia')
      .reduce((acc, o) => acc + (o.total || 0), 0);
    const totalGastos = gastosCaja.reduce((acc, g) => acc + g.monto, 0);
    const efectivoEsperado = Math.max(0, ingresosEfectivo - totalGastos);
    const diferencia = efectivoReal - efectivoEsperado;
    const autosLavados = ordenes.filter(o => o.estado === 'completada').length;
    const facturacionBruta = ingresosEfectivo + ingresosTransferencia;
    const gananciaNeta = facturacionBruta - totalGastos;

    const diffTexto = diferencia >= 0 ? `+$${diferencia.toLocaleString()} (Correcto / Sobrante)` : `-$${Math.abs(diferencia).toLocaleString()} (Faltante)`;
    const textoWhatsApp =
      `📊 *CIERRE DIARIO - LAVADERO* 🚗\n` +
      `📅 Fecha: ${new Date().toLocaleDateString('es-AR')}\n` +
      `🚘 *Autos lavados:* ${autosLavados}\n\n` +
      `💵 *Efectivo cobrado:* $${ingresosEfectivo.toLocaleString()}\n` +
      `📱 *Transferencias / MP:* $${ingresosTransferencia.toLocaleString()}\n` +
      `💸 *Gastos caja chica:* -$${totalGastos.toLocaleString()}\n` +
      `────────────────────────\n` +
      `💰 *FACTURACIÓN TOTAL:* $${facturacionBruta.toLocaleString()}\n` +
      `💵 *EFECTIVO FÍSICO ARQUEO:* $${efectivoReal.toLocaleString()} (${diffTexto})\n` +
      `✅ *GANANCIA NETA ESTIMADA:* $${gananciaNeta.toLocaleString()}\n\n` +
      `_Cierre generado automáticamente desde el Asistente._`;

    setResumenCierreGenerado(textoWhatsApp);
    setShowCierreModal(false);
    triggerToast(`📊 Cierre diario generado con éxito.`);
  };

  // CONSULTAR TRACKING CLIENTE
  const handleConsultarTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    const pat = trackingPatenteInput.toUpperCase().trim();
    if (!pat) return;

    setTrackingBuscando(true);
    setTrackingError('');

    if (apiOnline) {
      try {
        const res = await fetch(`${API_URL}/ordenes/tracking/${pat}`);
        if (res.ok) {
          setTrackingResultado(await res.json());
          setTrackingBuscando(false);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Fallback simulado
    const encontrada = ordenes.find(o => o.patente.toUpperCase() === pat);
    setTrackingBuscando(false);
    if (encontrada) {
      setTrackingResultado({
        patente: encontrada.patente,
        nombreCliente: encontrada.nombreCliente,
        box: encontrada.box,
        etapa: encontrada.etapa,
        estado: encontrada.estado,
        servicio: encontrada.servicio?.nombre || 'Lavado Completo',
        total: encontrada.total,
        tiempoEstimadoMinutos: encontrada.tiempoEstimadoMinutos || 45,
        iniciadoAt: new Date(Date.now() - (encontrada.iniciadoMinutosAtras || 10) * 60000).toISOString()
      });
    } else {
      setTrackingError(`No encontramos ningún auto en proceso con la patente ${pat}. Verifica si está bien escrita.`);
      setTrackingResultado(null);
    }
  };

  // Cálculos de Caja en Vivo
  const ingresosEfectivoHoy = ordenes
    .filter(o => o.estado === 'completada' && o.metodoPago !== 'transferencia')
    .reduce((acc, o) => acc + (o.total || 0), 0);
  const ingresosTransfHoy = ordenes
    .filter(o => o.estado === 'completada' && o.metodoPago === 'transferencia')
    .reduce((acc, o) => acc + (o.total || 0), 0);
  const totalGastosHoy = gastosCaja.reduce((acc, g) => acc + g.monto, 0);
  const gananciaNetaHoy = (ingresosEfectivoHoy + ingresosTransfHoy) - totalGastosHoy;
  const autosCompletadosHoy = ordenes.filter(o => o.estado === 'completada').length;

  // ──────────────────────────────────────────────────────────
  // VISTA PÚBLICA (PORTAL DE CLIENTES: RESERVAS & SEGUIMIENTO)
  // ──────────────────────────────────────────────────────────
  if (viewMode === 'public') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
        
        {/* Header Público */}
        <header className="header-top" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🚗</span>
            <span className="logo-text" style={{ fontSize: '22px' }}>Lavadero Express</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setViewMode('admin')} style={{ gap: '8px' }}>
              <Shield size={16} />
              <span>Acceso Dueños</span>
            </button>
          </div>
        </header>

        {/* Subtabs del Cliente: Reservar Turno vs Seguimiento */}
        <div style={{ display: 'flex', justifyContent: 'center', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', gap: '20px', padding: '12px' }}>
            <button
              className={`btn ${publicSubTab === 'reservar' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPublicSubTab('reservar')}
              style={{ gap: '8px', minWidth: '180px' }}
            >
              <Calendar size={18} />
              <span>📅 Reservar Turno</span>
            </button>

            <button
              className={`btn ${publicSubTab === 'tracking' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPublicSubTab('tracking')}
              style={{ gap: '8px', minWidth: '180px' }}
            >
              <Search size={18} />
              <span>🔍 Seguimiento de mi Auto</span>
            </button>
          </div>
        </div>

        {/* Contenido Público */}
        <div className="content-container" style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '30px 20px' }}>
          
          {/* SUBTAB: SEGUIMIENTO EN VIVO */}
          {publicSubTab === 'tracking' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <h1 className="page-title" style={{ fontSize: '32px', marginBottom: '8px' }}>¿Dónde está mi auto?</h1>
                <p style={{ color: 'var(--text-muted)' }}>Ingresá tu patente para ver el estado de tu lavado en vivo y en directo.</p>
              </div>

              <div className="card" style={{ padding: '24px' }}>
                <form onSubmit={handleConsultarTracking} style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: AE123ZZ o AF456AA"
                    style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}
                    value={trackingPatenteInput}
                    onChange={e => setTrackingPatenteInput(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ minWidth: '140px', fontSize: '16px' }} disabled={trackingBuscando}>
                    <Search size={18} />
                    <span>{trackingBuscando ? 'Buscando...' : 'Consultar'}</span>
                  </button>
                </form>

                {trackingError && (
                  <div className="alert-box danger" style={{ marginTop: '16px' }}>
                    <AlertTriangle size={18} />
                    <span>{trackingError}</span>
                  </div>
                )}
              </div>

              {/* Resultado del Stepper en Vivo */}
              {trackingResultado && (
                <div className="card" style={{ border: '2px solid var(--primary)', padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <div>
                      <span className="badge badge-info" style={{ fontSize: '13px', textTransform: 'uppercase' }}>
                        Patente: {trackingResultado.patente}
                      </span>
                      <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '6px' }}>{trackingResultado.servicio}</h2>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Monto a abonar:</span>
                      <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--success)' }}>${trackingResultado.total?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Stepper de 4 Pasos */}
                  <div className="stepper-container">
                    <div className={`stepper-item ${['ingresado', 'lavado', 'secado', 'terminado'].includes(trackingResultado.etapa) ? (trackingResultado.etapa === 'ingresado' ? 'current' : 'completed') : ''}`}>
                      <div className="stepper-circle" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>1</div>
                      <div style={{ flexGrow: 1 }}>
                        <p style={{ fontWeight: 'bold', fontSize: '15px' }}>Vehículo Ingresado</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Asignado a {trackingResultado.box || 'Bahía de lavado'}</p>
                      </div>
                      {trackingResultado.etapa !== 'ingresado' && <Check size={20} />}
                    </div>

                    <div className={`stepper-item ${['lavado', 'secado', 'terminado'].includes(trackingResultado.etapa) ? (trackingResultado.etapa === 'lavado' ? 'current' : 'completed') : ''}`}>
                      <div className="stepper-circle" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>2</div>
                      <div style={{ flexGrow: 1 }}>
                        <p style={{ fontWeight: 'bold', fontSize: '15px' }}>En Lavado Activo</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Hidrolavado y desengrase exterior</p>
                      </div>
                      {['secado', 'terminado'].includes(trackingResultado.etapa) && <Check size={20} />}
                    </div>

                    <div className={`stepper-item ${['secado', 'terminado'].includes(trackingResultado.etapa) ? (trackingResultado.etapa === 'secado' ? 'current' : 'completed') : ''}`}>
                      <div className="stepper-circle" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>3</div>
                      <div style={{ flexGrow: 1 }}>
                        <p style={{ fontWeight: 'bold', fontSize: '15px' }}>Secado y Terminación</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Detallado de vidrios, neumáticos e interiores</p>
                      </div>
                      {trackingResultado.etapa === 'terminado' && <Check size={20} />}
                    </div>

                    <div className={`stepper-item ${trackingResultado.etapa === 'terminado' ? 'current' : ''}`} style={{ borderColor: trackingResultado.etapa === 'terminado' ? 'var(--success)' : 'var(--border-color)', backgroundColor: trackingResultado.etapa === 'terminado' ? 'rgba(52, 211, 153, 0.15)' : 'var(--bg-input)' }}>
                      <div className="stepper-circle" style={{ backgroundColor: trackingResultado.etapa === 'terminado' ? 'var(--success)' : 'var(--border-color)', color: '#000' }}>4</div>
                      <div style={{ flexGrow: 1 }}>
                        <p style={{ fontWeight: 'bold', fontSize: '15px', color: trackingResultado.etapa === 'terminado' ? 'var(--success)' : 'inherit' }}>
                          {trackingResultado.etapa === 'terminado' ? '🎉 ¡LISTO PARA RETIRAR!' : 'Listo para Retirar'}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Te esperamos para la entrega y cobro</p>
                      </div>
                      {trackingResultado.etapa === 'terminado' && <CheckCircle2 size={24} style={{ color: 'var(--success)' }} />}
                    </div>
                  </div>

                  <div className="alert-box success" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Shield size={18} />
                    <span>Te enviaremos un WhatsApp automático apenas esté listo. Podés abonar con Mercado Pago al alias del lavadero.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUBTAB: RESERVA DE TURNO (CALENDARIO) */}
          {publicSubTab === 'reservar' && (
            <div>
              {bookingSuccess ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'var(--success-glow)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={36} />
                  </div>
                  <h1 className="page-title" style={{ fontSize: '28px' }}>¡Turno Confirmado!</h1>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '480px' }}>
                    Registramos tu turno para el <strong>{selectedSlot?.fecha} ({selectedSlot?.label})</strong>. Te notificaremos vía WhatsApp al número indicado.
                  </p>
                  <button className="btn btn-primary" onClick={() => { setBookingSuccess(false); setSelectedSlot(null); }}>
                    Reservar otro turno
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <h1 className="page-title" style={{ fontSize: '32px', marginBottom: '8px' }}>Elegí tu Turno de Lavado</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Seleccioná el día y horario que te quede cómodo. Rápido y sin registrarte.</p>
                  </div>

                  {/* Calendario Semanal */}
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--primary)' }}>Semana Disponible</span>
                      <span className="badge badge-info">Lunes a Viernes</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                      {disponibilidad.map((dia, idx) => (
                        <div key={idx} style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 8px', textAlign: 'center' }}>
                          <p style={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '14px' }}>{dia.diaNombre}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>{dia.fecha}</p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {dia.franjas.map((f, fIdx) => (
                              <button
                                key={fIdx}
                                type="button"
                                className={`btn ${f.disponible ? 'btn-success' : 'btn-secondary'}`}
                                style={{ width: '100%', padding: '8px 4px', fontSize: '11px', opacity: f.disponible ? 1 : 0.35, cursor: f.disponible ? 'pointer' : 'not-allowed', flexDirection: 'column' }}
                                disabled={!f.disponible}
                                onClick={() => setSelectedSlot({ fecha: dia.fecha, franja: f.franja, label: f.label })}
                              >
                                <strong>{f.label}</strong>
                                <span style={{ fontSize: '9px' }}>{f.disponible ? 'Libre' : 'Ocupado'}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Formulario de Confirmación */}
                  {selectedSlot && (
                    <div className="card" style={{ border: '2px solid var(--primary)', padding: '24px' }}>
                      <h3 className="card-title" style={{ marginBottom: '14px', color: 'var(--primary)' }}>
                        Confirmar turno para: {selectedSlot.fecha} ({selectedSlot.label})
                      </h3>

                      <form onSubmit={e => { e.preventDefault(); setBookingSuccess(true); }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="alert-box success" style={{ gridColumn: 'span 2' }}>
                          <Shield size={18} />
                          <span>Tus datos están protegidos. Solo usaremos tu teléfono para avisarte cuando tu vehículo esté listo.</span>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Tu Nombre</label>
                          <input type="text" className="form-input" required placeholder="Ej: Juan Pérez" />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Celular / WhatsApp</label>
                          <input type="text" className="form-input" required placeholder="Ej: 5491132145678" />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Patente</label>
                          <input type="text" className="form-input" required placeholder="Ej: AE123ZZ" style={{ textTransform: 'uppercase' }} />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Auto (Marca y Modelo)</label>
                          <input type="text" className="form-input" required placeholder="Ej: Toyota Corolla" />
                        </div>

                        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                          <button type="button" className="btn btn-secondary" onClick={() => setSelectedSlot(null)}>Cancelar</button>
                          <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }}>Confirmar Reserva</button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // LOGIN ADMINISTRATIVO
  // ──────────────────────────────────────────────────────────
  if (!token || !user) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div style={{ fontSize: '36px' }}>⚡</div>
            <h1 className="auth-title">Asistente del Lavadero</h1>
            <p className="auth-subtitle">Ingreso exclusivo para Dueños y Encargados</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input type="email" className="form-input" placeholder="admin@lavadero.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {authError && <div className="alert-box danger">{authError}</div>}
            {authSuccess && <div className="alert-box success">{authSuccess}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px', height: '48px', fontSize: '15px' }}>
              {isSetupMode ? 'Registrar y Configurar' : 'Ingresar al Asistente'}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <button className="btn-logout" style={{ fontSize: '13px', textDecoration: 'underline' }} onClick={() => setViewMode('public')}>
              ← Volver al Portal de Clientes
            </button>
            <button className="btn-logout" style={{ fontSize: '13px', textDecoration: 'underline' }} onClick={() => setIsSetupMode(!isSetupMode)}>
              {isSetupMode ? 'Ingresar' : 'Configurar Admin'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // PANEL INTERNO / ASISTENTE DEL DUEÑO
  // ──────────────────────────────────────────────────────────
  const boxes = ['Box 1', 'Box 2', 'Box 3'];

  return (
    <div style={{ display: 'flex', width: '100vw', minHeight: '100vh', position: 'relative' }}>
      
      {/* Toast Notification */}
      {notifToast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, backgroundColor: 'var(--bg-card)', border: '2px solid var(--primary)', padding: '16px 22px', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'modalSlideUp 0.3s ease' }}>
          <Sparkles size={20} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-main)' }}>{notifToast}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <span style={{ fontSize: '24px' }}>⚡</span>
          <span className="logo-text">ASISTENTE</span>
        </div>

        <ul className="nav-links">
          <li>
            <button className={`nav-item ${currentTab === 'asistente' ? 'active' : ''}`} onClick={() => setCurrentTab('asistente')}>
              <Zap size={18} style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 'bold' }}>Control en Vivo</span>
            </button>
          </li>
          <li>
            <button className={`nav-item ${currentTab === 'caja' ? 'active' : ''}`} onClick={() => setCurrentTab('caja')}>
              <DollarSign size={18} />
              <span>Caja & Cierre</span>
            </button>
          </li>
          <li>
            <button className={`nav-item ${currentTab === 'insumos' ? 'active' : ''}`} onClick={() => setCurrentTab('insumos')}>
              <Package size={18} />
              <span>Insumos & Alertas</span>
            </button>
          </li>
          <li>
            <button className={`nav-item ${currentTab === 'turnos' ? 'active' : ''}`} onClick={() => setCurrentTab('turnos')}>
              <Calendar size={18} />
              <span>Turnos Reservados</span>
            </button>
          </li>
          <li>
            <button className={`nav-item ${currentTab === 'clientes' ? 'active' : ''}`} onClick={() => setCurrentTab('clientes')}>
              <Users size={18} />
              <span>Clientes & Autos</span>
            </button>
          </li>
          <li>
            <button className={`nav-item ${currentTab === 'servicios' ? 'active' : ''}`} onClick={() => setCurrentTab('servicios')}>
              <Wrench size={18} />
              <span>Servicios</span>
            </button>
          </li>
        </ul>

        <div className="user-profile-section">
          <div className="user-info">
            <span className="user-name">{user.nombre}</span>
            <span className="user-role">Dueño / Encargado</span>
          </div>
          <button className="btn-logout" title="Cerrar sesión" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-wrapper">
        <header className="header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <h2 className="page-title">
              {currentTab === 'asistente' ? '⚡ Centro de Control en Vivo' : currentTab.toUpperCase()}
            </h2>
            <button
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px' }}
              onClick={() => setShowIngresoAutoModal(true)}
            >
              <Plus size={16} />
              <span>+ Auto Ingresado</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={checkApiStatus} title="Refrescar">
              <RefreshCw size={14} />
            </button>
            <div className={`api-status-badge ${apiOnline ? 'connected' : 'simulated'}`}>
              <div className="status-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: apiOnline ? 'var(--success)' : 'var(--warning)' }} />
              <span>{apiOnline ? 'Online (Mongo)' : 'Modo Asistente Offline'}</span>
            </div>
          </div>
        </header>

        <div className="content-container">

          {/* ──────────────────────────────────────────────────────────
              TAB 1: ASISTENTE & CONTROL EN VIVO (LIVE BOXES)
              ────────────────────────────────────────────────────────── */}
          {currentTab === 'asistente' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Morning Briefing Banner */}
              <div className="card" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(167,139,250,0.1) 100%)', border: '1px solid rgba(56,189,248,0.3)', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>☀️ Buenos días! Estado del Lavadero</span>
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                      {autosCompletadosHoy} autos lavados hoy · Recaudación bruta: <strong>${(ingresosEfectivoHoy + ingresosTransfHoy).toLocaleString()}</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => setShowGastoModal(true)}>
                      💸 Gasto Caja Chica
                    </button>
                    <button className="btn btn-success" onClick={() => setShowCierreModal(true)}>
                      📊 Cierre Diario
                    </button>
                  </div>
                </div>
              </div>

              {/* LIVE BOXES / BAHÍAS DE LAVADO */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Car size={20} style={{ color: 'var(--primary)' }} />
                  <span>Boxes de Lavado en Curso</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {boxes.map(boxNombre => {
                    const ordenEnBox = ordenes.find(o => o.box === boxNombre && o.estado !== 'completada');

                    if (!ordenEnBox) {
                      return (
                        <div key={boxNombre} className="box-card-live" style={{ borderStyle: 'dashed', textAlign: 'center', justifyContent: 'center', minHeight: '260px' }}>
                          <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{boxNombre}</span>
                          <span className="badge badge-success" style={{ alignSelf: 'center' }}>🟢 DISPONIBLE</span>
                          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Puesto libre para lavado</p>
                          <button
                            className="btn btn-primary btn-touch-xl"
                            style={{ marginTop: '12px' }}
                            onClick={() => {
                              setFormIngreso({ ...formIngreso, box: boxNombre });
                              setShowIngresoAutoModal(true);
                            }}
                          >
                            <Plus size={18} />
                            <span>Asignar Auto</span>
                          </button>
                        </div>
                      );
                    }

                    const etapa = ordenEnBox.etapa;
                    return (
                      <div key={boxNombre} className="box-card-live active">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{boxNombre}</span>
                          <span className={`badge ${etapa === 'secado' ? 'badge-warning' : 'badge-info'}`} style={{ textTransform: 'uppercase' }}>
                            {etapa === 'ingresado' ? 'Ingresado' : etapa === 'lavado' ? 'En Lavado' : 'Secado / Detalle'}
                          </span>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <p style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '1px' }}>
                              {ordenEnBox.patente}
                            </p>
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--success)' }}>
                              ${ordenEnBox.total.toLocaleString()}
                            </span>
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{ordenEnBox.notas || 'Vehículo'} · {ordenEnBox.nombreCliente}</p>
                          <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600', marginTop: '2px' }}>
                            🧼 {ordenEnBox.servicio?.nombre}
                          </p>
                        </div>

                        {/* Barra de progreso de etapa */}
                        <div style={{ backgroundColor: 'var(--bg-input)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: etapa === 'ingresado' ? '25%' : etapa === 'lavado' ? '60%' : '90%',
                              backgroundColor: etapa === 'secado' ? 'var(--warning)' : 'var(--primary)',
                              transition: 'width 0.4s ease'
                            }}
                          />
                        </div>

                        {/* Botón de Acción Táctil en 1 toque */}
                        <button
                          className={`btn-touch-xl ${etapa === 'secado' ? 'btn-success' : 'btn-primary'}`}
                          onClick={() => handleAvanzarEtapa(ordenEnBox._id)}
                        >
                          {etapa === 'ingresado' && (
                            <>
                              <span>Iniciar Lavado</span>
                              <ChevronRight size={18} />
                            </>
                          )}
                          {etapa === 'lavado' && (
                            <>
                              <span>Pasar a Secado</span>
                              <ChevronRight size={18} />
                            </>
                          )}
                          {etapa === 'secado' && (
                            <>
                              <CheckCircle2 size={20} />
                              <span>¡Listo! (Avisar WhatsApp)</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SEMÁFORO PREDICTIVO DE INSUMOS & CAJA CHICA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                
                {/* Semáforo Predictivo */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Package size={18} style={{ color: 'var(--primary)' }} />
                      <span>Semáforo Predictivo de Insumos</span>
                    </h3>
                    <span className="badge badge-info">Dosis por auto</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {pronosticoInsumos.map(insumo => {
                      const porcentaje = Math.min(100, (insumo.lavadosRestantes / 30) * 100);
                      const esCritico = insumo.estado === 'CRITICO';
                      const esAlerta = insumo.estado === 'ALERTA';

                      return (
                        <div key={insumo._id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontWeight: '600', fontSize: '14px' }}>{insumo.nombre}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                                ({insumo.stockActual} {insumo.unidad})
                              </span>
                            </div>

                            <span
                              className={`badge ${esCritico ? 'badge-danger' : esAlerta ? 'badge-warning' : 'badge-success'}`}
                              style={{ fontSize: '11px' }}
                            >
                              {esCritico ? '⚠️ ' : ''}Alcanza para ~{insumo.lavadosRestantes} autos
                            </span>
                          </div>

                          <div className="gauge-bar-bg">
                            <div
                              className={`gauge-bar-fill ${esCritico ? 'critico' : esAlerta ? 'alerta' : 'optimo'}`}
                              style={{ width: `${Math.max(8, porcentaje)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Caja Rápida & Gastos de Hoy */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarSign size={18} style={{ color: 'var(--success)' }} />
                      <span>Caja de Hoy</span>
                    </h3>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => setShowGastoModal(true)}>
                      + Anotar Gasto
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ backgroundColor: 'var(--bg-input)', padding: '12px', borderRadius: '10px' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Efectivo en mano</p>
                      <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--success)' }}>
                        ${Math.max(0, ingresosEfectivoHoy - totalGastosHoy).toLocaleString()}
                      </p>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-input)', padding: '12px', borderRadius: '10px' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Transferencias / MP</p>
                      <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>
                        ${ingresosTransfHoy.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Últimos gastos */}
                  <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Salidas de Caja Chica:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                    {gastosCaja.length === 0 ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No hay gastos anotados hoy.</p>
                    ) : (
                      gastosCaja.map(g => (
                        <div key={g._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                          <span>{g.concepto}</span>
                          <strong style={{ color: 'var(--danger)' }}>-${g.monto.toLocaleString()}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 2: CAJA & CIERRE DIARIO
              ────────────────────────────────────────────────────────── */}
          {currentTab === 'caja' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Resumen Financiero del Turno</h3>
                  <button className="btn btn-success" onClick={() => setShowCierreModal(true)}>
                    📊 Hacer Arqueo & Cerrar Día
                  </button>
                </div>

                <div className="dashboard-grid">
                  <div className="stat-card">
                    <div className="stat-icon-container success"><DollarSign size={24} /></div>
                    <div className="stat-details">
                      <span className="stat-value">${(ingresosEfectivoHoy + ingresosTransfHoy).toLocaleString()}</span>
                      <span className="stat-label">Facturación Bruta Hoy</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon-container danger"><DollarSign size={24} /></div>
                    <div className="stat-details">
                      <span className="stat-value">-${totalGastosHoy.toLocaleString()}</span>
                      <span className="stat-label">Gastos Caja Chica</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon-container primary"><TrendingUp size={24} /></div>
                    <div className="stat-details">
                      <span className="stat-value">${gananciaNetaHoy.toLocaleString()}</span>
                      <span className="stat-label">Ganancia Neta Estimada</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon-container warning"><Car size={24} /></div>
                    <div className="stat-details">
                      <span className="stat-value">{autosCompletadosHoy}</span>
                      <span className="stat-label">Vehículos Lavados</span>
                    </div>
                  </div>
                </div>

                {/* Resumen Generado para WhatsApp */}
                {resumenCierreGenerado && (
                  <div className="card" style={{ border: '2px solid var(--success)', marginTop: '20px' }}>
                    <div className="card-header">
                      <h4 style={{ color: 'var(--success)', fontWeight: 'bold' }}>✅ Resumen Diario para WhatsApp</h4>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => {
                          navigator.clipboard.writeText(resumenCierreGenerado);
                          triggerToast('¡Resumen copiado! Ya podés pegarlo en WhatsApp.');
                        }}
                      >
                        Copiar Mensaje
                      </button>
                    </div>
                    <pre style={{ backgroundColor: 'var(--bg-input)', padding: '16px', borderRadius: '8px', fontSize: '13px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                      {resumenCierreGenerado}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 3: INSUMOS & ALERTAS
              ────────────────────────────────────────────────────────── */}
          {currentTab === 'insumos' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Inventario & Proyección de Stock</h3>
              </div>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Insumo</th>
                      <th>Stock Actual</th>
                      <th>Mínimo</th>
                      <th>Autonomía Estimada</th>
                      <th>Acción Rápida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pronosticoInsumos.map(p => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 'bold' }}>{p.nombre}</td>
                        <td>{p.stockActual} {p.unidad}</td>
                        <td>{p.stockMinimo} {p.unidad}</td>
                        <td>
                          <span className={`badge ${p.estado === 'CRITICO' ? 'badge-danger' : p.estado === 'ALERTA' ? 'badge-warning' : 'badge-success'}`}>
                            ~{p.lavadosRestantes} lavados restantes
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => {
                              setPronosticoInsumos(prev =>
                                prev.map(item => item._id === p._id ? { ...item, stockActual: item.stockActual + 5, lavadosRestantes: item.lavadosRestantes + 40, estado: 'OPTIMO' } : item)
                              );
                              triggerToast(`+5 Litros cargados en ${p.nombre}`);
                            }}
                          >
                            + Cargar Bidón (5L)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TABS CONSERVADAS: TURNOS, CLIENTES, SERVICIOS
              ────────────────────────────────────────────────────────── */}
          {currentTab === 'turnos' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Agenda de Turnos</h3>
              </div>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Celular</th>
                      <th>Patente</th>
                      <th>Fecha</th>
                      <th>Franja</th>
                      <th>Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turnos.map(t => (
                      <tr key={t._id}>
                        <td style={{ fontWeight: '600' }}>{t.nombreCliente}</td>
                        <td>{t.telefonoCliente}</td>
                        <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{t.patente}</td>
                        <td>{t.fecha}</td>
                        <td>{t.franja}</td>
                        <td>{t.notas || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentTab === 'clientes' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Clientes Registrados</h3>
              </div>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Teléfono</th>
                      <th>Vehículos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map(c => {
                      const v = vehiculos.filter(veh => (typeof veh.cliente === 'object' ? veh.cliente._id === c._id : veh.cliente === c._id));
                      return (
                        <tr key={c._id}>
                          <td style={{ fontWeight: '600' }}>{c.nombre}</td>
                          <td>{c.telefono}</td>
                          <td>
                            {v.map(item => (
                              <span key={item._id} className="badge badge-info" style={{ marginRight: '6px' }}>
                                {item.patente} ({item.marca} {item.modelo})
                              </span>
                            ))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentTab === 'servicios' && (
            <div className="cards-grid">
              {servicios.map(s => (
                <div key={s._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>{s.nombre}</h4>
                    <span className="badge badge-info" style={{ fontSize: '14px' }}>${s.precio.toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.descripcion}</p>
                  <p style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '8px' }}>⏱️ Duración: {s.duracion} minutos</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* ──────────────────────────────────────────────────────────
          MODAL: INGRESO RÁPIDO DE AUTO (3 TOQUES)
          ────────────────────────────────────────────────────────── */}
      {showIngresoAutoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="card-title" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Car size={20} style={{ color: 'var(--primary)' }} />
              <span>Ingreso Rápido de Vehículo</span>
            </h3>

            <form onSubmit={handleIngresoAutoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Patente / Dominio *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Ej: AE123ZZ"
                  style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  value={formIngreso.patente}
                  onChange={e => setFormIngreso({ ...formIngreso, patente: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Nombre Cliente (Opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Juan"
                    value={formIngreso.nombreCliente}
                    onChange={e => setFormIngreso({ ...formIngreso, nombreCliente: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Celular WhatsApp (Opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Para avisarle cuando esté listo"
                    value={formIngreso.telefonoCliente}
                    onChange={e => setFormIngreso({ ...formIngreso, telefonoCliente: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Tipo de Vehículo</label>
                  <select
                    className="form-select"
                    value={formIngreso.categoriaVehiculo}
                    onChange={e => setFormIngreso({ ...formIngreso, categoriaVehiculo: e.target.value })}
                  >
                    <option value="auto">Auto / Hatchback / Sedán</option>
                    <option value="suv">SUV / Monovolumen</option>
                    <option value="camioneta">Camioneta / Pick-up</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Asignar a Box</label>
                  <select
                    className="form-select"
                    value={formIngreso.box}
                    onChange={e => setFormIngreso({ ...formIngreso, box: e.target.value })}
                  >
                    <option value="Box 1">Box 1</option>
                    <option value="Box 2">Box 2</option>
                    <option value="Box 3">Box 3</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Servicio a Realizar</label>
                <select
                  className="form-select"
                  value={formIngreso.servicioId}
                  onChange={e => setFormIngreso({ ...formIngreso, servicioId: e.target.value })}
                >
                  {servicios.map(s => (
                    <option key={s._id} value={s._id}>{s.nombre} (${s.precio.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowIngresoAutoModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary btn-touch-xl">Ingresar y Comenzar Lavado</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          MODAL: GASTO RÁPIDO DE CAJA CHICA
          ────────────────────────────────────────────────────────── */}
      {showGastoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="card-title" style={{ marginBottom: '14px' }}>Anotar Salida de Dinero (Caja Chica)</h3>

            {/* Atajos de 1 toque */}
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Atajos frecuentes de 1 toque:</p>
            <div className="chips-grid" style={{ marginBottom: '16px' }}>
              <button type="button" className="chip-btn" onClick={() => handleRegistrarGasto('Almuerzo operarios', 4500, 'comida')}>
                🍔 Almuerzo ($4.500)
              </button>
              <button type="button" className="chip-btn" onClick={() => handleRegistrarGasto('Bolsa de franelas / microfibras', 3000, 'insumos')}>
                🧼 Franelas ($3.000)
              </button>
              <button type="button" className="chip-btn" onClick={() => handleRegistrarGasto('Bolsa de hielo y agua', 1500, 'comida')}>
                🧊 Hielo ($1.500)
              </button>
              <button type="button" className="chip-btn" onClick={() => handleRegistrarGasto('Repuesto acople manguera', 2500, 'repuestos')}>
                🔧 Repuesto manguera ($2.500)
              </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleRegistrarGasto(formGasto.concepto, Number(formGasto.monto), formGasto.categoria); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Concepto / Motivo</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Ej: Compra de café y azúcar"
                  value={formGasto.concepto}
                  onChange={e => setFormGasto({ ...formGasto, concepto: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Monto ($)</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  placeholder="Ej: 3500"
                  value={formGasto.monto}
                  onChange={e => setFormGasto({ ...formGasto, monto: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowGastoModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-danger">Guardar Gasto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          MODAL: ARQUEO Y CIERRE DIARIO
          ────────────────────────────────────────────────────────── */}
      {showCierreModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="card-title" style={{ marginBottom: '14px' }}>Arqueo de Caja y Cierre Diario</h3>

            <div style={{ backgroundColor: 'var(--bg-input)', padding: '16px', borderRadius: '10px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Efectivo Teórico Esperado en Cajón:</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)' }}>
                ${Math.max(0, ingresosEfectivoHoy - totalGastosHoy).toLocaleString()}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                (Facturado efectivo: ${ingresosEfectivoHoy.toLocaleString()} − Gastos caja: ${totalGastosHoy.toLocaleString()})
              </p>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleCerrarDia(); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">¿Cuánto efectivo físico contaste en el cajón? ($)</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  placeholder="Ingresá los billetes contados"
                  style={{ fontSize: '18px', fontWeight: 'bold' }}
                  value={cierreRealContado}
                  onChange={e => setCierreRealContado(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Observaciones (Opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Se dejaron $10.000 de cambio para mañana"
                  value={cierreObservaciones}
                  onChange={e => setCierreObservaciones(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCierreModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-success btn-touch-xl">
                  <Send size={18} />
                  <span>Cerrar Día y Generar Resumen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
