/**
 * XMPP Context for React
 * 
 * This module provides a context for managing the XMPP client instance within a React application.
 * It includes a provider component for supplying the XMPP client to the component tree
 * and a custom hook for accessing the context values.
 * 
 * Documentation Generated with ChatGPT
 */

import React, { createContext, useContext, useState } from 'react';
import { client } from '@xmpp/client';

// Create a React context for XMPP client management
const XMPPContext = createContext(null);

/**
 * Provider component for XMPP context.
 *
 * This component provides the XMPP client and an updater function to the component tree.
 * It allows child components to access and update the XMPP client instance.
 *
 * @param {React.PropsWithChildren} props - The props containing children components.
 * @returns {JSX.Element} - The XMPP provider component.
 */
export const XMPPProvider = ({ children }) => {
  // State to hold the XMPP client instance
  const [xmppClient, setXmppClient] = useState(null);

  /**
   * Updates the XMPP client instance in the context.
   *
   * @param {import('@xmpp/client').Client} clientInstance - The XMPP client instance to set.
   */
  const updateClient = (clientInstance) => {
    setXmppClient(clientInstance);
  };

  return (
    <XMPPContext.Provider value={{ xmppClient, updateClient }}>
      {children}
    </XMPPContext.Provider>
  );
};

/**
 * Custom hook for accessing XMPP context values.
 *
 * This hook provides access to the XMPP client instance and the update function
 * from the context. It is used to consume the context in functional components.
 *
 * @returns {Object} - The context values including xmppClient and updateClient.
 */
export const useXMPP = () => {
  return useContext(XMPPContext);
};