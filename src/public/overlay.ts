interface MatchData {
    player1_name: string;
    player1_logo: string | null;
    player1_fargo: number | null;
    player1_score: number;
    player2_name: string;
    player2_logo: string | null;
    player2_fargo: number | null;
    player2_score: number;
    race_to: number;
}

// Socket.IO global variable

class OverlayApp {
    private socket: any;
    private previousScores: { player1: number; player2: number } = { player1: 0, player2: 0 };
    private previousRaceTo: number = 5;
    private isGameWon: boolean = false;

    constructor() {
        this.socket = (window as any).io();
        this.init();
    }

    private init(): void {
        this.setupSocketListeners();
        this.loadCurrentMatch();
    }

    private setupSocketListeners(): void {
        this.socket.on('match_update', (data: MatchData) => {
            this.updateOverlay(data);
        });

        this.socket.on('connect', () => {
            console.log('Overlay connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Overlay disconnected from server');
        });
    }

    private async loadCurrentMatch(): Promise<void> {
        try {
            const response = await fetch('/api/match');
            if (response.ok) {
                const data: MatchData = await response.json();
                this.updateOverlay(data, false); // Don't animate on initial load
                this.previousScores = {
                    player1: data.player1_score,
                    player2: data.player2_score
                };
                this.previousRaceTo = data.race_to;
            }
        } catch (error) {
            console.error('Error loading current match:', error);
        }
    }

    private updateOverlay(data: MatchData, animate: boolean = true): void {
        // Update player names
        const player1Name = document.getElementById('player1-name')!;
        const player2Name = document.getElementById('player2-name')!;
        
        player1Name.textContent = data.player1_name;
        player2Name.textContent = data.player2_name;

        // Update logos
        this.updatePlayerLogo('player1-logo', data.player1_logo);
        this.updatePlayerLogo('player2-logo', data.player2_logo);

        // Update Fargo ratings
        this.updatePlayerFargo('player1-fargo', data.player1_fargo);
        this.updatePlayerFargo('player2-fargo', data.player2_fargo);

        // Update race to display
        this.updateRaceToDisplay(data.race_to);

        // Check for winner before updating scores
        const player1Won = data.player1_score >= data.race_to && data.player1_score > 0;
        const player2Won = data.player2_score >= data.race_to && data.player2_score > 0;
        const gameJustWon = (player1Won || player2Won) && !this.isGameWon;
        
        this.isGameWon = player1Won || player2Won;

        // Update scores with animation if they changed
        this.updateScore('player1-score', data.player1_score, this.previousScores.player1, animate);
        this.updateScore('player2-score', data.player2_score, this.previousScores.player2, animate);

        // Apply winner styling
        this.updateWinnerStyling(player1Won, player2Won, gameJustWon);

        // Reset game won status if scores were reset
        if (data.player1_score === 0 && data.player2_score === 0) {
            this.isGameWon = false;
            this.clearWinnerStyling();
        }

        // Update previous scores for next comparison
        this.previousScores = {
            player1: data.player1_score,
            player2: data.player2_score
        };
        this.previousRaceTo = data.race_to;
    }

    private updatePlayerLogo(elementId: string, logoUrl: string | null): void {
        const logoElement = document.getElementById(elementId) as HTMLImageElement;
        
        if (logoUrl && logoUrl.trim() !== '') {
            logoElement.src = logoUrl;
            logoElement.style.display = 'block';
            logoElement.onerror = () => {
                logoElement.style.display = 'none';
            };
        } else {
            logoElement.style.display = 'none';
        }
    }

    private updatePlayerFargo(elementId: string, fargo: number | null): void {
        const fargoElement = document.getElementById(elementId)!;
        
        if (fargo && fargo > 0) {
            fargoElement.textContent = fargo.toString();
            fargoElement.style.display = 'block';
        } else {
            fargoElement.style.display = 'none';
        }
    }

    private updateRaceToDisplay(raceTo: number): void {
        const raceToElement = document.getElementById('race-to-display')!;
        raceToElement.textContent = `Race to ${raceTo}`;
        
        // Add animation if race_to changed
        if (raceTo !== this.previousRaceTo) {
            raceToElement.classList.add('updated');
            setTimeout(() => {
                raceToElement.classList.remove('updated');
            }, 500);
        }
    }

    private updateScore(elementId: string, newScore: number, previousScore: number, animate: boolean): void {
        const scoreElement = document.getElementById(elementId)!;
        scoreElement.textContent = newScore.toString();

        // Add animation class if score changed and animation is enabled
        if (animate && newScore !== previousScore) {
            scoreElement.classList.add('updated');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                scoreElement.classList.remove('updated');
            }, 500);
        }
    }

    private updateWinnerStyling(player1Won: boolean, player2Won: boolean, gameJustWon: boolean): void {
        const player1Container = document.querySelector('.player1') as HTMLElement;
        const player2Container = document.querySelector('.player2') as HTMLElement;
        const player1Name = document.getElementById('player1-name')!;
        const player2Name = document.getElementById('player2-name')!;
        const player1Score = document.getElementById('player1-score')!;
        const player2Score = document.getElementById('player2-score')!;

        // Clear existing winner classes
        [player1Container, player2Container, player1Name, player2Name, player1Score, player2Score].forEach(el => {
            el.classList.remove('winner', 'loser', 'winner-pulse', 'winner-glow');
        });

        if (player1Won) {
            player1Container.classList.add('winner');
            player1Name.classList.add('winner-glow');
            player1Score.classList.add('winner-glow');
            player2Container.classList.add('loser');
            
            if (gameJustWon) {
                player1Container.classList.add('winner-pulse');
                this.triggerWinnerCelebration('player1');
            }
        } else if (player2Won) {
            player2Container.classList.add('winner');
            player2Name.classList.add('winner-glow');
            player2Score.classList.add('winner-glow');
            player1Container.classList.add('loser');
            
            if (gameJustWon) {
                player2Container.classList.add('winner-pulse');
                this.triggerWinnerCelebration('player2');
            }
        }
    }

    private clearWinnerStyling(): void {
        const allElements = document.querySelectorAll('.player, #player1-name, #player2-name, #player1-score, #player2-score');
        allElements.forEach(el => {
            el.classList.remove('winner', 'loser', 'winner-pulse', 'winner-glow');
        });
    }

    private triggerWinnerCelebration(winner: string): void {
        // Create celebration effect
        const celebration = document.createElement('div');
        celebration.className = 'celebration';
        celebration.textContent = '🎉 WINNER! 🎉';
        
        const winnerContainer = document.querySelector(`.${winner}`) as HTMLElement;
        winnerContainer.appendChild(celebration);
        
        // Remove celebration after animation
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.parentNode.removeChild(celebration);
            }
        }, 3000);
    }
}

// Initialize the overlay app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OverlayApp();
}); 