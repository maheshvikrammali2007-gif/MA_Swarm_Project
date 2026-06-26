// Advanced M&A Contract Risk Weighting Engine in Rust
fn main() {
    let test_clause = "The acquiring company shall absorb all undisclosed historical tax liabilities up to $50M.";
    let risk_score = calculate_risk(test_clause);
    
    println!("--- AMDS Rust Risk Analysis Daemon ---");
    println!("Target Clause: {}", test_clause);
    println!("Evaluated Risk Index: {:.2}", risk_score);
}

fn calculate_risk(clause: &str) -> f64 {
    let lower_clause = clause.to_lowercase();
    let mut risk_score = 0.10;

    if lower_clause.contains("undisclosed") {
        risk_score += 0.30;
    }
    if lower_clause.contains("liability") {
        risk_score += 0.20;
    }
    if lower_clause.contains("tax") {
        risk_score += 0.15;
    }
    if lower_clause.contains("indemnify") {
        risk_score += 0.25;
    }
    if lower_clause.contains("unlimited") {
        risk_score += 0.40;
    }

    if risk_score > 1.0 {
        1.0
    } else {
        risk_score
    }
}
