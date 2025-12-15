import { GoogleGenAI } from "@google/genai";
import { PDFParse } from 'pdf-parse';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js'; // Import Job model to look up description

const cleanJSON = (text) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const analyzeResume = async (req, res) => {
  try {
    // Check for buffer, not path
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: "No resume file uploaded" });
    }
    
    // We expect the Client to send 'jobId' along with the file
    const { jobId } = req.body;
    const { userId } = req.auth;
    if (!jobId) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    // 2. Fetch the Job Description from DB
    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) {
      return res.status(404).json({ error: "Job not found or unauthorized" });
    }

    // Initialize AI
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 3. Parse PDF from RAM (Buffer)
    let resumeText = "";
    
    // Initialize Parser with Buffer
    const parser = new PDFParse({ data: req.file.buffer }); // <--- 'data' param is required
    
    try {
      const pdfResult = await parser.getText();
      resumeText = pdfResult.text;
    } finally {
      // Clean up memory immediately
      await parser.destroy(); 
    }

    if (!resumeText) return res.status(400).json({ error: "Could not extract text from PDF" });

    // 4. AI Analysis (Using the DB's Job Description)
    const prompt = `
      You are an expert ATS. Analyze the following Resume against the provided Job Description.
      
      JOB TITLE: ${job.title}
      JOB DESCRIPTION:
      "${job.description}"
      
      RESUME TEXT:
      "${resumeText.substring(0, 8000)}" 
      
      CRITICAL INSTRUCTION:
      1. Tiers: Use ONLY "S", "A", "B", or "F".
      2. Skills: Identify the top 4 most important skills FROM THE JOB DESCRIPTION. 
         Score the candidate on those specific skills (0-100).
         Example for Sales: { "Negotiation": 90, "Communication": 85, "CRM": 60, "Closing": 70 }
         Example for Dev: { "React": 90, "Node.js": 80, "System Design": 50, "Testing": 70 }
      
      Return PURE JSON object (no markdown):
      {
        "name": "Candidate Name",
        "email": "candidate@email.com",
        "aiScore": 85,
        "tier": "S", 
        "summary": "Summary of fit based on the JD.",
        "keySkills": { "Skill1": 0, "Skill2": 0, "Skill3": 0, "Skill4": 0 },
        "badges": ["badge1", "badge2"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const textOutput = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textOutput) throw new Error("AI returned empty response");

    const jsonString = cleanJSON(textOutput);
    const candidateData = JSON.parse(jsonString);

    // 5. Save to DB (Linked to Job)
    const newCandidate = new Candidate({
      ...candidateData,
      jobId: job._id, // Link the candidate to this specific job
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
    
    // Security: Validate ownership
    const job = await Job.findOne({ _id: jobId, userId: req.auth.userId });
    if (!job) return res.status(404).json({ error: "Unauthorized" });

    const candidate = await Candidate.findById(candidateId);
    
    // Initialize AI
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // The "Copywriter" Prompt
    const prompt = `
      You are an expert technical recruiter. Write a short, exciting interview invitation email.
      
      CANDIDATE: ${candidate.name}
      ROLE: ${job.title}
      KEY STRENGTH: ${candidate.summary}
      
      Output strictly JSON:
      {
        "subject": "Email Subject Line",
        "body": "Email Body Text (Plain text, no HTML, keep it casual but professional)"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const textOutput = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    const emailDraft = JSON.parse(textOutput.replace(/```json/g, '').replace(/```/g, '').trim());

    res.status(200).json(emailDraft);

  } catch (error) {
    console.error("Email Gen Error:", error);
    res.status(500).json({ error: "Failed to generate email" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    // 1. Accept 'emailBody' from the request
    const { candidateId, status, emailBody } = req.body; 
    const { userId } = req.auth;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    const job = await Job.findOne({ _id: candidate.jobId, userId });
    if (!job) return res.status(403).json({ error: "Unauthorized" });

    // 2. Update Status AND Email Body (if provided)
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

    // 1. Find Candidate
    const candidate = await Candidate.findById(id);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    // 2. Security Check: Ensure User owns the Job this candidate belongs to
    const job = await Job.findOne({ _id: candidate.jobId, userId });
    if (!job) return res.status(403).json({ error: "Unauthorized access to this candidate" });

    // 3. Destroy
    await candidate.deleteOne();

    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete candidate" });
  }
};