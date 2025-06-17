# Shorty

Shorty is a simple and user-friendly URL shortener built with Laravel and React. It allows you to create, manage, and track short links with ease. The project is designed for easy deployment and provides a modern, intuitive interface for users.

## Features

- Create short URLs with custom aliases
- Track visits and analytics for each link
- Heatmap visualization of clicks by country
- Expiration and visit limits for links
- Responsive and clean UI
- Authentication and user management

## Getting Started

### Requirements
- PHP 8.1+
- Composer
- Node.js 18+
- SQLite (default) or other supported database

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/shorty.git
   cd shorty
   ```
2. Install PHP dependencies:
   ```sh
   composer install
   ```
3. Install JavaScript dependencies:
   ```sh
   npm install
   ```
4. Copy the example environment file and set your variables:
   ```sh
   cp .env.example .env
   php artisan key:generate
   ```
5. Run migrations:
   ```sh
   php artisan migrate
   ```
6. Build frontend assets:
   ```sh
   npm run build
   ```
7. Start the development server:
   ```sh
   php artisan serve
   ```

Access the app at [http://localhost:8000](http://localhost:8000).

## Usage
- Register or log in to your account
- Create new short URLs from the dashboard
- View analytics and heatmaps for each link
- Manage, edit, or delete your links

## Issues & Suggestions

Found a bug? Have an idea for a new feature? Please open an issue on GitHub! Suggestions and contributions are very welcome. Help us make Shorty even better for everyone.

## License

This project is open source and available under the MIT License.
