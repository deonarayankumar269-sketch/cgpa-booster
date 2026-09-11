# Academic Hub

A student workspace for study resources, academic calculations and collaborative rooms.

## Local development

1. Copy `.env.example` to `.env` and set `JWT_SECRET`.
2. Run `docker compose up --build`.
3. Open `http://localhost:8080`.

For separate development:
- Server: `cd server && npm install && npm run dev`
- Client: `cd client && npm install && npm run dev`

MongoDB can be provided through Docker Compose or a local MongoDB instance.
