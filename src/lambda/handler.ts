import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MongoClient, Db } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

// Cargar variables de entorno desde .env en la raíz del proyecto (solo para testing local)
// En AWS Lambda, las variables se configuran en la consola
try {
  require('dotenv').config({ path: '../../.env' });
} catch (error) {
  // dotenv no disponible (normal en AWS Lambda desplegado)
}

// Configuración MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interbanking';
const VALID_TOKEN = process.env.AUTH_TOKEN || 'asdasdsafd';

// Cliente MongoDB (reutilizado entre invocaciones - warm starts)
let cachedDb: Db | null = null;
let cachedClient: MongoClient | null = null;

// Tipos
enum CompanyType {
  SME = 'sme',
  CORPORATE = 'corporate',
}

interface CompanyInput {
  cuit: string;
  businessName: string;
  companyType: CompanyType;
  adhesionDate: string;
}

interface CompanyResponse {
  id: string;
  cuit: string;
  businessName: string;
  companyType: CompanyType;
  adhesionDate: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Conecta a MongoDB (reutiliza conexión si existe)
 * 
 * ESTRATEGIA DE REUTILIZACIÓN DE CONEXIÓN:
 * - AWS Lambda mantiene el contexto de ejecución "caliente" (warm start) después
 *   de la primera invocación, permitiendo reutilizar variables globales
 * - cachedDb y cachedClient persisten entre invocaciones dentro del mismo contenedor
 * - Esto reduce latencia (no reconectar en cada request) y carga en MongoDB
 * - Si Lambda está "fría" (cold start), se crea nueva conexión automáticamente
 * 
 * BENEFICIOS:
 * - ⚡ Menor latencia en warm starts (50-200ms vs 500-1000ms)
 * - 💰 Menor costo de ejecución (menos tiempo = menos facturación)
 * - 🔒 Mejor uso de conexiones de MongoDB (evita pool exhaustion)
 */
async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    console.log('[Lambda]: Using cached MongoDB connection (warm start)');
    return cachedDb;
  }

  console.log('[Lambda]: Creating new MongoDB connection (cold start)');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  const dbName = MONGODB_URI.split('/').pop()?.split('?')[0] || 'interbanking';
  cachedClient = client;
  cachedDb = client.db(dbName);

  console.log(`[Lambda]: Connected to MongoDB database: ${dbName}`);
  return cachedDb;
}

/**
 * Lambda Handler - Company Adhesion
 * Valida y almacena la adhesión de una nueva empresa en MongoDB
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('[Lambda]: Processing company adhesion request');

  try {
    // Conectar a MongoDB
    const db = await connectToDatabase();
    const companiesCollection = db.collection('companies');

    // 1. Validar autenticación
    const authResult = validateAuthentication(event);
    if (!authResult.valid) {
      return createResponse(401, {
        statusCode: 401,
        message: authResult.message,
        error: 'Unauthorized',
      });
    }

    // 2. Parsear y validar body
    const body = parseBody(event.body);
    if (!body) {
      return createResponse(400, {
        statusCode: 400,
        message: 'Invalid request body',
        error: 'Bad Request',
      });
    }

    // 3. Validar datos de empresa
    const validationErrors = validateCompanyData(body);
    if (validationErrors.length > 0) {
      return createResponse(400, {
        statusCode: 400,
        message: validationErrors,
        error: 'Bad Request',
      });
    }

    // 4. Verificar CUIT único (IDEMPOTENCIA)
    // ESTRATEGIA DE IDEMPOTENCIA Y REINTENTOS:
    // - Si se recibe un request duplicado (mismo CUIT), devolvemos 409 Conflict
    // - AWS Lambda configurado con maximumRetryAttempts: 2 en serverless.yml
    // - Los reintentos automáticos SOLO ocurren en errores 5xx o timeouts
    // - En caso de 4xx (400, 401, 409), NO se reintenta (error del cliente)
    // - CUIT es la clave de idempotencia natural (unique index en MongoDB)
    // - Si un reintento encuentra CUIT duplicado → 409 (no se duplica el registro)
    const existingCompany = await companiesCollection.findOne({ cuit: body.cuit });
    if (existingCompany) {
      console.log(`[Lambda]: Idempotency check - CUIT ${body.cuit} already exists`);
      return createResponse(409, {
        statusCode: 409,
        message: `Company with CUIT ${body.cuit} already exists`,
        error: 'Conflict',
      });
    }

    // 5. Crear empresa
    const company = await createCompany(companiesCollection, body);

    console.log(`[Lambda]: Company created successfully - ID: ${company.id}`);

    // 6. Retornar respuesta exitosa
    return createResponse(201, {
      id: company.id,
      cuit: company.cuit,
      businessName: company.businessName,
      companyType: company.companyType,
      adhesionDate: company.adhesionDate,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    });
  } catch (error: any) {
    console.error('[Lambda]: Error processing request:', error);
    return createResponse(500, {
      statusCode: 500,
      message: 'Internal server error',
      error: error.message || 'Unknown error',
    });
  }
};

/**
 * Valida el token Bearer de autenticación
 */
function validateAuthentication(event: APIGatewayProxyEvent): {
  valid: boolean;
  message?: string;
} {
  const authHeader = event.headers?.Authorization || event.headers?.authorization;

  if (!authHeader) {
    return { valid: false, message: 'Missing authorization header' };
  }

  const token = authHeader.replace('Bearer ', '').trim();

  if (token !== VALID_TOKEN) {
    return { valid: false, message: 'Invalid authentication token' };
  }

  return { valid: true };
}

/**
 * Parsea el body del request
 */
function parseBody(body: string | null): CompanyInput | null {
  if (!body) return null;

  try {
    return JSON.parse(body);
  } catch (error) {
    console.error('[Lambda]: Error parsing body:', error);
    return null;
  }
}

/**
 * Valida los datos de la empresa
 */
function validateCompanyData(data: CompanyInput): string[] {
  const errors: string[] = [];

  // Validar CUIT (11 dígitos)
  if (!data.cuit || !/^\d{11}$/.test(data.cuit)) {
    errors.push('CUIT must be 11 digits');
  }

  // Validar businessName (3-100 caracteres)
  if (
    !data.businessName ||
    data.businessName.length < 3 ||
    data.businessName.length > 100
  ) {
    errors.push('Business name must be between 3 and 100 characters');
  }

  // Validar companyType
  if (
    !data.companyType ||
    !Object.values(CompanyType).includes(data.companyType)
  ) {
    errors.push('Company type must be "sme" or "corporate"');
  }

  // Validar adhesionDate (formato YYYY-MM-DD)
  if (!data.adhesionDate || !/^\d{4}-\d{2}-\d{2}$/.test(data.adhesionDate)) {
    errors.push('Adhesion date must be in format YYYY-MM-DD (e.g., 2025-11-14)');
  }

  return errors;
}

/**
 * Crea una nueva empresa en MongoDB
 */
async function createCompany(collection: any, data: CompanyInput): Promise<CompanyResponse> {
  const now = new Date().toISOString();
  const id = uuidv4();

  const company = {
    _id: id, // MongoDB usa _id como primary key
    cuit: data.cuit,
    businessName: data.businessName,
    companyType: data.companyType,
    adhesionDate: data.adhesionDate,
    createdAt: now,
    updatedAt: now,
  };

  await collection.insertOne(company);

  return {
    id: company._id,
    cuit: company.cuit,
    businessName: company.businessName,
    companyType: company.companyType,
    adhesionDate: company.adhesionDate,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

/**
 * Crea una respuesta HTTP estándar
 */
function createResponse(
  statusCode: number,
  body: Record<string, any>
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

