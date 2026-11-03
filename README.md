# 🏗️ Control de Obras — Gestión Integral, Finanzas y Despiece 3D

<p align="left">
  <img src="https://img.shields.io/badge/Licencia-MIT-green.svg?style=for-the-badge" alt="Licencia MIT" />
  <img src="https://img.shields.io/badge/Estado-Open--Source_Ready-brightgreen?style=for-the-badge" alt="Estado" />
  <img src="https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Firebase_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
</p>

> **Control de Obras** es una plataforma web progresiva (SPA / PWA) diseñada para contratistas, talleres de carpintería arquitectónica, arquitectos e ingenieros civiles. Centraliza el ciclo completo de una obra: cotización paramétrica, contratos legales, despiece y corte 3D, control de compras, nómina de cuadrillas y balance financiero en tiempo real.

---

## 🌟 Origen y Liberación Open Source

Este proyecto fue desarrollado y madurado bajo el **Ecosistema AnAnApps** a lo largo de **92 órdenes de desarrollo e iteraciones funcionales**. 

> 💡 **Proyecto en Pausa & Invitación a Contribuir / Continuar:**  
> Actualmente este proyecto se encuentra en **pausa estratégica** en AnAnApps. Ha sido **congelado y liberado como código abierto (Open Source)** bajo **Licencia MIT**, con el objetivo de que cualquier desarrollador, equipo o empresa del sector de la construcción lo tome, lo bifurque (Fork), lo continúe evolucionando o contribuya mejoras mediante Pull Requests. ¡Tu contribución y liderazgo en este proyecto son bienvenidos!

---

## 🚀 Características Principales

### 1. 📐 Diseñador 3D & Optimización de Corte On-Device
- Visualización y modelado tridimensional de piezas y muebles usando **Three.js / WebGL**.
- Algoritmo de cálculo de corte 2D de tableros ejecutado en segundo plano con **Web Workers** (cero congelamiento de interfaz).
- Exportación de listas de corte detalladas con dimensiones de veta y cantos.

### 2. 💰 Cotizaciones Dinámicas y Contratos Automatizados
- Creador paramétrico de presupuestos con cálculo en vivo de materiales, mano de obra y margen de utilidad.
- Compilación de **contratos de obra en HTML/PDF** listos para imprimir o firmar, con esquemas de pago fraccionados (anticipo, armado, avance y entrega).

### 3. 📊 Finanzas en Vivo & Control Presupuestario
- Comparativa en tiempo real entre el **presupuesto proyectado vs. gastos ejecutados**.
- Registro de gastos de obra categorizados (insumos, fletes, maquinaria, imprevistos).
- Balance financiero global con semáforos de rentabilidad.

### 4. 📦 Compras Globales, Materiales y Proveedores
- Matriz de compras consolidadas entre múltiples obras.
- Catálogo de materiales e insumos con precios unitarios históricos.
- Directorio de proveedores con datos de contacto y condiciones comerciales.

### 5. 👥 Cuadrillas, Clientes y Agenda
- Control de personal operativo (albañiles, carpinteros, instaladores) y liquidación de jornales.
- Directorio de clientes con portal web personalizado para seguimiento del estado de sus proyectos.
- Agenda integrada para citas técnicas y fechas críticas de entrega en obra.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18 + TypeScript 5.x (Modo Estricto, 0 `any`) |
| **Bundler & Build** | Vite 5.x (Code-splitting y Tree-shaking optimizado) |
| **Estilos & UI** | Tailwind CSS + Tokens de diseño CSS en `src/styles/tokens.css` |
| **Gráficos & 3D** | Three.js + WebGL + Web Workers |
| **Persistencia** | Google Cloud Firestore (Web SDK v10) |
| **Iconografía** | Lucide React Icons |

---

## ⚡ Guía de Instalación y Puesta en Marcha

### Prerrequisitos
- [Node.js](https://nodejs.org/) v18.x o superior.
- Gestor de paquetes `npm` (incluido con Node).
- Un proyecto en [Firebase Console](https://console.firebase.google.com/) con **Firestore** y **Authentication** habilitados (plan gratuito Spark).

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/ananapps799617/control-de-obras.git
cd control-de-obras
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Configurar variables de entorno
Copia el archivo de plantilla `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```
Abre `.env.local` y pega las credenciales de tu proyecto de Firebase:
```env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### Paso 4: Iniciar en desarrollo
```bash
npm run dev
```
La aplicación estará disponible de inmediato en `http://localhost:5173`.

### Comandos útiles
```bash
# Compilar a producción
npm run build

# Previsualizar el build localmente
npm run preview
```

---

## 📁 Estructura del Código

```text
CODIGO/
├── public/                 # Assets estáticos, favicon y manifest PWA
├── src/
│   ├── app/                # Enrutador y configuración raíz
│   ├── components/         # Componentes UI reutilizables (Modales, botones, inputs)
│   ├── features/           # Módulos de negocio (Auth, Cotizaciones, Finanzas, 3D...)
│   ├── lib/                # Utilidades de formato, fechas y cálculos matemáticos
│   ├── services/           # Capa de datos desacoplada hacia Firebase Firestore
│   ├── styles/             # Variables CSS y tokens de diseño
│   └── types/              # Contratos e interfaces TypeScript
├── .env.example            # Plantilla pública de variables de entorno
├── .gitignore              # Blindaje estricto de secretos y caches
├── package.json
└── vite.config.js
```

---

## 🤝 Cómo Contribuir

¡Las contribuciones, ideas y forks son más que bienvenidos!

1. Realiza un **Fork** de este repositorio.
2. Crea tu rama de función (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios con commits descriptivos (`git commit -m "feat: agregar exportación a Excel"`).
4. Sube tu rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un **Pull Request**.

---

## 📄 Licencia

Este proyecto se distribuye bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles. Puedes usarlo, modificarlo y distribuirlo libremente para proyectos personales o comerciales.
