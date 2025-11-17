# Tests - Companies Module

## Overview

This directory contains E2E (End-to-End) and module tests for the Companies microservice.

## Test Structure

```
test/
├── companies/
│   ├── dto/
│   │   ├── create-company.dto.spec.ts                      # Validation tests
│   │   ├── company-adhesion-response.dto.spec.ts           # Response DTO tests
│   │   ├── company-joined-response.dto.spec.ts             # Response DTO tests
│   │   ├── company-with-transfers.dto.spec.ts              # Transfer DTO tests
│   │   ├── paginated-companies-joined-response.dto.spec.ts # Pagination tests
│   │   └── paginated-transfers-response.dto.spec.ts        # Pagination tests
│   ├── schemas/
│   │   └── company.schema.spec.ts    # Schema definition and validation tests
│   ├── companies.controller.spec.ts  # E2E tests for Companies Controller
│   ├── companies.service.spec.ts     # Unit tests for Companies Service
│   └── companies.module.spec.ts      # Module integration tests
├── transfers/
│   ├── dto/
│   │   ├── create-transfer.dto.spec.ts        # Validation tests
│   │   └── transfer-response.dto.spec.ts      # Response DTO tests
│   ├── schemas/
│   │   └── transfer.schema.spec.ts   # Schema definition and validation tests
│   ├── transfers.controller.spec.ts  # E2E tests for Transfers Controller
│   ├── transfers.service.spec.ts     # Unit tests for Transfers Service
│   └── transfers.module.spec.ts      # Module integration tests for Transfers
├── common/
│   ├── types/
│   │   └── company.types.spec.ts     # Enum tests
│   ├── interfaces/
│   │   ├── company.interface.spec.ts # Interface tests
│   │   └── transfer.interface.spec.ts # Interface tests
│   ├── constants/
│   │   └── timezone.constant.spec.ts # Constant tests
│   ├── utils/
│   │   └── date.helper.spec.ts       # Date utility tests
│   ├── middleware/
│   │   ├── auth.middleware.spec.ts   # Auth middleware tests
│   │   └── rate-limit.middleware.spec.ts # Rate limit middleware tests
│   └── interceptors/
│       └── timezone.interceptor.spec.ts # Timezone interceptor tests
├── app.module.spec.ts                # Integration tests for AppModule
├── main.spec.ts                      # Bootstrap configuration tests
├── jest-e2e.json                     # Jest configuration for E2E tests
└── README.md                         # This file
```

## Running Tests

### All E2E Tests
```bash
npm run test:e2e
```

### Service Unit Tests
```bash
npm test -- companies/companies.service.spec
```

### Module Tests
```bash
npm test -- companies/companies.module.spec
```

### Controller E2E Tests
```bash
npm test -- companies/companies.controller.spec
```

### DTO Tests
```bash
# All DTO tests
npm test -- companies/dto

# Specific DTO tests
npm test -- companies/dto/create-company.dto.spec
npm test -- companies/dto/company-adhesion-response.dto.spec
npm test -- companies/dto/paginated-companies-joined-response.dto.spec
```

### Schema Tests
```bash
# Schema tests
npm test -- companies/schemas/company.schema.spec
```

### Transfers Module Tests
```bash
# Transfers module tests
npm test -- transfers/transfers.module.spec
```

### Transfers Controller E2E Tests
```bash
# Transfers controller E2E tests
npm test -- transfers/transfers.controller.spec
```

### Transfers Service Unit Tests
```bash
# Transfers service unit tests
npm test -- transfers/transfers.service.spec
```

### Transfers DTO Tests
```bash
# All DTO tests
npm test -- transfers/dto

# Specific DTO tests
npm test -- transfers/dto/create-transfer.dto.spec
npm test -- transfers/dto/transfer-response.dto.spec
```

### Transfers Schema Tests
```bash
# Schema tests
npm test -- transfers/schemas/transfer.schema.spec
```

### App Module Tests
```bash
# App module integration tests
npm test -- app.module.spec
```

### Main Bootstrap Tests
```bash
# Bootstrap configuration tests
npm test -- main.spec
```

