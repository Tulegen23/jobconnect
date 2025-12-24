# Быстрый старт JobConnect

## Запуск проекта одной командой

```bash
docker-compose up --build
```

Это поднимет все сервисы:
- **MongoDB** на порту 27017
- **Backend API** на порту 4000
- **Frontend** на порту 3000
- **Mongo Express** (опционально) на порту 8081

## Первый запуск

1. Дождитесь полного запуска всех контейнеров (может занять 2-3 минуты)

2. Заполните базу данных тестовыми данными:
```bash
docker-compose exec api npm run seed
```

3. Откройте в браузере:
   - Frontend: http://localhost:3000
   - GraphQL Playground: http://localhost:4000/graphql
   - Mongo Express: http://localhost:8081 (admin/admin)

## Тестовые учетные данные

После выполнения seed:

**Работодатель:**
- Email: `employer1@example.com`
- Password: `employer123`

**Соискатель:**
- Email: `candidate1@example.com`
- Password: `candidate123`

## Остановка

```bash
docker-compose down
```

Для полной очистки (включая данные БД):
```bash
docker-compose down -v
```

## Проверка работоспособности

1. Откройте http://localhost:3000
2. Зарегистрируйтесь или войдите с тестовыми данными
3. Попробуйте создать вакансию (как работодатель) или подать заявку (как соискатель)

## Troubleshooting

### Проблемы с портами
Если порты заняты, измените их в `docker-compose.yml`

### Проблемы с билдом
```bash
docker-compose build --no-cache
docker-compose up
```

### Просмотр логов
```bash
docker-compose logs -f api    # логи бэкенда
docker-compose logs -f client # логи фронтенда
docker-compose logs -f mongo  # логи базы данных
```

