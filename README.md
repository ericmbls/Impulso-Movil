# 🏫 IMPULSO - Sistema Integral de Gestión Académica CBTIS 61

**IMPULSO** es una plataforma integral de gestión académica desarrollada para el **Centro de Bachillerato Tecnológico Industrial y de Servicios No. 61 (CBTIS 61)**.

Su objetivo es centralizar y modernizar los procesos académicos e institucionales mediante una solución tecnológica compuesta por una aplicación móvil, servicios backend y herramientas de administración, permitiendo una gestión eficiente de la información escolar.

---

# 📱 Aplicación Móvil

Desarrollada con **Ionic, Angular y Capacitor**, la aplicación móvil ofrece acceso seguro y en tiempo real a la información académica para alumnos, docentes, padres de familia y administradores.

## Funcionalidades Principales

* ✅ Inicio de sesión seguro
* ✅ Credencial digital institucional
* ✅ Consulta de horarios
* ✅ Consulta de calificaciones
* ✅ Seguimiento de asistencias
* ✅ Notificaciones escolares
* ✅ Dashboard personalizado
* ✅ Experiencia Mobile First
* ✅ Compatibilidad con Android e iOS

---

# 🚀 Tecnologías Utilizadas

## Mobile

* Angular 20
* Ionic 8
* Capacitor 8
* TypeScript 5
* SCSS

---

# 📂 Estructura del Proyecto Mobile

```text
mobile/
│
├── android/
│
├── src/
│   │
│   ├── app/
│   │
│   ├── core/
│   │   ├── constants/
│   │   ├── enums/
│   │   ├── guards/
│   │   ├── interfaces/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── schedule/
│   │   ├── grades/
│   │   ├── attendance/
│   │   ├── credential/
│   │   ├── notifications/
│   │   └── profile/
│   │
│   ├── layouts/
│   │   ├── auth-layout/
│   │   └── main-layout/
│   │
│   ├── shared/
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── validators/
│   │
│   ├── app.routes.ts
│   └── app.component.ts
│
├── assets/
├── environments/
├── theme/
│
├── capacitor.config.ts
├── package.json
└── angular.json
```

---

# ⚙️ Requisitos

## Generales

* Node.js 22 o superior
* npm 10 o superior
* Git

## Desarrollo Mobile

* Angular CLI
* Ionic CLI
* Capacitor CLI
* Android Studio
* Android SDK
* Java JDK 21

---

# 📦 Instalación

## 1. Instalar herramientas globales

### Actualizar npm

```bash
npm install -g npm@latest
```

### Angular CLI

```bash
npm install -g @angular/cli
```

### Ionic CLI

```bash
npm install -g @ionic/cli
```

### Capacitor CLI

```bash
npm install -g @capacitor/cli
```

---

## 2. Clonar el proyecto

```bash
git clone <repositorio>
cd mobile
```

---

## 3. Instalar dependencias

```bash
npm install
```

---

## 4. Instalar Capacitor y plataformas

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
```

---

# ▶️ Ejecución en Navegador

Iniciar servidor de desarrollo:

```bash
ionic serve
```

La aplicación estará disponible en:

```text
http://localhost:8100
```

---

# 🤖 Configuración para Android

## Agregar plataforma Android

```bash
npx cap add android
```

## Sincronizar Capacitor

```bash
npx cap sync
```

## Abrir Android Studio

```bash
npx cap open android
```

---

# 📲 Ejecución en Emulador Android

Generar la aplicación web:

```bash
npm run build
```

Sincronizar archivos con Android:

```bash
npx cap sync android
```

Ejecutar en dispositivo o emulador:

```bash
npx cap run android
```

---

# ☕ Configuración de JAVA_HOME

Verificar la variable de entorno:

```bash
echo %JAVA_HOME%
```

Debe apuntar a:

```text
C:\Program Files\Android\Android Studio\jbr
```

Verificar versión instalada:

```bash
java -version
```

Versión recomendada:

```text
Java 21
```

---

# 👥 Roles del Sistema

## 👨‍🎓 Alumno

* Dashboard personal
* Consulta de horarios
* Consulta de calificaciones
* Seguimiento de asistencias
* Credencial digital
* Notificaciones institucionales

## 👨‍👩‍👧 Padre de Familia

* Seguimiento académico
* Consulta de calificaciones
* Consulta de asistencias
* Recepción de alertas escolares

## 👨‍🏫 Docente

* Pase de lista
* Registro de asistencias
* Captura de calificaciones
* Consulta de horario docente

## 👨‍💼 Administrador

* Gestión institucional
* Administración de usuarios
* Gestión de horarios
* Generación de reportes
* Seguimiento de alertas académicas

---

# 🎯 Estado Actual del Desarrollo

## Aplicación Mobile

| Módulo               | Estado           |
| -------------------- | ---------------- |
| Login                | ✅ Completado     |
| Dashboard Alumno     | ✅ Completado     |
| Layout Principal     | ✅ Completado     |
| Navegación / Sidebar | ✅ Completado     |
| Horarios             | 🚧 En desarrollo |
| Calificaciones       | 🚧 En desarrollo |
| Asistencias          | 🚧 En desarrollo |
| Credencial Digital   | 🚧 En desarrollo |
| Notificaciones       | 🚧 En desarrollo |
| Perfil               | 🚧 En desarrollo |

---

# 📄 Licencia

Este proyecto ha sido desarrollado exclusivamente para el **CBTIS 61** y su uso está restringido a fines institucionales.

---

## ❤️ Desarrollado para impulsar la transformación digital de la educación.
