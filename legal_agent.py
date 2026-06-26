import google.generativeai as genai
from typing import Optional
import config
import logging

# Configure Logger for the Agent
logger = logging.getLogger("LegalAgent")

class LegalAgent:
    """
    Legal Agent specialized in analyzing M&A clauses for legal risks, 
    including liabilities, warranties, indemnification caps, and jurisdictions.
    """
    def __init__(self, api_key: Optional[str] = None, model_name: str = config.DEFAULT_MODEL) -> None:
        """
        Initializes the Legal Agent with Google Generative AI client config.
        """
        active_key = api_key or config.GEMINI_API_KEY
        if not active_key:
            raise ValueError("GEMINI_API_KEY is not defined. Set it in .env or pass it to constructor.")
        
        genai.configure(api_key=active_key)
        
        system_instruction = (
            "You are the Legal Agent. Your role is to analyze M&A clauses for legal risks, "
            "including liabilities, indemnification, jurisdiction, warranties, compliance, "
            "and dispute resolution. Provide direct, ruthless, and precise legal analysis. "
            "If a clause does not contain legal elements, report 'NOT FOUND'."
        )
        self.model = genai.GenerativeModel(model_name, system_instruction=system_instruction)

    async def analyze_async(self, clause: str) -> str:
        """
        Asynchronously analyze a clause for legal risk using Gemini's async engine.
        
        Args:
            clause: The raw string of the clause to be analyzed.
            
        Returns:
            The generated legal analysis response text.
        """
        if not clause.strip():
            logger.warning("Empty clause text received for legal analysis.")
            return "ERROR [LegalAgent]: Received empty clause text."
            
        logger.info("Initiating legal analysis run...")
        try:
            response = await self.model.generate_content_async(clause)
            logger.info("Legal analysis completed successfully.")
            return response.text
        except Exception as e:
            logger.error(f"Failed to generate legal content: {e}", exc_info=True)
            return f"ERROR [LegalAgent]: Failed to analyze clause. Detail: {str(e)}"
