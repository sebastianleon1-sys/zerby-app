#Zerby app
DOCUMENTACION DEL BACKEND:
1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/sebastianleon1-sys/zerby-app
    cd tu-repositorio
    ```

2.  **Instalar dependencias, dentro del backend:**
    ```bash
    npm install
    ```

3.  **Iniciar el Servidor:**
    ```bash
    npm run dev
    ```
    El servidor estará disponible en `http://localhost:3000`.

---

## 📂 Arquitectura del Proyecto (Para Desarrollo Interno)

El proyecto sigue el patrón **Controller-Service-Repository** (implementado vía Prisma).

| Carpeta | Descripción | Archivos Clave |
| :--- | :--- | :--- |
| **`/api`** | Define los *endpoints* y métodos HTTP de cada módulo. | `auth.routes.js`, `proveedores.routes.js`, etc. |
| **`/controllers`** | Contiene la lógica de manejo de solicitudes, validación inicial y formato de respuesta. | `auth.controller.js`, `anuncio.controller.js`, etc. |
| **`/services`** | Lógica de negocio reusable y compleja (ej: cálculos). | `proximity.service.js` (Fórmula Haversine). |
| **`/middlewares`** | Funciones que se ejecutan antes del controlador. | `auth.middleware.js` (`verifyToken`, `verifyRole`). |
| **`/utils`** | Herramientas de utilidad. | `prisma.client.js` (Instancia única de Prisma). |

---

## 📚 Documentación de la API (Referencia Frontend)

**URL Base:** `http://localhost:3000/api`

### 🔑 Autenticación (Header)

Para todas las rutas protegidas, usar el token en el encabezado:

`Authorization: Bearer <tu-token-jwt>`

---

### Módulo 1: Autenticación (`/api/auth`)

#### 1.1. `POST /register` (Registro)

| Parámetro | Tipo | Obligatorio | Notas |
| :--- | :--- | :--- | :--- |
| `role` | String | Sí | `"CLIENTE"` o `"PROVEEDOR"`. |
| `password` | String | Sí | Se hashea automáticamente. |
| `descripcion` | String | Solo `PROVEEDOR` | Descripción del servicio. |

**Body (Ejemplo para PROVEEDOR):**

```json
{
  "email": "electricista@mail.com",
  "password": "secure123",
  "role": "PROVEEDOR",
  "nombre": "Servicios Eléctricos Sur",
  "descripcion": "Instalaciones y emergencias eléctricas.",
  "servicios": ["Electricidad", "Instalaciones"],
  "lat": -33.4560,
  "lng": -70.6500
}
````

**Respuesta Exitosa (201 Created):** Devuelve el token para iniciar la sesión.

```json
{ "message": "Usuario registrado exitosamente", "token": "...", "user": { "userId": 10, "role": "PROVEEDOR" } }
```

#### 1.2. `POST /login` (Inicio de Sesión)

**Body (JSON):**

```json
{ "email": "electricista@mail.com", "password": "secure123" }
```

**Respuesta Exitosa (200 OK):**

```json
{ "message": "Inicio de sesión exitoso", "token": "...", "user": { "userId": 10, "role": "PROVEEDOR" } }
```

-----

### Módulo 2: Proveedores y Búsqueda

#### 2.1. `GET /api/proveedores/nearby` (Búsqueda por Proximidad)

| Query Param | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- |
| `lat` | Number | Sí | Latitud del punto de búsqueda (cliente). |
| `lng` | Number | Sí | Longitud del punto de búsqueda (cliente). |
| `radius` | Number | No | Radio de búsqueda en **kilómetros** (default: 10). |

**Respuesta Exitosa (200 OK):** Array de proveedores ordenados por `distance`.

```json
[
  { "id": 5, "nombre": "Plomero Juan", "rating": 4.8, "servicios": ["Plomería"], "distance": 0.58 }
]
```

#### 2.2. Perfiles Protegidos (Proveedor)

| Método | Endpoint | Rol Requerido | Body (JSON) | Respuesta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/proveedores/profile` | `PROVEEDOR` | N/A | Objeto completo del Proveedor, incluyendo su array de `anuncios`. |
| `PUT` | `/api/proveedores/profile` | `PROVEEDOR` | Campos a actualizar (ej: `descripcion`, `servicios`). | Objeto Proveedor actualizado. |

#### 2.3. Perfiles Protegidos (Cliente)

| Método | Endpoint | Rol Requerido | Body (JSON) | Respuesta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/clientes/profile` | `CLIENTE` | N/A | Objeto completo del Cliente. |
| `PUT` | `/api/clientes/profile` | `CLIENTE` | Campos a actualizar (ej: `nombre`, `lat`, `lng`). | Objeto Cliente actualizado. |

-----

### Módulo 3: Anuncios (CRUD)

#### 3.1. `POST /api/anuncios` (Crear Anuncio)

**Rol Requerido:** PROVEEDOR

**Body (JSON):**

```json
{
  "titulo": "Instalación de Focos LED",
  "descripcion": "Cambio de iluminación LED a domicilio.",
  "precio": 35.00,
  "categoria": "Electricidad"
}
```

**Respuesta Exitosa (201 Created):** Objeto del Anuncio creado.

#### 3.2. `GET /api/anuncios` (Listar)

| Query Param | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- |
| `categoria` | String | No | Filtra por categoría específica (ej: `?categoria=Electricidad`). |

**Respuesta Exitosa (200 OK):** Array de objetos `Anuncio`.

#### 3.3. `PUT /api/anuncios/:id` (Actualizar)

**Rol Requerido:** PROVEEDOR (Debe ser el dueño del anuncio)

**Body (JSON):**

```json
{ "precio": 40.00, "descripcion": "Nueva descripción..." }
```

**Respuesta Exitosa (200 OK):** Objeto del Anuncio actualizado.

#### 3.4. `DELETE /api/anuncios/:id` (Eliminar)

**Rol Requerido:** PROVEEDOR (Debe ser el dueño del anuncio)

**Respuesta Exitosa (204 No Content):** Indica eliminación exitosa.

-----

### Módulo 4: Reseñas (Reviews)

#### 4.1. `POST /api/reviews/anuncio/:anuncioId` (Crear Reseña)

**Rol Requerido:** CLIENTE

**Body (JSON):**

```json
{ "rating": 5, "comment": "¡Excelente servicio! Muy profesional." }
```

**Respuesta Exitosa (201 Created):** Objeto de la Reseña creada. **Nota:** El backend inicia una lógica que recalcula el `rating` del proveedor asociado.

#### 4.2. `GET /api/reviews/anuncio/:anuncioId` (Listar Reseñas)

**Respuesta Exitosa (200 OK):** Array de objetos `Review` para ese anuncio.

-----

### 🚨 Códigos de Estado y Manejo de Errores

| Código | Clase de Error | Significado para el Frontend |
| :--- | :--- | :--- |
| **200/201** | Éxito | Operación completada satisfactoriamente. |
| **400** | Bad Request | Error de validación, datos incompletos. |
| **401** | Unauthorized | Token ausente, inválido o expirado. Redirigir al login. |
| **403** | Forbidden | Usuario con token válido, pero sin el rol requerido (`CLIENTE` vs `PROVEEDOR`). |
| **404** | Not Found | Recurso solicitado inexistente. |
| **500** | Internal Error | Fallo del servidor (debe ser reportado). |

```
```
