# JobConnect

JobConnect — платформа поиска работы, где компании публикуют вакансии, а кандидаты откликаются на них.

## Описание проекта

JobConnect — это современная платформа для поиска работы, построенная на стеке MERN (MongoDB, Express.js, React/Next.js, Node.js). Платформа позволяет работодателям публиковать вакансии, а соискателям — находить подходящие позиции и подавать заявки.

### Цели проекта

- Создать удобную платформу для связи работодателей и соискателей
- Обеспечить быстрый поиск вакансий с фильтрацией
- Предоставить инструменты для управления вакансиями и заявками
- Реализовать real-time уведомления о новых вакансиях и изменениях статуса заявок

### Доменная область

Платформа работает в сфере рекрутинга и HR-технологий, объединяя работодателей и соискателей.

### Роли пользователей

1. **Соискатель (Candidate)** — может просматривать вакансии, применять фильтры, подавать заявки и отслеживать их статус
2. **Работодатель (Employer)** — может создавать компанию, публиковать вакансии, просматривать заявки и управлять их статусами

## Схема данных

### Модели данных

1. **User** (Пользователь)
   - email, password, firstName, lastName, role, phone, avatar, bio, skills, experience, location
   - Связи: один-ко-многим с Company (owner), один-ко-многим с Application (candidate)

2. **Company** (Компания)
   - name, description, website, logo, industry, size, location, foundedYear, owner, employees
   - Связи: многие-к-одному с User (owner), один-ко-многим с Job

3. **Job** (Вакансия)
   - title, description, requirements, salaryMin, salaryMax, currency, employmentType, location, remote, status, company, category, experienceLevel, skills, applicationsCount, viewsCount
   - Связи: многие-к-одному с Company, один-ко-многим с Application

4. **Application** (Заявка)
   - job, candidate, coverLetter, status, resume, notes, reviewedBy, reviewedAt
   - Связи: многие-к-одному с Job, многие-к-одному с User (candidate, reviewedBy)

### Связи между моделями

- User (employer) → Company (owner): один-ко-многим
- Company → Job: один-ко-многим
- User (candidate) → Application: один-ко-многим
- Job → Application: один-ко-многим

## Технологический стек

### Backend
- **Node.js** + **Express.js** — серверная часть
- **TypeScript** — строгая типизация
- **GraphQL** — API (Queries, Mutations, Subscriptions)
- **MongoDB** + **Mongoose** — база данных
- **JWT** — аутентификация
- **Jest** — тестирование
- **Docker** — контейнеризация

### Frontend
- **Next.js 14** (App Router) — React фреймворк
- **TypeScript** — строгая типизация
- **Apollo Client** — GraphQL клиент с поддержкой Subscriptions
- **Zustand** — управление состоянием
- **TailwindCSS** — стилизация
- **React Hook Form** + **Zod** — формы и валидация

## Как запустить локально

### Требования

- Docker и Docker Compose
- Node.js 20+ (для локальной разработки без Docker)

