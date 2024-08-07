# Intercom Notifier

Monitors Intercom conversations for notes containing the `#ping` keyword and logs relevant information.

## Features

- Fetches open conversations for specified admins.
- Checks conversation parts for notes with `#ping`.
- Logs the details of the `#ping` notes and saves them to a JSON file.
- Handles errors and logs them separately.

## Setup

### Prerequisites

- Node.js (v12 or higher)
- npm (Node package manager)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/jskoiz/intercom-notifier.git
   cd intercom-notifier
   ```

2. Install the required packages:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your Intercom token and admin details:
   ```env
   INTERCOM_TOKEN=your_intercom_token
   ADMIN_DETAILS=[{"id":"123","name":"John"}]
   ```

## Usage

To run the script and start monitoring for `#ping` notes, use:

```sh
ts-node fetchPings.ts
```

### Running Compiled JavaScript

Alternatively, you can compile the TypeScript files and run the JavaScript output:

1. Compile the TypeScript files:
   ```sh
   tsc
   ```

2. Run the compiled JavaScript file:
   ```sh
   node fetchPings.js
   ```

## Files

- `fetchPings.ts`: Main script to fetch and process Intercom conversations.
- `logger.ts`: Module for logging and error handling.
- `.env`: Environment variables file (not included in the repository).

## Logging

- `ping_notes.json`: Logs of conversations with `#ping` notes.
- `error_log.json`: Logs of any errors encountered during processing.

## Contributing

Feel free to fork the project and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.