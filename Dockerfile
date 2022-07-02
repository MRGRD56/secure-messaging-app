ARG APP_NAME

FROM node:16-alpine as common
WORKDIR /app/common
COPY /common/package*.json ./
RUN npm install
COPY /common ./
#RUN npx -y yalc publish --private

FROM node:16-alpine as backend
COPY --from=common /app/common /app/common
WORKDIR /app/backend
COPY /backend/package*.json ./
#RUN npx -y yalc add @secure-messaging-app/common
RUN npm install
COPY /backend ./
#COPY --from=common /app/common /app/backend/node_modules/@secure-messaging-app/common
RUN npm run backend:build
CMD ["npm", "run", "backend:dev"]

#FROM node:16-alpine as backend
#COPY --from=common /app/common/ /app/common/
#COPY /backend/package*.json /app/backend/
##RUN npx -y yalc add @secure-messaging-app/common
#RUN npm install
#COPY /backend /app/backend/
#RUN (cd /app/backend && npm run backend:build)
#CMD ["npm", "run", "backend:dev"]

FROM node:16-alpine as frontend-build
COPY --from=common /app/common/ /app/common/
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
