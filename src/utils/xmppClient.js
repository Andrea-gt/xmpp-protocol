/**
 * XMPP Client Connection Script
 * 
 * This script sets up an XMPP client connection using the @xmpp/client library.
 * It includes functions to handle connection events such as online, error, and offline states.
 * 
 * Documentation Generated with ChatGPT
 */

import { client, xml } from "@xmpp/client";

/**
 * Connects to an XMPP server with the provided username and password.
 *
 * @param {string} username - The username to authenticate with the XMPP server.
 * @param {string} password - The password associated with the username.
 * @returns {Promise<import('@xmpp/client').Client>} - The XMPP client instance.
 * @throws {Error} - Throws an error if the XMPP client fails to start.
 */
export const connectXMPP = async (username, password) => {
  // Create an instance of the XMPP client with the specified service, domain, username, and password
  const xmppClient = client({
    service: "ws://alumchat.lol:7070/ws/", // WebSocket service URL for XMPP server
    domain: 'alumchat.lol',                // Domain of the XMPP server
    username: username,                   // Username for authentication
    password: password,                   // Password for authentication
    resource: 'xpp-client'                // Resource name of client
  });

  // Event handler for when the client successfully connects to the XMPP server
  xmppClient.on('online', async (address) => {
    console.log('Connected to XMPP server as:', address.toString());
    // Send presence information to indicate the client is online
    await xmppClient.send(xml('presence', {}, xml('priority', {}, 127))); 
  });

  // Event handler for when an error occurs during the connection
  xmppClient.on('error', (err) => {
    console.error('XMPP Connection Error:', err);
  });

  // Event handler for when the client disconnects from the XMPP server
  xmppClient.on('offline', () => {
    console.log('Disconnected from XMPP server');
  });

  // Start the XMPP client and handle any errors that occur
  try {
    await xmppClient.start();
    return xmppClient;
  } catch (error) {
    console.error("Failed to start the XMPP client:", error);
    throw new Error("Could not connect to XMPP server");
  }
};

/**
 * Registers a new user with the XMPP server.
 *
 * @param {string} full_name - The full name of the user (optional, for display purposes).
 * @param {string} username - The username for registration.
 * @param {string} password - The password for registration.
 * @returns {Promise<boolean>} - Returns true if registration is successful, otherwise throws an error.
 * @throws {Error} - Throws an error if registration fails.
 */
export const registerXMPP = async (full_name, username, password) => {
  // Create an instance of the XMPP client
  const xmppClient = client({
    service: "ws://alumchat.lol:7070/ws/", // WebSocket service URL for XMPP server
    domain: 'alumchat.lol',                // Domain of the XMPP server
    sasl: ['SCRAM-SHA-1', 'PLAIN'],        // Supported SASL mechanisms
    resource: 'xpp-client'                 // Resource name of the client
  });

  // Event handler for connection errors
  xmppClient.on('error', (err) => {
    console.error('XMPP Connection Error:', err);
  });

  // Handle the registration process
  return new Promise((resolve, reject) => {
    xmppClient.on("open", async (address) => {
      console.log("Connection established");
      try {
        // Prepare the registration IQ stanza
        const registerRequest = xml(
          'iq',
          { type: 'set', id: 'register-request', to: "alumchat.lol" },
          xml('query', { xmlns: 'jabber:iq:register' },
            xml('username', {}, username),
            xml('password', {}, password),
            full_name ? xml('name', {}, full_name) : null // Optionally include full name
          )
        );
        // Send the registration IQ stanza
        await xmppClient.send(registerRequest);
        // Listen for the response stanza
        xmppClient.on("stanza", (stanza) => {
          if (stanza.is("iq") && stanza.getAttr("id") === "register-request") {
            if (stanza.getAttr("type") === "result") {
              console.log("Registration successful");
              resolve({ status: true, message: "Registration successful" });
            } else if (stanza.getAttr("type") === "error") {
              const error = stanza.getChild("error");
              if (error?.getChild("conflict")) {
                reject({ status: false, message: "Error: Username already taken" });
                throw new Error("Error: Username already taken");
              } else {
                reject({ status: false, message: "Error: Registration failed" });
                throw new Error("Error: Registration failed");
              }
            }
          }
        });
      } catch (error) {
        console.error("Registration failed:", error);
        reject({ status: false, message: "Could not register with XMPP server" });
        throw new Error("Could not register with XMPP server");
      } finally {
        // Stop the client after the registration attempt
        await xmppClient.stop();
        console.log("Connection closed.");
        xmppClient.removeAllListeners(); // Ensure all listeners are removed
      }
    });

    // Start the XMPP client
    xmppClient.start().catch((err) => {
      console.error("Failed to start XMPP client:", err);
      reject({ status: false, message: "Failed to start XMPP client" });
    });
  });
};