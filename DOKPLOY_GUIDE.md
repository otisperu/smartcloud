# Guía Definitiva de Despliegue en Dokploy con Next.js Standalone + Prisma

Este documento recopila las directrices y lecciones aprendidas («Knowledge Base») para garantizar que los despliegues de la plataforma **SmartCloudOPS** en Dokploy (usando la opción **Compose**) levanten exitosamente y sin generar el error "404 page not found" provocado por Traefik.

> ⚠️ **Documento Vivo:** Lee y respeta este documento antes de realizar refactorizaciones mayores en la infraestructura, Dockerfile o docker-compose.

---

## 1. El Error 404 de Traefik (Red Aislada)

### Problema
Dokploy despliega sus contenedores tipo `Compose` en una sub-red privada *bridge*, que de forma predeterminada no expone contenedores de manera pública. Si subes tu proyecto y el dominio que configuraste devuelve un **"404 page not found"** con la pantalla negra característica de Traefik, el problema radica en que Traefik no puede ver la IP del contenedor.

### Solución Arquitectónica
Es **estrictamente obligatorio** engachar tu contenedor de red frontend (Next.js) a la red maestra de traefik interna de Dokploy, tradicionalmente llamada `dokploy-network`.

```yaml
# En docker-compose.yml
services:
  frontend:
    networks:
      - dokploy-network
      - default
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.smartcloud-frontend.rule=Host(`${DOMAIN:-midominio.com}`)"
      - "traefik.http.services.smartcloud-frontend.loadbalancer.server.port=3000"

networks:
  dokploy-network:
    external: true
```

---

## 2. El Error de Bases de Datos `P1001` (Nombres de Servicio en red local)

### Problema
Prisma genera el error `Error: P1001: Can't reach database server at postgresql:5432` si la URL declara como host a `postgresql`, pero el servicio Docker de base de datos tiene otro nombre en tu red interna (por ejemplo, `database`).

### Solución Arquitectónica
El segmento del Hostname de la variable de estado `DATABASE_URL` debe coincidir **exactamente** con el nombre declarado como identificador de servicio en el `docker-compose.yml`.

**Incorrecto:**  
`docker-compose.yml` -> `services: database: image: postgres`  
`.env` -> `DATABASE_URL=postgresql://user:pass@postgresql:5432/db`

**Correcto:**  
`docker-compose.yml` -> `services: postgresql: image: postgres`  
`.env` -> `DATABASE_URL=postgresql://user:pass@postgresql:5432/db`  
*(Ambos son idénticos en la parte de red).*

---

## 3. Crash en Startup: Faltan archivos de Prisma WASM

### Problema
El error en los logs: `Error: Cannot find module '@prisma/engines'` ó `Error: ENOENT: no such file or directory, open '...prisma_schema_build_bg.wasm'`.
Esto es muy común en `Dockerfile` de Next.js cuando utilizan `output: "standalone"`, en el cuál se realizan recortes extremos en la compilación y herramientas CLI como `prisma db push` que corremos en `entrypoint.sh` se corrompen debido a copias incompletas y enlaces simbólicos rotos de Node Modules en Alpine.

### Solución Arquitectónica
Dejar de copiar binarios desde el `builder` hacia el `runner` de la forma `COPY --from=builder /app/node_modules/prisma`. **Se debe instalar el CLI de manera nativa** directamente en la capa final antes de los comandos operacionales.

```dockerfile
# En el archivo Dockerfile: Stage runner

# Output standalone de Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# 🚨 La clave del éxito para evitar la ausencia de WASM
RUN npm install prisma@5.14.0

COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
CMD ["sh", "entrypoint.sh"]
```

---

## 4. Redirects Tóxicos que Bypass-ean a Page.tsx

### Problema
Generar redirecciones usando `next.config.mjs` de la forma incondicional desde la raíz (`source: "/", destination: "/register"`) anula por completo la capacidad de `page.tsx` de gestionar de forma inteligente tu Home Page. Esto bloquea implementaciones como "si el usuario ya está logueado por NextAuth redirígelo al dashboard, sino al login / registro".

### Solución Arquitectónica
La lógica condicional debe residir siempre del lado de la aplicación y la validación en NextAuth/Servidor (dentro del Middleware o en un componente dinámico del Server Side Routing), minimizando los arrays `redirects` estáticos dentro del config root.
