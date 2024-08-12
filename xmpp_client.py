import slixmpp

class XMPPClient(slixmpp.ClientXMPP):
    def __init__(self, jid, password):
        super().__init__(jid, password)

        self.authenticated = False  # Flag to track authentication status
        self.add_event_handler("session_start", self.session_start)
        self.add_event_handler("message", self.message)
        self.add_event_handler("session_bind", self.bind_success)
        self.add_event_handler("failed_auth", self.auth_failure)

    def session_start(self, event):
        self.send_presence()
        self.get_roster()
        self.authenticated = True  # Set flag to true on successful login
        print("Login successful!")

    def message(self, msg):
        print(f"Message from {msg['from']}: {msg['body']}")

    def bind_success(self, event):
        print("Successfully bound to the XMPP server.")

    def auth_failure(self, event):
        print("Login failed: Incorrect JID or password.")
        self.disconnect() 

    def login(self):
        try:
            self.connect(address=("alumchat.lol", 7070), disable_starttls=True)
            self.process(forever=False)  # Start the event loop
        except Exception as e:
            print(f"Error during login: {e}")

# Create a function to initialize and run the client
def run_client(jid, password):
    client = XMPPClient(jid, password)
    client.login()  # Call the login method to connect and start the loop

if __name__ == "__main__":
    # Replace with your JID and password
    jid = input("Enter your JID: ")
    password = input("Enter your password: ")
    run_client(jid, password)