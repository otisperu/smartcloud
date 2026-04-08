# SmartCloudOPS — Documento de Arquitectura de Software

**Dominio:** smartcloud.app *(por definir)*
**Versión:** 0.2.0 — Fase 1: Panel de control base + Auth + DB
**Última actualización:** 2026-04-06

---

## 1. Visión del Producto

SaaS/PaaS para automatizar el despliegue (provisioning) y gestión de infraestructura y aplicaciones empresariales en la nube. Permite:

- Aprovisionamiento automático de VPS en Contabo mediante API
- Instalación desatendida de **ERPNext** y **n8n** sobre Docker
- Gestión de suscripciones, facturación y ciclo de vida de despliegues
- Venta y configuración de dominios personalizados (NameSilo como reseller)
- Backups automáticos hacia almacenamiento externo (S3 / Backblaze)

**Diferenciador clave:** El cliente paga un plan y recibe un entorno funcional de ERPNext (o n8n) en minutos, sin configurar servidores manualmente.

---

## 2. Stack Tecnológico

> Las versiones en `package.json` son fuente de verdad para escribir código.
> Verificar compatibilidad de APIs contra estas versiones antes de implementar.

### Frontend / Backend (Fullstack)

| Paquete              | Versión   | Notas clave                                                    |
|----------------------|-----------|----------------------------------------------------------------|
| Node.js              | 20        | Imagen Docker: `node:20-alpine`                                |
| Next.js              | 14.2.3    | App Router, Server Actions, API Routes                         |
| React                | 18.x      |                                                                |
| TypeScript           | 5.x       |                                                                |
| Tailwind CSS         | 3.4.1     | Config en `tailwind.config.ts`                                 |
| Prisma Client        | 5.14.0    | ORM — generado en `postinstall` y `build`                      |
| Prisma CLI           | 5.14.0    | Migrations y schema management                                 |
| lucide-react         | 0.378.0   | Iconografía                                                    |
| clsx                 | 2.1.1     | Utilidad de classnames condicionales                           |
| tailwind-merge       | 2.3.0     | Merge seguro de clases Tailwind                                |

### Integraciones Externas

| Servicio       | Uso                                              |
|----------------|--------------------------------------------------|
| Contabo API    | Provisioning y gestión de VPS (OAuth2)           |
| Stripe         | Suscripciones y cobros recurrentes               |
| NameSilo API   | Registro y gestión de dominios (reseller)        |
| Stalwart Mail  | Servidor de correo self-hosted (SMTP/IMAP)       |
| AWS S3 / Backblaze | Almacenamiento de backups de clientes        |

### Infraestructura

