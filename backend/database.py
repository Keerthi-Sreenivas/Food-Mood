import sqlite3
import os

DATABASE = 'foodmood.db'

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            spot_name TEXT NOT NULL,
            photo_path TEXT,
            rating INTEGER NOT NULL,
            location TEXT,
            cuisine_type TEXT,
            mood TEXT NOT NULL,
            companions TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Check if we already have data
    cursor.execute('SELECT COUNT(*) FROM entries')
    count = cursor.fetchone()[0]
    
    # Only insert sample data if the table is empty
    if count == 0:
        # Insert sample data
        sample_data = [
            ("Tony's Pizza", "sample1.jpg", 5, "Downtown", "Italian", "😊", "Sarah, Mike", "Amazing margherita pizza!"),
            ("Sushi Zen", "sample2.jpg", 4, "Uptown", "Japanese", "🤩", "Emma", "Fresh sashimi, great atmosphere"),
            ("Café Luna", "sample3.jpg", 4, "Midtown", "Café", "😌", "Solo", "Perfect morning coffee spot")
        ]
        
        cursor.executemany('''
            INSERT INTO entries 
            (spot_name, photo_path, rating, location, cuisine_type, mood, companions, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', sample_data)
    
    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn