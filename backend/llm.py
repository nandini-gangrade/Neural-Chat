import os
import httpx
import strings
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

# Load environment variables from .env
load_dotenv()


def llm_call(user_prompt: str) -> str:
    """
    Call the LLM with a user prompt and return the response string.
    Uses Azure OpenAI (or any OpenAI-compatible endpoint) configured via .env
    """
    base_url = os.getenv("API_ENDPOINT")
    api_key = os.getenv("API_KEY")
    model = os.getenv("LLM_MODEL")
    verify_ssl = os.getenv("VERIFY_SSL", "true").lower() != "false"

    # Allow disabling SSL verification for corporate proxies / self-signed certs
    http_client = httpx.Client(verify=verify_ssl)

    llm = ChatOpenAI(
        base_url=base_url,
        model=model,
        api_key=api_key,
        http_client=http_client
    )

    system_msg = SystemMessage(content=strings.LLM_SYSTEM_PROMPT)
    user_msg = HumanMessage(content=user_prompt)

    try:
        response = llm.invoke([system_msg, user_msg])
        return response.content
    except Exception as e:
        print(f"[LLM ERROR] Call failed: {e}")
        return f"LLM call failed for model '{model}': {str(e)}"


if __name__ == "__main__":
    user_prompt = "What are the major topics required for knowledge on developing AI Agents?"
    print(llm_call(user_prompt))
