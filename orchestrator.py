import asyncio
import logging
import google.generativeai as genai
from typing import Optional
import config
from legal_agent import LegalAgent
from finance_agent import FinanceAgent

# Configure central logging to print cleanly to the console
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(name)s] - %(levelname)s - %(message)s"
)
logger = logging.getLogger("Orchestrator")

class MASwarmOrchestrator:
    """
    Master brain that orchestrates the M&A Agent Swarm pipeline (AMDS).
    Executes sub-agents in parallel and aggregates findings.
    """
    def __init__(self, api_key: Optional[str] = None, model_name: str = config.DEFAULT_MODEL) -> None:
        """
        Initializes the Orchestrator with Legal and Finance sub-agents.
        """
        active_key = api_key or config.GEMINI_API_KEY
        if not active_key:
            raise ValueError("GEMINI_API_KEY is not defined. Please set it in the environment.")
            
        self.api_key = active_key
        logger.info("Initializing Legal and Finance agents in the swarm...")
        self.legal_agent = LegalAgent(api_key=self.api_key, model_name=model_name)
        self.finance_agent = FinanceAgent(api_key=self.api_key, model_name=model_name)
        
        system_instruction = (
            "You are the Lead M&A Architect. Your goal is to coordinate a swarm of specialized agents (Legal, Finance, Research) "
            "to analyze M&A documents.\n\n"
            "Your workflow must always follow these steps:\n"
            "1. INGEST: Deconstruct the legal clause into atomic components.\n"
            "2. DISPATCH: Delegate sub-tasks to the specific agent required (Legal, Finance, or Researcher).\n"
            "3. SYNTHESIZE: Combine the outputs into a coherent, executive-level report.\n"
            "4. CRITIQUE: Add a 'Red Flag' summary at the bottom, highlighting the 3 highest risks.\n\n"
            "Maintain a professional, ruthless, and analytical tone. Never hallucinate—if data is missing, report 'NOT FOUND'."
        )
        self.architect_model = genai.GenerativeModel(model_name, system_instruction=system_instruction)
        logger.info("Swarm orchestrator initialized successfully.")

    async def analyze_clause_swarm_async(self, clause: str) -> str:
        """
        Orchestrates parallel sub-agent calls, clause ingestion, and executive synthesis.
        
        Args:
            clause: The raw contract clause to analyze.
            
        Returns:
            The final synthesized report markdown.
        """
        if not clause.strip():
            logger.warning("Empty clause passed to Orchestrator.")
            return "ERROR [Orchestrator]: Received empty clause."
            
        logger.info("Step 1: INGEST - Deconstructing clause into components...")
        deconstruct_prompt = f"Deconstruct the following legal clause into atomic components for analysis: '{clause}'"
        
        try:
            deconstruct_response = await self.architect_model.generate_content_async(deconstruct_prompt)
            print("\n--- [1. INGESTED COMPONENTS] ---")
            print(deconstruct_response.text)
            print("-" * 35)
        except Exception as e:
            logger.error(f"Error during deconstruction phase: {e}")
            return f"ERROR [Orchestrator]: Failed in ingestion phase. Details: {e}"

        logger.info("Step 2: DISPATCH - Initiating parallel sub-agent queries...")
        
        # Async execution of sub-agents in parallel
        legal_task = self.legal_agent.analyze_async(clause)
        finance_task = self.finance_agent.analyze_async(clause)
        
        # Await both tasks concurrently
        legal_report, finance_report = await asyncio.gather(legal_task, finance_task)
        
        print("\n--- [2. DISPATCHED AGENT FEEDBACK] ---")
        print(f"[LEGAL AGENT OUTPUT]:\n{legal_report}\n")
        print(f"[FINANCE AGENT OUTPUT]:\n{finance_report}")
        print("-" * 35)

        logger.info("Step 3 & 4: SYNTHESIZE & CRITIQUE - Executing synthesis...")
        synthesis_prompt = f"""
        Combine these analyses for the original clause: "{clause}"
        
        Sub-Agent Inputs:
        - Legal Agent Analysis:
        {legal_report}
        
        - Finance Agent Analysis:
        {finance_report}
        
        Please synthesize this into a coherent executive report and critique with a 'Red Flag' summary of the 3 highest risks.
        """
        
        try:
            synthesis_response = await self.architect_model.generate_content_async(synthesis_prompt)
            logger.info("Swarm synthesis complete.")
            return synthesis_response.text
        except Exception as e:
            logger.error(f"Failed to generate final synthesized report: {e}")
            return f"ERROR [Orchestrator]: Failed in synthesis phase. Details: {e}"

async def main() -> None:
    # Load settings from config
    api_key = config.GEMINI_API_KEY
    if not api_key:
        logger.error("GEMINI_API_KEY is not defined. Ensure it is configured in the .env file.")
        return
        
    orchestrator = MASwarmOrchestrator(api_key=api_key)
    
    test_clause = (
        "The acquiring company shall absorb all undisclosed historical tax liabilities up to $50M, "
        "and Target Seller shall indemnify Buyer against any IP infringement claims for 3 years post-closing."
    )
    
    print("\nStarting Swarm Execution on sample clause...")
    report = await orchestrator.analyze_clause_swarm_async(test_clause)
    
    print("\n" + "="*30 + " FINAL REPORT " + "="*30)
    print(report)
    print("="*74)

if __name__ == "__main__":
    asyncio.run(main())
