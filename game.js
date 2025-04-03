// Game Configuration
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// Game Variables
let game;
let player;
let stars;
let asteroids;
let bullets;
let cursors;
let lastFired = 0;
let score = 0;
let lives = 3;
let gameOver = false;
let scoreText;
let livesText;

// Preload assets
function preload() {
    this.load.image('starship', 'https://images.pexels.com/photos/73871/rocket-launch-rocket-take-off-nasa-73871.jpeg');
    this.load.image('asteroid', 'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg');
    this.load.image('bullet', 'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg');
    this.load.image('star', 'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg');
}

// Create game objects
function create() {
    // Create starfield background
    stars = this.add.tileSprite(0, 0, config.width, config.height, 'star');
    stars.setOrigin(0, 0);

    // Create player (SpaceX starship)
    player = this.physics.add.sprite(config.width / 2, config.height - 100, 'starship');
    player.setCollideWorldBounds(true);
    player.setScale(0.2);

    // Create asteroid group
    asteroids = this.physics.add.group();
    this.time.addEvent({
        delay: 1000,
        callback: spawnAsteroid,
        callbackScope: this,
        loop: true
    });

    // Create bullet group
    bullets = this.physics.add.group();

    // Set up controls
    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', fireBullet, this);

    // Set up collision detection
    this.physics.add.collider(bullets, asteroids, bulletHitAsteroid, null, this);
    this.physics.add.collider(player, asteroids, playerHitAsteroid, null, this);

    // Create UI text
    scoreText = this.add.text(20, 20, 'SCORE: 0', { 
        fontSize: '32px', 
        fill: '#00d4ff',
        fontFamily: 'Orbitron'
    });
    livesText = this.add.text(20, 60, 'LIVES: 3', { 
        fontSize: '32px', 
        fill: '#ff0000',
        fontFamily: 'Orbitron'
    });
}

// Game update loop
function update() {
    if (gameOver) return;

    // Update starfield
    stars.tilePositionY += 2;

    // Player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-300);
    } else if (cursors.right.isDown) {
        player.setVelocityX(300);
    } else {
        player.setVelocityX(0);
    }

    // Fire bullets with rate limiting
    if (cursors.up.isDown && this.time.now > lastFired) {
        fireBullet();
        lastFired = this.time.now + 200;
    }
}

// Helper functions
function spawnAsteroid() {
    const x = Phaser.Math.Between(50, config.width - 50);
    const asteroid = asteroids.create(x, 0, 'asteroid');
    asteroid.setScale(Phaser.Math.FloatBetween(0.1, 0.3));
    asteroid.setVelocity(0, Phaser.Math.Between(100, 300));
    asteroid.setAngularVelocity(Phaser.Math.FloatBetween(-50, 50));
}

function fireBullet() {
    const bullet = bullets.create(player.x, player.y - 50, 'bullet');
    bullet.setVelocityY(-500);
    bullet.setScale(0.1);
}

function bulletHitAsteroid(bullet, asteroid) {
    bullet.destroy();
    asteroid.destroy();
    score += 100;
    scoreText.setText('SCORE: ' + score);
}

function playerHitAsteroid(player, asteroid) {
    asteroid.destroy();
    lives--;
    livesText.setText('LIVES: ' + lives);
    
    if (lives <= 0) {
        gameOver = true;
        this.physics.pause();
        
        // Game over text
        const gameOverText = this.add.text(config.width / 2, config.height / 2 - 60, 'GAME OVER', { 
            fontSize: '64px', 
            fill: '#ff0000',
            fontFamily: 'Orbitron'
        }).setOrigin(0.5);
        
        // Final score display
        this.add.text(config.width / 2, config.height / 2 + 20, `FINAL SCORE: ${score}`, { 
            fontSize: '32px', 
            fill: '#00d4ff',
            fontFamily: 'Orbitron'
        }).setOrigin(0.5);
        
        // Save score to localStorage
        const scores = JSON.parse(localStorage.getItem('spacexDefenderScores')) || [];
        scores.push({
            score: score,
            date: new Date().toISOString(),
            initials: 'ANON'
        });
        localStorage.setItem('spacexDefenderScores', JSON.stringify(scores));
        
        // Add button to view high scores
        const scoreButton = this.add.text(config.width / 2, config.height / 2 + 100, 'VIEW HIGH SCORES', { 
            fontSize: '24px', 
            fill: '#ffffff',
            fontFamily: 'Orbitron',
            backgroundColor: '#005288',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();
        
        scoreButton.on('pointerdown', () => {
            window.location.href = 'highscores.html';
        });
    }
}

// Initialize game
game = new Phaser.Game(config);
