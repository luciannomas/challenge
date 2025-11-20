# AWS Lambda - Company Adhesion Function

## Descripción

Función Lambda de AWS que procesa solicitudes de adhesión de empresas. Valida datos, verifica unicidad de CUIT, y almacena registros en MongoDB (misma base que usa NestJS).

Equivalente serverless del endpoint `POST /companies/adhesion`.

---

## Arquitectura

```
Cliente --> API Gateway --> Lambda --> MongoDB (compartida con NestJS)
```

**Componentes:**
- API Gateway: Recibe requests HTTP POST `/adhesion`
- Lambda: Valida datos y ejecuta lógica de negocio
- MongoDB: Base de datos única para Lambda y NestJS
- CloudWatch: Logs y monitoreo

---

## Input/Output

### Request Body
```json
{
  "cuit": "20333444555",
  "businessName": "Tech Solutions SA",
  "companyType": "sme",
  "adhesionDate": "2025-11-14"
}
```

**Validaciones:**
- `cuit`: 11 dígitos numéricos
- `businessName`: 3-100 caracteres
- `companyType`: "sme" o "corporate"
- `adhesionDate`: Formato YYYY-MM-DD
- `Authorization`: Bearer token válido

### Response Exitoso (201)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "cuit": "20333444555",
  "businessName": "Tech Solutions SA",
  "companyType": "sme",
  "adhesionDate": "2025-11-14",
  "createdAt": "2025-11-14T21:30:00.000Z",
  "updatedAt": "2025-11-14T21:30:00.000Z"
}
```

### Errores
- **400** Bad Request: Validación fallida
- **401** Unauthorized: Token inválido o faltante
- **409** Conflict: CUIT duplicado
- **500** Internal Server Error

Ver archivos `output-*.json` para ejemplos completos.

---

## Despliegue con Serverless Framework

### Archivo serverless.yml

Configuración completa incluida con:
- Variables de entorno parametrizadas (`MONGODB_URI`, `AUTH_TOKEN`)
- API Gateway con CORS
- CloudWatch Logs (retención 14 días)
- Reintentos automáticos (máximo 2)
- Reserved concurrency (10)

### Variables de Entorno

**Configuración:**
```yaml
environment:
  MONGODB_URI: ${env:MONGODB_URI}
  AUTH_TOKEN: ${env:AUTH_TOKEN}
  NODE_ENV: ${self:provider.stage}
```

**Despliegue:**
```bash
serverless deploy              # Deploy a dev
serverless deploy --stage prod # Producción
serverless offline start       # Testing local
```

---

## Reutilización de Conexión MongoDB

### Estrategia de Caché

El handler implementa caché de conexiones mediante variables globales que persisten entre invocaciones:

```typescript
let cachedDb: Db | null = null;
let cachedClient: MongoClient | null = null;
```

### Cold Start vs Warm Start

| Tipo | Conexión | Latencia |
|------|----------|----------|
| Cold Start | Nueva | ~500-1000ms |
| Warm Start | Reutilizada | ~50-200ms |

**Beneficios:**
- Latencia reducida (5-10x más rápido en warm starts)
- Menor costo de ejecución
- Mejor rendimiento de MongoDB

AWS Lambda mantiene el contexto "caliente" por ~15-20 minutos después de la última invocación.

---

## Políticas de Reintento e Idempotencia

### Configuración de Reintentos

**En serverless.yml:**
```yaml
maximumRetryAttempts: 2  # Máximo 2 reintentos
```

**Cuándo se reintentan:**
- Errores 5xx (Internal Server Error, etc.)
- Timeouts (función no responde a tiempo)
- **NO se reintentan errores 4xx** (Bad Request, Unauthorized, Conflict)

### Idempotencia

**CUIT como clave de idempotencia:**

El handler verifica existencia de CUIT antes de insertar. Si ya existe, devuelve 409 Conflict.

**Garantías:**
- Reintentos automáticos NO duplican registros
- Mismo CUIT siempre devuelve 409 en requests subsecuentes
- Índice único en MongoDB previene duplicados

**Casos de uso:**

1. **Request exitoso:**
   ```
   Request → Lambda → MongoDB → 201 Created
   ```

2. **Error transitorio con reintento:**
   ```
   Request 1 → Lambda → MongoDB timeout → 500 Error
   Request 2 (reintento) → Lambda → CUIT existe → 409 Conflict (no duplica)
   ```

3. **CUIT duplicado:**
   ```
   Request 1 → Lambda → 201 Created
   Request 2 (mismo CUIT) → Lambda → 409 Conflict (no duplica)
   ```

4. **Validación fallida (NO se reintenta):**
   ```
   Request → Lambda → Validación CUIT inválido → 400 Bad Request (FIN)
   ```

---

## Integración con el Sistema

**Flujo:**
- `POST /adhesion` → API Gateway → Lambda → MongoDB
- `GET /companies` → NestJS API → MongoDB (misma base)

**Ventajas:**
- Una sola base de datos (MongoDB)
- Consistencia total entre sistemas
- Lambda serverless solo para adhesiones
- NestJS sigue funcionando sin cambios

---

## Testing Local

### 1. Configurar variables de entorno

Crear `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Editar `.env`:
```
MONGODB_URI=mongodb://localhost:27017/interbanking
AUTH_TOKEN=Bearer_mK7pL9xR4tN2wQ8vZ3jH6yF5sA1cE0bD
```

### 2. Instalar dependencias

```bash
cd src/lambda
npm install
```

### 3. Compilar

```bash
npm run build
```

### 4. Testing local con Serverless Offline

```bash
serverless offline start
```

---

## Configuración AWS Lambda

**Runtime:** Node.js 18.x  
**Handler:** `handler.handler`  
**Memory:** 512 MB  
**Timeout:** 30 segundos  
**Variables de entorno:** `MONGODB_URI`, `AUTH_TOKEN`, `NODE_ENV`  
**Reintentos:** Máximo 2 intentos automáticos  
**Concurrency:** 10 (control de rate limiting)  

---

## Notas

- No requiere despliegue (diseño funcional para el challenge)
- Código listo para producción con `serverless.yml` completo
- Usa la misma base MongoDB que NestJS
- Token parametrizado via variables de entorno
- Reutilización de conexión MongoDB implementada
- Idempotencia garantizada via CUIT único
- Reintentos automáticos NO duplican registros
