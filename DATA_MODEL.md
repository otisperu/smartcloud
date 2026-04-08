# SmartCloudOPS — Modelo de Datos (Prisma)

Este documento detalla el modelo de datos de la plataforma SmartCloudOPS, gestionado a través de Prisma ORM y almacenado en PostgreSQL.

---

## 1. Módulo de Autenticación (NextAuth)

Las siguientes entidades son requeridas por `NextAuth` para gestionar las sesiones, logins con OAuth (ej. Google) y tokens de seguridad.

### `Account`
Almacena las cuentas de proveedores de autenticación externos vinculadas a un usuario local.
- **id** (`String`): Identificador único (CUID).
- **userId** (`String`): Relación con `User`.
- **type**, **provider**, **providerAccountId**: Datos específicos de OAuth.
- **access_token**, **refresh_token**, **id_token**: Tokens devueltos por el proveedor.
- **expires_at**: Timestamp de expiración.

### `Session`
Controla las sesiones activas de los usuarios en la aplicación web.
- **sessionToken** (`String`): Token único de la sesión de NextAuth.
- **userId** (`String`): Relación con `User`.
- **expires** (`DateTime`): Fecha de caducidad de la sesión.

### `VerificationToken`
Tokens temporales para procesos como `Reset Password` o validación por Email.
- **identifier** (`String`): Habitualmente el email a verificar.
- **token** (`String`): El token de seguridad generado (único).
- **expires** (`DateTime`): Caducidad del token.

---

## 2. Entidades Core de Negocio

Estas tablas representan la base de la plataforma de servicios en la nube: clientes, planes de recursos, máquinas (VPS) y despliegues.

### `User`
Representa al administrador interno y/o cliente que consume la plataforma.
- **id** (`String`): Identificador único (CUID).
- **name**, **email**, **image**: Datos personales.
- **passwordHash** (`String`): Para login basado en credenciales.
- **role** (`String`): Perfil de usuario (`CLIENT` | `ADMIN`).
- **Relaciones:** Tiene múltiples cuentas (NextAuth), sesiones, dominios registrados y suscripciones de pago.

### `Plan`
Catálogo maestro de planes de servidor VPS ofrecidos al cliente (`Starter`, `Business`, `Enterprise`, etc.).
- **id** (`String`): Identificador único (CUID).
- **name** (`String`): Nombre comercial del plan.
- **ramGB** (`Int`): Memoria RAM adjudicada.
- **vCpuCores** (`Int`): Cantidad de núcleos virtuales.
- **storageGB** (`Int`): Capacidad de disco principal (generalmente NVMe).
- **priceMonthly** (`Float`): Costo mensual fijo.

### `VPS`
Representa una máquina virtual (servidor) pre-aprovisonado o contratado físicamente a través de un proxy/API como Contabo.
- **id** (`String`): Identificador único (CUID).
- **providerId** (`String`): El ID de la máquina tal como fue asignado por el proveedor de nube.
- **ipAddress** (`String`): IPv4 final asignada al VPS.
- **status** (`String`): Estado actual (`PENDING`, `PROVISIONING`, `ACTIVE`, `STOPPED`).
- **planId** (`String`): Enlace directo al plan que justifica su tamaño/costo.

### `Deployment`
Representa la carga de trabajo en sí (los contenedores y aplicaciones instaladas en un VPS).
- **id** (`String`): Identificador único (CUID).
- **vpsId** (`String`): Servidor VPS en el cual este entorno descansa.
- **domain** (`String`): Subdominio o dominio principal configurado.
- **addonType** (`String`): Software de catálogo instalado (ej. `ERPNext`, `n8n`).
- **adminPass** (`String`): Contraseña maestra generada en el script desatendido y almacenada para el cliente.
- **status** (`String`): (`INSTALLING`, `ACTIVE`, `ERROR`, `STOPPED`).

---

## 3. Facturación y Expansiones

### `Subscription`
Una membresía o modelo de pago recurrente suscrito al Stripe del proyecto que ampara el gasto general o planes de un usuario.
- **id** (`String`): Identificador interno.
- **userId** (`String`): Relación al cliente `User`.
- **status** (`String`): Estado de pagos (`ACTIVE`, `EXPIRED`, `CANCELLED`, `PAST_DUE`).
- **stripeId** (`String`): Identificación oficial retornada por Stripe.
- **expiresAt** (`DateTime`): Cierre de ciclo.

### `Domain`
Un nombre de dominio comercial comprado o trasladado por el cliente dentro de la plataforma (Integración NameSilo).
- **id** (`String`): Identificador único.
- **name** (`String`): El dominio string en sí (ej. *'midominio.com'*).
- **provider** (`String`): Quién lo maneja (`NameSilo` o `External`).
- **autoRenew** (`Boolean`): Switch de cobro recurrente.
- **expirationDate** (`DateTime`): Fecha vital donde NameSilo requiere la renovación.
- **userId** (`String`): Propietario.
