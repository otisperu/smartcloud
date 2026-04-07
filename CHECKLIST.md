# 📋 Checklist Maestro y Control de Avance: SmartCloudOPS

Seguimiento puntual de cada sub-tarea. Una tarea se marca completada solo cuando pasa su verificación.

---

## Fase 1: Panel de Control Base · 🔄 En curso

### 1.1 Docker & Infraestructura Local
- [x] `Dockerfile` multi-stage (deps → builder → runner) con `node:20-alpine`
- [x] `docker-compose.yml` con servicios `app` + `postgres:16-alpine`
- [x] `.dockerignore` configurado
- [x] `next.config.mjs` con `output: 'standalone'`
- [ ] *Verificación:* `docker compose up` levanta la app en `localhost:3000` sin errores

### 1.2 Dependencias y Setup
- [x] `next-auth`, `@next-auth/prisma-adapter`, `bcryptjs` instalados
- [x] `@types/bcryptjs` en devDependencies
- [x] `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin` instalados
- [x] `autoprefixer` instalado
- [x] *Verificación:* `npm run build` completa sin errores — ✅ Build exitoso

### 1.3 Base de Datos (Prisma + PostgreSQL)
- [x] Schema actualizado: `User` con campos NextAuth (`name`, `emailVerified`, `image`)
- [x] Modelos NextAuth agregados: `Account`, `Session`, `VerificationToken`
- [x] Relaciones correctas entre los 6 modelos principales
- [ ] `prisma migrate dev` ejecutado en contenedor con la DB activa
- [ ] *Verificación:* `npx prisma studio` muestra todas las tablas y se pueden crear registros

### 1.4 Autenticación (NextAuth.js)
- [x] `src/lib/auth.ts` con `authOptions`: Credentials + Google OAuth
- [x] `src/lib/prisma.ts` — singleton PrismaClient
- [x] `src/app/api/auth/[...nextauth]/route.ts` — handlers GET y POST
- [x] `src/app/api/auth/register/route.ts` — endpoint de registro con hash bcrypt
- [x] `src/middleware.ts` — protege `/dashboard/**`, redirige a `/login`
- [ ] *Verificación:* Registro con email → login → sesión activa. Acceso sin sesión a `/dashboard` redirige a `/login`

### 1.5 Autenticación Google OAuth
- [x] Google provider habilitado en `authOptions`
- [x] Botón "Continuar con Google" en login y registro
- [ ] `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` configurados en `.env`
- [ ] *Verificación:* Flujo Google OAuth completo funciona en entorno local y Docker

### 1.6 Design System & UI Base
- [x] `globals.css` con tokens CSS (colores brand, tipografía Inter, animaciones)
- [x] `tailwind.config.ts` extendido con paleta dark y brand
- [x] `src/components/ui/button.tsx` — variantes: primary, ghost, outline, destructive
- [x] `src/components/ui/badge.tsx` — variantes por estado: active, provisioning, error, pending
- [x] `src/components/ui/card.tsx` — card con header/content/footer
- [x] `src/components/ui/input.tsx` — input estilizado para formularios
- [x] *Verificación:* Build compila sin errores — ✅ Confirmado

### 1.7 Páginas de Autenticación
- [x] `src/app/(auth)/layout.tsx` — layout centrado sin sidebar
- [x] `src/app/(auth)/login/page.tsx` — formulario email + contraseña + botón Google
- [x] `src/app/(auth)/register/page.tsx` — formulario nombre + email + contraseña + Google
- [ ] *Verificación:* Formularios validan campos vacíos y muestran errores. Diseño premium y responsivo

### 1.8 Dashboard UI (Datos Mock)
- [x] `src/components/dashboard/sidebar.tsx` — navegación con íconos Lucide + ruta activa
- [x] `src/components/dashboard/stats-card.tsx` — card de métrica con ícono + número
- [x] `src/app/(dashboard)/layout.tsx` — sidebar + header con avatar y logout
- [x] `src/app/(dashboard)/dashboard/page.tsx` — resumen con stats cards y lista de despliegues
- [x] `src/app/(dashboard)/plans/page.tsx` — grid de planes Starter/Business/Enterprise
- [x] `src/app/(dashboard)/deployments/page.tsx` — tabla con estados badge variados
- [ ] *Verificación:* Navegación fluida entre secciones. Badge de estado reflejan colores correctos. Diseño profesional y consistente

