# Interbanking API - Challenge

## ¿Qué hace esta API?

Esta API permite:
- Obtener empresas que realizaron transferencias en el último mes (con paginación)
- Obtener empresas que se adhirieron en el último mes (con paginación)
- Registrar la adhesión de nuevas empresas (Pyme o Corporativa)

---

## Stack Tecnológico

- **Framework**: NestJS 10
- **Lenguaje**: TypeScript 5
- **Base de Datos**: MongoDB (local)
- **ODM**: Mongoose
- **Testing**: Jest (647 tests completos)
- **Documentación**: Swagger/OpenAPI

---
## Estructura del Proyecto

```
challenge/
├── src/
│   ├── main.ts                    # Entry point + Swagger config
│   ├── app.module.ts              # Módulo raíz
│   ├── common/                    # Recursos compartidos
│   │   ├── types/                 # Enums y tipos
│   │   ├── interfaces/            # Interfaces TypeScript
│   │   ├── constants/             # Constantes (timezone)
│   │   ├── utils/                 # Utilidades (date helper)
│   │   ├── middleware/            # Auth + Rate limiting
│   │   └── interceptors/          # Timezone interceptor
│   ├── companies/                 # Módulo Companies
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dto/
│   │   ├── schemas/
│   │   └── companies.module.ts
│   ├── transfers/                 # Módulo Transfers
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dto/
│   │   ├── schemas/
│   │   └── transfers.module.ts
│   ├── lambda/                    # AWS Lambda (punto adicional - excluida del build)
│   │   ├── handler.ts
│   │   ├── input-example.json
│   │   ├── output-*.json
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   └── database/
│       └── seed.ts                # Script de datos de prueba
├── test/                          # 647 tests
│   ├── companies/
│   ├── transfers/
│   ├── common/
│   ├── app.module.spec.ts
│   ├── main.spec.ts
│   └── README.md
├── README.md                      # Este archivo
└── package.json
```

---

## Instalación y Ejecución

### Prerrequisitos
- **Node.js** v18 o superior
- **MongoDB** instalar localmente.

### Pasos para ejecutar

#### 1. Instalar dependencias
```bash
npm install
```

#### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores (o usar los valores por defecto)
# MONGODB_URI=mongodb://localhost:27017/interbanking
# AUTH_TOKEN=Bearer_mK7pL9xR4tN2wQ8vZ3jH6yF5sA1cE0bD
# PORT=3000
# CORS_ORIGIN=*
```

#### 3. Iniciar MongoDB
```bash
mongod
```

#### 4. Poblar base de datos (Seed)
```bash
npm run seed
```

Este comando creará:
- 20 empresas (12 antiguas, 8 del último mes)
- Transferencias de prueba

#### 5. Iniciar la aplicación
```bash
npm run start:dev
```

La API estará disponible en: **http://localhost:3000**

---

## Documentación Interactiva - Swagger

La API incluye **Swagger/OpenAPI** para probar todos los endpoints de forma interactiva.

### Acceso a Swagger:
```
http://localhost:3000/api/docs
```
---

## 🔒 Seguridad

### Autenticación
- **Bearer Token**: Todas las rutas de adhesión requieren autenticación mediante token Bearer
- Token configurado en variable de entorno `AUTH_TOKEN` (ver `.env.example`)
- Formato: `Authorization: Bearer <token>`
- **No hay tokens hardcodeados en el código** - todo se maneja mediante `process.env`

### Protecciones Implementadas
- ✅ **Helmet**: Headers HTTP seguros (XSS, clickjacking, MIME sniffing)
- ✅ **CORS**: Control de orígenes permitidos (configurable via `CORS_ORIGIN`)
- ✅ **Rate Limiting**: Protección contra sobrecarga (in-memory)
  - 5 requests cada 30 segundos por IP
  - Bloqueo de 40 segundos al exceder límite
  - Rutas protegidas: GET `/companies/with-transfers/last-month` y `/companies/joined/last-month`
- ✅ **Validación Estricta**: DTOs con `class-validator` y `whitelist: true`
- ✅ **Paginación**: Límites en consultas GET para prevenir consultas pesadas

### Rate Limiting - Producción

**📌 Implementación Actual (Challenge):**

El middleware in-memory actual es **correcto para el challenge**, pero tiene limitaciones en producción:
- ✓ Simple y efectivo para desarrollo
- ✗ No escala en clusters o múltiples instancias
- ✗ Se pierde el estado en cada restart
- ✗ **No expone headers de cuota** (`X-RateLimit-*`)

---

**🚀 Opciones de Reemplazo para Producción:**

#### Opción 1: `@nestjs/throttler` con Redis (Recomendado)

```bash
npm install @nestjs/throttler @nestjs/throttler-storage-redis ioredis
```

**Ventajas:**
- ✓ **Comparte estado entre instancias** (cluster/múltiples servidores)
- ✓ **Persistencia de límites** en Redis
- ✓ **Headers de cuota automáticos**:
  - `X-RateLimit-Limit`: Límite de requests permitidos
  - `X-RateLimit-Remaining`: Requests restantes en ventana actual
  - `X-RateLimit-Reset`: Timestamp de reinicio de ventana

**Ejemplo de configuración:**
```typescript
// app.module.ts
ThrottlerModule.forRoot([{
  ttl: 30000,  // 30 segundos
  limit: 5,    // 5 requests
  storage: new ThrottlerStorageRedisService(new Redis({ /* config */ })),
}])
```

---

#### Opción 2: API Gateway / Load Balancer

**Alternativas de infraestructura:**
- **AWS API Gateway**: Burst/rate limits nativos, sin código
- **NGINX**: Módulo `limit_req_zone` para rate limiting
- **Cloudflare**: Rate Limiting con reglas configurables

**Ventaja:** Se maneja a nivel de infraestructura, sin cambios en el código

---

## Tests

El proyecto incluye **647 tests** que cubren:
- Unit tests (servicios, DTOs, schemas, middlewares)
- E2E tests (endpoints completos)
- Integration tests (módulos)

### Ejecutar tests
```bash
# Todos los tests
npm test

