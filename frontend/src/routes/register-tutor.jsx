import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Upload, ArrowRight, ArrowLeft, User, GraduationCap, BookOpen, DollarSign } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/register-tutor")({
  component: RegisterTutorPage,
});

const steps = [
  { icon: User, title: "Profile", desc: "Tell us about you" },
  { icon: GraduationCap, title: "Education", desc: "Your qualifications" },
  { icon: BookOpen, title: "Subjects", desc: "What you teach" },
  { icon: DollarSign, title: "Pricing", desc: "Set your rate" },
];

const allSubjects = ["Mathematics","Physics","Chemistry","Biology","English","Computer Science","Economics","History","French","Spanish","Music","Art","Calculus","Algebra","Python","JavaScript","SAT Prep","IELTS"];

function RegisterTutorPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    bio: "",
    qualifications: "",
    education: "",
    teachingMethodology: "",
    mainSubject: "",
    experience: "",
    hourlyRate: "",
    trialRate: "",
  });

  const [selectedSubjects, setSelectedSubjects] = useState(["Mathematics", "Calculus"]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const tutorData = localStorage.getItem("tutor");
    if (tutorData) {
      try {
        const tutor = JSON.parse(tutorData);
        const [firstName = "", ...rest] = (tutor.name || "").split(" ");
        const lastName = rest.join(" ");
        setForm((prev) => ({
          ...prev,
          firstName,
          lastName,
          email: tutor.email || tutor.email || "",
          phone: tutor.phone || "",
          city: tutor.locality || "",
          bio: tutor.bio || "",
          qualifications: tutor.qualifications || "",
          education: tutor.education || "",
          teachingMethodology: tutor.teachingMethodology || "",
          mainSubject: tutor.subject || "",
          experience: tutor.experience ? String(tutor.experience) : "",
          hourlyRate: tutor.hourlyRate ? String(tutor.hourlyRate) : "",
          trialRate: tutor.trialRate ? String(tutor.trialRate) : "",
        }));
        if (tutor.profilePhoto) {
          setPhotoPreview(tutor.profilePhoto);
        }
      } catch (err) {
        console.error("Failed to parse tutor data:", err);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleDocumentsChange = (e) => {
    const files = Array.from(e.target.files || []);
    setDocuments(files.slice(0, 5));
    setError("");
  };

  const toggleSubject = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((item) => item !== subject)
        : [...prev, subject]
    );
    setError("");
  };

  const validateStep = (currentStep) => {
    const nextErrors = [];

    if (currentStep === 0) {
      if (!form.firstName.trim()) nextErrors.push("First name is required");
      if (!form.lastName.trim()) nextErrors.push("Last name is required");
      if (!form.email.trim()) nextErrors.push("Email is required");
      if (!form.phone.trim()) nextErrors.push("Phone number is required");
      if (!form.city.trim()) nextErrors.push("City is required");
      if (!form.bio.trim()) nextErrors.push("Bio is required");
      if (!photoFile && !photoPreview) nextErrors.push("Profile photo is required");
    }

    if (currentStep === 1) {
      if (!form.qualifications.trim()) nextErrors.push("Qualifications are required");
      if (!form.education.trim()) nextErrors.push("Education details are required");
    }

    if (currentStep === 2) {
      if (!form.mainSubject.trim()) nextErrors.push("Primary subject is required");
      if (!form.experience.trim() || Number(form.experience) < 1) nextErrors.push("Experience is required");
      if (!selectedSubjects.length) nextErrors.push("Select at least one subject");
    }

    if (currentStep === 3) {
      if (!form.hourlyRate.trim() || Number(form.hourlyRate) <= 0) nextErrors.push("Hourly rate is required");
    }

    if (nextErrors.length) {
      setError(nextErrors.join(". "));
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setIsSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token missing. Please sign in again.");
      }

      const payload = new FormData();
      payload.append("firstName", form.firstName.trim());
      payload.append("lastName", form.lastName.trim());
      payload.append("phone", form.phone.trim());
      payload.append("city", form.city.trim());
      payload.append("bio", form.bio.trim());
      payload.append("qualifications", form.qualifications.trim());
      payload.append("education", form.education.trim());
      payload.append("teachingMethodology", form.teachingMethodology.trim());
      payload.append("mainSubject", form.mainSubject.trim());
      payload.append("experience", form.experience.trim());
      payload.append("hourlyRate", form.hourlyRate.trim());
      payload.append("trialRate", form.trialRate.trim());
      payload.append("subjects", JSON.stringify(selectedSubjects));

      if (photoFile) {
        payload.append("profilePhoto", photoFile);
      }
      documents.forEach((file) => payload.append("documents", file));

      const response = await fetch("http://localhost:5000/api/tutors/complete-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to complete profile");
      }

      setSuccess("Your tutor profile is submitted successfully. Redirecting to your dashboard...");
      localStorage.setItem("tutor", JSON.stringify({ ...(result.tutor || {}), profileComplete: true }));
      setTimeout(() => {
        navigate("/tutor-dashboard");
      }, 400);
    } catch (submitError) {
      console.error(submitError);
      setError(submitError.message || "Unable to complete registration.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 sm:p-10 shadow-[0_48px_100px_-56px_rgba(15,23,42,0.2)]">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">Become a Trifinity Tutor</h1>
              <p className="max-w-2xl text-sm text-slate-600">Share your knowledge, set your hours, earn on your terms.</p>
            </div>
            <div className="mt-6 flex items-center justify-center gap-3 sm:grid sm:grid-cols-4 sm:gap-4">
              {steps.map((item, index) => (
                <div key={item.title} className="flex items-center sm:flex-col sm:items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                    index === step ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-500"
                  }`}>
                    <item.icon className="h-5 w-5" />
                  </div>

                  {/* connector line between icons on small screens */}
                  {index < steps.length - 1 && (
                    <div className="block sm:hidden flex-1 h-px bg-slate-200 mx-2" />
                  )}

                  <div className="hidden sm:block text-center">
                    <div className={`text-sm font-semibold ${index === step ? "text-slate-900" : "text-slate-500"}`}>{item.title}</div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-border/60 p-6 sm:p-10">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Step {step + 1} of {steps.length}</p>
                  <h2 className="text-2xl font-semibold text-slate-900">{steps[step].title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{steps[step].desc}</p>
                </div>
                <div className="text-right text-sm text-slate-500 hidden md:block">{steps[step].title}</div>
              </div>

              <div className="grid gap-6">
                {step === 0 && (
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-[100px_minmax(0,1fr)] items-center">
                      <div className="space-y-3">
                        <div className="h-24 w-24 rounded-3xl overflow-hidden border border-slate-200 bg-slate-100">
                          {photoPreview ? (
                            <img src={photoPreview} alt="Profile preview" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full grid place-items-center text-slate-400">Photo</div>
                          )}
                        </div>
                        <label className="block rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition">
                          Browse photo
                          <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handlePhotoChange} />
                        </label>
                      </div>
                      <div className="space-y-2">
                        <p className="font-semibold text-slate-900">Profile photo</p>
                        <p className="text-sm text-slate-500">Add a professional photo so students can recognize you.</p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="First name" name="firstName" value={form.firstName} onChange={handleInputChange} />
                      <Field label="Last name" name="lastName" value={form.lastName} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Email address" name="email" type="email" value={form.email} onChange={handleInputChange} />
                      <Field label="Phone number" name="phone" value={form.phone} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="City" name="city" value={form.city} onChange={handleInputChange} />
                      <Field label="Primary subject" name="mainSubject" value={form.mainSubject} onChange={handleInputChange} placeholder="Mathematics" />
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleInputChange}
                        rows={5}
                        placeholder="Tell students what makes your teaching special."
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Qualifications" name="qualifications" value={form.qualifications} onChange={handleInputChange} placeholder="B.Sc, M.Ed, etc." />
                      <Field label="Education" name="education" value={form.education} onChange={handleInputChange} placeholder="University or certification" />
                    </div>
                    <div>
                      <Label>Teaching methodology</Label>
                      <Textarea
                        name="teachingMethodology"
                        value={form.teachingMethodology}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Describe your classroom style, lesson planning, and tools you use."
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Certificates & documents</Label>
                      <label className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-700 hover:border-slate-400 hover:bg-slate-100 cursor-pointer transition">
                        <span>{documents.length ? `${documents.length} file(s) selected` : "Upload PDF, DOC, PNG, JPG"}</span>
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-white text-xs">Browse</span>
                        <input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg" className="hidden" multiple onChange={handleDocumentsChange} />
                      </label>
                      {documents.length > 0 && (
                        <ul className="mt-3 space-y-2 text-sm text-slate-700">
                          {documents.map((file) => (
                            <li key={file.name + file.size} className="rounded-xl border border-slate-200 bg-white px-3 py-2">{file.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Years of experience" name="experience" value={form.experience} onChange={handleInputChange} type="number" placeholder="5" />
                      <Field label="Teaching city" name="city" value={form.city} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Subjects you teach</Label>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {allSubjects.map((subject) => {
                          const active = selectedSubjects.includes(subject);
                          return (
                            <button
                              key={subject}
                              type="button"
                              onClick={() => toggleSubject(subject)}
                              className={`rounded-full px-4 py-2 text-sm font-medium transition-all border ${
                                active ? "bg-blue-600 text-white border-transparent" : "bg-white text-slate-700 border-slate-300 hover:border-blue-400"
                              }`}
                            >
                              {subject}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-sm text-slate-500">Select the subjects you want students to find you by.</p>
                    </div>
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.16)]">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-slate-900">What students will see</h3>
                        <p className="text-sm text-slate-600">Your tutor card will show photo, subject, experience, and hourly pricing.</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200 p-4">
                            <p className="text-sm font-semibold text-slate-900">Profile image</p>
                            <p className="mt-2 text-sm text-slate-600">Professional photos help build trust.</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 p-4">
                            <p className="text-sm font-semibold text-slate-900">Certificates</p>
                            <p className="mt-2 text-sm text-slate-600">Upload transcripts and certificates for verification.</p>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4">
                          <p className="text-sm font-semibold text-slate-900">Selected subjects</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedSubjects.slice(0, 5).map((subject) => (
                              <span key={subject} className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.12em] text-slate-600">{subject}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Hourly rate (USD)" name="hourlyRate" value={form.hourlyRate} onChange={handleInputChange} type="number" placeholder="20" />
                        <Field label="Trial rate (optional)" name="trialRate" value={form.trialRate} onChange={handleInputChange} type="number" placeholder="10" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Set your hourly and trial session rates. Students will see hourly pricing on your tutor card.</p>
                      </div>
                    </div>
                  )}
              </div>

              {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              {success && <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="ghost" disabled={step === 0 || isSaving} onClick={() => setStep((prev) => Math.max(prev - 1, 0))}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <div className="flex items-center gap-3">
                  {step < steps.length - 1 ? (
                    <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleNextStep} disabled={isSaving}>
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleSubmit} disabled={isSaving}>
                      {isSaving ? "Submitting..." : "Submit and complete registration"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Bottom 'What students will see' panel removed per request */}
        </div>
      </div>
    </SiteLayout>
  );
}

function Field({ label, name, value, onChange, placeholder, type = "text", readOnly = false, className = "" }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <Input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        readOnly={readOnly}
        className="mt-2"
      />
    </div>
  );
}

export default RegisterTutorPage;
