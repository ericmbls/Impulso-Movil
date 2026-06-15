# 🏫 IMPULSO - Sistema Integral de Gestión Académica CBTIS 61

Sistema integral de gestión académica desarrollado para el **Centro de Bachillerato Tecnológico Industrial y de Servicios No. 61 (CBTIS 61)**.

IMPULSO centraliza el control académico, asistencia, seguimiento escolar, credenciales digitales y comunicación institucional mediante una plataforma moderna compuesta por backend, frontend web y aplicación móvil.




## 📱 Aplicación Móvil (Ionic + Angular + Capacitor)

* ✅ Inicio de Sesión Seguro
* ✅ Credencial Digital Institucional
* ✅ Consulta de Horarios
* ✅ Consulta de Calificaciones
* ✅ Seguimiento de Asistencias
* ✅ Notificaciones Escolares
* ✅ Dashboard Personalizado
* ✅ Experiencia Mobile First
* ✅ Compatible con Android e iOS

---

# 🏗️ Arquitectura General

```text
IMPULSO/
├── mobile/             # Aplicación móvil Ionic
│
└── .gitignore
```

---

# 🚀 Tecnologías Utilizadas

## Mobile

* Angular 20
* Ionic 8
* Capacitor 8
* TypeScript 5
* SCSS

---

# 📂 Estructura Mobile

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

* Node.js 22+
* npm 10+
* Git

## Backend

* PostgreSQL 14+

## Mobile

* Android Studio
* Android SDK
* Java JDK 21
* Capacitor

---

# 📦 Instalación del Proyecto

# 📱 Mobile

Entrar a la carpeta:

```bash
cd mobile
```

Instalar dependencias:

```bash
npm install
```

Instalar Capacitor:

```bash
npm install \
@capacitor/core \
@capacitor/cli \
@capacitor/android \
@capacitor/ios
```

---

# ▶️ Ejecutar en Navegador

```bash
ionic serve
```

Disponible en:

```text
http://localhost:8100
```

---

# 🤖 Android Studio

Agregar Android:

```bash
npx cap add android
```

Sincronizar:

```bash
npx cap sync
```

Abrir Android Studio:

```bash
npx cap open android
```

---

# 📲 Ejecutar en Emulador Android

Generar build web:

```bash
npm run build
```

Sincronizar:

```bash
npx cap sync android
```

Ejecutar:

```bash
npx cap run android
```

---

# 🔐 Configuración JAVA_HOME

Verificar:

```bash
echo %JAVA_HOME%
```

Debe apuntar a:

```text
C:\Program Files\Android\Android Studio\jbr
```

Verificar Java:

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
* Horario
* Calificaciones
* Asistencia
* Credencial Digital
* Notificaciones

---

## 👨‍👩‍👧 Padre de Familia

* Seguimiento académico
* Calificaciones
* Asistencia
* Alertas escolares

---

## 👨‍🏫 Docente

* Pase de lista
* Registro de asistencias
* Captura de calificaciones
* Horario docente

---

## 👨‍💼 Administrador

* Gestión institucional
* Usuarios
* Horarios
* Reportes
* Alertas académicas

---

# 🎯 Estado Actual

## Mobile

* ✅ Login UI
* ✅ Dashboard Alumno
* ✅ Layout Principal
* ✅ Sidebar / Navegación
* 🚧 Horarios
* 🚧 Calificaciones
* 🚧 Asistencias
* 🚧 Credencial Digital
* 🚧 Notificaciones
* 🚧 Perfil

---

# 📄 Licencia

Proyecto desarrollado exclusivamente para el **CBTIS 61**.

---

### Desarrollado con ❤️ para la transformación digital de la educación.
