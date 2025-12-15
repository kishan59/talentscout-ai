import { GoogleGenAI } from "@google/genai";
import { PDFParse } from 'pdf-parse';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js'; 

// Utility to clean AI output (Gemma can be chatty)
const cleanAIResponse = (text) => {
  // 1. Remove markdown code blocks if present
  let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
  
  // 2. Find the first '{' and the last '}' to isolate the JSON object
  const firstOpen = clean.indexOf('{');
  const lastClose = clean.lastIndexOf('}');
  
  if (firstOpen !== -1 && lastClose !== -1) {
    clean = clean.substring(firstOpen, lastClose + 1);
  }
  
  return clean;
};

export const analyzeResume = async (req, res) => {
  try {
    // Check for buffer
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: "No resume file uploaded" });
    }
    
    const { jobId } = req.body;
    const { userId } = req.auth;
    if (!jobId) return res.status(400).json({ error: "Job ID is required" });

    // 2. Fetch Job Description
    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) return res.status(404).json({ error: "Job not found or unauthorized" });

    // Initialize AI
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 3. Parse PDF from RAM
    let resumeText = "";
    const parser = new PDFParse({ data: req.file.buffer }); 
    
    try {
      const pdfResult = await parser.getText();
      resumeText = pdfResult.text;
    } finally {
      await parser.destroy(); 
    }

    if (!resumeText) return res.status(400).json({ error: "Could not extract text from PDF" });

    // 4. AI Analysis (Gemma 3 Edition)
    // Kept your exact logic for Tiers and Skills, added strict JSON enforcement for Gemma
    const prompt = `
      You are an expert ATS. Analyze the following Resume against the provided Job Description.
      
      CRITICAL INSTRUCTION:
      Output ONLY a raw JSON object. Do not output markdown, explanations, or "Here is the JSON".
      
      JOB TITLE: ${job.title}
      JOB DESCRIPTION: "${job.description.substring(0, 2000)}"
      
      RESUME TEXT: "${resumeText.substring(0, 6000)}" 
      
      ANALYSIS RULES:
      1. Tiers: Use ONLY "S", "A", "B", or "F".
      2. Skills: Identify the top 4 most important skills FROM THE JOB DESCRIPTION. 
         Score the candidate on those specific skills (0-100).
      
      REQUIRED JSON STRUCTURE:
      {
        "name": "Candidate Name",
        "email": "candidate@email.com",
        "aiScore": 85,
        "tier": "S", 
        "summary": "1-2 sentence summary of fit.",
        "keySkills": { "React": 90, "Node.js": 80, "AWS": 50, "Testing": 70 },
        "badges": ["badge1", "badge2"]
      }
    `;

    const response = await ai.models.generateContent({
      // 🚀 SWITCHED TO GEMMA 3 (14.4k Daily Requests)
      model: 'gemma-3-27b-it', 
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const textOutput = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) throw new Error("AI returned empty response");

    // Robust Cleaning for Gemma
    const jsonString = cleanAIResponse(textOutput);
    const candidateData = JSON.parse(jsonString);

    // 5. Save to DB
    const newCandidate = new Candidate({
      ...candidateData,
      jobId: job._id, 
      originalResumeText: resumeText
    });
    
    await newCandidate.save();
    
    res.status(201).json({ message: "Analysis Complete", candidate: newCandidate });

  } catch (error) {
    console.error("❌ Error processing resume:", error);
    res.status(500).json({ error: "Failed to process resume", details: error.message });
  }
};

export const generateEmail = async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;
    
    const job = await Job.findOne({ _id: jobId, userId: req.auth.userId });
    if (!job) return res.status(404).json({ error: "Unauthorized" });

    const candidate = await Candidate.findById(candidateId);
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Gemma Email Prompt
    const prompt = `
      You are an expert technical recruiter. Write a short, exciting interview invitation email.
      Output strictly raw JSON.
      
      CANDIDATE: ${candidate.name}
      ROLE: ${job.title}
      KEY STRENGTH: ${candidate.summary}
      
      JSON Structure:
      {
        "subject": "Email Subject Line",
        "body": "Email Body Text (Plain text, no HTML)"
      }
    `;

    const response = await ai.models.generateContent({
      // 🚀 SWITCHED TO GEMMA 3
      model: 'gemma-3-27b-it',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const textOutput = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    const jsonString = cleanAIResponse(textOutput);
    const emailDraft = JSON.parse(jsonString);

    res.status(200).json(emailDraft);

  } catch (error) {
    console.error("Email Gen Error:", error);
    res.status(500).json({ error: "Failed to generate email" });
  }
};

// --- NO CHANGES BELOW THIS LINE (Kept your logic exactly as is) ---

export const updateStatus = async (req, res) => {
  try {
    const { candidateId, status, emailBody } = req.body; 
    const { userId } = req.auth;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    const job = await Job.findOne({ _id: candidate.jobId, userId });
    if (!job) return res.status(403).json({ error: "Unauthorized" });

    candidate.status = status;
    if (emailBody) {
        candidate.emailBody = emailBody;
    }

    await candidate.save();

    res.status(200).json({ message: "Status updated", candidate });
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.auth;

    const candidate = await Candidate.findById(id);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    const job = await Job.findOne({ _id: candidate.jobId, userId });
    if (!job) return res.status(403).json({ error: "Unauthorized access to this candidate" });

    await candidate.deleteOne();

    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete candidate" });
  }
};