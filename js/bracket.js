// Bracket configuration
const BRACKET_CONFIG = {
    rounds: [
        { name: 'First Round', matchups: 8 },
        { name: 'Second Round', matchups: 4 },
        { name: 'Semifinals', matchups: 2 },
        { name: 'Finals', matchups: 1 }
    ],
    finalRound: { name: 'NBA Finals', matchups: 1 },
    regions: [
        { name: 'Eastern Conference', id: 'east' },
        { name: 'Western Conference', id: 'west' }
    ],
    teamsPerMatchup: 2
};

// Teams by conference
const TEAMS = {
    east: [
        "Boston Celtics", "Brooklyn Nets", "New York Knicks", "Philadelphia 76ers",
        "Toronto Raptors", "Chicago Bulls", "Cleveland Cavaliers", "Detroit Pistons",
        "Indiana Pacers", "Milwaukee Bucks", "Atlanta Hawks", "Charlotte Hornets",
        "Miami Heat", "Orlando Magic", "Washington Wizards"
    ],
    west: [
        "Denver Nuggets", "Minnesota Timberwolves", "Oklahoma City Thunder",
        "Portland Trail Blazers", "Utah Jazz", "Golden State Warriors",
        "LA Clippers", "Los Angeles Lakers", "Phoenix Suns", "Sacramento Kings",
        "Dallas Mavericks", "Houston Rockets", "Memphis Grizzlies",
        "New Orleans Pelicans", "San Antonio Spurs"
    ]
};

// Team logos - paths to logo images
const TEAM_LOGOS = {
    "Boston Celtics": "assets/logos/celtics.png",
    "Brooklyn Nets": "assets/logos/nets.png",
    "New York Knicks": "assets/logos/knicks.png",
    "Philadelphia 76ers": "assets/logos/76ers.png",
    "Toronto Raptors": "assets/logos/raptors.png",
    "Chicago Bulls": "assets/logos/bulls.png",
    "Cleveland Cavaliers": "assets/logos/cavaliers.png",
    "Detroit Pistons": "assets/logos/pistons.png",
    "Indiana Pacers": "assets/logos/pacers.png",
    "Milwaukee Bucks": "assets/logos/bucks.png",
    "Atlanta Hawks": "assets/logos/hawks.png",
    "Charlotte Hornets": "assets/logos/hornets.png",
    "Miami Heat": "assets/logos/heat.png",
    "Orlando Magic": "assets/logos/magic.png",
    "Washington Wizards": "assets/logos/wizards.png",
    "Denver Nuggets": "assets/logos/nuggets.png",
    "Minnesota Timberwolves": "assets/logos/timberwolves.png",
    "Oklahoma City Thunder": "assets/logos/thunder.png",
    "Portland Trail Blazers": "assets/logos/blazers.png",
    "Utah Jazz": "assets/logos/jazz.png",
    "Golden State Warriors": "assets/logos/warriors.png",
    "LA Clippers": "assets/logos/clippers.png",
    "Los Angeles Lakers": "assets/logos/lakers.png",
    "Phoenix Suns": "assets/logos/suns.png",
    "Sacramento Kings": "assets/logos/kings.png",
    "Dallas Mavericks": "assets/logos/mavericks.png",
    "Houston Rockets": "assets/logos/rockets.png",
    "Memphis Grizzlies": "assets/logos/grizzlies.png",
    "New Orleans Pelicans": "assets/logos/pelicans.png",
    "San Antonio Spurs": "assets/logos/spurs.png"
};

