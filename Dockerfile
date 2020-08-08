FROM node:12.18.3-alpine
EXPOSE 9001 9229

WORKDIR /home/app

COPY package.json /home/app/
COPY yarn.lock /home/app/

RUN yarn install --frozen-lockfile

COPY . /home/app

CMD yarn dev
