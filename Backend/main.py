from fastapi import FastAPI
import firebase_admin
from routers import predict

# Use the service account keys to create a credentials.Certificate to connect to firebase
cred = firebase_admin.credentials.Certificate('vos_service_account_keys.json')
# Use those credentials to initialize the firebase_admin app which will verify the JWT
firebase_admin.initialize_app(cred)

app = FastAPI()

app.include_router(predict.router)