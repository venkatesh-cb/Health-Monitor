import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const RELATIONS = [
  "Self",
  "Parent",
  "Mother",
  "Father",
  "Spouse",
  "Child",
  "Son",
  "Daughter",
  "Sibling",
  "Brother",
  "Sister",
  "Grandparent",
  "Grandchild",
  "Friend",
  "Other",
];

const Index = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf" || selectedFile.type.startsWith("image/")) {
        setFile(selectedFile);
      } else {
        toast.error("Please upload a PDF or image file");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type === "application/pdf" || droppedFile.type.startsWith("image/")) {
        setFile(droppedFile);
      } else {
        toast.error("Please upload a PDF or image file");
      }
    }
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!name.trim()) {
  //     toast.error("Please enter your name");
  //     return;
  //   }
  //   if (!relation) {
  //     toast.error("Please select a relation");
  //     return;
  //   }
  //   if (!file) {
  //     toast.error("Please upload a report file");
  //     return;
  //   }

  //   setIsUploading(true);

  //   const formData = new FormData();
  //   formData.append("Name", name.trim());
  //   formData.append("Relation", relation);
  //   formData.append("Enter report", file);

  //   sessionStorage.setItem(
  //     "uploadData",
  //     JSON.stringify({
  //       name: name.trim(),
  //       relation,
  //       fileName: file.name,
  //       uploadTime: new Date().toISOString(),
  //     })
  //   );

  //   try {
  //     const response = await fetch("https://n8n.codebyte.solutions/webhook/report", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     const data = await response.json();
  //     sessionStorage.setItem("backendResponse", JSON.stringify(data));
  //     navigate("/processing");
  //   } catch (error) {
  //     console.error("Upload error:", error);
  //     sessionStorage.setItem("backendResponse", JSON.stringify({ message: "Error in workflow" }));
  //     navigate("/processing");
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };


  // Replace the existing handleSubmit with this
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!relation) {
      toast.error("Please select a relation");
      return;
    }
    if (!file) {
      toast.error("Please upload a report file");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("Name", name.trim());
    formData.append("Relation", relation);
    // IMPORTANT: use the underscore name that matches your webhook binaryPropertyName
    formData.append("Enter_report", file); // <<-- changed from "Enter report"

    // Save upload metadata so Processing page can show it immediately
    sessionStorage.setItem(
      "uploadData",
      JSON.stringify({
        name: name.trim(),
        relation,
        fileName: file.name,
        uploadTime: new Date().toISOString(),
      })
    );

    // Mark backend as pending so Processing shows "in progress"
    sessionStorage.setItem("backendResponse", JSON.stringify({ backend_status: "pending" }));

    // Navigate immediately to processing page (do not wait for the webhook)
    navigate("/processing");

    // Fire the webhook in background: update sessionStorage when it completes
    (async () => {
      try {
        const response = await fetch("https://n8n.codebyte.solutions/webhook/report", {
          method: "POST",
          body: formData,
        });

        // Try to parse JSON (if backend returns JSON)
        let data;
        try {
          data = await response.json();
        } catch (err) {
          // backend didn't return JSON — store status text
          data = { backend_status: response.ok ? "received" : "error", statusText: response.statusText };
        }

        // Save actual backend response — Processing polls sessionStorage and will pick this up
        sessionStorage.setItem("backendResponse", JSON.stringify(data));
      } catch (error) {
        console.error("Upload error:", error);
        sessionStorage.setItem("backendResponse", JSON.stringify({ message: "Error in workflow" }));
      } finally {
        // optional: if Index still mounted, reset uploading UI
        try {
          setIsUploading(false);
        } catch (e) {
          // component may be unmounted after navigate; ignore
        }
      }
    })();
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
            Health Report Monitor - AI-Powered Report Analysis
          </p>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-lg shadow-sm border border-border p-8">
            <h1 className="text-2xl font-bold text-center text-foreground mb-7">
              Upload Health Report
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relation" className="text-foreground">
                    Relation with Patient
                  </Label>
                  <Select value={relation} onValueChange={setRelation}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select relation" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      {RELATIONS.map((rel) => (
                        <SelectItem key={rel} value={rel}>
                          {rel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Patient's Report (PDF)</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : file
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  {file ? (
                    <p className="text-foreground font-medium">{file.name}</p>
                  ) : (
                    <>
                      <p className="text-foreground">
                        Click to upload or <span className="text-primary">drag and drop</span>
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">PDF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isUploading}
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90"
              >
                {isUploading ? "Uploading..." : "Upload Report"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
