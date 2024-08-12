from flask import Flask
from flask_socketio import SocketIO, emit
from xmpp_client import run_client  # Import your XMPP client

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')  # Allow all origins

@app.route('/')
def index():
    return "XMPP Server is running"

@socketio.on("login")
def handle_login(data):
    jid = data.get('jid')
    password = data.get('password')
    
    try:
        # Initialize and run the XMPP client in the background
        socketio.start_background_task(run_client, jid, password)
        emit("login_response", {"message": "Logging in..."})
    except Exception as e:
        emit("login_response", {"error": str(e)})

if __name__ == '__main__':
    socketio.run(app)