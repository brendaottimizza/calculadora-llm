# Build from the repository root. The calculator does not require the API server.
# Debian (glibc) matches the native Vite/Tailwind dependencies in the lockfile.
FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN npm install --global pnpm@10.26.1

# Keep dependency installation cached when only application sources change.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY artifacts/llm-costs/package.json ./artifacts/llm-costs/package.json
COPY lib/api-client-react/package.json ./lib/api-client-react/package.json

# Vite and React are devDependencies, needed only in this build stage.
RUN pnpm --filter @workspace/llm-costs... install --frozen-lockfile

COPY tsconfig.base.json ./tsconfig.base.json
COPY artifacts/llm-costs/ ./artifacts/llm-costs/
COPY lib/api-client-react/ ./lib/api-client-react/

# Defaults required by vite.config.ts; no Dokploy build variables are needed.
RUN NODE_ENV=production PORT=80 BASE_PATH=/ pnpm --filter @workspace/llm-costs run build

FROM nginx:stable-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/artifacts/llm-costs/dist/public/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:80/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]
