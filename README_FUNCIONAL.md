# Sistema de Gestión de Reservas y Calendario

## 📋 Descripción General

Sistema completo de reservas y gestión de calendario que permite a usuarios crear eventos/servicios reservables y gestionar su disponibilidad. La plataforma conecta expertos/consultores con clientes a través de un sistema de reservas automatizado con integraciones externas.

## 🏗️ Arquitectura del Sistema

El sistema está compuesto por cuatro servicios principales que trabajan de manera integrada:

1. **[Servicio de Autenticación](#-servicio-de-autenticación)** - Registro y login de usuarios
2. **[Servicio de Disponibilidad](#-servicio-de-disponibilidad)** - Gestión de horarios disponibles  
3. **[Servicio de Eventos](#-servicio-de-gestión-de-eventos)** - Creación y gestión de servicios reservables
4. **[Servicio de Integraciones](#-servicio-de-integraciones)** - Conexiones con servicios externos (Google, Zoom, etc.)

## 🔄 Flujo de Usuario Completo

```
REGISTRO → CONFIGURAR DISPONIBILIDAD → CREAR EVENTOS → CONECTAR INTEGRACIONES → RECIBIR RESERVAS
```

---

## 🔐 Servicio de Autenticación

### Descripción
Maneja el registro y autenticación de usuarios con configuración automática de disponibilidad predeterminada.

### Funcionalidades Principales

#### Registro de Usuarios (`registerService`)
- **Auto-configuración inteligente**: Crea disponibilidad L-V 9AM-5PM automáticamente
- **Username único**: Genera automáticamente desde el nombre (ej: "juanperez123abc")
- **Seguridad**: Contraseñas hasheadas, validación de emails duplicados

#### Autenticación (`loginService`)
- **JWT tokens**: Generación de tokens seguros con expiración
- **Validación robusta**: Verificación de credenciales con errores genéricos
- **Sesiones seguras**: Retorna usuario sin contraseña + token de acceso

### Flujo Funcional
1. **Registro**: Usuario proporciona datos → Sistema genera username único → Crea disponibilidad predeterminada
2. **Login**: Usuario ingresa credenciales → Validación → Generación token JWT → Sesión activa

### Características Destacadas
- **UX sin fricción**: Usuario obtiene configuración útil inmediatamente
- **Seguridad empresarial**: Manejo profesional de tokens y contraseñas
- **Escalabilidad**: Username generation con 17.5M combinaciones posibles

---

## ⏰ Servicio de Disponibilidad

### Descripción
Gestiona horarios de disponibilidad de usuarios y genera slots de tiempo disponibles para eventos públicos, considerando reuniones existentes.

### Funcionalidades Principales

#### Gestión Personal
- **Consulta disponibilidad** (`getUserAvailabilityService`): Obtiene configuración actual del usuario
- **Actualización horarios** (`updateAvailabilityService`): Modifica días y horarios disponibles

#### Disponibilidad Pública
- **Slots para eventos** (`getAvailabilityForPublicEventService`): Genera horarios reservables considerando:
  - Horarios de disponibilidad configurados
  - Reuniones ya programadas
  - Duración del evento
  - Intervalos entre citas (timeGap)

### Algoritmos Inteligentes

#### Generación de Slots
1. Para cada día de la semana calcula la próxima fecha
2. Divide horario disponible en intervalos según duración del evento
3. Excluye slots con conflictos de reuniones existentes
4. Filtra horarios en el pasado (no permite reservar atrás en el tiempo)

#### Prevención de Conflictos
- **Validación de solapamiento**: Detecta automáticamente conflictos con reuniones
- **Tiempo real**: No muestra slots ya pasados si es el día actual
- **Flexibilidad**: Configurable por usuario (horarios, días, intervalos)

### Casos de Uso
- **Consultor configura**: Lunes a Viernes 9:00-17:00 con gaps de 30 min
- **Cliente reserva**: Ve solo slots libres excluyendo reuniones programadas
- **Sistema previene conflictos**: Automáticamente evita solapamientos

---

## 📅 Servicio de Gestión de Eventos

### Descripción
Maneja el ciclo completo de eventos/servicios reservables con sistema de URLs públicas y control de privacidad.

### Funcionalidades Principales

#### Gestión de Eventos
- **Creación** (`createEventService`): Crea eventos con slug automático y validación
- **Privacidad** (`toggleEventPrivacyService`): Cambia visibilidad público/privado
- **Consulta personal** (`getUserEventsService`): Lista eventos con métricas de uso
- **Eliminación** (`deleteEventService`): Borra eventos de manera segura

#### Acceso Público
- **Descubrimiento** (`getPublicEventsByUsernameService`): Lista eventos públicos de un usuario
- **Detalle** (`getPublicEventByUsernameAndSlugService`): Evento específico para reservar

### Arquitectura de URLs Públicas

#### Sistema SEO-Friendly
```
PATRÓN: /[username]/[event-slug]
EJEMPLO: /juanperez123abc/consultoria-marketing

BENEFICIOS:
✅ URLs memorables y legibles
✅ Optimización para motores de búsqueda  
✅ Identificación única global de eventos
✅ Estructura escalable
```

### Seguridad y Control
- **Validación de propiedad**: Solo el dueño puede modificar/eliminar eventos
- **Datos filtrados**: Consultas públicas excluyen información sensible
- **Niveles de acceso**: Eventos privados vs públicos con control granular

### Integración
- **Con disponibilidad**: Los eventos usan la configuración del usuario propietario
- **Con reservas**: Los eventos públicos pueden recibir reservas de otros usuarios
- **Con integraciones**: Se crean automáticamente en calendarios externos conectados

---

## 🔗 Servicio de Integraciones

### Descripción
Gestiona conexiones OAuth con servicios externos (Google Calendar/Meet, Zoom, Outlook) para automatizar la creación de reuniones y sincronización de calendarios.

### Funcionalidades Principales

#### Gestión de Conexiones
- **Estado completo** (`getUserIntegrationsService`): Lista todas las integraciones disponibles y su estado
- **Verificación rápida** (`checkIntegrationService`): Confirma si una integración específica está activa
- **Conexión OAuth** (`connectAppService`): Inicia proceso de autorización con proveedores
- **Persistencia** (`createIntegrationService`): Guarda tokens tras autorización exitosa

#### Gestión de Tokens
- **Validación automática** (`validateGoogleToken`): Renueva tokens de Google automáticamente
- **Seguridad OAuth**: Estado codificado, scopes mínimos, almacenamiento seguro

### Integraciones Soportadas

#### Google Meet & Calendar (Implementado)
- **Funcionalidad**: Crea eventos en Google Calendar + enlaces Meet automáticos
- **Scopes**: `calendar.events` (lectura/escritura de eventos)
- **Renovación**: Tokens se renuevan automáticamente sin intervención del usuario

#### Zoom Meeting (Preparado)
- **Estado**: Estructura configurada, implementación OAuth pendiente
- **Funcionalidad planeada**: Generación automática de enlaces Zoom para reuniones

#### Outlook Calendar (Preparado)  
- **Estado**: Configuración lista, integración OAuth pendiente
- **Funcionalidad planeada**: Sincronización bidireccional con calendario Outlook

### Flujo OAuth Completo
```
1. Usuario selecciona "Conectar Google Calendar"
2. Sistema genera URL OAuth con estado codificado (seguridad)
3. Usuario autoriza en Google
4. Google retorna código + estado
5. Sistema intercambia código por tokens
6. Tokens guardados en BD de forma segura
7. Integración lista para usar
```

### Arquitectura Extensible
- **Mapeos centralizados**: Fácil agregar nuevos proveedores
- **Configuración uniforme**: Misma estructura para todos los servicios
- **Seguridad robusta**: Prevención CSRF, tokens seguros, renovación automática

---

## 🔄 Integración Entre Servicios

### Flujo Completo de Usuario

#### 1. Configuración Inicial
```
Registro → Username automático + Disponibilidad L-V 9AM-5PM
    ↓
Crear evento "Consultoría Marketing" → Slug: consultoria-marketing
    ↓
Conectar Google Calendar → OAuth → Tokens guardados
    ↓
Hacer evento público → URL: /usuario123abc/consultoria-marketing
```

#### 2. Reserva de Cliente
```
Cliente visita → /usuario123abc/consultoria-marketing
    ↓
Sistema consulta disponibilidad → Slots libres considerando reuniones
    ↓
Cliente selecciona horario → Reserva confirmada
    ↓
Evento creado en Google Calendar → Invitación automática + enlace Meet
```

### Dependencias Entre Servicios

#### Servicio de Eventos → Disponibilidad
- Los eventos usan `getAvailabilityForPublicEventService` para mostrar slots reservables
- El slug del evento identifica qué disponibilidad consultar

#### Disponibilidad → Integraciones  
- Al generar slots, verifica si hay integración de calendario activa
- Si existe, incluye reuniones externas en cálculo de conflictos

#### Integraciones → Todos los Servicios
- Valida tokens antes de cualquier operación externa
- Renueva automáticamente si es necesario
- Crea eventos en calendarios externos tras reservas

---

## 📊 Métricas y Monitoreo

### Métricas por Servicio

#### Autenticación
- Registros exitosos vs fallidos
- Intentos de login y tasas de éxito
- Generación de usernames únicos

#### Disponibilidad
- Slots generados por evento
- Conflictos detectados automáticamente  
- Modificaciones de horarios por usuario

#### Eventos
- Eventos creados públicos vs privados
- Cambios de privacidad
- Accesos a URLs públicas

#### Integraciones
- Conexiones OAuth exitosas
- Renovaciones de tokens automáticas
- Errores de integración por proveedor

---

## 🛣️ Roadmap y Extensiones

### Funcionalidades Futuras

#### Integraciones Adicionales
- **Microsoft Teams**: Video conferencing integrado
- **Apple Calendar**: Sincronización móvil nativa
- **Stripe**: Pagos para eventos premium
- **Calendly**: Importar configuraciones existentes

#### Mejoras de Sistema
- **Notificaciones**: Email/SMS automáticos pre-reunión
- **Analytics**: Dashboard de métricas detalladas
- **API pública**: Endpoints para integraciones de terceros
- **Mobile app**: Aplicación nativa iOS/Android

#### Escalabilidad
- **Cacheo**: Redis para eventos públicos populares
- **CDN**: Optimización de assets estáticos
- **Microservicios**: Separación de servicios por dominio
- **Rate limiting**: Protección contra abuso de APIs

---

## 🔧 Configuración y Deployment

### Variables de Entorno Requeridas
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id  
GOOGLE_CLIENT_SECRET=your-google-client-secret
REDIRECT_URI=https://yourdomain.com/oauth/callback
```

### Dependencias Principales
- **TypeORM**: ORM para base de datos
- **Google APIs**: OAuth y Calendar integration
- **JWT**: Manejo de tokens de autenticación
- **date-fns**: Manipulación de fechas y horarios

---

## 📞 Soporte y Contacto

Para preguntas técnicas, reportes de bugs o solicitudes de nuevas funcionalidades, por favor:

1. **Revisa la documentación**: Busca en este README primero
2. **Consulta logs**: Los servicios incluyen logging detallado
3. **Reporta issues**: Incluye pasos para reproducir y logs relevantes
4. **Solicita features**: Describe el caso de uso y beneficio esperado

---

**Última actualización**: Mayo 2025  
**Versión del sistema**: 1.0.0  
**Mantenido por**: Equipo de Desarrollo