# PetConnect

PetConnect is a social platform designed for pet lovers to share experiences, media, and information about their pets. Users can register, create pet profiles, post updates, interact through comments and chat, and get assistance from an AI chatbot.

## Features

- **User Authentication**: Register and login with email and password.
- **User Profiles**: Customize your profile and showcase your pets.
- **Pet Management**: Create detailed profiles for your pets.
- **Posts**: Share photos and updates about your pets.
- **Social Interaction**: Like, comment, and save posts from other users.
- **Direct Messaging**: Chat with other pet owners.

## Technologies Used

- **Frontend**: React.js, TypeScript, Redux, React Router, Tailwind CSS
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14.0 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pet-connect.git
   cd pet-connect
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Project Structure

```
pet-connect/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/         # Authentication components
│   │   ├── chat/         # Chat components
│   │   ├── layout/       # Layout components
│   │   ├── pet/          # Pet-related components
│   │   └── post/         # Post-related components
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── store/            # Redux store configuration
│   │   ├── userSlice.ts  # User state management
│   │   ├── petSlice.ts   # Pet state management
│   │   ├── postSlice.ts  # Post state management
│   │   └── chatSlice.ts  # Chat state management
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application component
│   └── index.tsx         # Entry point
├── package.json
└── README.md
```

## Testing

To test the functionality:

1. **User Authentication**:
   - Register a new account
   - Login with credentials
   - Log out

2. **Pet Management**:
   - Create a new pet profile
   - View pet details
   - Update pet information

3. **Posts**:
   - Create a new post
   - View posts in the feed
   - Interact with posts (like, comment, save)

4. **Chat**:
   - Start a conversation with another user
   - Send messages
   - View conversation history

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all the contributors who have helped with this project.
- Special thanks to the open-source community for providing the tools and libraries used in this project.
