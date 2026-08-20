import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  ClipboardList,
  TrendingUp,
  Package,
  Wrench,
  LogOut,
  Plus,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Shield,
  Check
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
  { _id: 'v3', patente: 'AD789BC', marca: 'Ford', modelo: 'Focus', cliente: { _id: 'c3', nombre: 'Carlos López', telefono: '5491177778888' } }
];

const MOCK_SERVICIOS = [
  { _id: 's1', nombre: 'Lavado Básico', descripcion: 'Lavado exterior y aspirado simple', precio: 5000, duracion: 45 },
  { _id: 's2', nombre: 'Lavado Completo', descripcion: 'Lavado exterior, aspirado profundo y siliconas', precio: 8000, duracion: 90 },
  { _id: 's3', nombre: 'Limpieza de Tapizados', descripcion: 'Lavado completo + remoción de manchas en asientos', precio: 15000, duracion: 180 }
];

const MOCK_PRODUCTOS = [
  { _id: 'p1', nombre: 'Shampoo Siliconado', stock: 12.5, stockMinimo: 5, unidad: 'L' },
  { _id: 'p2', nombre: 'Silicona Líquida', stock: 4.8, stockMinimo: 2, unidad: 'L' },
  { _id: 'p3', nombre: 'Perfume Cherry', stock: 15, stockMinimo: 3, unidad: 'unidades' }
];

const MOCK_TURNOS = [
  { _id: 't1', nombreCliente: 'Juan Pérez', telefonoCliente: '5491133334444', patente: 'AE123ZZ', fecha: '2026-08-21', franja: 'manana', estado: 'confirmado', notas: 'Vehículo: Toyota Corolla' },
  { _id: 't2', nombreCliente: 'María Rodríguez', telefonoCliente: '5491155556666', patente: 'AF456AA', fecha: '2026-08-21', franja: 'tarde', estado: 'confirmado', notas: 'Vehículo: Volkswagen Gol' }
];

const MOCK_ORDENES = [
  { _id: 'o1', cliente: { nombre: 'Juan Pérez' }, vehiculo: { patente: 'AE123ZZ', marca: 'Toyota', modelo: 'Corolla' }, servicio: { nombre: 'Lavado Básico', precio: 5000 }, estado: 'PROCESO', total: 5000, productosUsados: [{ producto: 'p1', cantidad: 0.5 }] },
  { _id: 'o2', cliente: { nombre: 'María Rodríguez' }, vehiculo: { patente: 'AF456AA', marca: 'Volkswagen', modelo: 'Gol' }, servicio: { nombre: 'Lavado Completo', precio: 8000 }, estado: 'PENDIENTE', total: 8000, productosUsados: [{ producto: 'p1', cantidad: 0.8 }, { producto: 'p2', cantidad: 0.2 }] }
];

const MOCK_TENDENCIA = [
  { anio: 2026, mes: 3, autos: 45, ingresos: 320000 },
  { anio: 2026, mes: 4, autos: 52, ingresos: 410000 },
  { anio: 2026, mes: 5, autos: 58, ingresos: 460000 },
  { anio: 2026, mes: 6, autos: 64, ingresos: 520000 },
  { anio: 2026, mes: 7, autos: 70, ingresos: 610000 },
  { anio: 2026, mes: 8, autos: 82, ingresos: 680000 }
];

const DEFAULT_DISPONIBILIDAD = [
  { fecha: '2026-08-24', diaNombre: 'lunes', franjas: [{ franja: 'manana', label: 'Mañana', horario: '08:00 - 12:00', disponible: true }, { franja: 'tarde', label: 'Tarde', horario: '16:00 - 20:00', disponible: true }] },
  { fecha: '2026-08-25', diaNombre: 'martes', franjas: [{ franja: 'manana', label: 'Mañana', horario: '08:00 - 12:00', disponible: true }, { franja: 'tarde', label: 'Tarde', horario: '16:00 - 20:00', disponible: false }] },
  { fecha: '2026-08-26', diaNombre: 'miércoles', franjas: [{ franja: 'manana', label: 'Mañana', horario: '08:00 - 12:00', disponible: false }, { franja: 'tarde', label: 'Tarde', horario: '16:00 - 20:00', disponible: true }] },
  { fecha: '2026-08-27', diaNombre: 'jueves', franjas: [{ franja: 'manana', label: 'Mañana', horario: '08:00 - 12:00', disponible: true }, { franja: 'tarde', label: 'Tarde', horario: '16:00 - 20:00', disponible: true }] },
  { fecha: '2026-08-28', diaNombre: 'viernes', franjas: [{ franja: 'manana', label: 'Mañana', horario: '08:00 - 12:00', disponible: true }, { franja: 'tarde', label: 'Tarde', horario: '16:00 - 20:00', disponible: true }] }
];

