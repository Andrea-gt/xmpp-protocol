/**
 * @file xmppClient.js
 * @description This file contains functions for establishing and managing an XMPP client connection 
 *              using the @xmpp/client library. It provides functionalities for connecting to the XMPP 
 *              server, handling connection events, and registering new users.
 * 
 *              The `connectXMPP` function sets up the XMPP client with the specified username and password, 
 *              and manages events related to the connection such as online, error, and offline states.
 *              The `registerXMPP` function handles user registration with the XMPP server, sending the 
 *              appropriate registration IQ stanza and managing responses for successful or failed registration.
 * 
 *              Key functionalities provided by this module include:
 *              - Connecting to the XMPP server and handling connection events.
 *              - Registering new users with the XMPP server.
 * 
 * @author Andrea Ximena Ramirez Recinos
 * @created Aug 2024
 * 
 * @note Documentation Generated with ChatGPT
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
  try {
    const xmppClient = client({
      service: "ws://alumchat.lol:7070/ws",
      resource: "xmpp-client",
      sasl: ['SCRAM-SHA-1', 'PLAIN'], // Try these mechanisms
    });

    return new Promise((resolve, reject) => {
      // Handle connection errors
      xmppClient.on("error", (err) => {
        if (err.code === "ECONERROR") {
          console.error("Connection error:", err);
          xmppClient.stop();
          xmppClient.removeAllListeners();
          reject(new Error("Error in XMPP Client"));
        }
      });

      // Handle successful connection
      xmppClient.on("open", () => {
        // Send the registration IQ stanza
        const registerRequest = xml(
          'iq',
          { type: 'set', id: 'register-request', to: "alumchat.lol" },
          xml('query', { xmlns: 'jabber:iq:register' },
            xml('username', {}, username),
            xml('password', {}, password),
            full_name ? xml('name', {}, full_name) : null // Optionally include full name
          )
        );
        xmppClient.send(registerRequest);
      });

      // Handle incoming stanzas
      xmppClient.on("stanza", async (stanza) => {
        if (stanza.is("iq") && stanza.getAttr("id") === "register-request") {
          await xmppClient.stop();
          xmppClient.removeAllListeners();

          if (stanza.getAttr("type") === "result") {
            resolve({ status: true, message: "Registration successful" });
          } else if (stanza.getAttr("type") === "error") {
            const error = stanza.getChild("error");
            if (error?.getChild("conflict")) {
              reject(new Error("Error: Username already taken."));
            } else {
              reject(new Error("An error occurred. Please try again!"));
            }
          }
        }
      });

      // Start the XMPP client
      xmppClient.start().catch((err) => {
        if (err.message.includes("invalid-mechanism")) {
          console.log("Ignoring SASL");
        } else {
          reject(new Error("Failed to start XMPP client: " + err.message));
        }
      });
    });
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};