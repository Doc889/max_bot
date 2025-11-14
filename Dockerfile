# Нормальный Debian-образ без проблем с сетью
FROM node:20

# Рабочая директория
WORKDIR /app

# Копируем основные файлы
COPY package.json package-lock.json tsconfig.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходники
COPY src ./src

# Копируем файлы данных
COPY src/files ./src/files

# Если файла schedule.json нет — создаём
RUN mkdir -p src/files && \
    [ -f src/files/schedule.json ] || echo '{}' > src/files/schedule.json

# Запуск генерации расписания и бота
CMD ["sh", "-c", "npx tsx src/schedule_generation.ts && npx tsx src/index.ts"]
