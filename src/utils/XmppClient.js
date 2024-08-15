import { client, xml } from '@xmpp/client';

class XMPPClient {
  constructor(jid, password) {
    this.jid = jid;
    this.password = password;
    this.authenticated = false;
    this.xmppClient = client({
      service: 'ws://alumchat.lol:7070/ws/',
      domain: 'alumchat.lol',
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.xmppClient.on('error', (err) => {
      console.error('Error:', err.toString());
    });

    this.xmppClient.on('online', (address) => {
      console.log(`Login successful as ${address.toString()}`);
      this.sendPresence();
      this.authenticated = true;
    });

    this.xmppClient.on('stanza', (stanza) => {
      if (stanza.is('message')) {
        const from = stanza.attrs.from;
        const body = stanza.getChild('body');
        if (body) {
          console.log(`Message from ${from}: ${body.text()}`);
          // Handle incoming message (e.g., notify React component)
        }
      }
    });

    this.xmppClient.on('auth:failed', () => {
      console.error('Login failed: Incorrect JID or password.');
      this.disconnect();
    });
  }

  sendPresence() {
    this.xmppClient.send(
      xml('presence', {}, xml('show', {}, 'chat'), xml('status', {}, 'Online'))
    );
  }

  login() {
    this.xmppClient.start().catch((err) => {
      console.error('Error during login:', err);
    });
    this.xmppClient.auth(this.jid, this.password);
  }

  logout() {
    if (this.authenticated) {
      this.xmppClient.send(xml('presence', { type: 'unavailable' }));
      this.xmppClient.stop();
      console.log('Logged out successfully.');
      this.authenticated = false;
    }
  }

  sendMessage(to, message) {
    const msg = xml('message', { to }, xml('body', {}, message));
    this.xmppClient.send(msg);
  }
}

export default XMPPClient;