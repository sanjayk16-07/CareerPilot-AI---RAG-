# API Notes

The backend exposes a versioned API under `/api/v1`.

Current endpoints:

- `GET /health` - service health check
- `GET /api/v1/health` - versioned API health check

Future routers should be added under `backend/app/api/v1/routers` and registered in `backend/app/api/v1/api.py`.

