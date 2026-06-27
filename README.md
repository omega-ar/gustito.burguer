# El Gustito Burger — Sistema de Gestión y Pedidos en Tiempo Real

Este proyecto es una plataforma web completa de punta a punta (End-to-End) diseñada para **El Gustito Burger**, la cual permite a los clientes realizar pedidos en línea con un sistema de **seguimiento en vivo**, y proporciona a los cajeros y administradores un potente **Panel de Control (Caja)** para gestionar la preparación, despachos, stock de ingredientes y arqueo de turnos de caja en efectivo y transferencia.

## ⚡ Características Principales

*   **Página del Cliente (Frontend):**
    *   Diseño responsive y moderno, adaptado para móvil y escritorio.
    *   Navegación fluida por categorías de hamburguesas (Simples, Dobles, Triples, Acompañamientos y Bebidas).
    *   **Seguimiento en Vivo:** Al realizar el pedido, el cliente accede a una pantalla dinámica (`seguimiento.html`) que se actualiza en tiempo real mostrando el progreso (Recibido 📥 -> En Cocina 🍳 -> En Camino 🛵 -> Entregado 🎉).
    *   **Integración con WhatsApp:** Un botón pre-configurado genera un mensaje detallado para enviar directamente el pedido al local.
*   **Panel de Caja (Cajero/Admin):**
    *   Control de Turnos: Apertura y Cierre de caja registrando el efectivo físico (`montoActual`) y transferencias.
    *   Facturación en Mostrador: Panel POS para agregar hamburguesas y cobrar rápidamente.
    *   Gestión de Cocina: Actualización en vivo del estado del pedido (Pendiente -> Preparando -> Terminado/En Camino).
    *   **Entrega Automática:** Los pedidos marcados "En Camino" se finalizan solos tras 5 minutos mediante un temporizador inteligente en segundo plano.
    *   **Impresión de Comandas:** Soporte para generar comandas de ticketera térmica en formato estándar de 80mm con toda la información de entrega, dirección y notas de cocina.
*   **Panel de Administración (Admin):**
    *   Control de Stock de ingredientes en tiempo real.
    *   Alertas de stock crítico o bajo.
    *   Reportes de ventas diarios detallando ingresos y productos más populares.

---

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** HTML5 semántico, Vanilla CSS (diseño personalizado y tema oscuro), Javascript (ES6), FontAwesome y Plus Jakarta Sans Google Fonts.
*   **Backend:** Node.js, Express framework, CORS, JSON Web Token (JWT) y REST APIs.
*   **Base de datos:** Google Cloud Firestore (Firebase Admin SDK).
*   **Autenticación:** Firebase Authentication.

---

## 📁 Estructura del Proyecto

```text
gustito/
├── backend/                  # Servidor API de Node.js
│   ├── controllers/          # Lógica de negocio (auth, orders, cash, products)
│   ├── middleware/           # Middlewares de Express (auth, isAdmin, errorHandler)
│   ├── routes/               # Enrutadores de API (/auth, /orders, /cash, /print)
│   ├── utils/                # Configuración de impresión y esquemas
│   ├── firebaseAdmin.js      # Conexión con Firestore
│   ├── seed.js               # Script para poblar la BD inicial
│   ├── createAdmin.js        # Script de consola para crear el administrador inicial
│   ├── server.js             # Entrada principal del servidor Express
│   ├── package.json          # Dependencias y comandos del backend
│   └── .env.example          # Plantilla para variables de entorno
│
├── frontend/                 # Archivos estáticos del Cliente y Panel
│   ├── css/                  # Hojas de estilo (styles, caja, admin)
│   ├── img/                  # Logotipo e imágenes de productos
│   ├── javascript/           # Lógica en JS (main, pedido, caja, seguimiento)
│   ├── index.html            # Landing page del cliente
│   ├── pedidos.html          # Checkout del cliente
│   ├── seguimiento.html      # Pantalla pública de seguimiento
│   ├── login.html            # Acceso para empleados
│   ├── caja.html             # Terminal de caja y comandas
│   └── admin.html            # Panel de reportes y stock
│
└── .gitignore                # Archivo para evitar la subida de secretos y dependencias
```

---

## 🚀 Instalación y Configuración Local

### Prerrequisitos
Tener instalado [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada).

### Paso 1: Configurar credenciales de Firebase
1. Ve a la consola de Firebase, descarga la clave privada en formato JSON de tu cuenta de servicio de Firestore.
2. Renombra el archivo descargado como `serviceAccountKey.json`.
3. Pégalo dentro de la carpeta `backend/` de este proyecto.

### Paso 2: Configurar Variables de Entorno
Crea un archivo `.env` dentro de la carpeta `backend/` usando como base el archivo `.env.example` y rellena las credenciales correspondientes.

### Paso 3: Instalar dependencias del Backend
Abre una terminal en la carpeta `/backend` y ejecuta:
```bash
npm install
```

### Paso 4: Poblar la Base de Datos (Seeding)
Para cargar todos los productos de hamburguesas, ingredientes y recetas por defecto en tu Firestore, ejecuta:
```bash
node seed.js
```

### Paso 5: Crear el Primer Administrador
Crea las credenciales de tu primer usuario administrador de forma directa ejecutando:
```bash
node createAdmin.js admin@elgustito.com password123
```
*(Puedes ingresar el correo y contraseña que desees).*

### Paso 6: Arrancar el Servidor
Inicia la API del backend:
```bash
npm start
```
El servidor quedará escuchando en: `http://localhost:8080`

### Paso 7: Correr el Frontend
Simplemente abre la carpeta `frontend/` y haz doble clic en `index.html` (o usa la extensión **Live Server** de VS Code corriendo en `http://localhost:5500` para pruebas ideales).

---

## 📦 Guía de Despliegue en Render (PaaS)

### 🚨 Preparación de GitHub
1. Inicializa git en el directorio raíz de la carpeta `gustito/`:
   ```bash
   git init
   git add .
   git commit -m "feat: setup gustito burger production ready"
   ```
2. Crea un repositorio vacío en tu cuenta de GitHub.
3. Sube el proyecto a tu repositorio remoto:
   ```bash
   git remote add origin https://github.com/tu-usuario/gustito-burger.git
   git branch -M main
   git push -u origin main
   ```

### ⚙️ Despliegue en Render.com
1. **Crear Servicio Web:** Inicia sesión en Render y crea un nuevo **Web Service** conectado a tu repositorio de GitHub.
2. **Configuración Inicial:**
   *   **Root Directory:** `backend` *(muy importante para que Render reconozca la carpeta del servidor Node)*
   *   **Runtime:** `Node`
   *   **Build Command:** `npm install`
   *   **Start Command:** `node server.js`
3. **Variables de Entorno (Environment Variables):**
   Agrega en la pestaña *Environment* de Render las variables documentadas en `.env.example`:
   *   `PORT` = `8080`
   *   `JWT_SECRET` = `un_hash_largo_y_seguro`
   *   `FIREBASE_API_KEY` = `tu_firebase_api_key_publica`
4. **Archivo de Credenciales Privadas (serviceAccountKey.json):**
   Como `serviceAccountKey.json` está ignorado en git por seguridad, debes subirlo a Render de forma segura:
   *   Ve a **Environment** en Render.
   *   En la sección **Secret Files**, haz clic en *Add Secret File*.
   *   Pon como nombre del archivo: `serviceAccountKey.json`.
   *   Copia y pega todo el contenido de tu archivo local `serviceAccountKey.json` dentro del cuadro de texto y guarda.