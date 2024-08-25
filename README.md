# Instant Messaging Client with XMPP 📱💬
Welcome to the Instant Messaging Client project! This guide will walk you through the setup and features of this application, which leverages the XMPP protocol to deliver real-time messaging capabilities.

## Overview 📝
This project is an instant messaging client that supports the XMPP (Extensible Messaging and Presence Protocol). The development focuses on implementing a fully functional chat application with individual features for account management and communication. The system will be developed individually and includes the following core functionalities:

### Account Management 🔑

1. **Register a New Account** 📝
   - Allows users to create a new account on the XMPP server.
   
2. **Sign In** 🔐
   - Provides functionality to log in with an existing account.
   
3. **Sign Out** 🚪
   - Enables users to log out of their account.

4. **Delete Account** 🗑️
   - Allows users to delete their account from the server.

### Communication 💬

1. **Show Contacts and Status** 👥
   - Displays a list of all contacts and their current presence status.
   
2. **Add a User to Contacts** ➕
   - Enables users to add new contacts to their contact list.

3. **Show Contact Details** 🕵️
   - Provides detailed information about a specific contact.

4. **1-to-1 Communication** 💬
   - Facilitates private chat between two users.

5. **Participate in Group Conversations** 🗣️
   - Allows users to join and participate in group chats.

6. **Define Presence Message** ✉️
   - Lets users set and update their presence status and status message.

7. **Send/Receive Notifications** 🔔
   - Manages notifications for incoming messages and other events.

8. **Send/Receive Files** 📁
   - Supports the sending and receiving of files, including images, documents, and more.

## Dependencies 📦
The project relies on the following dependencies:

- **React**: For building the user interface.
- **Vite**: For development and build tooling.
- **ESLint**: For linting JavaScript and TypeScript code.
- **xmpp/client**: For XMPP protocol implementation.
- **Redux**: For state management in React applications.
- **Node.js**: For running the development server and build scripts.
- **Material UI**: For user interface components and styling.

## Installation ⚙️
To get started with the project, follow these steps:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-repository/instant-messaging-client.git
   cd instant-messaging-client

2. **Install Dependencies**:

   ```bash
   npm install

3. **Run the Application:**:

   ```bash
   npm install

## Useful Scripts 🛠️
The following npm scripts are available for development and build processes:

- dev: Start the development server using Vite.

   ```bash
   npm run dev

- build: Build the project for production using Vite.

   ```bash
   npm run build

- generate:component: Generate a new React component using the script.

   ```bash
   npm run generate:component <ComponentName>

- generate:page: Generate a new page using the script.

   ```bash
   npm run generate:page <PageName>

## Contributors 🌟
- [Andrea-gt](https://github.com/Andrea-gt)

## Contact 📧
For any questions or further information, feel free to reach out. 

## Disclaimer ⚠️
This README, along with the XMPP connection setup and some stanza structures used in this project, were created with assistance from ChatGPT.

Happy chatting! 🎉