### Common Module Tests
```bash
# All common module tests
npm test -- common

# Types tests
npm test -- common/types/company.types.spec

# Interfaces tests
npm test -- common/interfaces/company.interface.spec
npm test -- common/interfaces/transfer.interface.spec

# Constants tests
npm test -- common/constants/timezone.constant.spec

# Utils tests
npm test -- common/utils/date.helper.spec

# Middleware tests
npm test -- common/middleware/auth.middleware.spec
npm test -- common/middleware/rate-limit.middleware.spec

# Interceptors tests
npm test -- common/interceptors/timezone.interceptor.spec
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:cov
```

## Test Coverage

### DTOs (Unit Tests)

#### CreateCompanyDto (30 tests)
- ✅ **CUIT Validation**
  - Accepts valid 11-digit CUIT
  - Rejects CUIT shorter/longer than 11 digits
  - Rejects non-numeric CUIT
  - Rejects empty CUIT
  
- ✅ **BusinessName Validation**
  - Accepts 3-100 characters
  - Rejects < 3 characters
  - Rejects > 100 characters
  - Validates boundaries (exactly 3, exactly 100)
  
- ✅ **CompanyType Validation**
  - Accepts SME and Corporate
  - Rejects invalid types
  
- ✅ **AdhesionDate Validation**
  - Accepts YYYY-MM-DD format
  - Rejects DD-MM-YYYY, MM/DD/YYYY formats
  - Accepts past and future dates

#### Response DTOs (28 tests)
- ✅ **CompanyAdhesionResponseDto**: Constructor, field filtering (no createdAt/updatedAt)
- ✅ **CompanyJoinedResponseDto**: Constructor, required fields only
- ✅ **TransferWithCompanyDto**: Constructor, amount handling, no transferDate
- ✅ **PaginatedCompaniesJoinedResponseDto**: Pagination meta, data array, multiple pages
- ✅ **PaginatedTransfersResponseDto**: Pagination logic, calculations, limits

---

### Schemas (Unit Tests)

#### CompanySchema (40 tests)
- ✅ **Schema Definition**
  - Schema existence and structure
  - Collection name: `companies`
  - Timestamps enabled (createdAt, updatedAt)
  
- ✅ **Field Properties**
  - cuit: required, unique, indexed
  - businessName: required
  - companyType: required, enum (SME, CORPORATE)
  - adhesionDate: required, indexed, descending order
  - createdAt: automatic timestamp
  - updatedAt: automatic timestamp
  
- ✅ **Field Types**
  - All string fields validated as String type
  - All date fields validated as Date type
  - Enum values validated for companyType
  
- ✅ **Indexes**
  - Unique index on cuit (ascending)
  - Descending index on adhesionDate
  - Minimum 2 indexes verified
  
- ✅ **Enum Validation**
  - Accepts SME company type
  - Accepts CORPORATE company type
  - Exactly 2 enum values
  
- ✅ **Required Field Validation**
  - Validates presence of: cuit, businessName, companyType, adhesionDate
  - Timestamps (createdAt, updatedAt) are NOT required (auto-generated)
  
- ✅ **Schema Validation**
  - Validates complete documents
  - Rejects documents without required fields
  - Rejects invalid companyType values
  - Validates both SME and Corporate types
  
- ✅ **Document Creation**
  - Creates documents with all properties
  - Sets timestamp fields correctly

---

### Companies Service (Unit Tests)

#### createCompany
- ✅ **Success Cases**
  - Creates SME companies successfully
  - Creates Corporate companies successfully
  - Parses adhesionDate in UTC-3 timezone
  - Sets adhesionDate time to current time (not 00:00:00)
  
- ✅ **Validation & Errors**
  - Throws ConflictException for duplicate CUIT
  - Handles database errors gracefully

#### getCompaniesWithTransfersLastMonth
- ✅ **Pagination**
  - Returns paginated transfers with default pagination (page=1, limit=10)
  - Returns paginated transfers with custom page and limit
  - Calculates skip correctly: (page-1) * limit
  
- ✅ **Data Filtering**
  - Filters transfers from last month only
  - Returns empty array when no transfers found
  - Handles transfers without company (null check)
  
- ✅ **Response Structure**
  - Returns correct DTO without transferDate
  - Includes: id, companyId, amount, debitAccount, creditAccount

#### getCompaniesJoinedLastMonth
- ✅ **Pagination**
  - Returns paginated companies with default pagination
  - Returns paginated companies with custom page and limit
  - Calculates skip correctly
  
