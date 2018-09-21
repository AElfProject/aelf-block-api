FROM node:8.11.1
COPY . /app
WORKDIR /app
EXPOSE 7101/tcp
ENTRYPOINT npm start
