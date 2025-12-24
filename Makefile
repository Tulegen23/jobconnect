.PHONY: up down build restart logs seed test clean

# Запуск всех сервисов
up:
	docker-compose up -d

# Запуск с пересборкой
build:
	docker-compose up --build -d

# Остановка всех сервисов
down:
	docker-compose down

# Остановка с удалением volumes
clean:
	docker-compose down -v

# Просмотр логов
logs:
	docker-compose logs -f

# Логи API
logs-api:
	docker-compose logs -f api

# Логи клиента
logs-client:
	docker-compose logs -f client

# Заполнение БД тестовыми данными
seed:
	docker-compose exec api npm run seed

# Запуск тестов
test:
	docker-compose exec api npm test

# Перезапуск
restart:
	docker-compose restart

# Статус сервисов
status:
	docker-compose ps