| Servicio    | Versión / Imagen         | Notas                                        |
|-------------|--------------------------|----------------------------------------------|
| PostgreSQL  | 16 (`postgres:16-alpine`)| Healthcheck con `pg_isready`                 |
| Traefik     | Gestionado por Dokploy   | Reverse proxy + SSL automático (Let's Encrypt)|
| Dokploy     | Última estable           | Único entorno de despliegue sobre Contabo    |
| Contabo VPS | Cloud VPS (S/M/L)        | Servidores base para alojar los despliegues  |

> **Next.js 14 + Prisma:** Ejecutar `prisma generate` antes de `next build`.
> El script `postinstall` en `package.json` lo hace automáticamente en `npm install`.
>
> **Dokploy:** Gestiona Traefik internamente. No se configura un contenedor nginx propio;
> el routing por dominio lo resuelve Traefik directamente hacia cada servicio.
>
> **Docker frontend:** `npm ci` requiere `package-lock.json`. Sin él usar `npm install`.

---

## 3. Dominios y Subdominios

| Subdominio              | Propósito                                     |
|-------------------------|-----------------------------------------------|
| app.smartcloud.app      | Panel de control principal (Next.js)          |
| admin.smartcloud.app    | Administración interna (Next.js admin routes) |

> Los VPS de clientes reciben subdominios temporales durante provisioning
> (ej. `cliente-abc.smartcloud.app`) hasta configurar dominio personalizado.

---

## 4. Contenedores Docker (Plataforma SmartCloudOPS)

> Traefik es gestionado por Dokploy. No existe contenedor nginx propio.

```
smartcloud-app    → Next.js (frontend + backend API) — puerto 3000 interno
postgres          → Base de datos PostgreSQL         — puerto 5432 interno
```

**Routing en producción (Dokploy):**
```
app.smartcloud.app   → smartcloud-app:3000
```

> Los VPS de clientes son instancias Contabo separadas, cada una con su propia
> instalación Docker gestionada por los scripts de aprovisionamiento de SmartCloudOPS.

### 4.1 Configuraciones Críticas para Dokploy / Prisma

Existen consideraciones específicas para el despliegue del modo `standalone` de Next.js mediante **Dokploy** y **Prisma**:

1. **Resolución de Hostnames (Network interno de Docker Compose):**
   Si la variable de entorno `.env` declara \`DATABASE_URL="postgresql://user:pass@postgresql:5432/..."\`, el servicio en el \`docker-compose.yml\` **debe** llamarse obligatoriamente \`postgresql\` y no "database" genéricamente. De lo contrario, Dokploy y el internal DNS de Docker de Compose levantarán un error \`P1001: Can't reach database server at postgresql:5432\` durante el inicio del contenedor frontend (migraciones Prisma).
   
2. **Prisma CLI y Error de Motores `.wasm`:**
   Dado que el Dockerfile usa `output: standalone`, los paquetes de Prisma generados en el *builder stage* pierden referencias y ficheros `.wasm` al hacer un COPY duro de las carpetas `.bin`. **La solución estándar arquitectural para SmartCloudOPS** es ejecutar `RUN npm install prisma@5.14.0` explícitamente dentro de la última etapa (Runner) del Dockerfile. Esto garantiza que la ejecución de `npx prisma db push --skip-generate` durante el script `entrypoint.sh` encuentre sus binarios WASM nativos.

---

## 5. Modelo de Datos Core

### User
```
id, email (unique), passwordHash, role (CLIENT | ADMIN)
createdAt, updatedAt
```

### Plan
```
id, name (Starter | Business | Enterprise)
ramGB, vCpuCores, storageGB, priceMonthly
```

### VPS
```
id, providerId (ID en Contabo), ipAddress
status (PENDING | PROVISIONING | ACTIVE | STOPPED)
planId (FK → Plan), createdAt
```

### Deployment
```
id, vpsId (FK → VPS), domain
addonType (ERPNext | n8n), adminPass
status (INSTALLING | ACTIVE | ERROR), createdAt
```

### Domain
```
id, name (unique), provider (NameSilo | External)
autoRenew, expirationDate, userId
```

### Subscription
```
id, userId (FK → User), status (ACTIVE | EXPIRED | CANCELLED)
stripeId, createdAt, expiresAt
```

---

## 6. Catálogo de Servicios

**Core (incluido en todos los planes):**
- **ERPNext** — Sistema de gestión empresarial desplegado automáticamente
- **SSL (HTTPS)** — Certificado Let's Encrypt gestionado por Traefik/Dokploy

**Add-ons (upselling):**
- **n8n** — Automatización de flujos de trabajo basada en nodos
- **Backups** — Copias de seguridad automáticas hacia S3/Backblaze
- **Dominios personalizados** — Configura `erp.empresa.com` con SSL automático
- **Venta de dominios** — Registro de nuevos dominios vía NameSilo desde el panel

---

## 7. Planes de Suscripción

| Dimensión                | Starter  | Business | Enterprise |
|--------------------------|----------|----------|------------|
| **Recurso base (Contabo)**| VPS S   | VPS M    | VPS L      |
| **RAM**                  | 6 GB     | 16 GB    | 30 GB      |
| **vCPU**                 | 4 cores  | 6 cores  | 8 cores    |
| **Almacenamiento NVMe**  | 100 GB   | 250 GB   | 400 GB     |
| **Servicios incluidos**  | ERPNext  | ERPNext + n8n | ERPNext + n8n + Backups |
| **Soporte**              | Email    | Email + Chat | SLA + Account manager |

> **Regla clave:** cada plan mapea 1:1 a un tier de Contabo. Al comprar un plan
> se provisiona automáticamente el VPS correspondiente vía API.

---

## 8. Flujos Principales

### Provisioning de un nuevo cliente
```
1. Cliente selecciona plan y completa checkout (Stripe)
2. Webhook de Stripe valida pago → activa Subscription
3. SmartCloudOPS llama a Contabo API → crea VPS del tier correcto
4. Sistema espera confirmación de VPS activo (polling o webhook)
5. Script de aprovisionamiento vía SSH:
   a. Instala Docker y dependencias base
   b. Despliega ERPNext con docker-compose parametrizado
   c. Configura reverse proxy + SSL automático
6. Estado en panel: PENDING → PROVISIONING → INSTALLING → ACTIVE
7. Cliente recibe credenciales de admin por email
```

### Ciclo de facturación y control
```
1. Stripe genera cobro mensual automático
2. invoice.payment_succeeded → Subscription sigue ACTIVE
3. invoice.payment_failed    → Subscription pasa a PAST_DUE
4. Sin pago tras X días      → VPS suspendido en Contabo
5. Pago recuperado           → VPS reactivado automáticamente
6. Cancelación               → VPS eliminado + datos exportados (si aplica)
```

### Configuración de dominio personalizado
```
1. Cliente ingresa su dominio (ej. erp.empresa.com)
2. Panel muestra registros DNS a apuntar (A record → IP VPS)
3. SmartCloudOPS verifica propagación DNS
4. Traefik reconfigura routing + genera SSL automáticamente
5. Dominio queda activo en el Deployment
```

---

## 9. Arquitectura de Directorios (Next.js)

```
src/
├── app/
│   ├── (auth)/               → Rutas de login y registro
│   ├── (dashboard)/          → Panel cliente autenticado
│   │   ├── deployments/      → Gestión de despliegues
│   │   ├── billing/          → Suscripción y facturas
│   │   └── domains/          → Gestión de dominios
│   ├── (admin)/              → Panel administrador interno
│   └── api/
│       ├── auth/             → NextAuth.js endpoints
│       ├── contabo/          → Proxy hacia Contabo API
│       ├── stripe/           → Webhooks y checkout
│       └── deployments/      → CRUD de despliegues
├── lib/
│   ├── prisma.ts             → Cliente Prisma singleton
│   ├── contabo.ts            → SDK interno Contabo API
│   ├── stripe.ts             → Cliente Stripe
│   └── ssh.ts                → Ejecución de scripts vía SSH
└── components/
    ├── ui/                   → Componentes base (Button, Card, Badge…)
    └── dashboard/            → Componentes específicos del panel
```

---

## 10. Fases de Desarrollo

### Fase 1 — Panel de Control Base · 🔄 Actual

**Objetivos:** Setup tecnológico, autenticación, modelos de datos y UI funcional con datos mock.

- Setup del proyecto Next.js + Prisma apuntando a PostgreSQL
- Esquema migrado con las 6 entidades base (`User`, `Plan`, `VPS`, `Deployment`, `Domain`, `Subscription`)
- Autenticación con NextAuth.js: registro, login y protección de rutas
- Dashboard con layout global (sidebar, menú, avatar)
- Vistas: catálogo de planes, lista de despliegues del cliente (datos mock)

**Verificación:**
- El proyecto arranca en local sin errores de compilación ni de consola
- Todas las tablas existen y se pueden leer/escribir desde Prisma Studio
- Un usuario puede registrarse, iniciar sesión y cerrar sesión correctamente
- La navegación entre secciones del dashboard funciona con datos simulados

---

### Fase 2 — Motor de Aprovisionamiento · Pendiente

**Objetivos:** Integrar Contabo API y automatizar el aprovisionamiento de VPS con ERPNext/n8n.

- Credenciales OAuth2 de Contabo configuradas y llamadas a `POST /v1/compute/instances` funcionando
- Sistema de polling o webhooks para detectar cuándo el VPS está listo
- Conexión SSH segura (keypairs) hacia la IP entregada por Contabo
- Script shell base: instala Docker, red y dependencias en VPS virgen
- Templates `docker-compose` para ERPNext y n8n parametrizados
- Estado del despliegue actualizado en tiempo real en el panel (`PENDING → PROVISIONING → ACTIVE`)

**Verificación:**
- Desde el panel se puede crear un VPS en Contabo y verlo reflejado en la DB
- El sistema envía un `echo "Hola Mundo"` vía SSH al VPS recién creado
- El script de provisioning termina y la URL temporal del servidor carga ERPNext
- El cliente ve el cambio de estado en su dashboard sin recargar la página

---

### Fase 3 — Facturación y Control · Pendiente

**Objetivos:** Integrar Stripe con suscripciones recurrentes, webhooks y suspensión automática.

- Planes de Stripe configurados (Starter, Business, Enterprise) con sus IDs de producto
- Flujo de checkout en frontend conectado al usuario autenticado
- Endpoint webhook para `invoice.payment_succeeded` y `invoice.payment_failed`
- Activación del despliegue solo tras validación de pago
- Lógica de suspensión: apagar VPS en Contabo si la suscripción entra en `EXPIRED`
- Reactivación automática al recuperar el pago

**Verificación:**
- Una tarjeta de prueba Stripe genera un cobro en modo Testing
- El estado de `Subscription` pasa a `ACTIVE` sin intervención manual tras el pago
- Un pago fallido suspende el VPS y lo refleja en el panel del cliente
- El VPS se reactiva automáticamente al regularizar el pago

---

### Fase 4 — Add-ons y Estabilidad · Pendiente

**Objetivos:** Dominios personalizados, venta de dominios y backups automáticos.

- Integración NameSilo API: búsqueda y compra de dominios desde el panel
- Verificación de propagación DNS y reconfiguración de Traefik al vuelo
- SSL automático para dominio personalizado del cliente (`erp.empresa.com`)
- Cron job de backup de ERPNext (archivos + DB) dentro del VPS del cliente
- Script de envío a bucket S3/Backblaze via Rclone o AWS CLI

**Verificación:**
- Compra de dominio vía NameSilo exitosa en Sandbox
- HTTPS auto-generado y accesible en el dominio personalizado del cliente
- El backup comprimido existe en el bucket externo tras la ejecución del cron
- El backup puede restaurarse en un entorno de desarrollo

---

### Fase 5 — Telemetría · Pendiente

**Objetivos:** Métricas de consumo de recursos visibles en el panel del cliente.

- Script ligero en el VPS del cliente que reporta RAM y disco usados (1×/hora)
- Widgets o gráficos en el dashboard mostrando consumo actual
- Alertas si el uso supera un umbral (ej. 85% de disco)

**Verificación:**
- El panel muestra en tiempo real: "8 GB de 100 GB usados (8%)"
- La métrica se actualiza sin recargar la página
- Una alerta aparece cuando el disco supera el umbral configurado

---

## 11. Variables de Entorno

Ver `.env.example` en la raíz del repositorio.
