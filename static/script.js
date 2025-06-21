class FoodMood {
    constructor() {
        this.entries = [];
        this.currentFilter = { search: '', mood: '' };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadEntries();
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentFilter.search = e.target.value;
            this.filterEntries();
        });

        // Mood filters
        document.querySelectorAll('.mood-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mood-filter').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter.mood = e.target.dataset.mood;
                this.filterEntries();
            });
        });

        // Photo upload
        const photoUpload = document.getElementById('photoUpload');
        const photoInput = document.getElementById('photoInput');
        
        photoUpload.addEventListener('click', () => photoInput.click());
        photoUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            photoUpload.style.borderColor = '#ff6b6b';
        });
        photoUpload.addEventListener('dragleave', () => {
            photoUpload.style.borderColor = '#dee2e6';
        });
        photoUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                photoInput.files = files;
                this.previewPhoto(files[0]);
            }
        });
        
        photoInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.previewPhoto(e.target.files[0]);
            }
        });

        // Star rating
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                document.getElementById('rating').value = rating;
                
                document.querySelectorAll('.star').forEach(s => {
                    if (parseInt(s.dataset.rating) <= rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
        });

        // Mood selection
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById('mood').value = e.target.dataset.mood;
            });
        });

        // Form submission
        document.getElementById('addEntryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEntry();
        });
    }

    previewPhoto(file) {
        const reader = new FileReader();
        const photoPreview = document.querySelector('.photo-preview');
        const uploadPlaceholder = document.querySelector('.upload-placeholder');
        
        reader.onload = (e) => {
            photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            photoPreview.classList.remove('hidden');
            uploadPlaceholder.classList.add('hidden');
        };
        
        reader.readAsDataURL(file);
    }

    async loadEntries() {
        try {
            const response = await fetch('/api/entries');
            this.entries = await response.json();
            this.renderEntries();
        } catch (error) {
            console.error('Error loading entries:', error);
        }
    }

    filterEntries() {
        const entriesGrid = document.getElementById('entriesGrid');
        entriesGrid.innerHTML = '';
        
        const filteredEntries = this.entries.filter(entry => {
            const matchesSearch = this.currentFilter.search === '' || 
                entry.spot_name.toLowerCase().includes(this.currentFilter.search.toLowerCase()) ||
                (entry.location && entry.location.toLowerCase().includes(this.currentFilter.search.toLowerCase())) ||
                (entry.companions && entry.companions.toLowerCase().includes(this.currentFilter.search.toLowerCase()));
                
            const matchesMood = this.currentFilter.mood === '' || entry.mood === this.currentFilter.mood;
            
            return matchesSearch && matchesMood;
        });
        
        if (filteredEntries.length === 0) {
            entriesGrid.innerHTML = '<div class="no-results">No food memories found. Try a different search or add a new memory!</div>';
            return;
        }
        
        filteredEntries.forEach(entry => {
            entriesGrid.appendChild(this.createEntryCard(entry));
        });
    }

    renderEntries() {
        this.filterEntries();
    }

    createEntryCard(entry) {
        const card = document.createElement('div');
        card.className = 'entry-card';
        
        let photoHtml = '';
        if (entry.photo_path) {
            const photoUrl = entry.photo_path.startsWith('sample') 
                ? `/sample-images/${entry.photo_path}` 
                : `/uploads/${entry.photo_path}`;
            photoHtml = `<img src="${photoUrl}" alt="${entry.spot_name}" class="entry-image">`;
        }
        
        let companionsHtml = '';
        if (entry.companions) {
            const companions = entry.companions.split(',').map(c => c.trim());
            companionsHtml = companions.map(c => `<span class="companion-chip">${c}</span>`).join('');
        }
        
        const stars = '⭐'.repeat(entry.rating);
        
        card.innerHTML = `
            ${photoHtml}
            <div class="entry-content">
                <div class="entry-header">
                    <h3 class="entry-title">${entry.spot_name}</h3>
                    <div class="entry-mood">${entry.mood}</div>
                </div>
                <div class="entry-rating">${stars}</div>
                <div class="entry-meta">
                    ${entry.location ? `<div>${entry.location}</div>` : ''}
                    ${entry.cuisine_type ? `<div>${entry.cuisine_type}</div>` : ''}
                </div>
                ${entry.notes ? `<div class="entry-notes">${entry.notes}</div>` : ''}
                ${companionsHtml ? `<div class="entry-companions">${companionsHtml}</div>` : ''}
                <div class="entry-actions">
                    <button class="delete-btn" data-id="${entry.id}">Delete</button>
                </div>
            </div>
        `;
        
        card.querySelector('.delete-btn').addEventListener('click', () => {
            this.deleteEntry(entry.id);
        });
        
        return card;
    }

    async saveEntry() {
        const form = document.getElementById('addEntryForm');
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/api/entries', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                closeAddModal();
                this.loadEntries();
                form.reset();
                document.querySelector('.photo-preview').classList.add('hidden');
                document.querySelector('.upload-placeholder').classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error saving entry:', error);
        }
    }

    async deleteEntry(id) {
        if (!confirm('Are you sure you want to delete this memory?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/entries/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.loadEntries();
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            const stats = await response.json();
            this.renderStats(stats);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    renderStats(stats) {
        const statsPanel = document.getElementById('statsPanel');
        
        let moodStatsHtml = '';
        if (stats.mood_stats.length > 0) {
            moodStatsHtml = stats.mood_stats.map(mood => `
                <div class="stat-card">
                    <div class="stat-value">${mood.mood}</div>
                    <div class="stat-label">${mood.count} memories</div>
                </div>
            `).join('');
        }
        
        let topSpotsHtml = '';
        if (stats.top_spots.length > 0) {
            topSpotsHtml = stats.top_spots.map(spot => `
                <div class="stat-card">
                    <div class="stat-title">${spot.spot_name}</div>
                    <div class="stat-value">${spot.visits}</div>
                    <div class="stat-label">visits</div>
                    <div class="stat-rating">Rating: ${spot.avg_rating.toFixed(1)} ⭐</div>
                </div>
            `).join('');
        }
        
        statsPanel.innerHTML = `
            <div class="stats-section">
                <h3>Overview</h3>
                <div class="stat-card">
                    <div class="stat-value">${stats.total_entries}</div>
                    <div class="stat-label">Total Memories</div>
                </div>
            </div>
            
            <div class="stats-section">
                <h3>Mood Patterns</h3>
                <div class="stats-grid">
                    ${moodStatsHtml}
                </div>
            </div>
            
            <div class="stats-section">
                <h3>Favorite Spots</h3>
                <div class="stats-grid">
                    ${topSpotsHtml}
                </div>
            </div>
        `;
    }
}

function openAddModal() {
    document.getElementById('addModal').style.display = 'block';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

function toggleStats() {
    const statsPanel = document.getElementById('statsPanel');
    const entriesGrid = document.getElementById('entriesGrid');
    
    if (statsPanel.classList.contains('hidden')) {
        statsPanel.classList.remove('hidden');
        entriesGrid.classList.add('hidden');
        app.loadStats();
    } else {
        statsPanel.classList.add('hidden');
        entriesGrid.classList.remove('hidden');
    }
}

// Initialize the app
const app = new FoodMood();