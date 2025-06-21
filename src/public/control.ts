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

interface MatchUpdate {
    player1_name: string;
    player1_logo: string | null;
    player1_fargo: number | null;
    player2_name: string;
    player2_logo: string | null;
    player2_fargo: number | null;
    race_to: number;
}

interface ScoreUpdate {
    player: 1 | 2;
    action: 'increment' | 'decrement';
}

declare const io: any;

class ControlApp {
    private socket: any;
    private modal: HTMLElement;

    constructor() {
        this.socket = (window as any).io();
        this.modal = document.getElementById('reset-modal')!;
        this.init();
    }

    private init(): void {
        this.setupEventListeners();
        this.setupSocketListeners();
        this.loadCurrentMatch();
        this.updateOverlayUrl();
    }

    private setupEventListeners(): void {
        // Update match button
        const updateButton = document.getElementById('update-match')!;
        updateButton.addEventListener('click', () => this.updateMatch());

        // Score buttons
        document.getElementById('player1-plus')!.addEventListener('click', () => 
            this.updateScore(1, 'increment'));
        document.getElementById('player1-minus')!.addEventListener('click', () => 
            this.updateScore(1, 'decrement'));
        document.getElementById('player2-plus')!.addEventListener('click', () => 
            this.updateScore(2, 'increment'));
        document.getElementById('player2-minus')!.addEventListener('click', () => 
            this.updateScore(2, 'decrement'));

        // Reset functionality
        document.getElementById('reset-scores')!.addEventListener('click', () => 
            this.showResetModal());
        document.getElementById('confirm-reset')!.addEventListener('click', () => 
            this.confirmReset());
        document.getElementById('cancel-reset')!.addEventListener('click', () => 
            this.hideResetModal());

        // Copy URL functionality
        document.getElementById('copy-url')!.addEventListener('click', () => 
            this.copyOverlayUrl());

        // Modal background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideResetModal();
            }
        });
    }

    private setupSocketListeners(): void {
        this.socket.on('match_update', (data: MatchData) => {
            this.updateDisplay(data);
        });

        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
    }

    private async loadCurrentMatch(): Promise<void> {
        try {
            const response = await fetch('/api/match');
            if (response.ok) {
                const data: MatchData = await response.json();
                this.updateDisplay(data);
                this.updateInputs(data);
            }
        } catch (error) {
            console.error('Error loading current match:', error);
        }
    }

    private updateDisplay(data: MatchData): void {
        // Update player names in display
        document.getElementById('player1-display')!.textContent = data.player1_name;
        document.getElementById('player2-display')!.textContent = data.player2_name;

        // Update scores
        document.getElementById('player1-score')!.textContent = data.player1_score.toString();
        document.getElementById('player2-score')!.textContent = data.player2_score.toString();
    }

    private updateInputs(data: MatchData): void {
        // Update input fields
        (document.getElementById('player1-name') as HTMLInputElement).value = data.player1_name;
        (document.getElementById('player2-name') as HTMLInputElement).value = data.player2_name;
        (document.getElementById('player1-logo') as HTMLInputElement).value = data.player1_logo || '';
        (document.getElementById('player2-logo') as HTMLInputElement).value = data.player2_logo || '';
        (document.getElementById('player1-fargo') as HTMLInputElement).value = data.player1_fargo?.toString() || '';
        (document.getElementById('player2-fargo') as HTMLInputElement).value = data.player2_fargo?.toString() || '';
        (document.getElementById('race-to') as HTMLInputElement).value = data.race_to.toString();
    }

    private async updateMatch(): Promise<void> {
        const player1Name = (document.getElementById('player1-name') as HTMLInputElement).value;
        const player2Name = (document.getElementById('player2-name') as HTMLInputElement).value;
        const player1Logo = (document.getElementById('player1-logo') as HTMLInputElement).value || null;
        const player2Logo = (document.getElementById('player2-logo') as HTMLInputElement).value || null;
        const player1FargoValue = (document.getElementById('player1-fargo') as HTMLInputElement).value;
        const player2FargoValue = (document.getElementById('player2-fargo') as HTMLInputElement).value;
        const player1Fargo = player1FargoValue ? parseInt(player1FargoValue) : null;
        const player2Fargo = player2FargoValue ? parseInt(player2FargoValue) : null;
        const raceTo = parseInt((document.getElementById('race-to') as HTMLInputElement).value) || 5;

        const update: MatchUpdate = {
            player1_name: player1Name,
            player1_logo: player1Logo,
            player1_fargo: player1Fargo,
            player2_name: player2Name,
            player2_logo: player2Logo,
            player2_fargo: player2Fargo,
            race_to: raceTo
        };

        try {
            const response = await fetch('/api/match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(update)
            });

            if (response.ok) {
                this.showSuccess('Match updated successfully!');
            } else {
                this.showError('Failed to update match');
            }
        } catch (error) {
            console.error('Error updating match:', error);
            this.showError('Error updating match');
        }
    }

    private async updateScore(player: 1 | 2, action: 'increment' | 'decrement'): Promise<void> {
        const update: ScoreUpdate = { player, action };

        try {
            const response = await fetch('/api/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(update)
            });

            if (!response.ok) {
                this.showError('Failed to update score');
            }
        } catch (error) {
            console.error('Error updating score:', error);
            this.showError('Error updating score');
        }
    }

    private showResetModal(): void {
        this.modal.style.display = 'block';
    }

    private hideResetModal(): void {
        this.modal.style.display = 'none';
    }

    private async confirmReset(): Promise<void> {
        try {
            const response = await fetch('/api/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ confirm: true })
            });

            if (response.ok) {
                this.showSuccess('Scores reset successfully!');
            } else {
                this.showError('Failed to reset scores');
            }
        } catch (error) {
            console.error('Error resetting scores:', error);
            this.showError('Error resetting scores');
        }

        this.hideResetModal();
    }

    private updateOverlayUrl(): void {
        const urlElement = document.getElementById('overlay-url')!;
        urlElement.textContent = `${window.location.origin}/overlay`;
    }

    private async copyOverlayUrl(): Promise<void> {
        const url = `${window.location.origin}/overlay`;
        
        try {
            await navigator.clipboard.writeText(url);
            this.showSuccess('URL copied to clipboard!');
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('URL copied to clipboard!');
        }
    }

    private showSuccess(message: string): void {
        this.showToast(message, 'success');
    }

    private showError(message: string): void {
        this.showToast(message, 'error');
    }

    private showToast(message: string, type: 'success' | 'error'): void {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Style the toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 25px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        if (type === 'success') {
            toast.style.background = '#48bb78';
        } else {
            toast.style.background = '#f56565';
        }

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ControlApp();
}); 