# Pinpoint Pro

[cloudflarebutton]

Pinpoint Pro is a high-performance, real-time communication and state management platform built on Cloudflare's edge network. It leverages Durable Objects to provide globally distributed, consistent state for complex multi-user applications like chat boards, collaborative tools, and real-time dashboards.

## 🚀 Key Features

- **Edge-First Architecture**: Built entirely on Cloudflare Workers for ultra-low latency.
- **Durable State**: Utilizes Cloudflare Durable Objects for strong consistency and persistent storage.
- **Multi-Entity System**: A robust core utility that allows multiple logical entities (Users, Chats, etc.) to share a single Global Durable Object class efficiently.
- **Type-Safe API**: Full TypeScript integration between the frontend and the edge worker.
- **Modern UI**: A polished React-based interface using Tailwind CSS and Radix UI components.
- **Real-Time Ready**: Designed for low-latency state mutations and instant updates.

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend/Edge**: Cloudflare Workers, Hono (web framework).
- **Storage**: Cloudflare Durable Objects (stateful storage).
- **State Management**: Immer, Zustand, TanStack Query.
- **UI Components**: Radix UI (via Shadcn UI).
- **Runtime**: Bun.

## 📦 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- [Cloudflare Account](https://dash.cloudflare.com/) for deployment.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pinpoint-pro
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

### Local Development

To start the development server for both the frontend and the worker:

```bash
bun run dev
```

The application will be available at `http://localhost:3000`. API requests to `/api/*` are automatically handled by the local Worker instance.

## 🏗️ Project Structure

- `src/`: React frontend application.
  - `components/`: UI components and layout logic.
  - `pages/`: Application views.
  - `lib/`: Utility functions and API clients.
- `worker/`: Cloudflare Worker source code.
  - `core-utils.ts`: The underlying framework for Durable Object entity management.
  - `entities.ts`: Definition of business entities (e.g., UserEntity, ChatBoardEntity).
  - `user-routes.ts`: API route definitions.
- `shared/`: TypeScript types and mock data shared between frontend and worker.

## 🌐 Deployment

[cloudflarebutton]

Deploying to Cloudflare is seamless. The project is configured to use Cloudflare Pages for the frontend assets and Workers for the API logic.

### Commands

1. **Build the project**:
   ```bash
   bun run build
   ```

2. **Deploy to Cloudflare**:
   ```bash
   bun run deploy
   ```

This command builds the assets and uses `wrangler` to deploy the worker and its associated Durable Object bindings to your Cloudflare account.

## 🔧 Configuration

The project configuration is managed through:
- `wrangler.jsonc`: Defines the Cloudflare Worker environment, including Durable Object migrations and bindings.
- `package.json`: Manages scripts and dependencies.
- `tsconfig.json`: TypeScript configuration for both the app and the worker.

## 🛡️ Best Practices

- **Durable Object Patterns**: Use the `Entity` and `IndexedEntity` classes in `worker/core-utils.ts` to manage state. Avoid direct storage manipulation where possible to maintain consistency.
- **Type Safety**: Always update `shared/types.ts` when changing data structures to ensure frontend and backend remain in sync.
- **Edge Constraints**: Keep the worker bundle size optimized and be mindful of Durable Object resource limits.

---
*Powered by Cloudflare Workers and Durable Objects.*