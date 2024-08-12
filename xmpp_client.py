import slixmpp
from slixmpp.exceptions import IqError, IqTimeout

class XMPPClient(slixmpp.ClientXMPP):
    def __init__(self, jid, password):
        super().__init__(jid, password)

        self.add_event_handler("session_start", self.start)
        self.add_event_handler("message", self.message)
        
    async def start(self, event):
        self.send_presence()
        await self.get_roster()

    async def message(self, msg):
        print(f"Message from {msg['from']}: {msg['body']}")

    async def login(self):
        try:
            await self.connect(address=('ws://alumchat.lol:7070/ws/', 5222), disable_starttls=True) 
            print("Logged in successfully.")
        except IqError as e:
            print(f"Error logging in: {e}")
        except IqTimeout:
            print("Login timed out.")

# Create a function to initialize and run the client
def run_client(jid, password):
    client = XMPPClient(jid, password)
    client.loop.run_until_complete(client.login())