- ✅ **Data Filtering**
  - Filters companies from last month only
  - Returns empty array when no companies found
  - Sorts companies by adhesionDate descending
  
- ✅ **Response Structure**
  - Returns correct DTO with required fields only
  - Includes: id, cuit, businessName, companyType, adhesionDate

#### Error Handling
- ✅ Handles database errors in all methods
- ✅ Proper error propagation

#### Timezone
- ✅ Uses configured timezone (UTC-3) for date calculations

---

### Companies Controller (E2E)

#### POST /companies/adhesion
- ✅ **Authentication**
  - Rejects requests without Authorization header
  - Rejects requests with invalid token format
  - Rejects requests with invalid token
  
- ✅ **Validation**
  - Validates CUIT (must be 11 digits)
  - Validates businessName (3-100 characters)
  - Validates companyType (sme or corporate)
  - Validates adhesionDate (YYYY-MM-DD format)
  - Validates required fields
  
- ✅ **Success Cases**
  - Creates SME companies successfully
  - Creates Corporate companies successfully
  - Rejects duplicate CUITs (409 Conflict)
  - Returns correct response structure (no createdAt/updatedAt)

#### GET /companies/with-transfers/last-month
- ✅ **Pagination**
  - Returns paginated results with default values (page=1, limit=10)
  - Accepts custom page and limit parameters
  - Enforces maximum limit of 100
  - Handles invalid page numbers gracefully
  
- ✅ **Response Structure**
  - Returns transfers without transferDate field
  - Includes: id, companyId, amount, debitAccount, creditAccount
  
- ✅ **Rate Limiting**
  - Blocks after 5 requests in 30 seconds (429 Too Many Requests)
  - Shows remaining time in error message

#### GET /companies/joined/last-month
- ✅ **Pagination**
  - Returns paginated results with default values
  - Accepts custom page and limit parameters
  
- ✅ **Response Structure**
  - Returns only required fields: id, cuit, businessName, companyType, adhesionDate
  - Excludes createdAt and updatedAt
  
- ✅ **Rate Limiting**
  - Blocks after 5 requests in 30 seconds

#### Timezone Configuration
- ✅ Returns dates in UTC-3 timezone format (-03:00)

### Companies Module (Integration Tests)

- ✅ Module initialization
- ✅ Controller and Service registration
- ✅ Middleware configuration (Auth, Rate Limiting)
- ✅ Method availability verification

---

### Transfers DTOs (Unit Tests)

#### CreateTransferDto (48 tests)
- ✅ **Valid DTO (5 tests)**
  - Validates with all valid fields
  - Accepts ISO date format (YYYY-MM-DD, ISO 8601)
  - Accepts large amounts (9999999.99)
  - Accepts small amounts (0.01)
  - Accepts long account numbers (20+ digits)
  
- ✅ **CompanyId Validation (3 tests)**
  - Rejects empty companyId
  - Rejects missing companyId
  - Rejects non-string companyId
  
- ✅ **Amount Validation (4 tests)**
  - Rejects missing amount
  - Rejects negative amount
  - Rejects zero amount
  - Rejects non-number amount
  
- ✅ **DebitAccount Validation (3 tests)**
  - Rejects empty debitAccount
  - Rejects missing debitAccount
  - Rejects non-string debitAccount
  
- ✅ **CreditAccount Validation (3 tests)**
  - Rejects empty creditAccount
  - Rejects missing creditAccount
  - Rejects non-string creditAccount
  
- ✅ **TransferDate Validation (8 tests)**
  - Rejects missing transferDate
  - Rejects empty transferDate
  - Rejects invalid formats (DD/MM/YYYY, MM/DD/YYYY)
  - Rejects invalid date string
  - Accepts future dates
  - Accepts past dates
  
- ✅ **Multiple Field Validation (2 tests)**
  - Reports all missing required fields
  - Reports multiple validation errors
  
- ✅ **Edge Cases (3 tests)**
  - Handles decimal amounts correctly
  - Handles very precise decimals (999.999)
  - Handles minimum positive amount (0.000001)

#### TransferResponseDto (33 tests)
- ✅ **Constructor (3 tests)**
  - Creates instance with all properties
  - Creates instance with partial properties
  - Handles empty object
  
