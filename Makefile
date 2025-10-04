.PHONY: all setup dev build start test publish clean docker-setup docker-stop

# Default target
all: build

# Install dependencies and setup the environment
setup:
	@npm install
	@cp -n .env.example .env || true
	@npm run prisma:migrate

# Run the application in development mode
dev:
	@npm run dev

# Build the application for production
build:
	@npm run build

# Start the application in production mode
start:
	@npm start

# Run tests
test:
	@npm test

# Publish the data to the public repository
publish:
	@npm run start

# Clean up build artifacts and node_modules
clean:
	@rm -rf dist node_modules
	@echo "Cleaned up build artifacts and node_modules."

# Setup for docker
docker-setup:
	docker-compose up -d --build
	docker-compose exec app npm run prisma:migrate
	docker-compose exec app npm run prisma:seed

# Stop and remove docker containers
docker-stop:
	docker-compose down