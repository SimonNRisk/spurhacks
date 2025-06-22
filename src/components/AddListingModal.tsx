import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Package, DollarSign, Loader2, X } from "lucide-react";

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated?: () => void;
}

const AddListingModal = ({
  isOpen,
  onClose,
  onListingCreated,
}: AddListingModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [location, setLocation] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTags([]);
    setPrice("");
    setQuantity("1");
    setLocation("");
    setUploadedImage(null);
    setPhotoPath("");
    setIsGenerating(false);
    setIsUploading(false);
    setIsSubmitting(false);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      alert("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setIsGenerating(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      // Call the generate-details endpoint
      const response = await fetch(
        "http://localhost:8000/listings/generate-details",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate listing details");
      }

      const result = await response.json();

      // Auto-fill form fields with AI-generated content
      setTitle(result.title || result.description?.split(".")[0] || ""); // Use AI title, fallback to first sentence
      setDescription(result.description || "");
      setTags(result.tags || []);
      setUploadedImage(result.photo_url);
      setPhotoPath(result.photo_path);
    } catch (error) {
      console.error("Error generating listing details:", error);
      alert("Failed to generate listing details. Please try again.");
    } finally {
      setIsUploading(false);
      setIsGenerating(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const addTag = (newTag: string) => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      addTag(input.value);
      input.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !location || !price || tags.length === 0) {
      alert("Please fill out all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const listingData = {
        title,
        description,
        tags,
        price: parseFloat(price),
        quantity,
        location,
        picture: photoPath,
        user: 1, // TODO: Get actual user ID from auth context
      };

      const response = await fetch("http://localhost:8000/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create listing");
      }

      const createdListing = await response.json();
      console.log("Listing created successfully:", createdListing);

      // Trigger refresh of listings grid if callback provided
      if (onListingCreated) {
        onListingCreated();
      }

      // Reset form and close modal
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating listing:", error);
      alert(`Failed to create listing: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="bg-primary text-white p-6 -m-6 mb-6 rounded-t-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              Add New Listing
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-2">
          {/* Photo Upload Section */}
          <div
            className={`text-center border-2 border-dashed rounded-lg transition-colors cursor-pointer relative ${
              uploadedImage
                ? "border-blue-300 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            } ${isUploading ? "pointer-events-none" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {uploadedImage ? (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded item"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2" />
                    <p>Click to change photo</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    ) : (
                      <Camera className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {isUploading
                        ? "Processing Image..."
                        : "Upload Item Photo"}
                    </h3>
                    <p className="text-gray-600">
                      {isUploading
                        ? "AI is analyzing your image and generating details..."
                        : "Drag & drop or click to browse (JPG, PNG up to 10MB)"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Upload image file"
            />
          </div>

          {/* Item Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Item Details
              </h3>
              <Badge className="bg-primary-light border-2 border-primary text-black text-xs">
                AI Enhanced
              </Badge>
              {isGenerating && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <Input
                  type="text"
                  placeholder="AI will suggest a title based on your image"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  placeholder="AI will generate a detailed description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[100px] resize-none"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-2">
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 flex items-center gap-1"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(index)}
                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                            aria-label={`Remove tag ${tag}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Input
                    type="text"
                    placeholder="AI will suggest relevant tags, or add your own (press Enter)"
                    onKeyPress={handleTagKeyPress}
                    className="w-full"
                    disabled={isGenerating}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rental Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Rental Details
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Day ($)
                </label>
                <Input
                  type="number"
                  placeholder="25.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Quantity
                </label>
                <Input
                  type="number"
                  placeholder="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <Input
                type="text"
                placeholder="Waterloo, Ontario"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            className="px-8"
            disabled={isGenerating || isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            disabled={
              isGenerating ||
              isSubmitting ||
              !title ||
              !description ||
              !location ||
              !price ||
              tags.length === 0
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : isGenerating ? (
              "Generating..."
            ) : (
              "List Item"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddListingModal;