- ✅ **Properties (2 tests)**
  - Has all required properties
  - Has correct property types
  
- ✅ **Amount Handling (4 tests)**
  - Handles large amounts (9999999.99)
  - Handles small amounts (0.01)
  - Handles integer amounts
  - Preserves decimal precision
  
- ✅ **Account Numbers (3 tests)**
  - Handles standard account numbers (16 digits)
  - Handles long account numbers (20+ digits)
  - Handles short account numbers
  
- ✅ **Date Handling (4 tests)**
  - Handles transferDate correctly
  - Handles createdAt correctly
  - Handles updatedAt correctly
  - Handles different date formats
  
- ✅ **ID Handling (2 tests)**
  - Handles MongoDB ObjectId format (24 chars)
  - Handles companyId as string
  
- ✅ **Edge Cases (4 tests)**
  - Handles zero amount
  - Handles same debit and credit accounts
  - Handles same createdAt and updatedAt
  - Creates DTO from another DTO
  
- ✅ **Object Structure (2 tests)**
  - Only has expected properties (8 total)
  - Does not add extra properties

---

### Transfers Schema (Unit Tests)

#### TransferSchema (53 tests)
- ✅ **Schema Definition**
  - Schema existence and structure
  - Collection name: `transfers`
  - Timestamps enabled (createdAt, updatedAt)
  
- ✅ **Field Properties**
  - companyId: required, ObjectId, indexed, references Company
  - amount: required, Number
  - debitAccount: required, String
  - creditAccount: required, String
  - transferDate: required, Date, indexed
  - createdAt: automatic timestamp
  - updatedAt: automatic timestamp
  
- ✅ **Field Types**
  - All string fields validated as String type
  - Amount field as Number type
  - Date fields validated as Date type
  - CompanyId as ObjectId type
  
- ✅ **References**
  - companyId references Company model
  - companyId as ObjectId for foreign key
  - Verifies companyId accepts ObjectId values
  
- ✅ **Indexes**
  - Index on companyId
  - Descending index on transferDate
  - Compound index on (companyId, transferDate)
  - Minimum 3 indexes verified
  
- ✅ **Required Field Validation**
  - Validates presence of: companyId, amount, debitAccount, creditAccount, transferDate
  - Timestamps (createdAt, updatedAt) are NOT required (auto-generated)
  
- ✅ **Schema Validation**
  - Validates complete documents
  - Rejects documents without required fields
  - Validates large amounts (9999999.99)
  - Validates small amounts (0.01)
  - Validates past and future dates
  
- ✅ **Document Creation**
  - Creates documents with all properties
  - Sets timestamp fields correctly
  - Handles decimal amounts
  - Handles long account numbers (20+ digits)
  - Preserves ObjectId reference type
  
- ✅ **Amount Handling**
  - Handles integer amounts
  - Handles negative amounts (schema level)
  - Handles zero amount
  
- ✅ **Date Handling**
  - Accepts Date objects
  - Accepts ISO date strings
  - Handles different date formats

---

### Transfers Controller (E2E)

#### POST /transfers
- ✅ **Success Cases**
  - Creates transfers successfully
  - Handles large amounts (9999999.99)
  - Handles small amounts (0.01)
  
- ✅ **Validation Errors**
  - Rejects missing companyId, amount, debitAccount, creditAccount, transferDate
  - Rejects negative amounts
  - Rejects zero amounts
  - Rejects empty fields
  - Rejects invalid date formats (DD/MM/YYYY)
  
- ✅ **Type Validation**
  - Validates companyId as string
  - Validates amount as number
  - Validates account numbers as strings
  - Rejects incorrect types

#### GET /transfers/last-month
- ✅ **Success Cases**
  - Returns transfers from last month
  - Returns correct response structure
  - Validates amounts are positive numbers
  - Validates dates are valid
  - Filters transfers within last month range
  
- ✅ **Response Format**
  - Returns array (even if empty)
  - All fields have correct types
  - Account numbers are strings
  - CompanyId is string

#### Timezone Configuration
- ✅ Returns dates in UTC-3 format (-03:00)
- ✅ Handles dates across timezone boundaries

#### Edge Cases
- ✅ Long account numbers (20+ digits)
- ✅ Decimal amounts (999.99)
- ✅ Future dates in transferDate

---

