FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements_docker.txt .
RUN pip install --no-cache-dir -r requirements_docker.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
