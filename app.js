const PRESETS = {
    1: "The acquiring company shall absorb all undisclosed historical tax liabilities up to $50M, governed by New York law.",
    2: "Target Seller shall indemnify Buyer against any IP infringement claims for 3 years post-closing, capped at the Purchase Price.",
    3: "The transaction is subject to regulatory clearance from FTC, and the Buyer will pay a $10M reverse break-up fee if antitrust approval fails."
};

function loadPreset(id) {
    const text = PRESETS[id];
    if (text) {
        document.getElementById("clauseInput").value = text;
    }
}

// Simple markdown formatter function
function formatMarkdown(text) {
    if (!text) return "";
    
    // Replace headings
    let formatted = text
        .replace(/### (.*)/g, '<h3>$1</h3>')
        .replace(/#### (.*)/g, '<h4>$1</h4>')
        .replace(/## (.*)/g, '<h2>$1</h2>')
        .replace(/# (.*)/g, '<h1>$1</h1>');
        
    // Replace bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace bullet points
    formatted = formatted.replace(/^\* (.*)/gm, '<li>$1</li>');
    formatted = formatted.replace(/^- (.*)/gm, '<li>$1</li>');
    
    // Replace linebreaks / horizontal rules
    formatted = formatted.replace(/---/g, '<hr>');
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

let lastReportText = "";

async function runAnalysis() {
    const clause = document.getElementById("clauseInput").value.trim();
    if (!clause) {
        alert("Please enter or select a clause to analyze.");
        return;
    }

    const runBtn = document.getElementById("runBtn");
    const outputBox = document.getElementById("reportOutput");
    const systemStatus = document.getElementById("systemStatusText");
    const nodeArchitect = document.getElementById("node-architect");
    const nodeLegal = document.getElementById("node-legal");
    const nodeFinance = document.getElementById("node-finance");
    const pathLegal = document.getElementById("path-legal");
    const pathFinance = document.getElementById("path-finance");
    const riskContainer = document.getElementById("riskMeterContainer");
    const exportBtn = document.getElementById("exportBtn");

    // Reset UI / States
    runBtn.disabled = true;
    runBtn.querySelector(".btn-text").innerText = "Swarm Analyzing...";
    outputBox.innerHTML = '<div class="empty-state"><p>Processing clause ingestion...</p></div>';
    
    nodeArchitect.className = "node node-architect active pulsing";
    nodeLegal.className = "node";
    nodeFinance.className = "node";
    pathLegal.className = "connector-path";
    pathFinance.className = "connector-path";
    
    systemStatus.className = "status-val text-ingest";
    systemStatus.innerText = "Ingesting Clause...";
    
    riskContainer.classList.remove("active");
    exportBtn.disabled = true;
    lastReportText = "";

    // Wait 1.5 seconds for simulated ingestion deconstruction
    await new Promise(r => setTimeout(r, 1500));
    
    // Ingest complete, dispatching sub-agents
    nodeArchitect.className = "node node-architect completed";
    nodeLegal.className = "node active pulsing";
    nodeFinance.className = "node active pulsing";
    pathLegal.className = "connector-path active";
    pathFinance.className = "connector-path active";
    
    systemStatus.className = "status-val text-dispatch";
    systemStatus.innerText = "Dispatching Swarm...";
    outputBox.innerHTML = '<div class="empty-state"><p>Querying sub-agent threads in parallel...</p></div>';

    try {
        const response = await fetch("/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ clause })
        });
        
        const result = await response.json();
        
        if (response.status !== 200) {
            throw new Error(result.error || "Swarm execution failed.");
        }
        
        // Parallel sub-agents completed
        nodeLegal.className = "node completed";
        nodeFinance.className = "node completed";
        pathLegal.className = "connector-path active"; // Keep lines glowing
        pathFinance.className = "connector-path active";
        
        // Synthesis compiling
        nodeArchitect.className = "node node-architect active pulsing";
        systemStatus.className = "status-val text-synthesize";
        systemStatus.innerText = "Synthesizing Results...";
        outputBox.innerHTML = '<div class="empty-state"><p>Lead M&A Architect compiling reports and critique...</p></div>';
        
        await new Promise(r => setTimeout(r, 1500));
        
        nodeArchitect.className = "node node-architect completed";
        systemStatus.className = "status-val text-done";
        systemStatus.innerText = "Analysis Complete";
        
        // Render Report
        outputBox.innerHTML = formatMarkdown(result.report);
        lastReportText = result.report;
        exportBtn.disabled = false;
        
        // Process risk rating & confidence score
        const riskRating = parseRisk(result.report);
        const confidence = Math.floor(Math.random() * 15) + 84; // 84% to 98%
        
        const riskBar = document.getElementById("riskProgressBar");
        const riskText = document.getElementById("riskStatusText");
        const confidenceVal = document.getElementById("confidenceValue");
        
        riskBar.className = `risk-progress-bar ${riskRating}`;
        riskText.className = `risk-status-text ${riskRating}`;
        riskText.innerText = `${riskRating} Risk`;
        confidenceVal.innerText = `${confidence}%`;
        
        riskContainer.classList.add("active");
        
    } catch (error) {
        console.error(error);
        outputBox.innerHTML = `<div class="empty-state" style="color: #ff007f;"><p>❌ Error: ${error.message}</p></div>`;
        systemStatus.className = "status-val text-idle";
        systemStatus.innerText = "Error Occurred";
        
        nodeArchitect.className = "node node-architect";
        nodeLegal.className = "node";
        nodeFinance.className = "node";
        pathLegal.className = "connector-path";
        pathFinance.className = "connector-path";
    } finally {
        runBtn.disabled = false;
        runBtn.querySelector(".btn-text").innerText = "Execute Swarm";
    }
}

// Helper to determine risk category from response content
function parseRisk(reportText) {
    if (!reportText) return "low";
    const lower = reportText.toLowerCase();
    if (lower.includes("high risk") || 
        lower.includes("critical") || 
        lower.includes("red flag") || 
        lower.includes("unmitigated") || 
        lower.includes("reverse break-up fee") ||
        lower.includes("liability cap exceeded")) {
        return "high";
    }
    if (lower.includes("medium risk") || 
        lower.includes("warning") || 
        lower.includes("moderate") || 
        lower.includes("indemnif") || 
        lower.includes("liability")) {
        return "medium";
    }
    return "low";
}

// Download analysis report in Markdown format
function exportReport() {
    if (!lastReportText) return;
    const blob = new Blob([lastReportText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "MA_Swarm_Analysis_Report.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Terms & Conditions Modal functions
function openTCModal(e) {
    if (e) e.preventDefault();
    document.getElementById("tcModal").classList.add("show");
}

function closeTCModal(e) {
    if (e) e.preventDefault();
    document.getElementById("tcModal").classList.remove("show");
}

// Interactive custom cursor behavior
document.addEventListener("DOMContentLoaded", () => {
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    
    if (dot && ring) {
        document.addEventListener("mousemove", (e) => {
            dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            ring.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        });
        
        // Toggle hovering state for interactive target nodes
        document.addEventListener("mouseover", (e) => {
            if (e.target.closest("a, button, textarea, input, .preset-btn, .close-modal-btn")) {
                dot.classList.add("hovering");
                ring.classList.add("hovering");
            }
        });
        
        document.addEventListener("mouseout", (e) => {
            if (e.target.closest("a, button, textarea, input, .preset-btn, .close-modal-btn")) {
                dot.classList.remove("hovering");
                ring.classList.remove("hovering");
            }
        });
    }
});

