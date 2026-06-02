# StockFlow - Sistema de Inventario

Sistema web para la gestión de inventario de productos. Permite crear, editar, eliminar y consultar productos con soporte de múltiples lotes y precios por fecha de ingreso.

## Stack

- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** .NET 8 Web API + Dapper
- **Base de datos:** PostgreSQL 16
- **Contenedores:** Docker + Docker Compose

## Cómo ejecutar

Tener Docker Desktop instalado y ejecutar:

```bash
docker-compose up --build -d
```

Eso levanta los 3 servicios:

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3030 |
| API      | http://localhost:5050 |
| Swagger  | http://localhost:5050/swagger |

## Credenciales de acceso

| Usuario   | Contraseña | Rol |
|-----------|-----------|-----|
| superusr  | Super1234 | Admin (CRUD completo) |
| consulta  | Consul123 | Viewer (solo lectura) |

## Comandos útiles

```bash
# detener todo
docker-compose down

# detener y borrar la base de datos
docker-compose down -v

# ver logs del backend
docker-compose logs -f api
```