// Bracket class to handle bracket creation and visualization
class Bracket {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            autoSave: true,
            bracketName: "My NBA Bracket",
            ...options
        };
        this.bracketState = {
            name: this.options.bracketName,
            selections: {},
            timestamp: new Date().toISOString()
        };
        this.init();
    }

    init() {
        // Load saved bracket if it exists
        const savedBracket = localStorage.getItem('nba_bracket');
        if (savedBracket) {
            try {
                this.bracketState = JSON.parse(savedBracket);
            } catch (e) {
                console.error("Error loading saved bracket:", e);
            }
        }

        this.createBracketStructure();
        this.setupEventListeners();
        
        // Draw connectors after a short delay to ensure the DOM is fully rendered
        setTimeout(() => this.drawConnectors(), 100);
    }

    createBracketStructure() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        this.container.classList.add('bracket-container');
        
        // Create header
        const header = document.createElement('div');
        header.className = 'bracket-header';
        header.innerHTML = `
            <h2>NBA Playoffs Bracket Challenge</h2>
            <div class="bracket-controls">
                <button class="btn btn-primary save-bracket">Save</button>
                <button class="btn btn-secondary reset-bracket">Reset</button>
            </div>
        `;
        this.container.appendChild(header);
        
        // Bracket name input
        const nameContainer = document.createElement('div');
        nameContainer.className = 'bracket-name-container';
        nameContainer.innerHTML = `
            <input type="text" class="bracket-name" placeholder="Enter your bracket name" 
                value="${this.bracketState.name || this.options.bracketName}">
        `;
        this.container.appendChild(nameContainer);
        
        // Create main content container
        const content = document.createElement('div');
        content.className = 'bracket-content';
        
        // Create regions (conferences)
        BRACKET_CONFIG.regions.forEach(region => {
            const regionEl = this.createRegion(region);
            content.appendChild(regionEl);
        });
        
        // Create finals round
        const finals = document.createElement('div');
        finals.className = 'finals-round';
        
        const finalsTitle = document.createElement('div');
        finalsTitle.className = 'round-title';
        finalsTitle.textContent = BRACKET_CONFIG.finalRound.name;
        finals.appendChild(finalsTitle);
        
        const finalsMatchupsContainer = document.createElement('div');
        finalsMatchupsContainer.className = 'matchups-container';
        
        // Create the finals matchup
        const finalsMatchup = this.createMatchup('finals', 0, 0);
        finalsMatchupsContainer.appendChild(finalsMatchup);
        
        finals.appendChild(finalsMatchupsContainer);
        content.appendChild(finals);
        
        this.container.appendChild(content);
    }

    createRegion(region) {
        const regionEl = document.createElement('div');
        regionEl.className = 'bracket-region';
        regionEl.dataset.region = region.id;
        
        const regionTitle = document.createElement('h3');
        regionTitle.className = 'region-title';
        regionTitle.textContent = region.name;
        regionEl.appendChild(regionTitle);
        
        const rounds = document.createElement('div');
        rounds.className = 'bracket-rounds';
        
        // Create rounds for this region
        BRACKET_CONFIG.rounds.forEach((round, roundIndex) => {
            const roundEl = this.createRound(round, roundIndex, region.id);
            rounds.appendChild(roundEl);
        });
        
        regionEl.appendChild(rounds);
        return regionEl;
    }

    createRound(round, roundIndex, regionId) {
        const roundEl = document.createElement('div');
        roundEl.className = 'bracket-round';
        roundEl.dataset.round = roundIndex;
        roundEl.dataset.region = regionId;
        
        const title = document.createElement('div');
        title.className = 'round-title';
        title.textContent = round.name;
        roundEl.appendChild(title);
        
        const matchupsContainer = document.createElement('div');
        matchupsContainer.className = 'matchups-container';
        
        // Create matchups for this round
        for (let i = 0; i < round.matchups; i++) {
            const matchup = this.createMatchup(regionId, roundIndex, i);
            matchupsContainer.appendChild(matchup);
        }
        
        roundEl.appendChild(matchupsContainer);
        return roundEl;
    }

    createMatchup(regionId, roundIndex, matchupIndex) {
        const matchup = document.createElement('div');
        matchup.className = 'matchup';
        matchup.dataset.matchup = matchupIndex;
        matchup.dataset.round = roundIndex;
        matchup.dataset.region = regionId;
        
        // Set up team selects
        for (let i = 0; i < BRACKET_CONFIG.teamsPerMatchup; i++) {
            const teamSelect = document.createElement('div');
            teamSelect.className = 'team-select';
            
            const select = document.createElement('select');
            select.dataset.position = i;
            
            // Final round gets special treatment
            if (regionId === 'finals') {
                // For finals, options come from conference champions
                if (i === 0) {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'Eastern Champion';
                    select.appendChild(option);
                    
                    // Get the saved East champion if exists
                    const eastChampKey = `east_3_0_${i}`;
                    if (this.bracketState.selections && this.bracketState.selections[eastChampKey]) {
                        const eastChamp = this.bracketState.selections[eastChampKey];
                        select.value = eastChamp;
                        select.dataset.team = eastChamp;
                        this.applyTeamStyles(select, eastChamp);
                    }
                } else {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'Western Champion';
                    select.appendChild(option);
                    
                    // Get the saved West champion if exists
                    const westChampKey = `west_3_0_${i}`;
                    if (this.bracketState.selections && this.bracketState.selections[westChampKey]) {
                        const westChamp = this.bracketState.selections[westChampKey];
                        select.value = westChamp;
                        select.dataset.team = westChamp;
                        this.applyTeamStyles(select, westChamp);
                    }
                }
            } else {
                // First round gets all teams as options
                if (roundIndex === 0) {
                    const emptyOption = document.createElement('option');
                    emptyOption.value = '';
                    emptyOption.textContent = 'Select Team';
                    select.appendChild(emptyOption);
                    
                    // Add region teams as options
                    const teams = TEAMS[regionId] || [];
                    teams.forEach(team => {
                        const option = document.createElement('option');
                        option.value = team;
                        option.textContent = team;
                        select.appendChild(option);
                    });
                    
                    // Set saved selection if exists
                    const selectionKey = `${regionId}_${roundIndex}_${matchupIndex}_${i}`;
                    if (this.bracketState.selections && this.bracketState.selections[selectionKey]) {
                        select.value = this.bracketState.selections[selectionKey];
                        select.dataset.team = this.bracketState.selections[selectionKey];
                        this.applyTeamStyles(select, this.bracketState.selections[selectionKey]);
                    }
                } else {
                    // Later rounds have placeholder options
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'Winner';
                    select.appendChild(option);
                    
                    // Set saved selection if exists
                    const selectionKey = `${regionId}_${roundIndex}_${matchupIndex}_${i}`;
                    if (this.bracketState.selections && this.bracketState.selections[selectionKey]) {
                        select.value = this.bracketState.selections[selectionKey];
                        select.dataset.team = this.bracketState.selections[selectionKey];
                        this.applyTeamStyles(select, this.bracketState.selections[selectionKey]);
                        
                        // Add the saved team as an option
                        const teamOption = document.createElement('option');
                        teamOption.value = this.bracketState.selections[selectionKey];
                        teamOption.textContent = this.bracketState.selections[selectionKey];
                        select.appendChild(teamOption);
                    }
                }
            }
            
            teamSelect.appendChild(select);
            matchup.appendChild(teamSelect);
        }
        
        return matchup;
    }

    applyTeamStyles(selectElement, teamName) {
        if (!teamName) return;
        
        // Don't apply logo images since they're missing
        // Just set the data-team attribute for CSS to apply the team colors
        selectElement.dataset.team = teamName;
    }

    setupEventListeners() {
        // Team selection change event
        if (this.container) {
            this.container.addEventListener('change', (e) => {
                if (e.target.tagName === 'SELECT') {
                    this.handleTeamSelection(e.target);
                }
            });
            
            // Save bracket button
            const saveBtn = this.container.querySelector('.save-bracket');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => this.saveBracket());
            }
            
            // Reset bracket button
            const resetBtn = this.container.querySelector('.reset-bracket');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => this.resetBracket());
            }
            
            // Bracket name input
            const nameInput = this.container.querySelector('.bracket-name');
            if (nameInput) {
                nameInput.addEventListener('change', (e) => {
                    this.bracketState.name = e.target.value;
                    if (this.options.autoSave) {
                        this.saveBracket();
                    }
                });
            }
        }
    }

    handleTeamSelection(selectElement) {
        const teamName = selectElement.value;
        const matchup = selectElement.closest('.matchup');
        const region = matchup.dataset.region;
        const round = parseInt(matchup.dataset.round);
        const matchupIndex = parseInt(matchup.dataset.matchup);
        const position = parseInt(selectElement.dataset.position);
        
        // Update the dataset
        selectElement.dataset.team = teamName;
        
        // Apply team styling
        this.applyTeamStyles(selectElement, teamName);
        
        // Save selection to bracket state
        const key = `${region}_${round}_${matchupIndex}_${position}`;
        this.bracketState.selections[key] = teamName;
        
        // Update next round (if not the finals)
        if (region !== 'finals') {
            this.updateNextRound(region, round, matchupIndex, teamName);
        }
        
        // Auto-save if enabled
        if (this.options.autoSave) {
            this.saveBracket();
        }
        
        // Redraw connectors to reflect changes
        this.drawConnectors();
    }

    updateNextRound(region, round, matchupIndex, teamName) {
        if (round >= BRACKET_CONFIG.rounds.length - 1) return;
        
        const nextRound = round + 1;
        const nextMatchupIndex = Math.floor(matchupIndex / 2);
        const position = matchupIndex % 2;
        
        // Find the next round select element
        const nextSelect = this.container.querySelector(
            `.matchup[data-region="${region}"][data-round="${nextRound}"][data-matchup="${nextMatchupIndex}"] .team-select:nth-child(${position + 1}) select`
        );
        
        if (nextSelect) {
            // Check if option exists, if not create it
            let option = Array.from(nextSelect.options).find(opt => opt.value === teamName);
            if (!option) {
                option = document.createElement('option');
                option.value = teamName;
                option.textContent = teamName;
                nextSelect.appendChild(option);
            }
            
            // Set the value, this will trigger a change event
            nextSelect.value = teamName;
            nextSelect.dataset.team = teamName;
            this.applyTeamStyles(nextSelect, teamName);
            
            // Update bracket state
            const key = `${region}_${nextRound}_${nextMatchupIndex}_${position}`;
            this.bracketState.selections[key] = teamName;
            
            // If we're updating conference champions, update finals too
            if (nextRound === 3) {
                // Find the finals select for this region
                const finalsPosition = region === 'east' ? 0 : 1;
                const finalsSelect = this.container.querySelector(
                    `.matchup[data-region="finals"][data-round="0"][data-matchup="0"] .team-select:nth-child(${finalsPosition + 1}) select`
                );
                
                if (finalsSelect) {
                    // Check if option exists, if not create it
                    let finalsOption = Array.from(finalsSelect.options).find(opt => opt.value === teamName);
                    if (!finalsOption) {
                        finalsOption = document.createElement('option');
                        finalsOption.value = teamName;
                        finalsOption.textContent = teamName;
                        finalsSelect.appendChild(finalsOption);
                    }
                    
                    // Set the value
                    finalsSelect.value = teamName;
                    finalsSelect.dataset.team = teamName;
                    this.applyTeamStyles(finalsSelect, teamName);
                    
                    // Update bracket state
                    const finalsKey = `finals_0_0_${finalsPosition}`;
                    this.bracketState.selections[finalsKey] = teamName;
                }
            }
        }
    }

    drawConnectors() {
        // Check if container exists before proceeding
        if (!this.container) return;
        
        // Clear old connectors
        const oldConnectors = this.container.querySelectorAll('.connector');
        oldConnectors.forEach(conn => conn.remove());
        
        // Draw connectors for each region
        if (BRACKET_CONFIG.regions) {
            BRACKET_CONFIG.regions.forEach(region => {
                this.drawRegionConnectors(region.id);
            });
        }
        
        // Draw connectors to finals
        this.drawFinalsConnectors();
    }

    drawRegionConnectors(regionId) {
        // Check if container exists
        if (!this.container) return;
        
        const region = this.container.querySelector(`.bracket-region[data-region="${regionId}"]`);
        if (!region) return;
        
        // For each round except the last
        for (let round = 0; round < BRACKET_CONFIG.rounds.length - 1; round++) {
            const matchups = region.querySelectorAll(`.matchup[data-round="${round}"]`);
            if (!matchups || matchups.length === 0) continue;
            
            // Process matchups in pairs
            for (let i = 0; i < matchups.length; i += 2) {
                const upperMatchup = matchups[i];
                const lowerMatchup = matchups[i + 1];
                if (!upperMatchup || !lowerMatchup) continue;
                
                const nextRoundIndex = round + 1;
                const nextMatchupIndex = Math.floor(i / 2);
                const nextMatchup = region.querySelector(`.matchup[data-round="${nextRoundIndex}"][data-matchup="${nextMatchupIndex}"]`);
                
                if (upperMatchup && lowerMatchup && nextMatchup) {
                    // Calculate positions
                    const upper = upperMatchup.getBoundingClientRect();
                    const lower = lowerMatchup.getBoundingClientRect();
                    const next = nextMatchup.getBoundingClientRect();
                    const regionRect = region.getBoundingClientRect();
                    
                    // Create horizontal connectors
                    const upperHorizontal = document.createElement('div');
                    upperHorizontal.className = 'connector connector-horizontal';
                    upperHorizontal.style.top = `${upper.top + upper.height/2 - regionRect.top}px`;
                    
                    const lowerHorizontal = document.createElement('div');
                    lowerHorizontal.className = 'connector connector-horizontal';
                    lowerHorizontal.style.top = `${lower.top + lower.height/2 - regionRect.top}px`;
                    
                    // Create vertical connector
                    const vertical = document.createElement('div');
                    vertical.className = 'connector connector-vertical';
                    vertical.style.top = `${upper.top + upper.height/2 - regionRect.top}px`;
                    vertical.style.height = `${lower.top - upper.top}px`;
                    
                    // Position horizontals based on region (left or right)
                    if (regionId === 'west') {
                        // West region connectors go left
                        upperHorizontal.style.right = 'auto';
                        upperHorizontal.style.left = `${0}px`;
                        upperHorizontal.style.width = `${next.left - upper.right + 15}px`;
                        
                        lowerHorizontal.style.right = 'auto';
                        lowerHorizontal.style.left = `${0}px`;
                        lowerHorizontal.style.width = `${next.left - lower.right + 15}px`;
                        
                        vertical.style.left = `${next.left - regionRect.left - 10}px`;
                    } else {
                        // East region connectors go right
                        upperHorizontal.style.left = 'auto';
                        upperHorizontal.style.right = `${0}px`;
                        upperHorizontal.style.width = `${upper.left - next.right + 15}px`;
                        
                        lowerHorizontal.style.left = 'auto';
                        lowerHorizontal.style.right = `${0}px`;
                        lowerHorizontal.style.width = `${lower.left - next.right + 15}px`;
                        
                        vertical.style.right = `${regionRect.right - next.right - 10}px`;
                    }

                    // Add animation classes
                    upperHorizontal.classList.add('animate-connector');
                    lowerHorizontal.classList.add('animate-connector');
                    vertical.classList.add('animate-connector');
                    
                    // Add to DOM
                    region.appendChild(upperHorizontal);
                    region.appendChild(lowerHorizontal);
                    region.appendChild(vertical);
                }
            }
        }
    }

    drawFinalsConnectors() {
        // Check if container exists
        if (!this.container) return;
        
        const eastChampion = this.container.querySelector(`.matchup[data-region="east"][data-round="3"][data-matchup="0"]`);
        const westChampion = this.container.querySelector(`.matchup[data-region="west"][data-round="3"][data-matchup="0"]`);
        const finals = this.container.querySelector(`.matchup[data-region="finals"][data-round="0"][data-matchup="0"]`);
        
        if (!eastChampion || !westChampion || !finals) return;
        
        const eastRect = eastChampion.getBoundingClientRect();
        const westRect = westChampion.getBoundingClientRect();
        const finalsRect = finals.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        
        // Create east to finals connector
        const eastConnector = document.createElement('div');
        eastConnector.className = 'connector connector-horizontal animate-connector';
        eastConnector.dataset.finals = "true";
        eastConnector.style.top = `${eastRect.top + eastRect.height/2 - containerRect.top}px`;
        eastConnector.style.left = `${eastRect.right - containerRect.left}px`;
        eastConnector.style.width = `${finalsRect.left - eastRect.right - 10}px`;
        
        // Create west to finals connector
        const westConnector = document.createElement('div');
        westConnector.className = 'connector connector-horizontal animate-connector';
        westConnector.dataset.finals = "true";
        westConnector.style.top = `${westRect.top + westRect.height/2 - containerRect.top}px`;
        westConnector.style.left = `${finalsRect.right - containerRect.left}px`;
        westConnector.style.width = `${westRect.left - finalsRect.right - 10}px`;
        
        // Add arrow indicators for finals connections
        const eastArrow = document.createElement('div');
        eastArrow.className = 'connector-arrow east animate-arrow';
        eastArrow.style.top = `${eastRect.top + eastRect.height/2 - containerRect.top - 6}px`;
        eastArrow.style.left = `${finalsRect.left - containerRect.left - 12}px`;
        
        const westArrow = document.createElement('div');
        westArrow.className = 'connector-arrow west animate-arrow';
        westArrow.style.top = `${westRect.top + westRect.height/2 - containerRect.top - 6}px`;
        westArrow.style.left = `${finalsRect.right - containerRect.left}px`;
        
        this.container.appendChild(eastConnector);
        this.container.appendChild(westConnector);
        this.container.appendChild(eastArrow);
        this.container.appendChild(westArrow);
    }

    saveBracket() {
        // Update timestamp
        this.bracketState.timestamp = new Date().toISOString();
        
        // Get bracket name from input
        const nameInput = this.container.querySelector('.bracket-name');
        if (nameInput) {
            this.bracketState.name = nameInput.value;
        }
        
        // Save to localStorage
        localStorage.setItem('nba_bracket', JSON.stringify(this.bracketState));
        
        // Visual feedback
        const saveBtn = this.container.querySelector('.save-bracket');
        if (saveBtn) {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saved!';
            saveBtn.classList.add('btn-success');
            
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.classList.remove('btn-success');
            }, 2000);
        }
    }

    resetBracket() {
        if (confirm('Are you sure you want to reset your bracket? All selections will be cleared.')) {
            // Clear bracket state
            this.bracketState = {
                name: this.options.bracketName,
                selections: {},
                timestamp: new Date().toISOString()
            };
            
            // Save empty state
            localStorage.setItem('nba_bracket', JSON.stringify(this.bracketState));
            
            // Rebuild bracket
            this.createBracketStructure();
            this.setupEventListeners();
            
            // Redraw connectors
            setTimeout(() => this.drawConnectors(), 100);
        }
    }
}

// Initialize bracket when page loads
document.addEventListener('DOMContentLoaded', () => {
    const bracket = new Bracket('bracket-container', {
        bracketName: "My NBA Playoffs Bracket 2025"
    });
}); 