# Tests con cobertura
npm run test:cov

# Tests en modo watch
npm run test:watch

# Ejecutar tests de un archivo específico
npm test -- ruta/al/archivo.spec

# Ejemplos:
npm test -- companies/companies.controller.spec
npm test -- companies/companies.service.spec
npm test -- transfers/transfers.service.spec
npm test -- common/middleware/auth.middleware.spec
```


## Middlewares Implementados

### Middleware de Autenticación
- **Ruta protegida**: `POST /companies/adhesion`
- **Propósito**: Validar que solo usuarios autorizados puedan registrar empresas
- **Token**: Configurado via variable de entorno `AUTH_TOKEN`
- **Header**: `Authorization: Bearer <token>`

Este sistema de validación es común en operaciones sensibles como adhesión de empresas.

**Configuración:**
```bash
# En .env
AUTH_TOKEN=Bearer_mK7pL9xR4tN2wQ8vZ3jH6yF5sA1cE0bD
```

### Middleware de Rate Limiting
- **Rutas protegidas**: 
  - `GET /companies/with-transfers/last-month`
  - `GET /companies/joined/last-month`
- **Propósito**: Evitar sobrecarga del servidor por exceso de consultas
- **Límite**: Máximo 5 requests cada 30 segundos por IP
- **Bloqueo**: 40 segundos si se excede el límite
- **Implementación**: In-memory (ver sección de Seguridad para opciones productivas)

---

## Paginación

Las rutas GET incluyen **paginación** para evitar consultas pesadas y mejorar el rendimiento:

- **page**: Número de página (default: 1)
- **limit**: Cantidad de resultados por página (default: 10, máximo: 100)
- **total**: Total de registros en la base de datos
- **totalPages**: Cantidad total de páginas

**Ejemplo de uso:**
```bash
# Primera página, 10 resultados
GET /companies/joined/last-month?page=1&limit=10

# Segunda página, 20 resultados
GET /companies/joined/last-month?page=2&limit=20
```

---

## Punto Adicional: AWS Lambda Function

Este proyecto incluye una **Lambda Function de AWS** (diseño teórico) que replica la funcionalidad de adhesión de empresas en arquitectura serverless.

**Ubicación:** `src/lambda/` (excluida del build de NestJS)

**Características:**
- Validación de datos (CUIT, businessName, companyType, adhesionDate)
- Autenticación Bearer Token
- Conexión a la misma base MongoDB que NestJS
- Verificación de CUIT único
- Manejo completo de errores
- CORS configurado
- Caché de conexiones MongoDB (warm starts)

**Arquitectura:**
- `POST /adhesion` → API Gateway → Lambda → MongoDB
- `GET /companies` → NestJS → MongoDB (misma base)

**Ver documentación:**
```bash
cd src/lambda/
cat README.md
```

La Lambda **no requiere despliegue** (es solo diseño funcional). Para detalles sobre arquitectura, input/output y configuración AWS, consulta `src/lambda/README.md`.

---

