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

async function runAnalysis() {
    const clause = document.getElementById("clauseInput").value.trim();
    if (!clause) {
        alert("Please enter or select a clause to analyze.");
        return;
    }

    const runBtn = document.getElementById("runBtn");
    const outputBox = document.getElementById("reportOutput");
    
    // Reset steps
    const steps = ['ingest', 'dispatch', 'synthesize'];
    steps.forEach(s => {
        const el = document.getElementById(`step-${s}`);
        el.classList.remove('active', 'completed');
    });
    
    document.getElementById("thread-legal").className = "thread";
    document.getElementById("thread-legal").querySelector(".thread-status").innerText = "Idle";
    document.getElementById("thread-finance").className = "thread";
    document.getElementById("thread-finance").querySelector(".thread-status").innerText = "Idle";
    
    // Start Ingest
    runBtn.disabled = true;
    runBtn.querySelector(".btn-text").innerText = "Swarm Analyzing...";
    outputBox.innerHTML = '<div class="empty-state"><p>Processing clause ingestion...</p></div>';
    
    document.getElementById("step-ingest").classList.add("active");
    
    // Wait 1.5 seconds for simulated ingestion deconstruction
    await new Promise(r => setTimeout(r, 1500));
    document.getElementById("step-ingest").classList.remove("active");
    document.getElementById("step-ingest").classList.add("completed");
    
    // Start Dispatching
    document.getElementById("step-dispatch").classList.add("active");
    const tLegal = document.getElementById("thread-legal");
    const tFinance = document.getElementById("thread-finance");
    
    tLegal.classList.add("running");
    tLegal.querySelector(".thread-status").innerText = "Analyzing...";
    tFinance.classList.add("running");
    tFinance.querySelector(".thread-status").innerText = "Analyzing...";
    
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
        
        // Parallel agents complete
        tLegal.classList.remove("running");
        tLegal.classList.add("completed");
        tLegal.querySelector(".thread-status").innerText = "Done";
        tFinance.classList.remove("running");
        tFinance.classList.add("completed");
        tFinance.querySelector(".thread-status").innerText = "Done";
        
        document.getElementById("step-dispatch").classList.remove("active");
        document.getElementById("step-dispatch").classList.add("completed");
        
        // Start Synthesis
        document.getElementById("step-synthesize").classList.add("active");
        outputBox.innerHTML = '<div class="empty-state"><p>Lead M&A Architect compiling reports and critique...</p></div>';
        
        await new Promise(r => setTimeout(r, 1500));
        
        document.getElementById("step-synthesize").classList.remove("active");
        document.getElementById("step-synthesize").classList.add("completed");
        
        // Render Report
        outputBox.innerHTML = formatMarkdown(result.report);
        
    } catch (error) {
        console.error(error);
        outputBox.innerHTML = `<div class="empty-state" style="color: #ff007f;"><p>❌ Error: ${error.message}</p></div>`;
        steps.forEach(s => document.getElementById(`step-${s}`).classList.remove('active'));
    } finally {
        runBtn.disabled = false;
        runBtn.querySelector(".btn-text").innerText = "Execute Swarm";
    }
}
