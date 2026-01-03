class DisasterManagementUI {
    constructor() {
        this.stats = {
            disasters: 0,
            verified: 0,
            totalFunding: 0,
            transactions: 0
        };
        
        this.isBackendConnected = false;
        this.apiBase = window.location.origin;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkBackendConnection();
    }

    setupEventListeners() {
        document.getElementById('test-disaster-btn').addEventListener('click', () => {
            this.runRealDisasterTest();
        });

        document.getElementById('full-test-btn').addEventListener('click', () => {
            this.runRealFullSystemTest();
        });

        document.getElementById('clear-logs-btn').addEventListener('click', () => {
            this.clearLogs();
        });
    }

    async checkBackendConnection() {
        try {
            this.addLog('info', 'CHECKING BACKEND CONNECTION...');
            
            // For Vercel static deployment, we'll run in demo mode
            if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('localhost')) {
                // Try to connect to API, but fallback to demo mode
                try {
                    const response = await fetch(`${this.apiBase}/api/status`);
                    if (response.ok) {
                        const data = await response.json();
                        this.isBackendConnected = true;
                        
                        // Update mode indicator based on response
                        const modeDisplay = document.getElementById('mode-display');
                        const modeText = document.getElementById('mode-text');
                        
                        if (data.mode === 'vercel_demo') {
                            modeDisplay.className = 'mode-display demo-mode';
                            modeText.textContent = 'VERCEL DEMO MODE - SIMULATED TRANSACTIONS';
                            this.addLog('info', 'CONNECTED TO VERCEL DEMO SYSTEM');
                            this.addLog('warning', 'THIS IS A DEMO - NO REAL BLOCKCHAIN TRANSACTIONS');
                        } else {
                            modeDisplay.className = 'mode-display real-mode';
                            modeText.textContent = 'REAL TRANSACTION MODE ACTIVE';
                            document.getElementById('real-transaction-warning').style.display = 'block';
                            this.addLog('info', 'CONNECTED TO REAL DISASTER MANAGEMENT SYSTEM');
                            this.addLog('warning', 'REAL BLOCKCHAIN TRANSACTIONS ENABLED');
                            this.addLog('error', 'THIS WILL SPEND ACTUAL ETH FROM YOUR WALLET!');
                        }
                        
                        this.updateRealSystemStatus(data);
                        return;
                    }
                } catch (apiError) {
                    console.log('API not available, falling back to demo mode');
                }
            }
            
            // Fallback to demo mode
            throw new Error('Backend not available');
            
        } catch (error) {
            this.isBackendConnected = false;
            
            // Update mode indicator for demo
            const modeDisplay = document.getElementById('mode-display');
            const modeText = document.getElementById('mode-text');
            modeDisplay.className = 'mode-display demo-mode';
            modeText.textContent = 'STATIC DEMO MODE - SIMULATED TRANSACTIONS';
            
            this.addLog('info', 'RUNNING IN STATIC DEMO MODE');
            this.addLog('warning', 'THIS IS A FRONTEND-ONLY DEMO');
            this.addLog('info', 'FOR REAL TRANSACTIONS, USE DOCKER OR HEROKU DEPLOYMENT');
            this.simulateSystemStartup();
        }
    }

    updateRealSystemStatus(data) {
        // Update blockchain status
        const status = data.blockchain.status === 'connected' ? 'connected' : 'error';
        this.updateBlockchainStatus(status, 
            status === 'connected' ? 
            `CONNECTED TO ${data.blockchain.network}` : 
            'BLOCKCHAIN CONNECTION FAILED'
        );
        
        if (data.blockchain.address && data.blockchain.balance) {
            this.updateWalletInfo(data.blockchain.address, data.blockchain.balance);
        }
        
        // Update agent statuses
        this.updateAgentStatus('watchtower', data.agents.watchtower.status === 'online');
        this.updateAgentStatus('auditor', data.agents.auditor.status === 'online');
        this.updateAgentStatus('treasurer', data.agents.treasurer.status === 'online');
        
        if (data.agents.watchtower.status === 'online' && 
            data.agents.auditor.status === 'online' && 
            data.agents.treasurer.status === 'online') {
            this.addLog('info', 'ALL AGENTS ONLINE AND READY FOR REAL TRANSACTIONS');
        }
    }

    simulateSystemStartup() {
        this.addLog('info', 'DEMO MODE - SIMULATED SYSTEM INITIALIZED');
        
        setTimeout(() => {
            this.updateBlockchainStatus('connecting', 'CONNECTING TO SEPOLIA TESTNET...');
        }, 1000);

        setTimeout(() => {
            this.updateBlockchainStatus('connected', 'CONNECTED TO SEPOLIA TESTNET (DEMO)');
            this.updateWalletInfo('0x5D3f355f0EA186896802878E7Aa0b184469c3033', '0.0486');
            this.updateAgentStatus('watchtower', true);
        }, 2000);

        setTimeout(() => {
            this.updateAgentStatus('auditor', true);
        }, 2500);

        setTimeout(() => {
            this.updateAgentStatus('treasurer', true);
            this.addLog('info', 'ALL AGENTS ONLINE (DEMO MODE)');
            this.addLog('warning', 'RUN "PYTHON APP.PY" FOR REAL TRANSACTIONS');
        }, 3000);
    }

    updateBlockchainStatus(status, message) {
        const statusElement = document.getElementById('blockchain-status');
        statusElement.className = `status-display ${status}`;
        statusElement.textContent = message;
    }

    updateWalletInfo(address, balance) {
        const walletInfo = document.getElementById('wallet-info');
        walletInfo.innerHTML = `
            <div>ADDRESS: ${address}</div>
            <div>BALANCE: ${balance} ETH</div>
        `;
    }

    updateAgentStatus(agentName, online) {
        const dot = document.getElementById(`${agentName}-dot`);
        if (dot) {
            dot.className = `agent-dot ${online ? 'online' : 'offline'}`;
        }
    }

    updateCardStatus(cardType, status, details) {
        const statusElement = document.getElementById(`${cardType}-status`);
        const detailsElement = document.getElementById(`${cardType}-details`);
        
        statusElement.className = `status-indicator ${status}`;
        statusElement.textContent = status.toUpperCase();
        detailsElement.textContent = details;
    }

    addLog(type, message) {
        const terminalContent = document.getElementById('terminal-content');
        const timestamp = new Date().toLocaleString();
        
        const logLine = document.createElement('div');
        logLine.className = `log-line ${type}`;
        logLine.innerHTML = `
            <span class="timestamp">[${timestamp}]</span>
            <span class="log-text">${message}</span>
        `;
        
        terminalContent.appendChild(logLine);
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }

    clearLogs() {
        const terminalContent = document.getElementById('terminal-content');
        terminalContent.innerHTML = '';
        this.addLog('info', 'SYSTEM LOGS CLEARED');
    }

    updateStats() {
        document.getElementById('disasters-count').textContent = this.stats.disasters;
        document.getElementById('verified-count').textContent = this.stats.verified;
        document.getElementById('total-funding').textContent = this.stats.totalFunding.toFixed(3);
        document.getElementById('transactions-count').textContent = this.stats.transactions;
    }

    async runRealDisasterTest() {
        if (!this.isBackendConnected) {
            // Run demo version
            return this.runDemoDisasterTest();
        }

        this.addLog('info', 'STARTING REAL DISASTER DETECTION TEST...');
        
        // Reset card statuses
        this.updateCardStatus('detect', 'processing', 'PROCESSING REAL TEST IMAGE...');
        this.updateCardStatus('verify', 'waiting', 'WAITING FOR DETECTION...');
        this.updateCardStatus('disburse', 'waiting', 'WAITING FOR VERIFICATION...');
        this.updateCardStatus('audit', 'waiting', 'WAITING FOR TRANSACTION...');

        try {
            const response = await fetch(`${this.apiBase}/api/test-disaster`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                this.updateCardStatus('detect', 'completed', 
                    `REAL DISASTER DETECTED: ${result.disaster_type} (${result.confidence}% CONFIDENCE)`);
                
                this.addLog('info', `REAL DISASTER DETECTED: ${result.disaster_type} (${result.confidence}% CONFIDENCE)`);
                this.stats.disasters++;
                this.updateStats();
            } else {
                this.updateCardStatus('detect', 'failed', 'NO DISASTER DETECTED OR ERROR OCCURRED');
                this.addLog('error', 'REAL DISASTER DETECTION FAILED');
            }
            
        } catch (error) {
            this.updateCardStatus('detect', 'failed', `ERROR: ${error.message}`);
            this.addLog('error', `REAL DISASTER TEST FAILED: ${error.message}`);
        }
    }

    async runDemoDisasterTest() {
        this.addLog('info', 'STARTING DEMO DISASTER DETECTION TEST...');
        
        // Reset card statuses
        this.updateCardStatus('detect', 'processing', 'PROCESSING DEMO TEST IMAGE...');
        this.updateCardStatus('verify', 'waiting', 'WAITING FOR DETECTION...');
        this.updateCardStatus('disburse', 'waiting', 'WAITING FOR VERIFICATION...');
        this.updateCardStatus('audit', 'waiting', 'WAITING FOR TRANSACTION...');

        await this.delay(2000);

        // Generate random demo results
        const disasterTypes = ['FIRE', 'FLOOD', 'EARTHQUAKE', 'CASUALTY'];
        const disasterType = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];
        const confidence = Math.floor(Math.random() * 15) + 85; // 85-100%
        
        this.updateCardStatus('detect', 'completed', 
            `DEMO DISASTER DETECTED: ${disasterType} (${confidence}% CONFIDENCE)`);
        
        this.addLog('info', `DEMO DISASTER DETECTED: ${disasterType} (${confidence}% CONFIDENCE)`);
        this.stats.disasters++;
        this.updateStats();
    }

    async runRealFullSystemTest() {
        if (!this.isBackendConnected) {
            // Run demo version
            return this.runDemoFullSystemTest();
        }

        this.addLog('info', 'STARTING REAL FULL SYSTEM TEST...');
        this.addLog('error', 'THIS WILL MAKE ACTUAL BLOCKCHAIN TRANSACTIONS!');
        
        // Reset all card statuses
        this.updateCardStatus('detect', 'processing', 'PROCESSING REAL DISASTER DETECTION...');
        this.updateCardStatus('verify', 'waiting', 'WAITING FOR DETECTION...');
        this.updateCardStatus('disburse', 'waiting', 'WAITING FOR VERIFICATION...');
        this.updateCardStatus('audit', 'waiting', 'WAITING FOR TRANSACTION...');

        try {
            const response = await fetch(`${this.apiBase}/api/full-test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                const steps = result.steps;
                
                // Step 1: Detection Results
                this.updateCardStatus('detect', 'completed', 
                    `REAL DISASTER DETECTED: ${steps.detection.disaster_type} (${steps.detection.confidence}% CONFIDENCE)`);
                
                this.addLog('info', `REAL DISASTER DETECTED: ${steps.detection.disaster_type}`);
                this.stats.disasters++;
                
                await this.delay(1000);
                
                // Step 2: Verification Results
                this.updateCardStatus('verify', 'processing', 'RUNNING REAL DISASTER VERIFICATION...');
                this.addLog('info', 'RUNNING REAL DISASTER VERIFICATION...');
                
                await this.delay(2000);
                
                this.updateCardStatus('verify', 'completed', 
                    `REAL VERIFICATION PASSED: ${steps.verification.score}/100 - ${steps.verification.human_impact} PEOPLE AFFECTED`);
                
                this.addLog('info', `REAL VERIFICATION PASSED: ${steps.verification.score}/100`);
                this.stats.verified++;
                
                await this.delay(1000);
                
                // Step 3: Real Blockchain Transaction
                this.updateCardStatus('disburse', 'processing', 'EXECUTING REAL BLOCKCHAIN TRANSACTION...');
                this.addLog('error', 'EXECUTING REAL BLOCKCHAIN TRANSACTION...');
                this.addLog('error', 'SPENDING REAL ETH FROM YOUR WALLET!');
                
                await this.delay(3000);
                
                this.updateCardStatus('disburse', 'completed', 
                    `REAL TRANSACTION CONFIRMED! HASH: ${steps.transaction.tx_hash.substring(0, 10)}...`);
                
                this.updateCardStatus('audit', 'completed', 
                    `TRANSACTION RECORDED ON BLOCKCHAIN - FULLY AUDITABLE`);
                
                this.addLog('info', 'REAL BLOCKCHAIN TRANSACTION SUCCESSFUL!');
                this.addLog('info', `TRANSACTION HASH: ${steps.transaction.tx_hash}`);
                this.addLog('info', 'FUNDS ACTUALLY MOVED ON SEPOLIA TESTNET!');
                
                this.stats.totalFunding += steps.transaction.amount;
                this.stats.transactions++;
                this.updateStats();
                
                // Update wallet balance
                this.updateWalletBalance();
                
                this.addLog('info', 'REAL DISASTER MANAGEMENT SYSTEM TEST COMPLETED!');
                
            } else {
                this.addLog('error', `REAL SYSTEM TEST FAILED: ${result.status}`);
                if (result.error) {
                    this.addLog('error', `ERROR DETAILS: ${result.error}`);
                }
            }
            
        } catch (error) {
            this.addLog('error', `REAL SYSTEM TEST FAILED: ${error.message}`);
        }
    }

    async runDemoFullSystemTest() {
        this.addLog('info', 'STARTING DEMO FULL SYSTEM TEST...');
        this.addLog('warning', 'THIS IS A SIMULATION - NO REAL TRANSACTIONS');
        
        // Reset all card statuses
        this.updateCardStatus('detect', 'processing', 'PROCESSING DEMO DISASTER DETECTION...');
        this.updateCardStatus('verify', 'waiting', 'WAITING FOR DETECTION...');
        this.updateCardStatus('disburse', 'waiting', 'WAITING FOR VERIFICATION...');
        this.updateCardStatus('audit', 'waiting', 'WAITING FOR TRANSACTION...');

        // Step 1: Demo Detection
        await this.delay(2000);
        
        const disasterTypes = ['FIRE', 'FLOOD', 'EARTHQUAKE', 'CASUALTY'];
        const disasterType = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];
        const confidence = Math.floor(Math.random() * 15) + 85;
        
        this.updateCardStatus('detect', 'completed', 
            `DEMO DISASTER DETECTED: ${disasterType} (${confidence}% CONFIDENCE)`);
        
        this.addLog('info', `DEMO DISASTER DETECTED: ${disasterType}`);
        this.stats.disasters++;
        
        await this.delay(1000);
        
        // Step 2: Demo Verification
        this.updateCardStatus('verify', 'processing', 'RUNNING DEMO DISASTER VERIFICATION...');
        this.addLog('info', 'RUNNING DEMO DISASTER VERIFICATION...');
        
        await this.delay(2000);
        
        const verificationScore = Math.floor(Math.random() * 35) + 60; // 60-95
        const humanImpact = Math.floor(Math.random() * 450) + 50; // 50-500
        
        this.updateCardStatus('verify', 'completed', 
            `DEMO VERIFICATION PASSED: ${verificationScore}/100 - ${humanImpact} PEOPLE AFFECTED`);
        
        this.addLog('info', `DEMO VERIFICATION PASSED: ${verificationScore}/100`);
        this.stats.verified++;
        
        await this.delay(1000);
        
        // Step 3: Demo Transaction
        this.updateCardStatus('disburse', 'processing', 'EXECUTING DEMO BLOCKCHAIN TRANSACTION...');
        this.addLog('info', 'EXECUTING DEMO BLOCKCHAIN TRANSACTION...');
        this.addLog('warning', 'THIS IS A SIMULATION - NO REAL ETH SPENT!');
        
        await this.delay(3000);
        
        const fundingAmount = Math.round((Math.random() * 0.009 + 0.001) * 1000) / 1000; // 0.001-0.01
        const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        
        this.updateCardStatus('disburse', 'completed', 
            `DEMO TRANSACTION COMPLETED! HASH: ${txHash.substring(0, 10)}...`);
        
        this.updateCardStatus('audit', 'completed', 
            `DEMO TRANSACTION RECORDED - SIMULATION COMPLETE`);
        
        this.addLog('info', 'DEMO BLOCKCHAIN TRANSACTION COMPLETED!');
        this.addLog('info', `DEMO TRANSACTION HASH: ${txHash}`);
        this.addLog('warning', 'THIS WAS A SIMULATION - NO REAL FUNDS MOVED!');
        
        this.stats.totalFunding += fundingAmount;
        this.stats.transactions++;
        this.updateStats();
        
        this.addLog('info', 'DEMO DISASTER MANAGEMENT SYSTEM TEST COMPLETED!');
    }

    async updateWalletBalance() {
        try {
            const response = await fetch(`${this.apiBase}/api/status`);
            if (response.ok) {
                const data = await response.json();
                if (data.blockchain.address && data.blockchain.balance) {
                    this.updateWalletInfo(data.blockchain.address, data.blockchain.balance);
                    this.addLog('info', `UPDATED BALANCE: ${data.blockchain.balance} ETH`);
                }
            }
        } catch (error) {
            console.error('Failed to update wallet balance:', error);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the UI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DisasterManagementUI();
});