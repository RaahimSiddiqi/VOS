FROM python:3.10-slim-buster

WORKDIR /backend

COPY ./requirements.txt /backend/requirements.txt
RUN apt-get update && apt-get upgrade -y
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir --upgrade -r /backend/requirements.txt
RUN apt-get install libgl1-mesa-glx -y
RUN apt-get install libglib2.0-0 -y
COPY . /backend

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
