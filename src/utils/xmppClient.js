import { client, xml } from "@xmpp/client";

export const connectXMPP = async (username, password) => {
  const xmppClient = client({
    service: "ws://alumchat.lol:7070/ws/",
    domain: 'alumchat.lol',
    username: username,
    password: password,
  });

  // Handle the connection going online
  xmppClient.on('online', async (address) => {
    console.log('Connected to XMPP server as:', address.toString());
    await xmppClient.send(xml('presence')); 
  });

  // Handle errors that occur during connection
  xmppClient.on('error', (err) => {
    console.error('XMPP Connection Error:', err);
  });

  // Handle disconnection
  xmppClient.on('offline', () => {
    console.log('Disconnected from XMPP server');
  });

  // Start the XMPP client
  try {
    await xmppClient.start();
    return xmppClient;
  } catch (error) {
    console.error("Failed to start the XMPP client:", error);
    throw new Error("Could not connect to XMPP server");
  }
};
