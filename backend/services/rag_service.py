import os
import json
from openai import OpenAI
from sqlalchemy.orm import Session
from models import DigitalTwin, DriftDetection, BaselineControl, RiskAnalysis, Recommendation, ChangeRequest

# Simple in-memory RAG document store for prototyping.
# In a real scenario, you would use ChromaDB, FAISS, or pgvector.
_document_store = []

def build_context_for_twin(twin_id: int, db: Session):
    """
    Extracts all relevant information for a given Digital Twin and stores it as documents.
    """
    global _document_store
    _document_store = [] # Clear previous context for simplicity in this prototype
    
    twin = db.query(DigitalTwin).filter(DigitalTwin.twin_id == twin_id).first()
    if not twin:
        return
    
    # Add Risk Analysis
    risk = db.query(RiskAnalysis).filter(RiskAnalysis.twin_id == twin_id).order_by(RiskAnalysis.created_at.desc()).first()
    if risk:
        _document_store.append({
            "type": "risk_report",
            "content": f"The current Risk Score for this twin is {risk.final_risk_score} (Level: {risk.risk_level}). "
                       f"Attack surface score is {risk.attack_surface} and Compliance score is {risk.compliance_score}."
        })
        
    # Add Drifts
    drifts = db.query(DriftDetection).filter(DriftDetection.twin_id == twin_id).all()
    if drifts:
        for drift in drifts:
            control = db.query(BaselineControl).filter(BaselineControl.control_id == drift.control_id).first()
            if control:
                _document_store.append({
                    "type": "drift",
                    "content": f"Configuration drift detected in {control.domain} -> {control.control_name}. "
                               f"The drift type is {drift.drift_type} with a {drift.severity} severity."
                })
    else:
        _document_store.append({
            "type": "drift",
            "content": "No configuration drift currently detected. The twin is compliant with its baseline."
        })
        
    # Add Recommendations
    rec = db.query(Recommendation).filter(Recommendation.twin_id == twin_id).order_by(Recommendation.created_at.desc()).first()
    if rec:
        _document_store.append({
            "type": "recommendation",
            "content": f"Latest recommendation: {rec.recommendation}."
        })

def retrieve_relevant_context(question: str) -> str:
    """
    Retrieves the most relevant documents for the question.
    (Mock implementation: currently returns all documents for the twin).
    """
    # For a true RAG, we would calculate embeddings for `question` and `_document_store`, 
    # then perform cosine similarity. Since our context per twin is small, we inject it all.
    context = ""
    for doc in _document_store:
        context += f"- {doc['content']}\n"
    return context

# Use Local Mistral Model
LOCAL_MODEL_PATH = r"C:\Users\GOPAL\.cache\huggingface\hub\models--mistralai--Mistral-7B-Instruct-v0.2\snapshots\63a8b081895390a26e140280378bc85ec8bce07a"
_local_tokenizer = None
_local_model = None

def _get_local_pipeline():
    global _local_tokenizer, _local_model
    if _local_tokenizer is None or _local_model is None:
        from transformers import AutoTokenizer, AutoModelForCausalLM
        import torch
        _local_tokenizer = AutoTokenizer.from_pretrained(LOCAL_MODEL_PATH)
        _local_model = AutoModelForCausalLM.from_pretrained(
            LOCAL_MODEL_PATH,
            device_map="auto",
            dtype=torch.float16
        )
    return _local_tokenizer, _local_model

def generate_rag_response(question: str, twin_id: int, db: Session) -> str:
    """
    Generates a response using an LLM augmented with context from the database.
    Supports OpenAI, Hugging Face, or a Local Mock fallback.
    """
    build_context_for_twin(twin_id, db)
    context = retrieve_relevant_context(question)
    
    prompt = (
        "You are the SecureTwin AI Security Copilot. Answer the user's question using ONLY the provided context.\n"
        "If you cannot answer the question using the context, say you don't know.\n\n"
        f"Context:\n{context}\n\n"
        f"User Question: {question}"
    )
    
    try:
        tokenizer, model = _get_local_pipeline()
        
        messages = [
            {"role": "user", "content": prompt}
        ]
        inputs = tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt",
        ).to(model.device)

        outputs = model.generate(**inputs, max_new_tokens=200)
        return tokenizer.decode(outputs[0][inputs["input_ids"].shape[-1]:], skip_special_tokens=True)

    except Exception as e:
        return f"Local Model Error: {str(e)}"
