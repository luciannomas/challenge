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

#### 2. Configurar variables de entorno (opcional)
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Las variables por defecto funcionan para desarrollo local
# MONGODB_URI=mongodb://localhost:27017/interbanking
# AUTH_TOKEN=asdasdsafd (para Lambda)
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
- **Token requerido**: `asdasdsafd` (mock para testing)
- **Header**: `Authorization: Bearer asdasdsafd`

Este sistema de validación es común en operaciones sensibles como adhesión de empresas.

### Middleware de Rate Limiting
- **Rutas protegidas**: 
  - `GET /companies/with-transfers/last-month`
  - `GET /companies/joined/last-month`
- **Propósito**: Evitar sobrecarga del servidor por exceso de consultas
- **Límite**: Máximo 5 requests cada 30 segundos por IP
- **Bloqueo**: 10 segundos si se excede el límite

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