### Transfers Service (Unit Tests)

#### createTransfer
- ✅ **Success Cases**
  - Creates transfers successfully
  - Converts transferDate string to Date object
  - Returns TransferResponseDto with all required fields
  - Handles large amounts (9999999.99)
  - Handles small amounts (0.01)
  - Handles different account formats
  
- ✅ **Data Transformation**
  - Converts companyId to string in response
  - Converts id (ObjectId) to string in response
  - Preserves decimal precision in amounts
  - Correctly transforms ObjectId to string
  
- ✅ **Error Handling**
  - Handles database errors
  - Propagates save errors
  - Handles unexpected errors

#### getTransfersLastMonth
- ✅ **Success Cases**
  - Returns transfers from last month
  - Calls find with correct date filter (transferDate >= one month ago)
  - Sorts transfers by transferDate descending
  - Returns array of TransferResponseDto
  - Returns empty array when no transfers found
  
- ✅ **Data Transformation**
  - Converts all ids to strings
  - Preserves transfer amounts
  - Preserves account numbers
  - Preserves transfer dates
  
- ✅ **Date Filtering**
  - Filters transfers within last month
  - Uses current date for calculating one month ago
  - Handles date at month boundary
  - Correctly parses ISO date strings
  
- ✅ **Multiple Results**
  - Handles empty database gracefully
  - Handles single transfer correctly
  - Handles multiple transfers correctly (10+)
  
- ✅ **Error Handling**
  - Handles database query errors
  - Handles null/undefined in find results

---

### Transfers Module (Integration Tests)

#### Module Setup (9 tests)
- ✅ **Module Initialization**
  - Module compilation
  - TransfersModule definition
  
- ✅ **Controllers**
  - TransfersController registration
  - Controller methods: createTransfer, getTransfersLastMonth
  
- ✅ **Providers**
  - TransfersService registration
  - Service methods: createTransfer, getTransfersLastMonth
  
- ✅ **Dependencies**
  - Service injection into controller
  - Service export verification
  
- ✅ **Module Configuration**
  - Module metadata validation
  - MongoDB connection initialization

---

### App Module (Integration Tests)

#### AppModule (16 tests)
- ✅ **Module Initialization (2 tests)**
  - Module compilation
  - AppModule definition
  
- ✅ **Module Imports (3 tests)**
  - ConfigModule imported
  - CompaniesModule imported
  - TransfersModule imported
  
- ✅ **Module Configuration (2 tests)**
  - ConfigModule configured as global
  - MongoDB connection established
  
- ✅ **Module Dependencies (2 tests)**
  - All required modules provided
  - Correct module structure
  
- ✅ **Environment Configuration (2 tests)**
  - Default MongoDB URI fallback
  - Custom MongoDB URI from environment
  
- ✅ **Module Integration (3 tests)**
  - CompaniesModule integration
  - TransfersModule integration
  - All modules working together

---

### Main Bootstrap (Integration Tests)

#### Bootstrap Configuration (35 tests)
- ✅ **Application Bootstrap (2 tests)**
  - Application creation successful
  - INestApplication instance verified
  
- ✅ **Timezone Configuration (4 tests)**
  - Timezone set to America/Buenos_Aires
  - Correct timezone offset (-03:00 or -02:00)
  - UTC-3 timezone verified
  - Time formatting correct (DD/MM/YYYY HH:mm:ss)
  
- ✅ **Global Pipes (4 tests)**
  - ValidationPipe configured
  - Whitelist option enabled
  - ForbidNonWhitelisted option enabled
  - Transform option enabled
  
- ✅ **Environment Variables (3 tests)**
  - PORT environment variable support
  - Default port 3000 fallback
  - MONGODB_URI environment variable support
  
- ✅ **Swagger Configuration (10 tests)**
  - Swagger title configured
  - Swagger description configured
  - Swagger version configured
  - Companies tag configured
  - Transfers tag configured
  - Bearer authentication configured
  - Server URL configured
  - Swagger path configured (api/docs)
  - Custom UI settings configured
  - Favicon and CSS customization
  
- ✅ **Logger Configuration (4 tests)**
  - Timezone configuration logged
  - Current time logged
  - Application running message logged
  - Swagger documentation URL logged
  
