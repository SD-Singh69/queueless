# QueueLess

QueueLess is a virtual queue platform for customer-facing businesses. Customers can discover queues, take a token, monitor their wait and present a QR pass. Shop owners can create a shop, call the next customer and complete visits.

## Run locally

1. Create an untracked `server/.env` from `server/.env.example`. Set `MONGODB_URI` to a fresh MongoDB Atlas connection string and set `JWT_SECRET` to a random value of at least 32 characters. Never put either value in `.env.example` or source control.
2. Run `npm install` at the project root and `npm install --prefix server` for the two applications.
3. Run `npm run dev` for the Vite client and `npm run server` for the API (or `npm run dev:all`).

The client runs at `http://localhost:5173` and the API at `http://localhost:5000`. Check `http://localhost:5000/api/health`: it reports database and auth configuration status. Without the API, the interface still supports local demo sessions and local queue persistence. Use `demo@queueless.app` / `demo1234` to open the customer demo.

## Architecture

- `src/` — React, Router, Context, local-first queue fallback, QR passes, alerts and responsive UI.
- `server/src/` — Express REST API, Mongoose models, JWT authorization, request validation, security middleware and Socket.IO queue events.

Set `VITE_API_URL` to the deployed API’s `/api` URL when deploying the client. Configure the API’s `CLIENT_URL`, `MONGODB_URI`, and `JWT_SECRET` in the deployment environment.
"# queueless" 
