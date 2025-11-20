# Interbanking API - Challenge

![CI Pipeline](https://github.com/luciannomas/challenge/actions/workflows/ci.yml/badge.svg)
![Coverage](https://img.shields.io/codecov/c/github/luciannomas/challenge)
![Node Version](https://img.shields.io/badge/node-18.x-green)
![NestJS](https://img.shields.io/badge/nestjs-10.3-red)

## Descripción

API REST para gestión de empresas y transferencias interbancarias con NestJS y MongoDB.

**Funcionalidades:**
- Adhesión de empresas (Pyme/Corporativa) con autenticación Bearer
- Consulta de empresas adheridas en el último mes (paginado)
- Consulta de empresas con transferencias en el último mes (paginado)
- Registro de transferencias interbancarias
- Zona horaria: UTC-3 (Argentina)

---

## Stack Tecnológico

| Tecnología | Versión |
|-----------|---------|
| NestJS | 10.3 |
| TypeScript | 5.3 |
| MongoDB | 7.0 |
| Node.js | 18.x |
| Jest | 29.7 |

---

## Instalación Rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar MongoDB (en otra terminal)
mongod

# 4. Poblar datos de prueba
npm run seed

# 5. Iniciar aplicación
npm run start:dev
```

**URL Base:** `http://localhost:3000`  
**Swagger:** `http://localhost:3000/api/docs`

---

## Documentación Swagger

Toda la API está documentada en **Swagger/OpenAPI** con ejemplos interactivos:

```
http://localhost:3000/api/docs
```

**Incluye:**
- Contratos completos de request/response
- Esquemas de error uniformes (`{ statusCode, message, error }`)
- Ejemplos de errores 4xx/5xx
- Autenticación Bearer integrada
- Try it out para todos los endpoints

---

## Mejoras Implementadas

### 1. Auth & Seguridad ✅

**Token no hardcodeado:**
- Token movido a `process.env.AUTH_TOKEN`
- Configuración via `.env` y documentado en `.env.example`
- `ConfigService` de NestJS para gestión de variables de entorno

**Protecciones:**
- **Helmet:** Headers HTTP seguros (XSS, clickjacking, MIME sniffing)
- **CORS:** Configurado via `CORS_ORIGIN`
  - **Development:** `CORS_ORIGIN=*` (cualquier origen - solo para testing)
  - **Production:** Usar dominio específico (ej: `https://mi-app.com`)
- **Validación estricta:** DTOs con `class-validator` y `whitelist: true`

---

### 2. Rate Limiting ✅

**Implementación actual (Challenge):**
- Middleware in-memory funcional
- Límite: 5 requests cada 30 segundos por IP
- Bloqueo: 40 segundos al exceder límite
- Rutas protegidas: GET endpoints de empresas/transferencias

**Opciones para Producción:**

**1. @nestjs/throttler con Redis**
```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nestjs/throttler-storage-redis';
import Redis from 'ioredis';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 30000, limit: 5 }], // 5 req cada 30s
      storage: new ThrottlerStorageRedisService(
        new Redis({ host: 'localhost', port: 6379 })
      ),
    }),
  ],
})
```
**Ventajas:** Comparte estado entre instancias, headers automáticos (`X-RateLimit-Limit`, `X-RateLimit-Remaining`)

**2. API Gateway:** AWS API Gateway, NGINX `limit_req_zone`, Cloudflare

---

### 3. Contratos y Errores (Swagger) ✅

**Esquemas de error uniformes:**

Formato estándar en todos los endpoints:

```json
{
  "statusCode": 400,
  "message": "CUIT must be 11 digits",
  "error": "Bad Request",
  "requestId": "uuid-v4-aqui"
}
```

**Códigos documentados:** 400, 401, 404, 409, 429, 500

**Implementación:** `src/common/dto/error-response.dto.ts`

---

### 4. Lambda (AWS - Diseño Funcional) ✅

**Ubicación:** `src/lambda/` (excluida del build de NestJS)

**Características:**
- Función Lambda completa para adhesión de empresas
- **Conexión a MongoDB** (misma base que NestJS, NO DynamoDB)
- Autenticación Bearer Token
- Validación de datos con manejo de errores

**Variables de entorno parametrizadas:**

`serverless.yml` configurado con:
```yaml
environment:
  MONGODB_URI: ${env:MONGODB_URI}
  AUTH_TOKEN: ${env:AUTH_TOKEN}
  NODE_ENV: ${self:provider.stage}
```

**Reutilización de conexión MongoDB:**
- Conexión cacheada a nivel de módulo (warm starts)
- Handler reutiliza conexión existente si está disponible
- Reduce latencia de 500-1000ms (cold) a 50-200ms (warm)

**Idempotencia y reintentos:**
- CUIT como clave natural de idempotencia
- Reintentos automáticos (máximo 2) solo en errores 5xx/timeout
- **Garantía:** Reintentos NO duplican registros (devuelve 409 Conflict)
- Documentado en `src/lambda/README.md`

**Despliegue:**
```bash
cd src/lambda/
serverless deploy --stage dev
```

**Documentación completa:** `src/lambda/README.md`

---

### 5. Observabilidad ✅

**Logging Interceptor:**
- `requestId` único (UUID v4) en header `X-Request-Id`
- Logs estructurados: `requestId`, `route`, `method`, `duration`, `status`, `ip`, `userAgent`

**Exception Filter Global:**
- Captura todas las excepciones
- Diferencia entre errores 4xx (WARN) y 5xx (ERROR)

**Ejemplo de log:**
```json
{
  "requestId": "a1b2c3d4-uuid",
  "route": "/companies/adhesion",
  "method": "POST",
  "duration": "45ms",
  "status": 201
}
```

**Archivos:** `src/common/filters/`, `src/common/interceptors/`

---

### 6. Tests & CI ✅

**Cobertura de tests:**
- **600+ tests** (unitarios, integración, E2E)
- Servicios, DTOs, Schemas, Controladores, Middlewares, Filters, Interceptors
- **Edge cases** para casos borde de fechas y timezones

**Tests de Edge Cases:** `test/companies/companies-date-edge-cases.spec.ts`

**Casos cubiertos:**
- **Límites inclusivos:** Empresas dentro/fuera de "último mes" (rangos seguros)
- **Cambio de mes:** Validación de transiciones entre meses
- **Zona horaria UTC-3:** Cálculos respetan America/Buenos_Aires
- **Transfers:** Validación de transferencias en bordes temporales

**CI/CD Pipeline:** `.github/workflows/ci.yml`

```
Lint → Test Coverage → Build → E2E Tests (MongoDB)
```

**Características:**
- GitHub Actions con workflow completo
- MongoDB como servicio para tests E2E
- **Coverage publicado en Codecov** automáticamente
- Artifacts de build guardados
- Ejecuta en: `push` a `main`/`develop` y `pull_request` a `main`

**Comandos de tests:**
```bash
# Todos los tests
npm test

# Con cobertura
npm run test:cov

# E2E completos
npm run test:e2e

# Test específico
npm test -- companies/companies.controller.spec

# Watch mode
npm run test:watch
```

---

## Estructura del Proyecto

```
challenge/
├── src/
│   ├── main.ts                    # Bootstrap + Swagger
│   ├── app.module.ts              # Módulo raíz
│   ├── common/
│   │   ├── constants/             # Timezone (UTC-3)
│   │   ├── middleware/            # Auth + Rate limiting
│   │   ├── filters/               # Exception filter
│   │   ├── interceptors/          # Logging interceptor
│   │   ├── dto/                   # Error response DTO
│   │   └── utils/                 # Date helper
│   ├── companies/                 # Módulo Companies
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dto/
│   │   └── schemas/
│   ├── transfers/                 # Módulo Transfers
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dto/
│   │   └── schemas/
│   └── lambda/                    # AWS Lambda (excluida del build)
│       ├── handler.ts
│       ├── serverless.yml
│       ├── package.json
│       └── README.md
├── test/                          # 600+ tests
│   ├── companies/
│   │   ├── companies.controller.spec.ts
│   │   ├── companies-date-edge-cases.spec.ts
│   │   └── dto/, schemas/
│   ├── transfers/
│   ├── common/                    # filters, interceptors, middleware
│   ├── database/                  # seed validation
│   └── README.md
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI
├── .env.example                   # Variables de entorno
└── README.md
```

---

## Variables de Entorno

Archivo `.env.example`:

## Middlewares

### Autenticación (Bearer Token)
- Ruta protegida: `POST /companies/adhesion`
- Header requerido: `Authorization: Bearer <token>`
- Token configurado via `AUTH_TOKEN` en `.env`

### Rate Limiting
- Rutas protegidas: GET `/companies/with-transfers/last-month` y `/companies/joined/last-month`
- Límite: 5 requests / 30 segundos por IP
- Bloqueo: 40 segundos al exceder

---

## Timezone

**Configuración:** UTC-3 (America/Buenos_Aires)

Todos los cálculos de "último mes" respetan la zona horaria de Argentina:
- Fecha actual en UTC-3
- Cálculo de rangos de fechas
- Validación de adhesiones y transferencias

**Implementación:** `moment-timezone` con constante `TIMEZONE` en `src/common/constants/timezone.constant.ts`

---

## Autor

**Luciano Mastrangelo**  
Email: luciano.mastran@gmail.com  
GitHub: [@luciannomas](https://github.com/luciannomas)

---
