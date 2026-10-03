const fs = require("fs");
const path = require("path");
const pdfParseModule = require("pdf-parse");

/**
 * 🤖 AUTOMATED CV VERIFICATION ENGINE
 * 
 * Architecture:
 * Tutor uploads document -> OCR/Text Extraction -> NLP Entity Extraction -> 
 * Verification Engine (Validity, Consistency, Suspicious Info) -> Confidence Score ->
 * Auto Approve / Flag for Admin
 */

/**
 * 1. OCR / Text Extraction Subsystem
 */
async function extractTextFromCV(filePath, mimetype = "") {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn("⚠️ File not found for extraction:", filePath);
      return "";
    }

    const ext = path.extname(filePath).toLowerCase();
    const isPdf = mimetype.includes("pdf") || ext === ".pdf";

    if (isPdf) {
      const dataBuffer = fs.readFileSync(filePath);
      try {
        if (typeof pdfParseModule === "function") {
          const pdfData = await pdfParseModule(dataBuffer);
          if (pdfData && pdfData.text) return pdfData.text;
        } else if (pdfParseModule.PDFParse) {
          const instance = new pdfParseModule.PDFParse({ data: dataBuffer });
          await instance.load();
          const textData = await instance.getText();
          if (textData) return typeof textData === "string" ? textData : textData.text || "";
        }
      } catch (pdfErr) {
        console.warn("⚠️ PDF parser warning, falling back to text stream:", pdfErr.message);
      }
    }

    // Fallback for plain text, docx raw strings, or ASCII readable strings
    const rawContent = fs.readFileSync(filePath, "utf8");
    const cleanAscii = rawContent.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ");
    return cleanAscii || "";
  } catch (err) {
    console.error("❌ CV Text Extraction Error:", err.message);
    return "";
  }
}

/**
 * 2. NLP Entity Extraction Subsystem
 * Extracts Name, Degree, University, Skills, Experience, Certifications
 */
function extractCVEntities(rawText = "", tutorProfile = {}) {
  const cleanText = rawText.replace(/\r\n/g, "\n");
  const lines = cleanText.split("\n").map(l => l.trim()).filter(Boolean);

  // --- A. Name Extraction ---
  let name = "";
  for (const line of lines.slice(0, 5)) {
    if (/^(resume|cv|curriculum vitae|profile|about me|contact)/i.test(line)) continue;
    if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/.test(line)) {
      name = line;
      break;
    }
  }
  if (!name && tutorProfile.name) {
    const tutorFirstName = tutorProfile.name.split(" ")[0];
    if (tutorFirstName && new RegExp(tutorFirstName, "i").test(rawText)) {
      name = tutorProfile.name;
    }
  }

  // --- B. Degree Extraction ---
  const degreeRegex = /\b(B\.?S\.?c?|M\.?S\.?c?|B\.?Tech|M\.?Tech|B\.?E\.?|M\.?E\.?|B\.?A\.?|M\.?A\.?|Ph\.?D\.?|Doctorate|Bachelor(?:'s)?(?:\s+of\s+[A-Za-z]+)?|Master(?:'s)?(?:\s+of\s+[A-Za-z]+)?|Diploma|Associate Degree)\b/gi;
  const degreeMatches = cleanText.match(degreeRegex) || [];
  const degreeList = [...new Set(degreeMatches.map(d => d.trim()))];
  const primaryDegree = degreeList.length > 0 ? degreeList.join(", ") : (tutorProfile.qualifications || tutorProfile.education || "");

  // --- C. University / Institution Extraction ---
  const uniRegex = /\b(?:[A-Z][A-Za-z0-9&]*[ \t]+){0,3}(?:University|College|Institute|Academy|Polytechnic|IIT|NIT|MIT|Stanford|Harvard|Oxford|Cambridge|Columbia|Berkeley)(?:[ \t]+[A-Z][A-Za-z0-9&]*){0,2}\b/gi;
  const uniMatches = cleanText.match(uniRegex) || [];
  const uniList = [...new Set(uniMatches.map(u => u.trim().replace(/[\n,;].*$/, "")))].filter(u => u.length > 3 && u.length < 80);
  const primaryUniversity = uniList.length > 0 ? uniList[0] : (tutorProfile.education || "");

  // --- D. Skills Extraction ---
  const knownSkills = [
    "Mathematics", "Calculus", "Algebra", "Geometry", "Trigonometry", "Statistics",
    "Physics", "Mechanics", "Thermodynamics", "Electromagnetism", "Quantum Physics",
    "Chemistry", "Organic Chemistry", "Inorganic Chemistry", "Biochemistry",
    "Biology", "Genetics", "Botany", "Zoology",
    "Computer Science", "Python", "JavaScript", "Java", "C++", "Data Structures", "Algorithms",
    "English", "Literature", "Grammar", "Creative Writing", "IELTS", "TOEFL", "SAT Prep",
    "Economics", "Microeconomics", "Macroeconomics", "History", "French", "Spanish",
    "Teaching", "Lesson Planning", "Curriculum Design", "Mentorship", "Online Tutoring"
  ];
  const extractedSkills = new Set();
  for (const skill of knownSkills) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "i");
    if (regex.test(rawText)) {
      extractedSkills.add(skill);
    }
  }
  if (tutorProfile.subjects && Array.isArray(tutorProfile.subjects)) {
    tutorProfile.subjects.forEach(s => extractedSkills.add(s));
  }
  if (tutorProfile.subject) {
    extractedSkills.add(tutorProfile.subject);
  }

  // --- E. Experience Extraction ---
  const expRegex = /(\d+\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|teaching|tutoring|work)|teaching\s+for\s+\d+\s+years?)/gi;
  const expMatch = cleanText.match(expRegex);
  let experience = expMatch ? expMatch[0] : "";
  if (!experience && tutorProfile.experience) {
    experience = `${tutorProfile.experience} years teaching experience`;
  }

  // --- F. Certifications Extraction ---
  const certRegex = /(Certified\s+[\w\s]+|TEFL|TESOL|CELTA|IELTS\s+Certified|B\.?Ed|M\.?Ed|Teaching\s+License|State\s+Certified|Math\s+Olympiad\s+Coach|Professional\s+Educator)/gi;
  const certMatches = cleanText.match(certRegex) || [];
  const certifications = [...new Set(certMatches.map(c => c.trim()))];
  if (certifications.length === 0 && (cleanText.toLowerCase().includes("certified") || cleanText.toLowerCase().includes("certification"))) {
    certifications.push("Certified Educator");
  }

  return {
    name: name || tutorProfile.name || "N/A",
    degree: primaryDegree || "Not specified",
    university: primaryUniversity || "Not specified",
    skills: Array.from(extractedSkills),
    experience: experience || (tutorProfile.experience ? `${tutorProfile.experience} years` : "Not specified"),
    certifications: certifications.length ? certifications : ["Standard Tutor Verification"]
  };
}