- ✅ **Application Configuration (3 tests)**
  - ValidationPipe options verified
  - Timezone constant usage
  - Moment timezone configuration
  
- ✅ **Bootstrap Function Behavior (4 tests)**
  - NestJS application created
  - Global pipes configured before start
  - Swagger setup before start
  - Startup messages logged
  
- ✅ **Integration (3 tests)**
  - All modules loaded
  - Ready to handle requests
  - HTTP server configured

---

### Common Module (Unit Tests)

#### Company Types (20 tests)
- ✅ **CompanyType Enum (6 tests)**
  - Has SME and CORPORATE values
  - Exactly 2 values
  - All expected values present
  - Accessible by key
  - String enum type

- ✅ **CompanyStatus Enum (7 tests)**
  - Has ACTIVE, INACTIVE, PENDING values
  - Exactly 3 values
  - All expected values present
  - Accessible by key
  - String enum type

- ✅ **Enum Usage (7 tests)**
  - Type annotations support
  - String value comparison
  - Switch statements compatibility
  - Object usage

#### Company Interface (12 tests)
- ✅ **Interface Structure (3 tests)**
  - All required properties
  - SME company type
  - CORPORATE company type

- ✅ **Property Types (6 tests)**
  - cuit as string
  - businessName as string
  - companyType as enum
  - adhesionDate, createdAt, updatedAt as Date

- ✅ **Interface Usage (3 tests)**
  - Function parameters
  - Array handling
  - Partial updates

#### Transfer Interface (11 tests)
- ✅ **Interface Structure (3 tests)**
  - All required properties
  - Large amounts handling
  - Small amounts handling

- ✅ **Property Types (7 tests)**
  - companyId as string
  - amount as number
  - debitAccount/creditAccount as string
  - transferDate, createdAt, updatedAt as Date

- ✅ **Interface Usage (5 tests)**
  - Function parameters
  - Array handling
  - Partial updates
  - Decimal amounts
  - Long account numbers

#### Timezone Constant (16 tests)
- ✅ **Constant Structure (4 tests)**
  - Defined and has NAME/DESCRIPTION
  - Object type

- ✅ **NAME Property (4 tests)**
  - America/Buenos_Aires value
  - String type
  - Valid IANA identifier
  - Not empty

- ✅ **DESCRIPTION Property (4 tests)**
  - UTC-3 value
  - Contains UTC
  - Not empty

- ✅ **Immutability (2 tests)**
  - Readonly enforcement (TypeScript compile-time)
  - Maintains consistent values

- ✅ **Usage (4 tests)**
  - Configuration usage
  - Moment-timezone integration
  - Function parameters
  - Destructuring

- ✅ **Timezone Information (3 tests)**
  - Argentina timezone representation
  - UTC-3 offset
  - Consistent naming

- ✅ **Export Type (3 tests)**
  - Exported as const
  - Correct property count
  - No additional properties

#### Date Helper (31 tests)
- ✅ **now() (3 tests)**
  - Returns current date
  - Close to current time
  - Uses configured timezone

- ✅ **oneMonthAgo() (4 tests)**
  - Returns date one month ago
  - Approximately 30 days before
  - Before current date
  - Uses configured timezone

- ✅ **parse() (4 tests)**
  - Parses ISO date strings
  - Handles date with time
  - Different date formats
  - Uses configured timezone

- ✅ **format() (5 tests)**
  - Default format (DD/MM/YYYY HH:mm:ss)
  - Custom format support
  - Time formatting
  - Different format patterns
  - Uses configured timezone

- ✅ **currentTimeFormatted() (4 tests)**
  - Returns formatted current time
  - String type
  - Close to current time
  - Uses configured timezone

- ✅ **Static Class Behavior (2 tests)**
  - Not instantiable
  - All methods static

- ✅ **Timezone Consistency (2 tests)**
  - Same timezone across methods
  - Consistent formatting

- ✅ **Edge Cases (4 tests)**
  - Leap years
  - End/beginning of month/year

#### Auth Middleware (37 tests)
- ✅ **Valid Authentication (3 tests)**
  - Calls next() with valid token
  - No exception with valid token
  - Bearer with correct token

- ✅ **Missing Authorization Header (3 tests)**
  - Throws UnauthorizedException
  - Correct error message
  - Doesn't call next()

