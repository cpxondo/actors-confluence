# 🎬 actors-confluence (PWA)

A Progressive Web App (PWA) that allows you to search for two or more actors or actresses and quickly discover which movies or TV shows they have worked on together.

The application connects to the [The Movie Database (TMDB)](https://www.themoviedb.org/) API to fetch real-time filmography data and cross-reference the results.

## ✨ Features

- **Smart search:** Real-time actor search with *debounce* to optimize API requests.
- **Multiple matching:** Allows adding two or more actors to the list to see exactly where they have all co-starred.
- **Quick filters:** Instant sorting of results by Movies, TV Shows, or All.
- **TMDB Integration:** Includes direct links to the official TMDB page for each matching project.
- **PWA Ready:** Configured with `vite-plugin-pwa` to be installable directly on mobile devices (Android/iOS) just like a native app.
- **Adaptive Interface:** Responsive design specially optimized for mobile screens using Tailwind CSS.

## 🛠 Technologies Used

- **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **PWA:** `vite-plugin-pwa`
- **Data:** [TMDB API v3](https://developer.themoviedb.org/reference/intro/getting-started)

## 🚀 Installation and Local Setup

Follow these steps to clone and run the project in your local environment.

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- A TMDB API Key (you can get one for free by registering on their website).

### Steps

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/actor-matches.git](https://github.com/YOUR_USERNAME/actors-confluence.git)
   cd actors-confluence
