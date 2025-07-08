# Voting DApp Frontend

A React + TypeScript + Vite frontend for the decentralized voting application on Kaia Kairos testnet.

## Environment Configuration

Create a `.env` file in the frontend directory with the following variables:

```env
# Kaia Kairos Testnet Configuration
VITE_KAIROS_RPC_URL=https://public-en-kairos.node.kaia.io
VITE_CONTRACT_ADDRESS=your_deployed_contract_address_here

# Optional: WebSocket endpoint for real-time updates
VITE_KAIROS_WS_URL=wss://public-en-kairos.node.kaia.io/ws
```

## Network Configuration

The app is configured to work with Kaia Kairos testnet:

- **Network Name**: Kaia Kairos Testnet
- **RPC URL**: https://public-en-kairos.node.kaia.io
- **Chain ID**: 0x3e9 (1001 decimal)
- **Currency Symbol**: KAI
- **Block Explorer**: https://explorer.kairos.kaia.io

## Development

This project uses Vite with React and TypeScript for fast development and building.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
