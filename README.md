# Transcriber

Transcriber is a free and open-source web application that converts audio and video files into text using whisper speech recognition model.

## Features

- **Audio & Video Transcription:** Upload files or record audio directly from your browser.
- **Multiple Languages:** Supports English, Spanish, and French.
- **Model Selection:** Choose between different Whisper models for accuracy or speed.
- **Export Options:** Download transcripts as TXT or JSON files.
- **Progress Tracking:** Visual feedback for transcription and file loading.
- **Responsive Design:** Optimized for desktop and mobile devices.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/transcriber.git
   cd transcriber
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

### Development

Start the development server:

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

To build for production:

```sh
npm run build
```

### Preview

To preview the production build:

```sh
npm run preview
```

## Usage

1. Upload an audio or video file, paste a URL, or record audio.
2. Select the source language and model.
3. Click "Transcribe Audio" to start.
4. Export the transcript as TXT or JSON.

## Technologies

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [@xenova/transformers](https://github.com/xenova/transformers.js)

## License

MIT

## Author

[Santiago Ramos](mailto:srmzcc@gmail.com)