### 1.9 Variables de Entorno
- [x] `.env.example` actualizado con `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL` apuntando a servicio Docker
- [ ] *Verificación:* `.env` local funciona tanto con `npm run dev` como con `docker compose up`

---

## Fase 2: Motor de Aprovisionamiento · Pendiente

### 2.1 API de Contabo
- [ ] Generar credenciales OAuth2 reales de Contabo
- [ ] Servicio proxy en backend para `POST /v1/compute/instances`
- [ ] *Verificación:* Se puede crear, leer y apagar un VPS desde código; reflejado en la DB

### 2.2 Execution Engine (SSH)
- [ ] Conexión vía SSH segura (keypairs) hacia IP de Contabo
- [ ] Sistema de polling/webhook para detectar VPS listo
- [ ] *Verificación:* El panel envía `echo "Hola Mundo"` vía SSH al VPS recién creado

### 2.3 Scripts de Aprovisionamiento
- [ ] Script shell base: Docker, red y dependencias en VPS virgen
- [ ] Template `docker-compose` para ERPNext/Frappe parametrizado
- [ ] Template `docker-compose` para n8n parametrizado
- [ ] *Verificación:* Script termina y la URL temporal carga la pantalla de bienvenida de ERPNext

### 2.4 Estados en Tiempo Real
- [ ] Pantalla "Provisionando..." visible durante instalación
- [ ] Indicador de estado: `PENDING → PROVISIONING → ACTIVE` (o `ERROR`)
- [ ] *Verificación:* El cliente ve el progreso en vivo y recibe sus credenciales al finalizar

---

## Fase 3: Facturación y Control · Pendiente

### 3.1 Stripe Checkout
- [ ] Planes configurados en Stripe (Starter, Business, Enterprise)
- [ ] Flujo de checkout conectado al usuario autenticado
- [ ] *Verificación:* Tarjeta de prueba genera cobro en modo Testing

### 3.2 Webhooks de Suscripción
- [ ] Endpoint webhook para `invoice.payment_succeeded` y `invoice.payment_failed`
- [ ] Vinculación factura → entidad `Subscription` en la DB
- [ ] *Verificación:* Estado de `Subscription` pasa a `ACTIVE` sin intervención manual

### 3.3 Motor de Suspensión
- [ ] Cron / tarea programada detecta suscripciones `EXPIRED`
- [ ] Apagado automático del VPS en Contabo
- [ ] *Verificación:* VPS en impago pasa a `STOPPED` y bloquea acceso

---

## Fase 4: Add-ons y Estabilidad · Pendiente

### 4.1 Dominios (NameSilo)
- [ ] Integración API NameSilo: búsqueda y compra desde el panel
- [ ] Interfaz para enlazar dominio externo con verificación DNS
- [ ] SSL automático al vincular dominio (Traefik via Dokploy)
- [ ] *Verificación:* Compra en Sandbox exitosa y HTTPS auto-generado en dominio personalizado

### 4.2 Backups Automáticos
- [ ] Cron job de backup ERPNext (archivos + DB) en el VPS del cliente
- [ ] Script de envío a S3/Backblaze via Rclone o AWS CLI
- [ ] *Verificación:* Backup comprimido existe en bucket externo y se puede restaurar

---

## Fase 5: Telemetría · Pendiente

### 5.1 Métricas en el Panel
- [ ] Script ligero en VPS cliente que reporta RAM y disco (1×/hora)
- [ ] Widgets de consumo en el dashboard del cliente
- [ ] Alerta al superar umbral (ej. 85% de disco)
- [ ] *Verificación:* Panel muestra "8 GB de 100 GB usados (8%)" y la alerta se dispara correctamente
