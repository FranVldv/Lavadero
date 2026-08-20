# Lavadero API 🚗

API REST robusta y moderna para el sistema de gestión interna y reservas públicas de un lavadero de autos.
Construido utilizando **NestJS**, **TypeScript**, **MongoDB (Mongoose)**, y seguridad mediante **JSON Web Tokens (JWT)**. Además, cuenta con simulación/envío real de notificaciones vía **WhatsApp Cloud API**.

---

## 🛠️ Stack Tecnológico

- **Core**: Node.js & NestJS (v10)
- **Base de Datos**: MongoDB & Mongoose (ODM)
- **Autenticación**: Passport JWT & BcryptJS
- **Validación de Datos**: Class-validator & Class-transformer
- **Notificaciones**: Axios & WhatsApp Cloud API

---

## 📁 Estructura del Proyecto

El backend está modularizado siguiendo las mejores prácticas de arquitectura limpia en NestJS:

```text
src/
├── main.ts                  # Bootstrap y configuración global (CORS, Prefijos, Pipes)
├── app.module.ts            # Módulo raíz que carga la configuración y las conexiones a BD
├── auth/                    # Autenticación, registro de admin inicial y JWT Guards
├── clientes/                # Gestión de clientes (CRUD)
├── vehiculos/               # Registro de vehículos asociados a clientes y búsquedas
├── servicios/               # Servicios del lavadero (tipo de lavado, duración, precio)
├── productos/               # Control de inventario e insumos de limpieza
├── turnos/                  # Reserva de turnos pública y control interno de agenda
├── ordenes/                 # Órdenes de trabajo, estado del lavado y consumo de stock
├── reportes/                # Agregaciones financieras y métricas para el Dashboard
└── notificaciones/          # Emisor de alertas y mensajes por WhatsApp
```

---

## 🚦 Endpoints de la API

La API cuenta con el prefijo global `/api/v1`. Los principales endpoints disponibles son:

### 🔑 Autenticación (`/auth`)
- `POST /auth/setup` - Configuración inicial (Crea el primer administrador en una base de datos vacía).
- `POST /auth/login` - Inicio de sesión. Retorna el token JWT.
- `PATCH /auth/password` *(Protegido)* - Cambiar contraseña del usuario logueado.

### 👤 Clientes (`/clientes`)
- `POST /clientes` - Registrar un nuevo cliente.
- `GET /clientes` - Obtener lista de clientes.
- `GET /clientes/:id` - Obtener detalle de un cliente.
- `PATCH /clientes/:id` - Actualizar información del cliente.
- `DELETE /clientes/:id` - Eliminar cliente.

### 🚘 Vehículos (`/vehiculos`)
- `POST /vehiculos` - Registrar un vehículo (vinculado a un cliente).
- `GET /vehiculos` - Obtener todos los vehículos.
- `GET /vehiculos/patente/:patente` - Buscar vehículo por patente.
- `GET /vehiculos/cliente/:clienteId` - Obtener vehículos de un cliente específico.
- `PATCH /vehiculos/:id` - Actualizar vehículo.
- `DELETE /vehiculos/:id` - Eliminar vehículo.

### 📅 Turnos (`/turnos`)
- `GET /turnos/semana?fecha=AAAA-MM-DD` *(Público)* - Consulta la disponibilidad horaria de la semana.
- `POST /turnos/reservar` *(Público)* - Reserva un turno de forma pública (envía notificación al dueño).
- `GET /turnos` *(Protegido)* - Listado de turnos agendados en un rango de fechas.
- `GET /turnos/:id` *(Protegido)* - Detalle del turno.
- `PATCH /turnos/:id` *(Protegido)* - Editar turno (Aprobar, Cancelar, Reagendar).

### 🛠️ Servicios (`/servicios`)
- `POST /servicios` *(Protegido)* - Crear un tipo de servicio (ej: Lavado Simple, Detailing).
- `GET /servicios` - Listar todos los servicios activos.
- `PATCH /servicios/:id` *(Protegido)* - Editar precio, duración o descripción.
- `DELETE /servicios/:id` *(Protegido)* - Dar de baja un servicio.

### 📦 Productos (`/productos`)
- `POST /productos` *(Protegido)* - Registrar un producto en stock (unidad de medida, cantidad, stock mínimo).
- `GET /productos` - Listar inventario.
- `PATCH /productos/:id` *(Protegido)* - Modificar stock o info de un producto.

### 📝 Órdenes de Trabajo (`/ordenes`)
- `POST /ordenes` *(Protegido)* - Crear una orden (asocia cliente, vehículo, servicio y productos usados).
- `GET /ordenes` *(Protegido)* - Ver todas las órdenes de trabajo.
- `PATCH /ordenes/:id` *(Protegido)* - Cambiar estado (`PENDIENTE`, `PROCESO`, `COMPLETADA`). *Al completarse, se descuenta el stock de productos utilizados automáticamente*.

### 📊 Reportes & Dashboard (`/reportes`)
- `GET /reportes/mensual?anio=YYYY&mes=MM` *(Protegido)* - Reporte de autos lavados, ingresos totales y productos consumidos en el mes.
- `GET /reportes/anual?anio=YYYY` *(Protegido)* - Reporte acumulado mes a mes.
- `GET /reportes/tendencia?meses=6` *(Protegido)* - Evolución histórica para gráficos de dashboard.

---

## ⚙️ Configuración Inicial

1. **Clonar el Repositorio y configurar Git**
   ```bash
   git init
   git remote add origin https://github.com/FranVldv/Lavadero.git
   ```

2. **Crear archivo `.env`**
   Copia el archivo de plantilla `.env` y define tus variables:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/lavadero
   JWT_SECRET=tu_secreto_largo_y_aleatorio
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   
   # WhatsApp Cloud API (Opcional, en desarrollo se simula por consola)
   WHATSAPP_PHONE_NUMBER_ID=
   WHATSAPP_ACCESS_TOKEN=
   OWNER_WHATSAPP_NUMBER=
   ```

3. **Instalar dependencias y levantar el servidor**
   ```bash
   npm install
   npm run start:dev
   ```

4. **Primer Inicio (Setup)**
   Realiza una petición `POST` a `/api/v1/auth/setup` con el siguiente cuerpo para crear el primer usuario administrador:
   ```json
   {
     "email": "admin@lavadero.com",
     "password": "contrasenia_segura",
     "nombre": "Administrador Principal"
   }
   ```