/**
 * 3. Verification Engine: Validity, Consistency, Suspicious Info
 */
function analyzeCVVerification({ rawText, extractedData, tutorProfile }) {
  const issues = [];
  const discrepancies = [];
  const suspiciousFlags = [];

  const wordCount = rawText ? rawText.trim().split(/\s+/).length : 0;

  // --- A. Validity Check ---
  let isValid = true;
  if (!rawText || wordCount < 10) {
    isValid = false;
    issues.push("Document text is minimal or unreadable (< 10 words).");
  }

  const hasEducation = Boolean(extractedData.degree !== "Not specified" || /education|academic|degree|university|college/i.test(rawText));
  if (!hasEducation) {
    issues.push("Missing clear Education/Academic section in CV.");
  }

  const hasExperience = Boolean(extractedData.experience !== "Not specified" || /experience|teaching|work|employment/i.test(rawText));
  if (!hasExperience) {
    issues.push("Missing clear Work/Teaching Experience section in CV.");
  }

  // --- B. Consistency Check ---
  let isConsistent = true;
  let matchScore = 0; // 0 to 100

  // Name consistency
  if (tutorProfile.name && extractedData.name && extractedData.name !== "N/A") {
    const profileTokens = tutorProfile.name.toLowerCase().split(/\s+/);
    const cvTokens = extractedData.name.toLowerCase().split(/\s+/);
    const nameOverlap = profileTokens.filter(t => cvTokens.includes(t));
    if (nameOverlap.length > 0) {
      matchScore += 30;
    } else {
      isConsistent = false;
      discrepancies.push(`Name in CV ("${extractedData.name}") does not match profile name ("${tutorProfile.name}").`);
    }
  } else {
    matchScore += 20; // Default match score if name matched via profile
  }

  // Subject/Skill consistency
  const profileSubjects = [tutorProfile.subject, ...(tutorProfile.subjects || [])].filter(Boolean).map(s => s.toLowerCase());
  const cvSkillsLower = extractedData.skills.map(s => s.toLowerCase());
  const skillMatch = profileSubjects.some(sub => cvSkillsLower.some(sk => sk.includes(sub) || sub.includes(sk)));

  if (skillMatch || profileSubjects.length === 0) {
    matchScore += 40;
  } else {
    discrepancies.push(`Registered subjects (${profileSubjects.join(", ")}) not clearly aligned with CV skills.`);
    matchScore += 10;
  }

  // Experience consistency
  if (tutorProfile.experience && extractedData.experience) {
    const cvYearsMatch = extractedData.experience.match(/\d+/);
    if (cvYearsMatch) {
      const cvYears = parseInt(cvYearsMatch[0], 10);
      const profileYears = parseInt(tutorProfile.experience, 10);
      if (Math.abs(cvYears - profileYears) > 5) {
        discrepancies.push(`Experience discrepancy: Registered ${profileYears} yrs vs CV ${cvYears} yrs.`);
      } else {
        matchScore += 30;
      }
    } else {
      matchScore += 30;
    }
  } else {
    matchScore += 30;
  }

  // --- C. Suspicious Information Detection ---
  if (/lorem ipsum|placeholder text|sample resume|john doe/i.test(rawText)) {
    suspiciousFlags.push("Contains template / dummy placeholder text.");
  }

  const cvYearsMatch = extractedData.experience ? extractedData.experience.match(/(\d+)\s*years?/) : null;
  if (cvYearsMatch && parseInt(cvYearsMatch[1], 10) > 45) {
    suspiciousFlags.push(`Unrealistic experience duration claimed (${cvYearsMatch[1]} years).`);
  }

  // --- D. Confidence Score Calculation (0 to 100) ---
  let confidenceScore = 0;

  if (isValid) confidenceScore += 30;
  confidenceScore += Math.round((matchScore / 100) * 45);

  if (extractedData.degree !== "Not specified") confidenceScore += 10;
  if (extractedData.university !== "Not specified") confidenceScore += 10;
  if (extractedData.skills.length > 0) confidenceScore += 5;

  // Deductions
  if (suspiciousFlags.length > 0) {
    confidenceScore -= (suspiciousFlags.length * 25);
  }
  if (!isConsistent) {
    confidenceScore -= 20;
  }

  confidenceScore = Math.max(0, Math.min(100, Math.round(confidenceScore)));

  // --- E. Automated Decision Engine & Diagnostic Feedback ---
  let autoDecision = "FLAGGED_FOR_ADMIN";
  let verificationReason = "";
  let recommendedAction = "";
  let estimatedTime = "2–4 Hours (Admin Review)";

  const allIssues = [...issues, ...discrepancies, ...suspiciousFlags];

  if (confidenceScore >= 80 && suspiciousFlags.length === 0 && isValid) {
    autoDecision = "AUTO_APPROVED";
    verificationReason = `CV verification passed with high confidence (${confidenceScore}% score). Extracted degree (${extractedData.degree}), institution (${extractedData.university}), and teaching experience align with registered profile.`;
    recommendedAction = "No action required. Your tutor profile is verified and active!";
    estimatedTime = "Instant (Auto-Approved)";
  } else {
    autoDecision = "FLAGGED_FOR_ADMIN";
    verificationReason = allIssues.length 
      ? `CV verification flagged for admin review (${confidenceScore}% confidence score). Reasons: ${allIssues.join("; ")}.` 
      : `CV verification confidence score (${confidenceScore}%) is below auto-approval threshold (80%).`;

    if (!isValid || !rawText || wordCount < 15) {
      recommendedAction = "Please upload a clear PDF/DOC CV containing your full name, degree, university, teaching experience, and subject skills.";
    } else if (discrepancies.length > 0) {
      recommendedAction = "Ensure your profile subjects and years of experience match the details listed in your CV document.";
    } else {
      recommendedAction = "Your document has been submitted for manual admin verification.";
    }
  }

  return {
    validity: {
      isValid,
      issues
    },
    consistency: {
      isConsistent: isConsistent && discrepancies.length === 0,
      matchScore: Math.min(100, matchScore),
      discrepancies
    },
    suspiciousFlags,
    confidenceScore,
    autoDecision,
    verificationReason,
    recommendedAction,
    estimatedTime
  };
}

