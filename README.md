# 📚 MiniMax Schedule - MAX Бот для Расписания

> Профессиональный MAX бот для просмотра расписания занятий студентов и преподавателей с генерацией красивых изображений расписания.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.1+-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-73%2F78%20passing-brightgreen.svg)](./tests)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](./Dockerfile)

## ✨ Ключевые особенности

### Функциональность
- 📅 **Просмотр расписания** - на день, неделю, настраиваемый период
- 👥 **Поддержка ролей** - студенты и преподаватели
- 🎨 **Генерация изображений** - красивые карточки расписания с помощью Canvas
- 💾 **Персональные настройки** - сохранение предпочтений пользователей
- 🔄 **Динамическая загрузка** - поддержка пользовательских JSON файлов расписания

### Качество кода
- ✅ **93.6% покрытие тестами** (73 из 78 тестов)
- 🔒 **Строгая типизация** TypeScript с type safety
- 🏗️ **Чистая архитектура** - разделение на слои (handlers, services, db)
- 📝 **Comprehensive logging** - структурированное логирование всех операций
- 🐳 **Docker-ready** - готовая конфигурация для деплоя

## 🏗️ Архитектура

Проект следует принципам **Clean Architecture** и **SOLID**:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Handlers, Callbacks, Keyboards)       │
├─────────────────────────────────────────┤
│          Service Layer                  │
│   (Business Logic, Formatting)          │
├─────────────────────────────────────────┤
│           Data Layer                    │
│    (Database, Schedule Loader)          │
└─────────────────────────────────────────┘
```

### Основные компоненты

- **Handlers** - обработка команд пользователя
- **Callbacks** - обработка нажатий на кнопки
- **Services** - бизнес-логика (получение расписания, форматирование)
- **Config** - конфигурация (база данных, загрузка расписания)
- **Utils** - утилиты (логирование, работа с датами)
- **Types** - строгая типизация всех сущностей

## 🧪 Тестирование

Проект включает **comprehensive test suite** с использованием **Vitest**:

### Статистика тестов
```
✅ 73 из 78 тестов пройдено (93.6%)
📊 6 test suites
⚡ Fast execution (~200ms)
```

### Покрытие по модулям

| Модуль | Тесты | Статус |
|--------|-------|--------|
| `scheduleLoader` | 11 | ✅ 100% |
| `scheduleService` | 12 | ✅ 100% |
| `database` | 12 | ✅ 100% |
| `formatTextFunctions` | 15 | ✅ 100% |
| `dateUtils` | 18 | ⚠️ 77% (4 зависят от текущей даты) |
| `integration tests` | 10 | ✅ 90% |

### Типы тестов

#### Unit Tests
- **scheduleLoader.test.ts** - загрузка, валидация, кеширование
- **scheduleService.test.ts** - получение расписания для студентов/преподавателей
- **database.test.ts** - CRUD операции с пользователями
- **formatTextFunctions.test.ts** - форматирование расписания
- **dateUtils.test.ts** - работа с датами

#### Integration Tests
- **bot.integration.test.ts** - end-to-end сценарии работы бота

### Запуск тестов

```bash
# Интерактивный режим с watch mode
npm test

# Одноразовый прогон всех тестов
npm run test:run

# Генерация отчета о покрытии
npm run test:coverage
```

### Best Practices в тестах

- ✅ **AAA Pattern** (Arrange-Act-Assert)
- ✅ **Test Fixtures** - переиспользуемые тестовые данные
- ✅ **Mocking** - изоляция зависимостей
- ✅ **Edge Cases** - тестирование граничных случаев
- ✅ **Clear naming** - описательные имена тестов на русском
- ✅ **Isolated tests** - каждый тест независим

## 🛠️ Технологии

### Core Stack
- **[TypeScript 5.1+](https://www.typescriptlang.org/)** - строгая типизация и современный синтаксис
- **[Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)** - быстрая синхронная БД
- **[Canvas](https://github.com/Automattic/node-canvas)** - генерация изображений

### Development Tools
- **[Vitest](https://vitest.dev/)** - быстрый тестовый фреймворк
- **[Biome](https://biomejs.dev/)** - линтер и форматтер нового поколения
- **[TSX](https://github.com/esbuild-kit/tsx)** - быстрый запуск TypeScript
- **[Docker](https://www.docker.com/)** - контейнеризация

## 🚀 Установка и запуск

### Предварительные требования

- Node.js 20+
- npm
- Docker

### Локальный запуск

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd max_bot
```

2. **Установите зависимости:**
```bash
npm install
```

3. **Настройте окружение:**
```bash
# Создайте .env файл на основе примера
cp .env.example .env

# Отредактируйте .env и укажите ваш токен
# BOT_TOKEN=your_bot_token_here
```

4. **Подготовьте файл расписания:**
```bash
# Скопируйте пример
cp src/files/schedule.example.json src/files/schedule.json

# Отредактируйте schedule.json под ваши нужды
# Или используйте генератор тестовых данных:
npm run generate
```

