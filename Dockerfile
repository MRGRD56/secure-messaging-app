ARG APP_NAME

FROM node:16-alpine as common
WORKDIR /common
COPY /common/package.json ./
COPY /common/package-lock.json ./
RUN npm install
COPY /common ./

FROM node:16-alpine as backend
WORKDIR /backend
COPY --from=common /common/ /common/
COPY /backend/package.json ./
COPY /backend/package-lock.json ./
RUN npm install
COPY /backend ./
RUN npm run backend:build
CMD ["npm", "run", "backend:dev"]

FROM node:16-alpine as frontend-build
COPY --from=common /common/ /common/
WORKDIR /frontend
COPY /frontend/package.json ./
COPY /frontend/package-lock.json ./
RUN npm install
COPY /frontend ./
RUN npm run frontend:build

FROM nginx as frontend
RUN mkdir -p /srv/www
COPY --from=frontend-build /frontend/build /srv/www/
COPY /nginx.conf /etc/nginx/conf.d/default.conf

FROM ${APP_NAME}
