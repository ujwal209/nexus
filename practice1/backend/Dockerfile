FROM python:3.11-slim

# Set working directory
WORKDIR /code

# Copy requirements file
COPY ./requirements.txt /code/requirements.txt

# Install dependencies using uv for maximum speed
RUN pip install --no-cache-dir uv && uv pip install --no-cache-dir --system -r requirements.txt

# Copy all application code
COPY . /code

# Expose port 7860 (Hugging Face standard port)
EXPOSE 7860

# Run uvicorn on host 0.0.0.0 and port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