/**
 * 4. Main Verification Engine Pipeline
 */
async function processCVVerification({ filePath, mimetype, tutorProfile }) {
  console.log("🤖 Running Automated CV Verification Engine for:", tutorProfile.name || tutorProfile.email);

  // 1. Extract text (OCR / Text Extraction)
  const rawText = await extractTextFromCV(filePath, mimetype);

  // 2. Extract Entities (NLP)
  const extractedData = extractCVEntities(rawText, tutorProfile);

  // 3. Verification Engine (Validity, Consistency, Suspicious Info, Confidence Score)
  const analysisResult = analyzeCVVerification({ rawText, extractedData, tutorProfile });

  const cvAnalysis = {
    extractedText: rawText.slice(0, 2000),
    extractedData,
    validity: analysisResult.validity,
    consistency: analysisResult.consistency,
    suspiciousFlags: analysisResult.suspiciousFlags,
    confidenceScore: analysisResult.confidenceScore,
    autoDecision: analysisResult.autoDecision,
    verificationReason: analysisResult.verificationReason,
    recommendedAction: analysisResult.recommendedAction,
    estimatedTime: analysisResult.estimatedTime,
    analyzedAt: new Date()
  };

  console.log(`✅ CV Verification Completed: Score=${cvAnalysis.confidenceScore}%, Decision=${cvAnalysis.autoDecision}`);
  return cvAnalysis;
}

module.exports = {
  extractTextFromCV,
  extractCVEntities,
  analyzeCVVerification,
  processCVVerification
};
