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