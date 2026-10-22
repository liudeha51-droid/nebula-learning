FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && useradd -m nebula && mkdir /scheduler && chown nebula:nebula /scheduler
COPY --chown=nebula:nebula . .
USER nebula
EXPOSE 8410
CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8410"]
