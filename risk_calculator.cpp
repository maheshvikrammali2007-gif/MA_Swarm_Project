#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

// Simple C++ Risk Calculator for M&A Due Diligence Clauses
double calculateRisk(const std::string& clauseText) {
    double baseRisk = 0.1;
    
    // Convert to lowercase
    std::string lowerText = clauseText;
    std::transform(lowerText.begin(), lowerText.end(), lowerText.begin(), ::tolower);
    
    // Risk keywords and weightings
    if (lowerText.find("undisclosed") != std::string::npos) baseRisk += 0.3;
    if (lowerText.find("liability") != std::string::npos) baseRisk += 0.2;
    if (lowerText.find("tax") != std::string::npos) baseRisk += 0.15;
    if (lowerText.find("indemnify") != std::string::npos) baseRisk += 0.2;
    if (lowerText.find("ftc") != std::string::npos || lowerText.find("antitrust") != std::string::npos) baseRisk += 0.25;
    if (lowerText.find("unlimited") != std::string::npos) baseRisk += 0.4;
    
    return std::min(baseRisk, 1.0);
}

int main() {
    std::string testClause = "The acquiring company shall absorb all undisclosed historical tax liabilities up to $50M.";
    double riskScore = calculateRisk(testClause);
    std::cout << "--- AMDS C++ Cognitive Risk Engine ---" << std::endl;
    std::cout << "Input Clause: " << testClause << std::endl;
    std::cout << "Calculated Risk Score: " << riskScore << std::endl;
    return 0;
}
