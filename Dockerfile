ARG APP_NAME

FROM node:16-alpine as backend
WORKDIR /app/backend
COPY /backend/package*.json ./
RUN npm install
COPY /backend ./
RUN npm run backend:build
CMD ["npm", "run", "backend:dev"]

FROM node:16-alpine as frontend-build
WORKDIR /app/frontend
COPY /frontend/package*.json ./
RUN npm install
COPY /frontend ./
RUN npm run frontend:build

FROM nginx as frontend
RUN mkdir -p /srv/www
COPY --from=frontend-build /app/frontend/build /srv/www/
COPY /nginx.conf /etc/nginx/conf.d/default.conf

FROM ${APP_NAME}
