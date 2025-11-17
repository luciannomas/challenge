# AWS Lambda - Company Adhesion Function

## Descripción

Función Lambda de AWS que procesa solicitudes de adhesión de empresas al sistema interbancario. Valida datos, verifica unicidad de CUIT, y almacena registros en MongoDB.

Es el equivalente serverless del endpoint `POST /companies/adhesion`.

---

## Arquitectura AWS

```
Cliente --> API Gateway --> Lambda --> MongoDB
```

**Componentes:**
- **API Gateway**: Recibe requests HTTP y los envía a Lambda
- **Lambda**: Valida datos y ejecuta lógica de negocio
- **MongoDB**: Almacena empresas (misma base que usa NestJS)

---

## Input esperado

Evento de API Gateway con el siguiente formato:

```json
{
  "httpMethod": "POST",
  "headers": {
    "Authorization": "Bearer asdasdsafd",
    "Content-Type": "application/json"
  },
  "body": "{\"cuit\":\"20333444555\",\"businessName\":\"Tech Solutions SA\",\"companyType\":\"sme\",\"adhesionDate\":\"2025-11-14\"}"
}
```

**Body parseado:**
```json
{
  "cuit": "20333444555",
  "businessName": "Tech Solutions SA",
  "companyType": "sme",
  "adhesionDate": "2025-11-14"
}
```

**Validaciones:**
- `cuit`: Exactamente 11 dígitos numéricos
- `businessName`: Entre 3 y 100 caracteres
- `companyType`: "sme" o "corporate"
- `adhesionDate`: Formato YYYY-MM-DD
- `Authorization`: Bearer token válido

---

## Output esperado

### Respuesta exitosa (201)

```json
{
  "statusCode": 201,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": "{\"id\":\"550e8400-e29b-41d4-a716-446655440000\",\"cuit\":\"20333444555\",\"businessName\":\"Tech Solutions SA\",\"companyType\":\"sme\",\"adhesionDate\":\"2025-11-14\",\"createdAt\":\"2025-11-14T21:30:00.000Z\",\"updatedAt\":\"2025-11-14T21:30:00.000Z\"}"
}
```

### Error de validación (400)

```json
{
  "statusCode": 400,
  "body": "{\"statusCode\":400,\"message\":[\"CUIT must be 11 digits\"],\"error\":\"Bad Request\"}"
}
```

### Error de CUIT duplicado (409)

```json
{
  "statusCode": 409,
  "body": "{\"statusCode\":409,\"message\":\"Company with CUIT 20333444555 already exists\",\"error\":\"Conflict\"}"
}
```

### Error de autenticación (401)

```json
{
  "statusCode": 401,
  "body": "{\"statusCode\":401,\"message\":\"Invalid authentication token\",\"error\":\"Unauthorized\"}"
}
```

---

## Integración con el sistema actual

La Lambda se conecta a la **misma base de datos MongoDB** que usa NestJS:

**Flujo:**
- `POST /adhesion` → API Gateway → Lambda → MongoDB
- `GET /companies` → NestJS → MongoDB (misma base)

**Ventajas:**
- Una sola fuente de datos (MongoDB)
- Consistencia total entre sistemas
- NestJS sigue funcionando sin cambios
- Lambda serverless solo para adhesiones
- Reutilización de conexiones MongoDB (warm starts)

**Configuración AWS Lambda:**
- Variable de entorno: `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/interbanking`
- Variable de entorno: `AUTH_TOKEN=asdasdsafd`
- Runtime: Node.js 18.x
- Handler: `dist/handler.handler`
- Memory: 256 MB
- Timeout: 10 segundos

---

## Configuración para testing local

### 1. Crear archivo `.env` en la raíz del proyecto

```bash
# En la raíz del proyecto (no en src/lambda/)
cp .env.example .env

# Editar con tus valores
MONGODB_URI=mongodb://localhost:27017/interbanking
AUTH_TOKEN=asdasdsafd
```

### 2. Instalar dependencias (en src/lambda/)

```bash
cd src/lambda
npm install
```

### 3. Compilar

```bash
npm run build
```

La Lambda cargará automáticamente las variables del `.env` ubicado en la raíz del proyecto. En AWS, las variables se configuran en la consola de Lambda.

---

## Notas

- No requiere despliegue (solo diseño funcional)
- Usa la misma base MongoDB que el sistema NestJS actual
- Token de prueba: `asdasdsafd`
- Formato de fechas: ISO 8601 (UTC)
- Conexión MongoDB con caché para mejorar rendimiento
- Variables de entorno cargadas desde `.env` en la raíz del proyecto (para testing local)
- En AWS Lambda, las variables se configuran en la consola (no usa `.env`)