export default function App() {
  // Navigation & Session State
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState<{ nombre: string; role: string } | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );

  // Connection State
  const [apiOnline, setApiOnline] = useState(false);
  const [, setCheckingApi] = useState(true);

  // App Data State
  const [clientes, setClientes] = useState(MOCK_CLIENTES);
  const [vehiculos, setVehiculos] = useState(MOCK_VEHICULOS);
  const [servicios, setServicios] = useState(MOCK_SERVICIOS);
  const [productos, setProductos] = useState(MOCK_PRODUCTOS);
  const [turnos, setTurnos] = useState(MOCK_TURNOS);
  const [ordenes, setOrdenes] = useState(MOCK_ORDENES);
  const [tendencia, setTendencia] = useState(MOCK_TENDENCIA);

  // Public Booking Calendar State
  const [refFecha, setRefFecha] = useState(() => {
    const today = new Date();
    // If weekend, advance to next Monday
    const day = today.getDay();
    if (day === 0) today.setDate(today.getDate() + 1);
    else if (day === 6) today.setDate(today.getDate() + 2);
    return today.toISOString().split('T')[0];
  });
  const [disponibilidad, setDisponibilidad] = useState(DEFAULT_DISPONIBILIDAD);
  const [selectedSlot, setSelectedSlot] = useState<{ fecha: string; franja: string; label: string } | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Auth Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Modals & Form states
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showVehiculoModal, setShowVehiculoModal] = useState(false);
  const [showOrdenModal, setShowOrdenModal] = useState(false);

  // Form Inputs
  const [formCliente, setFormCliente] = useState({ nombre: '', telefono: '' });
  const [formVehiculo, setFormVehiculo] = useState({ patente: '', marca: '', modelo: '', clienteId: '' });
  const [formPublicBooking, setFormPublicBooking] = useState({
    nombreCliente: '',
    telefonoCliente: '',
    patente: '',
    marcaModelo: '',
    servicioId: '',
    notas: ''
  });
  const [formOrden, setFormOrden] = useState({ clienteId: '', vehiculoId: '', servicioId: '', productosUsados: [] as any[] });

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
    } finally {
      setCheckingApi(false);
    }
  };

  useEffect(() => {
    checkApiStatus();
  }, [refFecha]);

  // Fetch initial data once API status is known
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
      if (res.ok) {
        setDisponibilidad(await res.json());
      }
    } catch (err) {
      console.error("Error cargando disponibilidad", err);
    }
  };

  const fetchDataFromApi = async () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [resCli, resVeh, resSer, resProd, resTur, resOrd, resTrend] = await Promise.all([
        fetch(`${API_URL}/clientes`),
        fetch(`${API_URL}/vehiculos`),
        fetch(`${API_URL}/servicios`),
        fetch(`${API_URL}/productos`, { headers }),
        fetch(`${API_URL}/turnos`, { headers }),
        fetch(`${API_URL}/ordenes`, { headers }),
        fetch(`${API_URL}/reportes/tendencia`, { headers })
      ]);

      if (resCli.ok) setClientes(await resCli.json());
      if (resVeh.ok) setVehiculos(await resVeh.json());
      if (resSer.ok) setServicios(await resSer.json());
      if (resProd.ok) setProductos(await resProd.json());
      if (resTur.ok) setTurnos(await resTur.json());
      if (resOrd.ok) setOrdenes(await resOrd.json());
      if (resTrend.ok) setTendencia(await resTrend.json());
    } catch (err) {
      console.error("Error cargando datos de API real", err);
    }
  };

  // Actions - Login & Register Setup Admin
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!apiOnline) {
      if (email === 'admin@lavadero.com' && password === 'admin123') {
        const dummyUser = { nombre: 'Administrador Simulado', role: 'admin' };
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
      const body = isSetupMode 
        ? { email, password, nombre: 'Administrador Principal' }
        : { email, password };

      const res = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

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
    setClientes(MOCK_CLIENTES);
    setVehiculos(MOCK_VEHICULOS);
    setServicios(MOCK_SERVICIOS);
    setProductos(MOCK_PRODUCTOS);
    setTurnos(MOCK_TURNOS);
    setOrdenes(MOCK_ORDENES);
    setTendencia(MOCK_TENDENCIA);
    setViewMode('public');
  };

  // Submit Public Booking
  const handlePublicBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    const payload = {
      fecha: selectedSlot.fecha,
      franja: selectedSlot.franja,
      nombreCliente: formPublicBooking.nombreCliente,
      telefonoCliente: formPublicBooking.telefonoCliente,
      patente: formPublicBooking.patente,
      servicio: formPublicBooking.servicioId || undefined,
      notas: `Auto: ${formPublicBooking.marcaModelo}.${formPublicBooking.notas ? ' Notas: ' + formPublicBooking.notas : ''}`
    };

    if (!apiOnline) {
      // Simulate booking
      const newTur = {
        _id: 't_' + Date.now(),
        nombreCliente: payload.nombreCliente,
        telefonoCliente: payload.telefonoCliente,
        patente: payload.patente,
        fecha: payload.fecha,
        franja: payload.franja,
        estado: 'confirmado',
        notas: payload.notas
      };
      setTurnos([...turnos, newTur]);
      
      // Update local availability status
      setDisponibilidad(disponibilidad.map(d => {
        if (d.fecha === selectedSlot.fecha) {
          return {
            ...d,
            franjas: d.franjas.map(f => f.franja === selectedSlot.franja ? { ...f, disponible: false } : f)
          };
        }
        return d;
      }));

      setBookingSuccess(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/turnos/reservar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setBookingSuccess(true);
        fetchDisponibilidad();
      } else {
        const errData = await res.json();
        alert(`Error al reservar: ${errData.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al intentar conectar con el servidor.');
    }
  };

  // Create Client (Admin)
  const handleCreateCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiOnline) {
      const newCli = { _id: 'c_' + Date.now(), ...formCliente };
      setClientes([...clientes, newCli]);
      setShowClienteModal(false);
      setFormCliente({ nombre: '', telefono: '' });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formCliente)
      });
      if (res.ok) {
        setShowClienteModal(false);
        setFormCliente({ nombre: '', telefono: '' });
        fetchDataFromApi();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Vehicle (Admin)
  const handleCreateVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiOnline) {
      const matchedClient = clientes.find(c => c._id === formVehiculo.clienteId) || { _id: 'temp', nombre: 'Desconocido', telefono: '' };
      const newVeh = {
        _id: 'v_' + Date.now(),
        patente: formVehiculo.patente.toUpperCase(),
        marca: formVehiculo.marca,
        modelo: formVehiculo.modelo,
        cliente: matchedClient
      };
      setVehiculos([...vehiculos, newVeh]);
      setShowVehiculoModal(false);
      setFormVehiculo({ patente: '', marca: '', modelo: '', clienteId: '' });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/vehiculos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patente: formVehiculo.patente,
          marca: formVehiculo.marca,
          modelo: formVehiculo.modelo,
          cliente: formVehiculo.clienteId
        })
      });
      if (res.ok) {
        setShowVehiculoModal(false);
        setFormVehiculo({ patente: '', marca: '', modelo: '', clienteId: '' });
        fetchDataFromApi();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Work Order (Admin)
  const handleCreateOrden = async (e: React.FormEvent) => {
    e.preventDefault();
    const selCliente = clientes.find(c => c._id === formOrden.clienteId);
    const selVeh = vehiculos.find(v => v._id === formOrden.vehiculoId);
    const selServ = servicios.find(s => s._id === formOrden.servicioId);

    if (!selCliente || !selVeh || !selServ) return;

    if (!apiOnline) {
      const newOrd = {
        _id: 'o_' + Date.now(),
        cliente: { nombre: selCliente.nombre },
        vehiculo: { patente: selVeh.patente, marca: selVeh.marca, modelo: selVeh.modelo },
        servicio: { nombre: selServ.nombre, precio: selServ.precio },
        estado: 'PENDIENTE',
        total: selServ.precio,
        productosUsados: []
      };
      setOrdenes([...ordenes, newOrd]);
      setShowOrdenModal(false);
      setFormOrden({ clienteId: '', vehiculoId: '', servicioId: '', productosUsados: [] });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/ordenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cliente: formOrden.clienteId,
          vehiculo: formOrden.vehiculoId,
          servicio: formOrden.servicioId,
          productosUsados: formOrden.productosUsados
        })
      });
      if (res.ok) {
        setShowOrdenModal(false);
        setFormOrden({ clienteId: '', vehiculoId: '', servicioId: '', productosUsados: [] });
        fetchDataFromApi();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update order status (Admin)
  const handleUpdateOrdenEstado = async (id: string, nuevoEstado: string) => {
    if (!apiOnline) {
      setOrdenes(ordenes.map(o => o._id === id ? { ...o, estado: nuevoEstado } : o));
      return;
    }

    try {
      const endpoint = nuevoEstado === 'COMPLETADA' ? `${id}/completar` : `${id}`;
      const res = await fetch(`${API_URL}/ordenes/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: nuevoEstado !== 'COMPLETADA' ? JSON.stringify({ estado: nuevoEstado }) : undefined
      });
      if (res.ok) {
        fetchDataFromApi();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Stock (Admin)
  const handleUpdateStock = async (id: string, nuevaCantidad: number) => {
    if (!apiOnline) {
      setProductos(productos.map(p => p._id === id ? { ...p, stock: nuevaCantidad } : p));
      return;
    }

    try {
      const res = await fetch(`${API_URL}/productos/${id}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: nuevaCantidad })
      });
      if (res.ok) {
        fetchDataFromApi();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // WEEK NAVIGATOR HELPERS
  const adjustWeek = (daysOffset: number) => {
    const current = new Date(refFecha);
    current.setDate(current.getDate() + daysOffset);
    setRefFecha(current.toISOString().split('T')[0]);
  };

  // Render Public Booking Screen
  if (viewMode === 'public') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
        
        {/* Public Header */}
        <header className="header-top" style={{ borderBottom: '1px solid var(--border-color)', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🚗</span>
            <span className="logo-text" style={{ fontSize: '22px' }}>Lavadero Express</span>
          </div>

          <button className="btn btn-secondary" onClick={() => setViewMode('admin')} style={{ gap: '8px' }}>
            <Shield size={16} />
            <span>Acceso Interno</span>
          </button>
        </header>

        {/* Content */}
        <div className="content-container" style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '40px 20px' }}>
          
          {bookingSuccess ? (
            <div className="card" style={{ textAlign: 'center', padding: '50px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--success-glow)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                <Check size={40} />
              </div>
              <h1 className="page-title" style={{ margin: '0', fontSize: '32px' }}>¡Turno Confirmado!</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '500px' }}>
                Hemos guardado tu reserva correctamente. Te enviaremos un mensaje de confirmación por **WhatsApp** al número ingresado.
              </p>
              
              <div style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', width: '100%', maxWidth: '400px', textAlign: 'left', marginTop: '10px' }}>
                <p><strong>Fecha:</strong> {selectedSlot?.fecha}</p>
                <p><strong>Bloque:</strong> {selectedSlot?.label} ({selectedSlot?.franja === 'manana' ? '08:00 - 12:00' : '16:00 - 20:00'})</p>
                <p><strong>Nombre:</strong> {formPublicBooking.nombreCliente}</p>
                <p><strong>Patente:</strong> {formPublicBooking.patente.toUpperCase()}</p>
                <p><strong>Celular:</strong> {formPublicBooking.telefonoCliente}</p>
              </div>

              <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => {
                setBookingSuccess(false);
                setSelectedSlot(null);
                setFormPublicBooking({ nombreCliente: '', telefonoCliente: '', patente: '', marcaModelo: '', servicioId: '', notas: '' });
              }}>
                Reservar otro Turno
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h1 className="page-title" style={{ fontSize: '36px', marginBottom: '10px' }}>Agenda tu Servicio de Lavado</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                  Selecciona la fecha y franja horaria que más te convenga. Es fácil, rápido y sin registrarte.
                </p>
              </div>

              {/* Weekly Calendar Selector */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <button className="btn btn-secondary" onClick={() => adjustWeek(-7)}>Semana Anterior</button>
                  <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--primary)' }}>
                    Semana del {disponibilidad[0]?.fecha} al {disponibilidad[disponibilidad.length - 1]?.fecha}
                  </span>
                  <button className="btn btn-secondary" onClick={() => adjustWeek(7)}>Siguiente Semana</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                  {disponibilidad.map((dia, dIdx) => (
                    <div key={dIdx} style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center' }}>
                      <p style={{ textTransform: 'capitalize', fontWeight: 'bold', color: 'var(--text-main)' }}>{dia.diaNombre}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dia.fecha}</p>
                      
                      <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        {dia.franjas.map((slot, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            className={`btn ${slot.disponible ? 'btn-success' : 'btn-secondary'}`}
                            style={{
                              width: '100%',
                              padding: '10px 4px',
                              fontSize: '12px',
                              opacity: slot.disponible ? 1 : 0.4,
                              cursor: slot.disponible ? 'pointer' : 'not-allowed',
                              flexDirection: 'column',
                              gap: '2px'
                            }}
                            disabled={!slot.disponible}
                            onClick={() => setSelectedSlot({ fecha: dia.fecha, franja: slot.franja, label: slot.label })}
                          >
                            <strong>{slot.label}</strong>
                            <span style={{ fontSize: '10px' }}>{slot.horario}</span>
                            <span style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.8 }}>
                              {slot.disponible ? 'Disponible' : 'Ocupado'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Slot Form */}
              {selectedSlot && (
                <div className="card" style={{ border: '1px solid var(--primary)' }}>
                  <h3 className="card-title" style={{ marginBottom: '16px', color: 'var(--primary)' }}>
                    Confirmar datos para: {selectedSlot.fecha} ({selectedSlot.label})
                  </h3>

                  <form onSubmit={handlePublicBookingSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="alert-box success" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', backgroundColor: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.3)', color: 'var(--success)', marginBottom: '10px' }}>
                      <Shield size={18} />
                      <span><strong>Tus datos están protegidos:</strong> Conexión encriptada mediante SSL. Resguardamos tu patente y celular para uso exclusivo de notificaciones de tu turno.</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tu Nombre Completo</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        value={formPublicBooking.nombreCliente} 
                        onChange={e => setFormPublicBooking({ ...formPublicBooking, nombreCliente: e.target.value })} 
                        placeholder="Ej: Franco Valdivia" 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Celular / WhatsApp (Para notificaciones)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        value={formPublicBooking.telefonoCliente} 
                        onChange={e => setFormPublicBooking({ ...formPublicBooking, telefonoCliente: e.target.value })} 
                        placeholder="Ej: 5491132145678" 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Patente / Dominio del auto</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        value={formPublicBooking.patente} 
                        onChange={e => setFormPublicBooking({ ...formPublicBooking, patente: e.target.value })} 
                        placeholder="Ej: AE123ZZ" 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Auto (Marca y Modelo)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        value={formPublicBooking.marcaModelo} 
                        onChange={e => setFormPublicBooking({ ...formPublicBooking, marcaModelo: e.target.value })} 
                        placeholder="Ej: Toyota Corolla" 
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Servicio Requerido (Opcional)</label>
                      <select 
                        className="form-select" 
                        value={formPublicBooking.servicioId} 
                        onChange={e => setFormPublicBooking({ ...formPublicBooking, servicioId: e.target.value })}
                      >
                        <option value="">Selecciona un tipo de lavado...</option>
                        {servicios.map(s => (
                          <option key={s._id} value={s._id}>{s.nombre} (${s.precio})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Notas Adicionales (Opcional)</label>
                      <textarea 
                        className="form-input" 
                        rows={2}
                        value={formPublicBooking.notas} 
                        onChange={e => setFormPublicBooking({ ...formPublicBooking, notas: e.target.value })} 
                        placeholder="Ej: Lavado de motor, remoción de manchas específicas, etc."
                      />
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setSelectedSlot(null)}>Cancelar</button>
                      <button type="submit" className="btn btn-primary">Agendar Turno</button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    );
  }

  // Render Admin Screen
  if (!token || !user) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div style={{ fontSize: '32px' }}>🚗</div>
            <h1 className="auth-title">Lavadero Interno</h1>
            <p className="auth-subtitle">Ingreso para Personal Administrativo</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-input"
                placeholder="admin@lavadero.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {authError && <div className="alert-box danger">{authError}</div>}
            {authSuccess && <div className="alert-box success">{authSuccess}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              {isSetupMode ? 'Registrar y Configurar' : 'Iniciar Sesión'}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
            <button className="btn-logout" style={{ fontSize: '13px', textDecoration: 'underline' }} onClick={() => setViewMode('public')}>
              ← Volver al Turnero
            </button>
            <button 
              className="btn-logout" 
              style={{ fontSize: '13px', textDecoration: 'underline' }}
              onClick={() => {
                setIsSetupMode(!isSetupMode);
                setAuthError('');
                setAuthSuccess('');
              }}
            >
              {isSetupMode ? 'Ingresar' : 'Configurar Admin'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard calculations
  const totalClientes = clientes.length;
  const turnosHoyCount = turnos.filter(t => t.fecha === new Date().toISOString().split('T')[0]).length;
  const ordenesCompletadas = ordenes.filter(o => o.estado === 'COMPLETADA').length;
  const ingresosMensuales = ordenes
    .filter(o => o.estado === 'COMPLETADA')
    .reduce((acc, current) => acc + (current.total || 0), 0);

  const maxIngresoTrend = Math.max(...tendencia.map(t => t.ingresos), 1);

  return (
    <div style={{ display: 'flex', width: '100vw', minHeight: '100vh' }}>
      
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <span style={{ fontSize: '24px' }}>🚗</span>
          <span className="logo-text">ADMIN</span>
        </div>

        <ul className="nav-links">
          <li>
            <button className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentTab('dashboard')}>
              <TrendingUp size={18} />
              <span>Dashboard</span>
            </button>
          </li>
          <li>
            <button className={`nav-item ${currentTab === 'clientes' ? 'active' : ''}`} onClick={() => setCurrentTab('clientes')}>
              <Users size={18} />
              <span>Clientes & Autos</span>
            </button>
          </li>
          <li>
            <button className={`nav-item ${currentTab === 'turnos' ? 'active' : ''}`} onClick={() => setCurrentTab('turnos')}>
              <Calendar size={18} />
              <span>Turnos Reservados</span>
            </button>
          </li>
          <li>
            <button className={`nav-item ${currentTab === 'ordenes' ? 'active' : ''}`} onClick={() => setCurrentTab('ordenes')}>
              <ClipboardList size={18} />
              <span>Órdenes de Trabajo</span>
            </button>
          </li>
          <li>
            <button className={`nav-item ${currentTab === 'inventario' ? 'active' : ''}`} onClick={() => setCurrentTab('inventario')}>
              <Package size={18} />
              <span>Insumos / Stock</span>
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
            <span className="user-role">{user.role}</span>
          </div>
          <button className="btn-logout" title="Cerrar sesión" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-wrapper">
        <header className="header-top">
          <h2 className="page-title" style={{ textTransform: 'capitalize' }}>{currentTab}</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={checkApiStatus} title="Refrescar">
              <RefreshCw size={14} />
            </button>
            <div className={`api-status-badge ${apiOnline ? 'connected' : 'simulated'}`}>
              <div className="status-dot" style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: apiOnline ? 'var(--success)' : 'var(--warning)'
              }} />
              <span>{apiOnline ? 'API Conectada' : 'Modo Simulador'}</span>
            </div>
          </div>
        </header>

        <div className="content-container">
          
          {/* TAB: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <div>
              <div className="dashboard-grid">
                <div className="stat-card">
                  <div className="stat-icon-container primary">
                    <Users size={24} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{totalClientes}</span>
                    <span className="stat-label">Clientes Registrados</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-container warning">
                    <Calendar size={24} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{turnosHoyCount}</span>
                    <span className="stat-label">Turnos para Hoy</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-container success">
                    <ClipboardList size={24} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{ordenesCompletadas}</span>
                    <span className="stat-label">Lavados Completados</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-container success" style={{ color: 'var(--success)', backgroundColor: 'var(--success-glow)' }}>
                    <DollarSign size={24} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">${ingresosMensuales.toLocaleString()}</span>
                    <span className="stat-label">Ingresos Registrados</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-charts-grid">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Tendencia de Ingresos Mensuales</h3>
                    <span className="badge badge-info">Últimos 6 meses</span>
                  </div>
                  
                  <div className="chart-simulated-bar-container">
                    {tendencia.map((item, index) => {
                      const heightPercent = (item.ingresos / maxIngresoTrend) * 100;
                      const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                      return (
                        <div key={index} className="chart-simulated-bar-wrapper">
                          <div style={{ color: 'var(--text-main)', fontSize: '11px', fontWeight: 'bold' }}>
                            ${Math.round(item.ingresos / 1000)}k
                          </div>
                          <div 
                            className="chart-simulated-bar" 
                            style={{ height: `${heightPercent || 10}%` }}
                            title={`Ingresos: $${item.ingresos} | Autos: ${item.autos}`}
                          />
                          <span className="chart-bar-label">{mesesNombres[item.mes - 1]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Insumos Críticos</h3>
                    <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                    {productos.map(p => {
                      const esCritico = p.stock <= p.stockMinimo;
                      return (
                        <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: esCritico ? 'rgba(251, 191, 36, 0.08)' : 'rgba(255,255,255,0.02)', borderRadius: '8px', border: esCritico ? '1px solid rgba(251,191,36,0.3)' : '1px solid var(--border-color)' }}>
                          <div>
                            <p style={{ fontWeight: '600', fontSize: '13px' }}>{p.nombre}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mínimo: {p.stockMinimo} {p.unidad}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className={`badge ${esCritico ? 'badge-danger' : 'badge-success'}`}>
                              {p.stock} {p.unidad}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLIENTES & VEHÍCULOS */}
          {currentTab === 'clientes' && (
            <div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <button className="btn btn-primary" onClick={() => setShowClienteModal(true)}>
                  <Plus size={16} />
                  <span>Nuevo Cliente</span>
                </button>
                <button className="btn btn-secondary" onClick={() => setShowVehiculoModal(true)}>
                  <Plus size={16} />
                  <span>Vincular Vehículo</span>
                </button>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Listado de Clientes y Flotas</h3>
                </div>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Teléfono / Celular</th>
                        <th>Vehículos Asociados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.map(c => {
                        const asociados = vehiculos.filter(v => typeof v.cliente === 'object' ? v.cliente._id === c._id : v.cliente === c._id);
                        return (
                          <tr key={c._id}>
                            <td style={{ fontWeight: '600' }}>{c.nombre}</td>
                            <td>{c.telefono}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {asociados.length === 0 ? (
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sin vehículos</span>
                                ) : (
                                  asociados.map(v => (
                                    <span key={v._id} className="badge badge-info" style={{ textTransform: 'uppercase' }}>
                                      {v.patente} ({v.marca} {v.modelo})
                                    </span>
                                  ))
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TURNOS */}
          {currentTab === 'turnos' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Agenda de Turnos Reservados</h3>
                </div>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Celular</th>
                        <th>Patente</th>
                        <th>Fecha</th>
                        <th>Bloque</th>
                        <th>Detalles / Notas</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {turnos.map(t => (
                        <tr key={t._id}>
                          <td style={{ fontWeight: '600' }}>{t.nombreCliente}</td>
                          <td>{t.telefonoCliente}</td>
                          <td style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 'bold' }}>{t.patente}</td>
                          <td>{t.fecha.split('T')[0]}</td>
                          <td style={{ textTransform: 'capitalize' }}>{t.franja}</td>
                          <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t.notas || '-'}</td>
                          <td>
                            <span className="badge badge-success">{t.estado}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ÓRDENES DE TRABAJO */}
          {currentTab === 'ordenes' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <button className="btn btn-primary" onClick={() => setShowOrdenModal(true)}>
                  <Plus size={16} />
                  <span>Crear Orden de Lavado</span>
                </button>
              </div>

              <div className="kanban-board">
                
                {/* Column: PENDIENTE */}
                <div className="kanban-column">
                  <div className="kanban-column-title">
                    <span>Pendientes</span>
                    <span className="badge badge-warning">
                      {ordenes.filter(o => o.estado === 'PENDIENTE').length}
                    </span>
                  </div>
                  
                  {ordenes.filter(o => o.estado === 'PENDIENTE').map(o => (
                    <div key={o._id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-warning" style={{ fontSize: '10px' }}>Pendiente</span>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>${o.total}</span>
                      </div>
                      <p style={{ fontWeight: '600', fontSize: '15px' }}>{o.cliente.nombre}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        🚘 {o.vehiculo.patente} ({o.vehiculo.marca} {o.vehiculo.modelo})
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '500' }}>
                        🧼 {o.servicio.nombre}
                      </p>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '12px', marginTop: '8px' }}
                        onClick={() => handleUpdateOrdenEstado(o._id, 'PROCESO')}
                      >
                        Iniciar Lavado
                      </button>
                    </div>
                  ))}
                </div>

                {/* Column: EN PROCESO */}
                <div className="kanban-column">
                  <div className="kanban-column-title">
                    <span>En Proceso</span>
                    <span className="badge badge-info">
                      {ordenes.filter(o => o.estado === 'PROCESO').length}
                    </span>
                  </div>

                  {ordenes.filter(o => o.estado === 'PROCESO').map(o => (
                    <div key={o._id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '3px solid var(--primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-info" style={{ fontSize: '10px' }}>Lavando...</span>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>${o.total}</span>
                      </div>
                      <p style={{ fontWeight: '600', fontSize: '15px' }}>{o.cliente.nombre}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        🚘 {o.vehiculo.patente} ({o.vehiculo.marca} {o.vehiculo.modelo})
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '500' }}>
                        🧼 {o.servicio.nombre}
                      </p>
                      <button 
                        className="btn btn-success" 
                        style={{ padding: '6px 12px', fontSize: '12px', marginTop: '8px' }}
                        onClick={() => handleUpdateOrdenEstado(o._id, 'COMPLETADA')}
                      >
                        Finalizar & Cobrar
                      </button>
                    </div>
                  ))}
                </div>

                {/* Column: COMPLETADA */}
                <div className="kanban-column">
                  <div className="kanban-column-title">
                    <span>Completadas</span>
                    <span className="badge badge-success">
                      {ordenes.filter(o => o.estado === 'COMPLETADA').length}
                    </span>
                  </div>

                  {ordenes.filter(o => o.estado === 'COMPLETADA').map(o => (
                    <div key={o._id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.85 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-success" style={{ fontSize: '10px' }}>Entregado</span>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>${o.total}</span>
                      </div>
                      <p style={{ fontWeight: '600', fontSize: '15px' }}>{o.cliente.nombre}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        🚘 {o.vehiculo.patente}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        ✔️ {o.servicio.nombre}
                      </p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

          {/* TAB: INVENTARIO */}
          {currentTab === 'inventario' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Insumos y Stock de Lavado</h3>
                </div>
                
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Unidad</th>
                        <th>Mínimo Crítico</th>
                        <th>Stock Actual</th>
                        <th>Acción Rápida</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map(p => {
                        const esCritico = p.stock <= p.stockMinimo;
                        return (
                          <tr key={p._id}>
                            <td style={{ fontWeight: '600' }}>{p.nombre}</td>
                            <td>{p.unidad}</td>
                            <td>{p.stockMinimo} {p.unidad}</td>
                            <td>
                              <span className={`badge ${esCritico ? 'badge-danger' : 'badge-success'}`}>
                                {p.stock} {p.unidad}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleUpdateStock(p._id, p.stock + 1)}>
                                  +1
                                </button>
                                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleUpdateStock(p._id, Math.max(0, p.stock - 1))}>
                                  -1
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SERVICIOS */}
          {currentTab === 'servicios' && (
            <div>
              <div className="cards-grid">
                {servicios.map(s => (
                  <div key={s._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{s.nombre}</h3>
                      <span className="badge badge-info" style={{ fontSize: '14px' }}>${s.precio}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', flexGrow: 1 }}>
                      {s.descripcion}
                    </p>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>Tiempo estimado:</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{s.duracion} minutos</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL: NUEVO CLIENTE (ADMIN) */}
      {showClienteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Agregar Nuevo Cliente</h3>
            <form onSubmit={handleCreateCliente} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input type="text" className="form-input" required value={formCliente.nombre} onChange={e => setFormCliente({ ...formCliente, nombre: e.target.value })} placeholder="Ej: Franco Valdivia" />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono (con Whatsapp)</label>
                <input type="text" className="form-input" required value={formCliente.telefono} onChange={e => setFormCliente({ ...formCliente, telefono: e.target.value })} placeholder="Ej: 5491132145678" />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowClienteModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VINCULAR VEHÍCULO (ADMIN) */}
      {showVehiculoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Vincular Vehículo</h3>
            <form onSubmit={handleCreateVehiculo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Propietario (Cliente)</label>
                <select className="form-select" required value={formVehiculo.clienteId} onChange={e => setFormVehiculo({ ...formVehiculo, clienteId: e.target.value })}>
                  <option value="">Selecciona un cliente...</option>
                  {clientes.map(c => (
                    <option key={c._id} value={c._id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Patente / Dominio</label>
                <input type="text" className="form-input" required value={formVehiculo.patente} onChange={e => setFormVehiculo({ ...formVehiculo, patente: e.target.value })} placeholder="Ej: AE123ZZ" />
              </div>
              <div className="form-group">
                <label className="form-label">Marca</label>
                <input type="text" className="form-input" required value={formVehiculo.marca} onChange={e => setFormVehiculo({ ...formVehiculo, marca: e.target.value })} placeholder="Ej: Toyota" />
              </div>
              <div className="form-group">
                <label className="form-label">Modelo</label>
                <input type="text" className="form-input" required value={formVehiculo.modelo} onChange={e => setFormVehiculo({ ...formVehiculo, modelo: e.target.value })} placeholder="Ej: Hilux" />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowVehiculoModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Registrar Vehículo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREAR ORDEN (ADMIN) */}
      {showOrdenModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Crear Orden de Lavado</h3>
            <form onSubmit={handleCreateOrden} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Cliente</label>
                <select className="form-select" required value={formOrden.clienteId} onChange={e => setFormOrden({ ...formOrden, clienteId: e.target.value, vehiculoId: '' })}>
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map(c => (
                    <option key={c._id} value={c._id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Vehículo</label>
                <select className="form-select" required value={formOrden.vehiculoId} onChange={e => setFormOrden({ ...formOrden, vehiculoId: e.target.value })}>
                  <option value="">Seleccionar vehículo...</option>
                  {vehiculos
                    .filter(v => typeof v.cliente === 'object' ? v.cliente._id === formOrden.clienteId : v.cliente === formOrden.clienteId)
                    .map(v => (
                      <option key={v._id} value={v._id}>{v.patente} ({v.marca} {v.modelo})</option>
                    ))
                  }
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Servicio a Realizar</label>
                <select className="form-select" required value={formOrden.servicioId} onChange={e => setFormOrden({ ...formOrden, servicioId: e.target.value })}>
                  <option value="">Seleccionar servicio...</option>
                  {servicios.map(s => (
                    <option key={s._id} value={s._id}>{s.nombre} (${s.precio})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowOrdenModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Registrar Lavado</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
