SHELL := /bin/zsh

FRONTEND_PORT := 5955
BACKEND_PORT := 8955

.PHONY: dev dev-frontend dev-backend stop-ports

stop-ports:
	@PIDS="$$(lsof -tiTCP:$(FRONTEND_PORT),$(BACKEND_PORT) -sTCP:LISTEN 2>/dev/null || true)"; \
	if [ -n "$$PIDS" ]; then \
		echo "Stopping existing servers on ports $(FRONTEND_PORT) and $(BACKEND_PORT): $$PIDS"; \
		echo "$$PIDS" | xargs kill 2>/dev/null || true; \
		sleep 1; \
		REMAINING="$$(lsof -tiTCP:$(FRONTEND_PORT),$(BACKEND_PORT) -sTCP:LISTEN 2>/dev/null || true)"; \
		if [ -n "$$REMAINING" ]; then \
			echo "Force stopping remaining processes: $$REMAINING"; \
			echo "$$REMAINING" | xargs kill -9 2>/dev/null || true; \
			sleep 1; \
		fi; \
	fi

dev: stop-ports
	@echo "Starting frontend on http://localhost:$(FRONTEND_PORT)"
	@echo "Starting backend on http://localhost:$(BACKEND_PORT)"
	@trap 'kill 0' INT TERM EXIT; \
	npm run dev:backend & \
	npm run dev:frontend & \
	wait

dev-frontend:
	npm run dev:frontend

dev-backend:
	npm run dev:backend
