# Use the official Node.js image
FROM node:14

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package.json yarn.lock ./

# Install dependencies using Yarn.
RUN yarn install --production

# Copy local code to the container image.
COPY . .

# Run the web service on container startup.
CMD [ "node", "index.js" ]

# Inform Docker that the container is listening on the specified port.
EXPOSE 8080