- ✅ **Invalid Authorization Format (4 tests)**
  - Rejects non-Bearer formats
  - Rejects missing Bearer keyword
  - Rejects wrong structure
  - Doesn't call next()

- ✅ **Missing Token (3 tests)**
  - Throws when token not provided
  - Correct error message
  - Doesn't call next()

- ✅ **Invalid Token (4 tests)**
  - Throws with invalid token
  - Correct error message
  - Doesn't call next()
  - Rejects similar tokens

- ✅ **Case Sensitivity (2 tests)**
  - Bearer keyword case-sensitive
  - Token case-sensitive

- ✅ **Whitespace Handling (4 tests)**
  - Single space between Bearer and token
  - No multiple spaces
  - No leading/trailing whitespace

- ✅ **Request Context (2 tests)**
  - Works with different HTTP methods
  - Works with different paths

- ✅ **Middleware Instance (3 tests)**
  - Instance verification
  - Has use method
  - Reusable across requests

#### Rate Limit Middleware (28 tests)
- ✅ **Normal Request Flow (3 tests)**
  - Allows first request
  - Allows requests under limit (5)
  - Tracks requests per IP

- ✅ **Rate Limit Exceeded (4 tests)**
  - Blocks after 5 requests
  - Correct status code (429)
  - Includes remaining time in message
  - Correct error structure

- ✅ **IP Address Detection (5 tests)**
  - From request.ip
  - From x-forwarded-for header
  - Uses first IP from x-forwarded-for
  - Fallback to socket.remoteAddress
  - Handles unknown IP

- ✅ **Time Window Behavior (1 test)**
  - Respects 30-second window

- ✅ **Block Duration (2 tests)**
  - Blocks for 10 seconds
  - Shows decreasing time

- ✅ **Multiple IPs (2 tests)**
  - Tracks independently
  - Doesn't affect other IPs

- ✅ **Middleware Instance (3 tests)**
  - Instance verification
  - Has use method
  - Maintains state

- ✅ **Configuration (1 test)**
  - Uses 5 as maximum

#### Timezone Interceptor (30 tests)
- ✅ **Interceptor Instance (3 tests)**
  - Defined
  - Instance verification
  - Has intercept method

- ✅ **Transform Dates (5 tests)**
  - Date objects to timezone format
  - Dates in objects
  - Dates in nested objects
  - Dates in arrays
  - Multiple dates in same object

- ✅ **Non-Date Values (5 tests)**
  - Doesn't transform strings/numbers/booleans
  - Preserves null/undefined

- ✅ **Edge Cases (6 tests)**
  - Null/undefined response
  - Empty array/object
  - Deeply nested structures
  - Array of nested objects

- ✅ **Timezone Format (3 tests)**
  - Includes timezone offset
  - Formats consistently
  - Uses configured timezone

- ✅ **Complex Data Structures (2 tests)**
  - Mixed data types
  - Pagination responses

---

## Test Statistics

