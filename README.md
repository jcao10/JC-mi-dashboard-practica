# Dashboard de Trading

Este es un dashboard para visualizar datos de trading, desarrollado con React, Material-UI y Chart.js.

## Características

- Visualización de datos por canal y por día
- Gráficos interactivos
- Tablas con información detallada
- Diseño responsive
- Tema personalizado con Material-UI

## Requisitos

- Node.js 16.x o superior
- npm 7.x o superior

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd dashboard-app
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

4. Construir para producción:
```bash
npm run build
```

## Estructura del Proyecto

```
dashboard-app/
├── src/
│   ├── components/
│   │   └── Dashboard.jsx
│   ├── index.js
│   └── index.css
├── scripts/
│   └── dbQuery.cjs
├── server.js
├── vite.config.js
└── package.json
```

## Tecnologías Utilizadas

- React 18
- Material-UI 5
- Chart.js
- Express
- PostgreSQL
- Vite

## Licencia

ISC 