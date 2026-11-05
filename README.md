# DevFinder 🚀 - Explorador de Perfiles de GitHub

Una aplicación web moderna, responsiva y con diseño premium que interactúa en tiempo real con la **API REST de GitHub**, aplicando manejo y validación de errores mediante bloques `try...catch`.

---

## ✨ Características Principales

1. **Diseño Premium & UI Fluida**:
   - Efecto Glassmorphism y orbes de iluminación ambiental en CSS puro.
   - Modo Oscuro y Modo Claro con detección y persistencia en `localStorage`.
   - Totalmente responsivo para móviles, tablets y ordenadores.

2. **Validación Exhaustiva con `try...catch`**:
   - **Validación de entrada**: Comprueba que el nombre de usuario no esté vacío, respete el límite de 39 caracteres y cumpla con el formato válido de GitHub (`/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/`).
   - **Manejo de códigos HTTP**: Detecta `404` (usuario inexistente), `403` (límite de peticiones de la API de GitHub alcanzado) y errores de red o conectividad.
   - **Consumo modular de Repositorios**: Un segundo bloque `try...catch` consulta de forma independiente los 6 repositorios más recientes/populares sin interrumpir el despliegue de los datos de perfil si fallan los repositorios.

3. **Información Visualizada**:
   - Avatar con efecto hover e indicador de tipo (Usuario / Organización).
   - Nombre completo, `@username` y enlace directo al perfil oficial.
   - Fecha de registro formateada en español.
   - Biografía pública.
   - Cuadrícula de estadísticas: Repositorios públicos, Seguidores, Siguiendo y Gists.
   - Metadatos con enlaces e iconos: Ubicación, Empresa, Blog o Sitio Web y cuenta de X / Twitter.
   - Tarjetas de repositorios con estrellas, forks y etiquetas de color según el lenguaje de programación.

---

## 🛠️ Estructura del Proyecto

```
GIT HIB API/
├── index.html   # Estructura semántica, accesibilidad y contenedores dinámicos
├── style.css    # Estilos modernos, variables CSS, animaciones y diseño responsivo
├── app.js       # Lógica asíncrona (async/await), validación con try...catch y renderizado
└── README.md    # Documentación del proyecto
```

---

## 🚀 Cómo Ejecutarlo

Puedes abrir directamente el archivo `index.html` en cualquier navegador web moderno:

1. Haz doble clic en [index.html](file:///c:/Users/sena%20cset/Desktop/GIT%20HIB%20API/index.html).
2. O levanta un servidor local si tienes una extensión como Live Server en tu editor:
   ```bash
   # Ejemplo con npx (opcional):
   npx serve .
   ```