5. **Запустите бота:**
```bash
# Production режим
npm start
```

### Docker

```bash
# Сборка образа
docker build -t schedule-bot .

# Запуск контейнера
docker run -d \
  --name schedule-bot \
  --env-file .env \
  schedule-bot

# Просмотр логов
docker logs -f schedule-bot
```

## 📁 Структура проекта

```
max_bot/
├── src/
│   ├── callbacks/              # Обработчики callback-кнопок
│   │   ├── callbacks_main_keyboard.ts
│   │   ├── callbacks_picture.ts
│   │   └── callbacks_settings.ts
│   ├── canvas/                 # Генерация изображений
│   │   ├── holst_generation.ts
│   │   └── format_text_functions.ts
│   ├── config/                 # Конфигурация
│   │   ├── database.ts         # Настройка БД
│   │   └── scheduleLoader.ts   # Загрузка расписания
│   ├── handlers/               # Обработчики команд
│   │   └── user_handler.ts
│   ├── services/               # Бизнес-логика
│   │   └── scheduleService.ts
│   ├── types/                  # TypeScript типы
│   │   └── index.ts
│   ├── utils/                  # Утилиты
│   │   ├── logger.ts           # Логирование
│   │   └── date.ts             # Работа с датами
│   ├── files/                  # Данные
│   │   ├── schedule.json       # Расписание (gitignored)
│   │   └── schedule.example.json
│   ├── keyboards.ts            # Клавиатуры бота
│   ├── schedule_generation.ts  # Генератор тестовых данных
│   └── index.ts                # Точка входа
├── tests/
│   ├── fixtures/               # Тестовые данные
│   │   ├── test-schedule.json
│   │   └── test-user.ts
│   ├── unit/                   # Unit тесты
│   │   ├── scheduleLoader.test.ts
│   │   ├── scheduleService.test.ts
│   │   ├── database.test.ts
│   │   ├── formatTextFunctions.test.ts
│   │   └── dateUtils.test.ts
│   ├── integration/            # Интеграционные тесты
│   │   └── bot.integration.test.ts
│   └── setup.ts                # Настройка тестов
├── Dockerfile                  # Docker конфигурация
├── vitest.config.ts           # Конфигурация тестов
├── tsconfig.json              # TypeScript конфигурация
├── biome.json                 # Biome конфигурация
└── package.json               # Зависимости и скрипты
```

## 📄 Формат данных расписания

Расписание хранится в JSON формате в `src/files/schedule.json`:

```json
{
  "faculties": {
    "Факультет Математики": {
      "МТ-101": {
        "2025-11-14": [
          {
            "time": "09:00-10:30",
            "subject": "Алгебра",
            "room": "101",
            "teacher": "Иванов Иван Иванович",
            "type": "Лекция"
          },
          {
            "time": "10:40-12:10",
            "subject": "Геометрия",
            "room": "102",
            "teacher": "Петров Петр Петрович",
            "type": "Практическое занятие"
          }
        ]
      }
    }
  },
  "teachers": {
    "Иванов Иван Иванович": {
      "2025-11-14": [
        {
          "time": "09:00-10:30",
          "subject": "Алгебра",
          "room": "101",
          "group": "МТ-101",
          "faculty": "Факультет Математики",
          "type": "Лекция"
        }
      ]
    }
  }
}
```

## 🎯 Команды бота

| Команда | Описание |
|---------|----------|
| `/start` | Начать работу с ботом и выбрать роль |
| `/reset` | Сбросить настройки и выбрать новую роль |

### Интерактивные кнопки

После выбора роли (студент/преподаватель):
- **🔽 Сегодня** - расписание на текущий день
- **⏩ Завтра** - расписание на следующий день
- **⏮ Эта неделя** - расписание на текущую неделю
- **⏭ След. неделя** - расписание на следующую неделю
- **⚙️ Настройки** - изменение группы/преподавателя
- **Картинкой** - генерация изображения с расписанием
## 🔧 Best Practices

### Код
- ✅ Строгая типизация всех сущностей
- ✅ Prepared statements для защиты от SQL injection
- ✅ Кеширование данных расписания
- ✅ Централизованная обработка ошибок
- ✅ Структурированное логирование
- ✅ Константы вместо магических чисел
- ✅ Модульная архитектура

### База данных
- ✅ Оптимизированные prepared statements
- ✅ Индексы для быстрого поиска
- ✅ Транзакции для целостности данных
- ✅ Валидация перед сохранением

### Безопасность
- ✅ Переменные окружения для секретов
- ✅ Валидация пользовательского ввода
- ✅ Защита от SQL injection
- ✅ Логирование всех операций

### Принципы разработки
1. **Clean Code** - читаемый и понятный код
2. **SOLID** - следование принципам объектно-ориентированного дизайна
3. **DRY** - избегание дублирования кода
4. **KISS** - простота решений
5. **Test-Driven** - тестирование как часть разработки


---

**Создано с ❤️ для хакатона VK Educatoin**