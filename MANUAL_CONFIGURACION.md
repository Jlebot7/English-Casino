# 📖 Manual Completo de Configuración: Lucky English Casino

Bienvenido a la guía paso a paso para configurar y personalizar **Lucky English Casino**. Este manual te guiará detalladamente en la configuración de **Firebase Firestore**, la **API de Groq**, el **sistema de Text-to-Speech (TTS)**, la **gestión de salones y alumnos**, y el **despliegue en GitHub Pages**.

---

## 📑 Tabla de Contenidos
1. [Configuración de Firebase Firestore (Backend en la Nube)](#1-configuración-de-firebase-firestore)
2. [Configuración de Groq API (Generador de Preguntas con IA)](#2-configuración-de-groq-api)
3. [Ajustes de Sonido y Text-to-Speech (TTS)](#3-ajustes-de-sonido-y-text-to-speech-tts)
4. [Gestión de Salones y Carga de Estudiantes](#4-gestión-de-salones-y-carga-de-estudiantes)
5. [Despliegue y Publicación en GitHub Pages](#5-despliegue-y-publicación-en-github-pages)
6. [Preguntas Frecuentes y Solución de Problemas](#6-preguntas-frecuentes)

---

## 1. Configuración de Firebase Firestore

Firebase permite guardar las actividades creadas por los docentes y las puntuaciones de los estudiantes en la nube para compartirlas mediante códigos PIN entre dispositivos.

> **Nota:** La aplicación es 100% funcional en el **Plan Gratuito (Spark)** de Firebase, **sin necesidad de ingresar tarjeta de crédito ni activar planes de pago**.

### Paso 1.1: Crear el Proyecto en Firebase
1. Ve a la consola oficial de Firebase: [https://console.firebase.google.com/](https://console.firebase.google.com/).
2. Inicia sesión con tu cuenta de Google.
3. Haz clic en **"Agregar proyecto"** (o *"Crear un proyecto"*).
4. Asigna un nombre al proyecto (ejemplo: `lucky-english-casino`) y haz clic en **Continuar**.
5. Desactiva Google Analytics (opcional, no es necesario para este proyecto) y pulsa en **"Crear proyecto"**.

---

### Paso 1.2: Habilitar Firestore Database
1. En el menú lateral izquierdo de tu proyecto en Firebase, ve a **Compilación** > **Firestore Database**.
2. Haz clic en el botón **"Crear base de datos"**.
3. Selecciona la ubicación de tu base de datos más cercana (por ejemplo: `nam5 (us-central)` o `southamerica-east1`).
4. En las reglas de seguridad, puedes seleccionar **"Iniciar en modo de prueba"** o **"Modo de producción"**.
5. Haz clic en **Habilitar**.

---

### Paso 1.3: Configurar las Reglas de Seguridad de Firestore
Para permitir que la app guarde actividades y registre las tablas de clasificación de los estudiantes:
1. En la página de Firestore Database, haz clic en la pestaña **Reglas** (*Rules*).
2. Borra el contenido actual y pega exactamente las siguientes reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura de actividades pedagógicas creadas
    match /activities/{activityId} {
      allow read, write: if true;
    }
    
    // Permitir lectura y guardado de puntajes del salón
    match /leaderboard/{scoreId} {
      allow read, write: if true;
    }
  }
}
```

3. Haz clic en el botón **"Publicar"** (*Publish*).

---

### Paso 1.4: Registrar la App Web y Obtener las Credenciales
1. En la consola de Firebase, ve al icono de engranaje ⚙️ (arriba a la izquierda) > **"Configuración del proyecto"** (*Project settings*).
2. En la pestaña **General**, baja hasta la sección *"Tus apps"* y haz clic en el icono web **`</>`**.
3. Escribe un apodo para la app (ejemplo: `Lucky Casino Web`) y haz clic en **"Registrar app"** (no es necesario marcar Firebase Hosting).
4. Verás un bloque de código similar a este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

5. Copia todo ese objeto (puedes copiar desde `{` hasta `}`).

---

### Paso 1.5: Guardar las Credenciales en la Aplicación
1. Abre **Lucky English Casino** en tu navegador.
2. Haz clic en el icono de **⚙️ (Ajustes)** en la barra superior.
3. Ve a la pestaña **"Firebase Backend"**.
4. Pega el objeto copiado en el campo de texto.
5. Haz clic en **"Save Firebase Config"**.
6. ¡Listo! Verás el indicador verde: `🟢 Connected to Firebase Firestore`.

---

## 2. Configuración de Groq API

Groq proporciona una velocidad ultrarrápida para que la inteligencia artificial (`Llama 3.3 70B`) redacte preguntas pedagógicas de opción múltiple, explicaciones de reglas gramaticales y vocabulario en cuestión de segundos.

### Paso 2.1: Obtener una API Key Gratuita
1. Ingresa a la plataforma de Groq: [https://console.groq.com/keys](https://console.groq.com/keys).
2. Inicia sesión o regístrate gratis con tu cuenta de Google o GitHub.
3. Haz clic en el botón **"Create API Key"**.
4. Asígnale un nombre (ej. `LuckyEnglishCasino`) y pulsa **"Submit"**.
5. Copia la clave generada (empieza por `gsk_...`). *(Guárdala en un lugar seguro ya que solo se muestra una vez).*

### Paso 2.2: Vincular la Clave en la Aplicación
1. En la aplicación, abre el menú de **⚙️ Ajustes**.
2. En la pestaña **"Groq AI"**, pega tu clave en el campo *Groq API Key*.
3. Haz clic en **"Test Connection"**. La aplicación emitirá un sonido de acierto y mostrará `Groq API Key is valid and connected!`.
4. Haz clic en **"Save Key"**.

> **Privacidad y Costos:** La clave se almacena exclusivamente en tu propio navegador (`localStorage`). Ningún estudiante ni servidor externo tiene acceso a ella y el uso estándar de Groq Cloud es gratuito.

---

## 3. Ajustes de Sonido y Text-to-Speech (TTS)

La app cuenta con dos motores de audio independientes:
1. **Sintetizador Web Audio API**: Genera sonidos de casino reales (palancas, rodillos girando, monedas metálicas, fichas y campanadas de acierto) de forma nativa sin cargar archivos externos pesados.
2. **Text-to-Speech (TTS)**: Pronuncia en inglés nativo las preguntas y las opciones de respuesta.

### Cómo personalizar el Audio y TTS:
1. Abre **⚙️ Ajustes** y haz clic en la pestaña **"Sound & TTS"**.
2. **Efectos de Casino**:
   * **Volumen**: Desliza para subir o bajar el volumen general de los efectos.
   * **Silenciar**: Usa el botón *Muted / Sound ON* o el altavoz en la barra superior para silenciar rápidamente la clase.
3. **Pronunciación TTS**:
   * **Selector de Voz**: Elige entre las voces en inglés instaladas en tu sistema operativo (voces `en-US`, `en-GB`, Google US English, Microsoft Zira, etc.).
   * **Velocidad de Lectura (Speech Rate)**: 
     * `0.75x - 0.85x`: Recomendado para niveles A1 y A2 (pronunciación más lenta y pausada).
     * `0.95x - 1.0x`: Velocidad natural recomendada para niveles B1 a C1.
4. Haz clic en **"Test Voice & Casino Chimes"** para escuchar una prueba inmediata.

---

## 4. Gestión de Salones y Carga de Estudiantes

Diseñado para proyectar la app en clase o dinamizar sesiones grupales organizadas por cursos.

### Paso 4.1: Crear o Seleccionar Salones
1. Haz clic en el botón **`🏫 Salones`** en la barra superior o en el botón del Lobby.
2. Verás las pestañas con los salones existentes (ej. *7° Básico A*, *8° Básico B*).
3. Para crear uno nuevo, pulsa en **"➕ Nuevo Salón"**, escribe el nombre del grupo (ej. *Inglés 10° B*, *Conversación Adultos*) y haz clic en **Guardar Salón**.

### Paso 4.2: Agregar Alumnos
Dentro del salón seleccionado tienes dos opciones:
* **De a uno**: Escribe el nombre en el campo y pulsa **"Agregar"**.
* **Pegar lista completa (Excel / Google Sheets)**:
  1. Haz clic en `📋 Pegar lista completa`.
  2. Copia la columna de nombres desde tu planilla de cálculo o lista de asistencia.
  3. Pégala en el cuadro de texto y pulsa **"Importar Estudiantes"**.
  4. La app asignará automáticamente un avatar temático y 1,000 fichas iniciales a cada alumno.

### Paso 4.3: Dinámica de Turnos en las Máquinas
Cuando juegues en cualquier máquina (**Tragamonedas**, **Ruleta** o **Blackjack**):
* La barra superior mostrará: `🎯 Turno: [Avatar] Nombre del Alumno`.
* **🎲 Al Azar**: Elige aleatoriamente al próximo estudiante para mantener a todos atentos.
* **Siguiente**: Avanza al siguiente alumno en orden de lista.
* **Selector de Salón**: Puedes cambiar de salón en vivo durante la partida desde el menú desplegable sin perder el progreso.

---

## 5. Despliegue y Publicación en GitHub Pages

Tu proyecto incluye un flujo automatizado en `.github/workflows/deploy.yml`.

### Paso 5.1: Activar GitHub Actions en tu Repositorio
1. Entra a tu repositorio en GitHub: `https://github.com/TU_USUARIO/TU_REPOSITORIO`.
2. Ve a la pestaña **Settings** (Ajustes).
3. En la barra lateral izquierda, selecciona **Pages**.
4. En **Build and deployment** > **Source**, selecciona:
   👉 **`GitHub Actions`**

### Paso 5.2: Subir Cambios y Publicar
Desde la terminal en tu computadora:

```powershell
# Verificar estado
git status

# Subir los cambios al repositorio
git push
```

En unos segundos, GitHub compilará el código y tu aplicación estará disponible globalmente en:
`https://TU_USUARIO.github.io/TU_REPOSITORIO/`

---

## 6. Preguntas Frecuentes

### ¿Qué pasa si no configuro Firebase?
No hay problema. La aplicación detecta automáticamente la ausencia de Firebase y activa el **modo LocalStorage**. Todo lo que crees (salones, alumnos, preguntas y puntajes) se guardará de forma persistente en tu navegador.

### ¿Los estudiantes necesitan crear una cuenta?
No. Los estudiantes acceden instantáneamente con el código PIN de 6 caracteres (ej. `VERB77`) o un enlace directo (`?pin=VERB77`) ingresando únicamente su apodo o jugando a través del modo aula proyectado por el docente.

### ¿Cómo reiniciar las fichas de todos los alumnos al terminar el año o periodo?
Abre el gestor de **Salones**, selecciona el grupo que deseas resetear y presiona el botón **"🔄 Reiniciar Fichas a 1000"**.