| Test Suite | Type | Tests | Coverage |
|------------|------|-------|----------|
| **Companies - DTOs** | | | |
| `create-company.dto.spec.ts` | Unit | 30 tests | Field validations (CUIT, businessName, companyType, adhesionDate) |
| `company-adhesion-response.dto.spec.ts` | Unit | 8 tests | Constructor, properties, type validation |
| `company-joined-response.dto.spec.ts` | Unit | 3 tests | Constructor, field filtering |
| `company-with-transfers.dto.spec.ts` | Unit | 7 tests | Constructor, amounts, accounts |
| `paginated-companies-joined-response.dto.spec.ts` | Unit | 12 tests | Pagination logic, meta properties |
| `paginated-transfers-response.dto.spec.ts` | Unit | 15 tests | Pagination, calculations, data structure |
| **Companies - Schemas** | | | |
| `company.schema.spec.ts` | Unit | 40 tests | Schema definition, fields, indexes, validation, enum types |
| **Companies - Services & Controllers** | | | |
| `companies.service.spec.ts` | Unit | 23 tests | Service methods, pagination, error handling |
| `companies.controller.spec.ts` | E2E | 35 tests | Endpoints, auth, rate limiting, validation |
| `companies.module.spec.ts` | Integration | 9 tests | Module setup, dependencies, middleware |
| **Transfers - DTOs** | | | |
| `create-transfer.dto.spec.ts` | Unit | 48 tests | Field validations (companyId, amount, accounts, transferDate) |
| `transfer-response.dto.spec.ts` | Unit | 33 tests | Constructor, properties, amounts, dates, edge cases |
| **Transfers - Schemas** | | | |
| `transfer.schema.spec.ts` | Unit | 53 tests | Schema definition, fields, indexes, references, validation |
| **Transfers - Services, Controllers & Modules** | | | |
| `transfers.service.spec.ts` | Unit | 43 tests | createTransfer, getTransfersLastMonth, error handling, date filtering |
| `transfers.controller.spec.ts` | E2E | 43 tests | POST/GET endpoints, validation, timezone, edge cases |
| `transfers.module.spec.ts` | Integration | 9 tests | Module setup, dependencies, exports |
| **App - Root Module & Bootstrap** | | | |
| `app.module.spec.ts` | Integration | 16 tests | Module initialization, imports, configuration, integration |
| `main.spec.ts` | Integration | 35 tests | Bootstrap, timezone, pipes, Swagger, logger, environment |
| **Common - Types & Interfaces** | | | |
| `company.types.spec.ts` | Unit | 20 tests | CompanyType enum, CompanyStatus enum, usage patterns |
| `company.interface.spec.ts` | Unit | 12 tests | Interface structure, property types, usage |
| `transfer.interface.spec.ts` | Unit | 11 tests | Interface structure, property types, usage |
| **Common - Constants & Utils** | | | |
| `timezone.constant.spec.ts` | Unit | 16 tests | Constant structure, NAME/DESCRIPTION, immutability, usage |
| `date.helper.spec.ts` | Unit | 31 tests | now(), oneMonthAgo(), parse(), format(), timezone consistency |
| **Common - Middleware** | | | |
| `auth.middleware.spec.ts` | Unit | 37 tests | Valid auth, missing header, invalid format, tokens, case sensitivity |
| `rate-limit.middleware.spec.ts` | Unit | 28 tests | Request flow, rate limit, IP detection, time window, block duration |
| **Common - Interceptors** | | | |
| `timezone.interceptor.spec.ts` | Unit | 30 tests | Date transformation, non-date values, edge cases, timezone format |
| **Total** | - | **647 tests** | 🎯 Complete coverage |

## Prerequisites

### MongoDB Running
Make sure MongoDB is running locally before executing tests:

```bash
# Windows (PowerShell)
mongod

# Or check if running
Get-Process mongod
```

### Environment Variables
Tests use the test database: `interbanking-test`

You can override this with:
```bash
MONGO_URI=mongodb://localhost:27017/interbanking-test npm run test:e2e
```

## Test Data Cleanup

E2E tests automatically clean up test data:
- Test companies use CUITs starting with `99`
- All test data is deleted after test suite completion

## Notes

### Rate Limiting Tests
Rate limiting tests require proper wait times to ensure clean state:
- **Pagination tests**: Wait 11 seconds (sufficient for normal operations)
- **Rate limit validation tests**: Wait 41 seconds (30s window + 10s block + 1s buffer) to ensure complete reset

This ensures each test starts with a clean rate limit state and validates the middleware behavior correctly.

**Note:** Tests have extended timeouts:
- Global timeout: **60 seconds** (ensures all tests complete successfully)
- Rate limit validation tests: **50 seconds** (specific timeout for these tests)
- Pagination tests: **15 seconds** (specific timeout for pagination with reset)

### Authentication Token
Tests use the mock token: `asdasdsafd`

### Timezone
Tests are configured to use `America/Buenos_Aires` (UTC-3) timezone.

## Debugging Tests

To debug a specific test:

```bash
npm run test:debug -- companies/companies.controller.spec
```

Then attach your debugger to the Node process.

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run E2E Tests
  run: |
    mongod --fork --logpath /var/log/mongodb.log
    npm run test:e2e
```

## Common Issues

### Issue: MongoDB connection timeout
**Solution**: Ensure MongoDB is running and accessible at `mongodb://localhost:27017`

### Issue: Rate limit tests failing
**Solution**: Increase timeout between test groups or run tests individually

### Issue: Port already in use
**Solution**: Stop any running instances of the application before running E2E tests

## Contact

For questions or issues with tests, please check the project documentation or contact the development team.