### Запуск через Docker (рекомендуется)

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd jobconnect
```

2. Запустите все сервисы одной командой:
```bash
docker-compose up --build
```

Это поднимет:
- MongoDB на порту 27017
- Mongo Express (UI для БД) на порту 8081
- Backend API на порту 4000
- Frontend на порту 3000

3. Заполните базу данных тестовыми данными:
```bash
docker-compose exec api npm run seed
```

4. Откройте в браузере:
- Frontend: http://localhost:3000
- GraphQL Playground: http://localhost:4000/graphql
- Mongo Express: http://localhost:8081 (admin/admin)

**Примечание:** Переменные окружения уже настроены в `docker-compose.yml`. Для кастомизации создайте `.env` файлы на основе `.env.example`.

### Запуск без Docker (для разработки)

#### Backend

```bash
cd server
npm install
npm run dev
```

#### Frontend

```bash
cd client
npm install
npm run dev
```

### Заполнение базы данных (Seeding)

```bash
cd server
npm run seed
```

Это создаст тестовых пользователей:
- **Employer**: employer1@example.com / employer123
- **Candidate**: candidate1@example.com / candidate123

## Как проверить real-time функциональность

### Подписка на новые вакансии

1. Откройте GraphQL Playground: http://localhost:4000/graphql
2. Выполните подписку:
```graphql
subscription {
  jobCreated {
    id
    title
    company {
      name
    }
    createdAt
  }
}
```
3. В другом окне/вкладке создайте новую вакансию через API или через фронтенд
4. Вы увидите обновление в реальном времени в подписке

### Подписка на изменения статуса заявок

1. В GraphQL Playground выполните:
```graphql
subscription {
  applicationStatusChanged {
    id
    status
    job {
      title
    }
    candidate {
      firstName
      lastName
    }
  }
}
```
2. Измените статус заявки через API или фронтенд
3. Обновление придет в реальном времени

### Проверка через фронтенд

1. Зарегистрируйтесь как соискатель
2. Откройте консоль браузера (F12)
3. При создании новой вакансии работодателем вы получите уведомление через WebSocket

## Демо-ссылки (Production)

*Добавьте ссылки на production окружение после деплоя*

- Frontend: https://your-frontend-url.com
- GraphQL Endpoint: https://your-api-url.com/graphql
- WebSocket Endpoint: wss://your-api-url.com/graphql

### Тестовые учетные данные

- **Employer**: employer1@example.com / employer123
- **Candidate**: candidate1@example.com / candidate123

## Скрипты

### Backend

- `npm run dev` — запуск в режиме разработки
- `npm run build` — сборка проекта
- `npm start` — запуск production версии
- `npm test` — запуск тестов
- `npm run seed` — заполнение БД тестовыми данными
- `npm run lint` — проверка кода

### Frontend

- `npm run dev` — запуск в режиме разработки
- `npm run build` — сборка проекта
- `npm start` — запуск production версии
- `npm run lint` — проверка кода

## GraphQL API

### Queries (6+)

- `me` — текущий пользователь
- `user(id)` — пользователь по ID
- `users(role, limit, offset)` — список пользователей
- `company(id)` — компания по ID
- `companies(limit, offset)` — список компаний
- `myCompany` — моя компания (для работодателя)
- `job(id)` — вакансия по ID
- `jobs(filters, limit, offset)` — список вакансий с фильтрами
- `myJobs(status, limit, offset)` — мои вакансии
- `application(id)` — заявка по ID
- `myApplications(status, limit, offset)` — мои заявки
- `jobApplications(jobId, status, limit, offset)` — заявки на вакансию

### Mutations (6+)

- `register(input)` — регистрация
- `login(input)` — вход
- `createCompany(input)` — создание компании
- `updateCompany(id, input)` — обновление компании
- `deleteCompany(id)` — удаление компании
- `createJob(input)` — создание вакансии
- `updateJob(id, input)` — обновление вакансии
- `publishJob(id)` — публикация вакансии
- `deleteJob(id)` — удаление вакансии
- `createApplication(input)` — создание заявки
- `updateApplication(id, input)` — обновление заявки
- `deleteApplication(id)` — удаление заявки

### Subscriptions (1+)

- `jobCreated` — новая вакансия создана
- `applicationCreated` — новая заявка создана
- `applicationStatusChanged` — статус заявки изменен

## Тестирование

Проект включает unit и integration тесты:

- **Unit тесты**: тестирование резолверов, утилит
- **Integration тесты**: тестирование полного workflow

Запуск тестов:
```bash
cd server
npm test
```

Покрытие кода:
```bash
npm run test:coverage
```

## Архитектура

### Backend структура

```
server/
├── src/
│   ├── config/          # Конфигурация
│   ├── db/              # Подключение к БД
│   ├── models/           # Mongoose модели
│   ├── graphql/
│   │   ├── types/        # GraphQL схемы
│   │   ├── resolvers/    # GraphQL резолверы
│   │   └── context.ts    # GraphQL контекст
│   ├── middleware/       # Express middleware
│   ├── utils/            # Утилиты (auth, etc.)
│   ├── scripts/          # Скрипты (seed, etc.)
│   └── index.ts          # Точка входа
├── __tests__/            # Тесты
└── package.json
```

### Frontend структура

```
client/
├── app/                  # Next.js App Router
│   ├── (routes)/         # Страницы
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Глобальные стили
├── lib/
│   ├── apollo.tsx        # Apollo Client настройка
│   ├── graphql/          # GraphQL запросы
│   └── store/            # Zustand stores
└── components/           # React компоненты
```

## Команда / Роли

*Укажите, кто работал над проектом и что делал*

- **Разработчик 1**: Backend (GraphQL API, модели, тесты)
- **Разработчик 2**: Frontend (UI, интеграция с API)

## Лицензия

MIT

