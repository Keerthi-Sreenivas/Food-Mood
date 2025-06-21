from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import sqlite3
import uuid
from werkzeug.utils import secure_filename
from database import get_db, init_db

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/sample-images/<filename>')
def sample_file(filename):
    return send_from_directory('static/sample-images', filename)

@app.route('/api/entries', methods=['GET'])
def get_entries():
    conn = get_db()
    cursor = conn.cursor()
    
    search = request.args.get('search', '')
    mood = request.args.get('mood', '')
    
    query = "SELECT * FROM entries WHERE 1=1"
    params = []
    
    if search:
        query += " AND spot_name LIKE ?"
        params.append(f'%{search}%')
    
    if mood:
        query += " AND mood = ?"
        params.append(mood)
    
    query += " ORDER BY created_at DESC"
    
    cursor.execute(query, params)
    entries = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(entries)

@app.route('/api/entries', methods=['POST'])
def add_entry():
    conn = get_db()
    cursor = conn.cursor()
    
    # Handle file upload
    photo_path = None
    if 'photo' in request.files:
        file = request.files['photo']
        if file and file.filename != '' and allowed_file(file.filename):
            filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Create upload directory if it doesn't exist
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            
            file.save(file_path)
            photo_path = filename
    
    # Insert entry
    cursor.execute('''
        INSERT INTO entries 
        (spot_name, photo_path, rating, location, cuisine_type, mood, companions, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        request.form.get('spot_name'),
        photo_path,
        int(request.form.get('rating', 5)),
        request.form.get('location'),
        request.form.get('cuisine_type'),
        request.form.get('mood'),
        request.form.get('companions'),
        request.form.get('notes')
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/entries/<int:entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    conn = get_db()
    cursor = conn.cursor()
    
    # Get photo path before deleting
    cursor.execute('SELECT photo_path FROM entries WHERE id = ?', (entry_id,))
    result = cursor.fetchone()
    
    if result and result['photo_path']:
        photo_path = os.path.join(app.config['UPLOAD_FOLDER'], result['photo_path'])
        if os.path.exists(photo_path):
            os.remove(photo_path)
    
    cursor.execute('DELETE FROM entries WHERE id = ?', (entry_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db()
    cursor = conn.cursor()
    
    # Total entries
    cursor.execute('SELECT COUNT(*) as total FROM entries')
    total_entries = cursor.fetchone()['total']
    
    # Mood stats
    cursor.execute('SELECT mood, COUNT(*) as count FROM entries GROUP BY mood ORDER BY count DESC')
    mood_stats = [dict(row) for row in cursor.fetchall()]
    
    # Top spots
    cursor.execute('''
        SELECT spot_name, COUNT(*) as visits, AVG(rating) as avg_rating 
        FROM entries 
        GROUP BY spot_name 
        ORDER BY visits DESC, avg_rating DESC 
        LIMIT 5
    ''')
    top_spots = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return jsonify({
        'total_entries': total_entries,
        'mood_stats': mood_stats,
        'top_spots': top_spots
    })

def setup_directories():
    """Create necessary directories on first run"""
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs('static/sample-images', exist_ok=True)

if __name__ == '__main__':
    init_db()
    setup_directories()
    app.run(debug=True)