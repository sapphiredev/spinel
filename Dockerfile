# ================ #
#    Base Stage    #
# ================ #

FROM node:16-alpine as base

WORKDIR /usr/src/app

ENV HUSKY=0
ENV CI=true
ENV LOG_LEVEL=info

# RUN apk add --no-cache dumb-init

COPY --chown=node:node yarn.lock .
COPY --chown=node:node package.json .
COPY --chown=node:node .yarnrc.yml .
COPY --chown=node:node .yarn/ .yarn/
COPY --chown=node:node .env .env

RUN sed -i 's/"prepare": "husky install .github\/husky"/"prepare": ""/' ./package.json

# ENTRYPOINT ["dumb-init", "--"]

# ================ #
#   Builder Stage  #
# ================ #

FROM base as builder

ENV NODE_ENV="development"

COPY --chown=node:node tsconfig.base.json .
COPY --chown=node:node tsup.config.ts .
COPY --chown=node:node scripts/ scripts/
COPY --chown=node:node src/ src/

RUN yarn install --immutable
RUN yarn run build

# ================ #
#   Runner Stage   #
# ================ #

FROM base AS runner

ENV NODE_ENV="production"
ENV NODE_OPTIONS="--enable-source-maps"

WORKDIR /usr/src/app

COPY --chown=node:node --from=builder /usr/src/app/dist dist

RUN yarn workspaces focus --all --production

USER node

CMD [ "yarn", "run", "start"]
