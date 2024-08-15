// src/context/XMPPContext.js
import React, { createContext, useContext, useState } from 'react';
import { client } from '@xmpp/client';

const XMPPContext = createContext(null);

export const XMPPProvider = ({ children }) => {
  const [xmppClient, setXmppClient] = useState(null);

  const updateClient = (clientInstance) => {
    setXmppClient(clientInstance);
  };

  return (
    <XMPPContext.Provider value={{ xmppClient, updateClient }}>
      {children}
    </XMPPContext.Provider>
  );
};

export const useXMPP = () => {
  return useContext(XMPPContext);
};
