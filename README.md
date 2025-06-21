# 🍽️ FoodMood - Food Memory Journal

A lightweight web-based food memory journal that tracks dining experiences, moods, and companions.

## Features

- **Add Food Memories**: Upload photos, rate experiences, track locations and cuisine types
- **Mood Tracking**: Select from 4 mood emojis (😊 Happy, 🤩 Excited, 😌 Relaxed, 🥰 Nostalgic)
- **Companion Tracking**: Tag who you dined with using quick-add chips
- **Instagram-style Feed**: Card-based layout showing your food memories
- **Search & Filter**: Real-time search by spot, location, or companions; filter by mood
- **Stats Dashboard**: View favorite spots, mood patterns, and dining statistics
- **Responsive Design**: Mobile-first design that works on all devices

## Quick Start

1. **Install Dependencies**:
   ```bash
   cd foodmood
   pip install -r backend/requirements.txt
   ```

2. **Run the App**:
   ```bash
   python app.py
   ```

3. **Open Browser**: Navigate to `http://localhost:5000`

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Backend**: Python Flask
- **Database**: SQLite
- **Styling**: Modern CSS with Grid/Flexbox

## Project Structure

```
foodmood/
├── backend/
│   ├── app.py         # Flask backend (150 lines)
│   ├── database.py    # SQLite setup (50 lines)
│   └── requirements.txt # Python dependencies
├── static/
│   ├── style.css      # Modern CSS (200 lines)
│   ├── script.js      # Vanilla JS (250 lines)
│   └── uploads/       # User uploaded photos
└── templates/
    └── index.html     # Single page app (150 lines)
```

## Key Features

- **Drag & Drop Photo Upload**: Intuitive photo upload with preview
- **Real-time Search**: Instant filtering as you type
- **Smooth Animations**: Hover effects and transitions
- **Mobile Responsive**: Works perfectly on phones and tablets
- **Sample Data**: Includes demo entries to get started

## API Endpoints

- `GET /api/entries` - Get all entries (with search/filter)
- `POST /api/entries` - Add new entry
- `DELETE /api/entries/<id>` - Delete entry
- `GET /api/stats` - Get statistics

Enjoy tracking your food memories! 🍕✨