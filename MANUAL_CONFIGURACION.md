# 📖 Manual Completo de Configuración: Lucky English Casino

Bienvenido a la guía paso a paso para configurar y personalizar **Lucky English Casino**. Este manual te guiará detalladamente en la configuración de **Firebase Firestore**, la **API de Groq**, el **sistema de Text-to-Speech (TTS)**, la **gestión de salones y alumnos**, la **gestión de sesiones diarias con historial** y el **despliegue en GitHub Pages**.

---

## 📑 Tabla de Contenidos
1. [Configuración de Firebase Firestore (Backend en la Nube)](#1-configuración-de-firebase-firestore)
2. [Configuración de Groq API (Generador de Preguntas con IA)](#2-configuración-de-groq-api)
3. [Ajustes de Sonido y Text-to-Speech (TTS)](#3-ajustes-de-sonido-y-text-to-speech-tts)
4. [Gestión por Salones, Alumnos y Sesiones Diarias](#4-gestión-por-salones-alumnos-y-sesiones-diarias)
5. [Dinámica de Aula: Ruleta de Selección y Regla de Exoneración por Suerte](#5-dinámica-de-aula-ruleta-de-selección-y-regla-de-exoneración-por-suerte)
6. [Despliegue y Publicación en GitHub Pages](#6-despliegue-y-publicación-en-github-pages)
7. [Preguntas Frecuentes y Solución de Problemas](#7-preguntas-frecuentes)

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
4. Verás un bloque de código con tus claves `apiKey`, `projectId`, etc.
5. Copia todo ese objeto (desde `{` hasta `}`).

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

Groq proporciona una velocidad ultrarrápida para que la inteligencia artificial redacte retos pedagógicos, oraciones, preguntas y explicaciones en milisegundos.

### Modelos Soportados de Groq:
* **`openai/gpt-oss-120b`**: Modelo de alta inteligencia y precisión gramatical (Recomendado).
* **`openai/gpt-oss-20b`**: Modelo ultrarrápido, ideal para la generación de retos por turno en tiempo real.
* **`qwen/qwen3.8-27b`**: Gran precisión en instrucciones de idiomas.
* **`llama-3.3-70b-versatile`** y **`llama-3.1-8b-instant`**.

> **Nota importante:** Los modelos antiguos `llama3-8b-8192`, `llama3-70b-8192` y `mixtral-8x7b-32768` fueron retirados por Groq. La app consulta automáticamente tu cuenta para usar solo modelos activos.

### Cómo obtener tu clave gratuita de Groq:
1. Entra a [https://console.groq.com/keys](https://console.groq.com/keys) y crea tu cuenta gratuita.
2. Haz clic en **"Create API Key"**, copia la clave (empieza con `gsk_...`).
3. En la app, abre **⚙️ Ajustes**, pega tu clave en **"Groq API Key"** y haz clic en **Guardar**.

---

## 3. Ajustes de Sonido y Text-to-Speech (TTS)

La app cuenta con dos motores de audio independientes:
1. **Sintetizador Web Audio API**: Genera sonidos de casino reales (palancas mecánicas, rodillos girando, monedas metálicas, fichas y campanadas de acierto) de forma nativa.
2. **Text-to-Speech (TTS)**: Pronuncia en inglés nativo las preguntas, respuestas y oraciones modelo para que toda la clase escuche la pronunciación correcta.

---

## 4. Gestión por Salones, Alumnos y Sesiones Diarias

El **Panel Docente** incluye herramientas integrales para la planificación y seguimiento del aula:

### 🏫 4.1 Gestión de Salones y Estudiantes
En la pestaña **"Salones & Alumnos"**:
* **Crear / Eliminar Salones**: Organiza tus cursos (ej. *10-A Mañana*, *10-B Tarde*, *Inglés Básico 2*).
* **Agregar Alumnos**: Ingresa nombres de a uno o pega la lista completa desde Excel / Google Sheets con el botón `📋 Pegar Lista desde Excel`.
* **Edición de Alumnos**: Puedes editar el nombre de cualquier estudiante o cambiar su avatar.
* **Estadísticas Acumuladas**: Monitorea fichas ganadas, número de retos acertados y veces que el alumno fue exonerado por suerte.

### 📅 4.2 Sesión Diaria Activa
En la pestaña **"Sesión Diaria"**:
1. **Tema Pedagógico**: Define el tema central de la clase (ej. *Past Continuous & Travel*, *Daily Routines & Frequency Adverbs*).
2. **Nivel CEFR**: Elige el nivel objetivo (A1, A2, B1, B2, C1).
3. **Variantes de Preguntas**:
   * 🎲 **Aleatorio / Mixto**: Combina todos los formatos para dinamismo.
   * 📝 **Selección Múltiple**: 4 opciones tradicionales (A, B, C, D).
   * ✏️ **Completar Espacios**: Frases con huecos (`____`).
   * ➕ **Frases en Afirmativo**: El alumno debe formular en voz alta una oración afirmativa.
   * ➖ **Frases en Negativo**: El alumno debe formular una oración negativa con auxiliares.
   * ❓ **Formular Preguntas**: El alumno debe formular una pregunta (Wh- o Yes/No).
4. **Registro en Vivo**: A medida que los alumnos juegan en el proyector, la tabla de turnos registra en vivo la hora, alumno, máquina jugada, si fue exonerado por suerte o si respondió el reto, aciertos y fichas.
5. **Finalizar y Guardar Sesión**: Al concluir la clase, presiona **"Guardar y Cerrar Sesión en Historial"** para archivarla permanentemente.

### 📜 4.3 Historial Permanente de Sesiones
En la pestaña **"Historial"**:
* Revisa todas las sesiones anteriores archivadas por fecha y salón.
* Consulta el porcentaje de alumnos exonerados por suerte vs los desafiados académicamente y el porcentaje de aciertos.
* **Ver Turnos Detallados**: Despliega el registro completo de cada alumno en esa sesión.
* **Reanudar Tema**: Carga con un clic el tema y variantes de una sesión anterior para continuar repasando.

---

## 5. Dinámica de Aula: Ruleta de Selección y Regla de Exoneración por Suerte

La aplicación está diseñada para ser proyectada en el aula (o smartboard) sin requerir que los estudiantes inicien sesión ni usen dispositivos móviles.

### 🎲 5.1 Sorteo con la Ruleta de Alumnos
1. En la pantalla principal o durante el juego, presiona **`🎲 GIRAR RULETA DE ALUMNOS`**.
2. La ruleta física girará con sonidos mecánicos y elegirá a un estudiante al azar con fanfarria de jackpot y confeti 🎉.
3. El alumno seleccionado pasa al frente o elige sus variables de juego.

### 🌟 5.2 Regla de Exoneración por Suerte ("Tener Suerte")
El alumno elige sus variables de casino y prueba su suerte:

*  **Lucky Slots**: Elige su apuesta y tira de la palanca.
  * **Si coinciden 2 o 3 rodillos**: **¡QUEDA EXONERADO!** Cobra sus fichas ganadas y **NO** responde ninguna pregunta.
  * **Si no coinciden**: Aparece el reto de inglés. Debe responder para salvar su turno.
* 🎡 **Ruleta Vegas**: Elige su apuesta y predice el color (🔴 Rojo, ⚫ Negro o 🟡 Jackpot).
  * **Si acierta**: **¡QUEDA EXONERADO!** Cobra el premio de la mesa sin responder preguntas.
  * **Si no acierta**: Debe responder la pregunta de la categoría en que cayó la ruleta.
* 🃏 **21 Blackjack**: Juega su mano contra el crupier (Hit / Stand).
  * **Si derrota a la casa o hace 21**: **¡QUEDA EXONERADO!** Cobra sus fichas y se salva del reto.
  * **Si pierde o se pasa**: Debe responder el reto pedagógico para salvar la ronda.

### ⚡ 5.3 Botón "Reto IA" en Cada Turno
Tanto en la barra superior de turnos como dentro de cada juego (cuando el alumno tiene mala suerte), el docente dispone del botón **`⚡ Reto IA`** (o `⚡ Generar Otro Reto IA`). Al presionarlo, Groq genera instantáneamente una pregunta única y contextualizada al tema de la sesión activa.

### 🗣️ 5.4 Evaluación Oral para el Docente
En retos orales (crear frases o completar):
* Botón **`✅ Correcto (+Fichas)`**: Otorga el puntaje y celebra el acierto.
* Botón **`❌ Incorrecto`**: Registra el fallo y muestra la retroalimentación.
* Botón **`👁️ Ver Solución Modelo`**: Despliega la frase ideal esperada y permite reproducirla con TTS en inglés nativo.

---

## 6. Despliegue y Publicación en GitHub Pages

Tu proyecto incluye un flujo automatizado en `.github/workflows/deploy.yml`.

### Paso 6.1: Activar GitHub Actions en tu Repositorio
1. Entra a tu repositorio en GitHub: `https://github.com/TU_USUARIO/TU_REPOSITORIO`.
2. Ve a la pestaña **Settings** (Ajustes).
3. En la barra lateral izquierda, selecciona **Pages**.
4. En **Build and deployment** > **Source**, selecciona:
   👉 **`GitHub Actions`**

### Paso 6.2: Subir Cambios y Publicar
Desde la terminal en tu computadora:

```powershell
git add .
git commit -m "feat: updated casino classroom app"
git push origin master
```

GitHub Actions compilará la aplicación y la publicará automáticamente en tu URL de GitHub Pages.

---

## 7. Preguntas Frecuentes

### ¿Necesitan los alumnos instalar algo o registrarse?
**No.** La aplicación funciona en modo proyección en pantalla gigante o proyector. Todo el control lo gestiona el docente en el aula.

### ¿Se pierden los datos si cierro el navegador?
**No.** Los salones, alumnos, sesiones diarias e historial quedan guardados de forma segura y persistente en el almacenamiento local (`localStorage`) de tu navegador y sincronizados con Firebase si está conectado.
