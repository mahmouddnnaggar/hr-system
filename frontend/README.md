# HR Evaluation Exam Frontend

React + Vite client for the HR Evaluation Exam System.

For the complete full-stack setup guide, see the root `README.md`.

## Features

- Email-only demo login.
- Role-based routing for HR and employee users.
- HR screens for dashboard, employees, exams, assignments, and results.
- Employee screens for dashboard, assigned exams, exam slides, evidence uploads, and personal results.
- Shared API client powered by Axios.
- Form validation with React Hook Form and Zod.
- Server state management with TanStack Query.

## Tech Stack

- React 19
- Vite
- React Router
- TanStack Query
- Axios
- Tailwind CSS 4
- React Hook Form
- Zod
- Framer Motion
- Sonner
- Lucide React

## Environment

Create a local `.env` file from `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
```

`VITE_API_URL` must include `/api`.

For production, set `VITE_API_URL` to the deployed backend API URL before building or redeploying.

Example:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

## Setup

Requires Node.js `^20.19.0` or `>=22.12.0`.

```bash
npm install
npm run dev
```

The development server usually runs at:

```txt
http://localhost:5173
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Build the app for production. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |

## Deployment

The project includes `vercel.json` with a rewrite rule for React Router:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

When deploying to Vercel or another static host, configure `VITE_API_URL` and redeploy after changes.
