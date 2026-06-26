import google.generativeai as genai
from typing import Optional
import config
import logging

# Configure Logger for the Agent
logger = logging.getLogger("FinanceAgent")

class FinanceAgent:
    """
    Finance Agent specialized in analyzing M&A clauses for financial risks, 
    tax liabilities, escrow requirements, price adjustments, and debt obligations.
    """
    def __init__(self, api_key: Optional[str] = None, model_name: str = config.DEFAULT_MODEL) -> None:
        """
        Initializes the Finance Agent with Google Generative AI client config.
        """
        active_key = api_key or config.GEMINI_API_KEY
        if not active_key:
            raise ValueError("GEMINI_API_KEY is not defined. Set it in .env or pass it to constructor.")
        
        genai.configure(api_key=active_key)
        
        system_instruction = (
            "You are the Finance Agent. Your role is to analyze M&A clauses for financial risks, "
            "tax exposure, hidden costs, payment terms, debt obligations, escrow rules, and "
            "valuation impacts. Provide precise, quantified financial analysis. If a clause "
            "does not contain financial elements, report 'NOT FOUND'."
        )
        self.model = genai.GenerativeModel(model_name, system_instruction=system_instruction)

    async def analyze_async(self, clause: str) -> str:
        """
        Asynchronously analyze a clause for financial risk using Gemini's async engine.
        
        Args:
            clause: The raw string of the clause to be analyzed.
            
        Returns:
            The generated financial analysis response text.
        """
        if not clause.strip():
            logger.warning("Empty clause text received for financial analysis.")
            return "ERROR [FinanceAgent]: Received empty clause text."
            
        logger.info("Initiating financial analysis run...")
        try:
            response = await self.model.generate_content_async(clause)
            logger.info("Financial analysis completed successfully.")
            return response.text
        except Exception as e:
            logger.error(f"Failed to generate financial content: {e}", exc_info=True)
            return f"ERROR [FinanceAgent]: Failed to analyze clause. Detail: {str(e)}"
