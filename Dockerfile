
FROM node:10-alpine

RUN mkdir -p /home/node/yelpcamp/node_modules && chown -R node:node /home/node/yelpcamp

WORKDIR /home/node/yelpcamp

COPY package*.json ./

USER node

RUN npm install

EXPOSE 9086

COPY --chown=node:node . .

CMD [ "node", "app.js" ]