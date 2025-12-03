import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PROCESSING_STEPS = [
  { id: 1, label: "Upload received", description: "We accepted your file and started processing" },
  { id: 2, label: "Detecting file type", description: "Checking whether the document is PDF or image" },
  { id: 3, label: "Extracting text (OCR)", description: "Running OCR or text extraction from pages" },
  { id: 4, label: "Initial AI extraction", description: "Extracting structured fields using AI" },
  { id: 5, label: "Preparing & sending to backend", description: "Packaging the extracted report" },
  { id: 6, label: "Lookup & map tests to LOINC", description: "Finding standard codes for each test" },
  { id: 7, label: "Saving to database", description: "Inserting patient, report, and test results" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

const Processing = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [extraInfoSubmitted, setExtraInfoSubmitted] = useState(false);
  const [uploadData, setUploadData] = useState<any>(null);

  // Extra info form state
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const data = sessionStorage.getItem("uploadData");
    if (data) {
      setUploadData(JSON.parse(data));
    }

    // Simulate processing steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= PROCESSING_STEPS.length) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    // Check for backend response
    const checkResponse = () => {
      const response = sessionStorage.getItem("backendResponse");
      if (response) {
        const data = JSON.parse(response);
        if (data.backend_status === "received" && data.backend_data?.success) {
          setIsComplete(true);
          setCurrentStep(PROCESSING_STEPS.length);
        } else if (data.message === "Error in workflow") {
          setHasError(true);
        }
      }
    };

    // Check response periodically
    const responseInterval = setInterval(checkResponse, 1000);

    // Timeout after 1 minute
    const timeout = setTimeout(() => {
      clearInterval(stepInterval);
      clearInterval(responseInterval);
      if (!isComplete && !hasError) {
        navigate("/home");
      }
    }, 60000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(responseInterval);
      clearTimeout(timeout);
    };
  }, [navigate, isComplete, hasError]);

  const handleExtraInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("extra_info").insert({
        phone: phone || null,
        email: email || null,
        address: address || null,
        emergency_contact: emergencyContact || null,
        blood_group: bloodGroup || null,
        allergies: allergies || null,
        notes: notes || null,
      });

      if (error) throw error;

      toast.success("Additional information saved!");
      setExtraInfoSubmitted(true);

      // Store extra info in session for display later
      sessionStorage.setItem(
        "extraInfo",
        JSON.stringify({
          phone,
          email,
          address,
          emergencyContact,
          bloodGroup,
          allergies,
          notes,
        })
      );
    } catch (error) {
      console.error("Error saving extra info:", error);
      toast.error("Failed to save additional information");
    }
  };

  const handleContinue = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="h-1 bg-primary w-full" />
        <div className="py-6">
          <div className="container flex items-center justify-center">
            <img src="/logo-cb.png" alt="CodeByte" className="h-10" />
          </div>
          <p className="text-center text-muted-foreground mt-2">
            Processing Your Health Report
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Progress Steps */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Processing Status</h2>
            
            {uploadData && (
              <div className="mb-6 p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">File: {uploadData.fileName}</p>
                <p className="text-sm text-muted-foreground">Submitted by: {uploadData.name}</p>
              </div>
            )}

            <div className="space-y-4">
              {PROCESSING_STEPS.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id || isComplete;

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
                      isActive ? "bg-primary/10" : isCompleted ? "bg-success/10" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? "bg-success text-success-foreground"
                          : isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span className="text-sm">{step.id}</span>
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                        {step.label}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasError && (
              <div className="mt-6 p-4 bg-destructive/10 rounded-lg">
                <p className="text-destructive font-medium">An error occurred during processing.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your report will still be saved. Please check back later.
                </p>
              </div>
            )}

            {(isComplete || hasError || extraInfoSubmitted) && (
              <Button onClick={handleContinue} className="w-full mt-6">
                Continue to Dashboard
              </Button>
            )}
          </div>

          {/* Right - Extra Info Form */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Additional Patient Information
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              While we process your report, you can add additional details (optional)
            </p>

            {extraInfoSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <p className="text-foreground font-medium">Information saved successfully!</p>
                <p className="text-muted-foreground text-sm mt-2">
                  You can continue once processing is complete.
                </p>
              </div>
            ) : (
              <form onSubmit={handleExtraInfoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="patient@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main St, City, State"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      type="text"
                      placeholder="Name - Phone"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Select value={bloodGroup} onValueChange={setBloodGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        {BLOOD_GROUPS.map((bg) => (
                          <SelectItem key={bg} value={bg}>
                            {bg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Known Allergies</Label>
                  <Input
                    id="allergies"
                    type="text"
                    placeholder="e.g., Penicillin, Peanuts"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional medical history or notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Save Information
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Processing;
