"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type FormValues = {
  file: FileList;
};

type S3Image = {
  url: string;
  key: string;
};

const FileUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set());
  const [showDuplicateAlert, setShowDuplicateAlert] = useState<boolean>(false);

  const form = useForm<FormValues>();

  // Load existing files from S3 on component mount
  useEffect(() => {
    const fetchUploadedFiles = async () => {
      try {
        const response = await fetch("/api/s3-retrieve?path=imagegroup1/");
        const data = await response.json();

        if (data.images && Array.isArray(data.images)) {
          const fileNames = new Set<string>(
            data.images.map((image: S3Image) => {
              const key = image.key as string;
              return key.split("/").pop() || "";
            })
          );

          setUploadedFiles(fileNames);
        }
      } catch (error) {
        console.error("Error fetching uploaded files:", error);
        toast.error("Failed to load existing files", {
          description: "There was a problem connecting to the server.",
        });
      }
    };

    fetchUploadedFiles();
  }, []);

  const handleFileChange = (files: FileList | null) => {
    const selectedFile = files?.[0] || null;
    setFile(selectedFile);
  };

  const checkDuplicate = (fileName: string): boolean => {
    return uploadedFiles.has(fileName);
  };

  const proceedWithUpload = async () => {
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/s3-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      console.log(data.status);

      toast.success("File uploaded successfully!", {
        description: "Your file has been uploaded to the server.",
      });

      setFile(null);
      form.reset();

      // Reload the page after successful upload
      setTimeout(() => {
        window.location.reload();
      }, 1500); // Small delay to allow the toast to be seen
    } catch (error) {
      toast.error("Upload failed. Please try again.", {
        description: "There was an error uploading your file.",
      });
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async () => {
    if (!file) {
      toast.error("Please select a file before uploading.", {
        description: "No file selected",
      });
      return;
    }

    // Check if file already exists
    if (checkDuplicate(file.name)) {
      setShowDuplicateAlert(true);
      return;
    }

    await proceedWithUpload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          field.onChange(e.target.files);
                          handleFileChange(e.target.files);
                        }}
                        className="cursor-pointer bg-gray-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {file && <p className="text-sm">Selected File: {file.name}</p>}

              <Button
                type="submit"
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Duplicate File Alert Dialog */}
      <AlertDialog
        open={showDuplicateAlert}
        onOpenChange={setShowDuplicateAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate File</AlertDialogTitle>
            <AlertDialogDescription>
              A file with the same name has already been uploaded. You cannot
              upload the same file twice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowDuplicateAlert(false)}>
              Ok
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FileUploadForm;
