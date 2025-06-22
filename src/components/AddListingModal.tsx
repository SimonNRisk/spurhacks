import React, { useState, useRef } from 'react';
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
import { Camera, Upload, Package, DollarSign, Loader2, X, MapPin, Sparkles } from 'lucide-react';

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated?: () => void;
}

const AddListingModal = ({ isOpen, onClose, onListingCreated }: AddListingModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [location, setLocation] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTags([]);
    setPrice('');
    setQuantity('1');
    setLocation('');
    setUploadedImage(null);
    setPhotoPath('');
    setIsGenerating(false);
    setIsUploading(false);
    setIsSubmitting(false);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/listings/generate-details', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate listing details');
      }

      const result = await response.json();

      setTitle(result.title || result.description?.split('.')[0] || '');
      setDescription(result.description || '');
      setTags(result.tags || []);
      setUploadedImage(result.photo_url);
      setPhotoPath(result.photo_path);

    } catch (error) {
      console.error('Error generating listing details:', error);
      alert('Failed to generate listing details. Please try again.');
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
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      addTag(input.value);
      input.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !location || !price || tags.length === 0) {
      alert('Please fill out all required fields');
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
        user: 1
      };
      
      const response = await fetch('http://localhost:8000/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create listing');
      }

      const createdListing = await response.json();
      console.log('Listing created successfully:', createdListing);
      
      if (onListingCreated) {
        onListingCreated();
      }
      
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Error creating listing:', error);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="text-center py-6 border-b border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">
              List Your Item
            </DialogTitle>
            <p className="text-gray-600 text-lg">
              Share what you own, earn from what you don't use
            </p>
          </DialogHeader>
        </div>

        <div className="space-y-8 p-6">
          {/* Photo Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Add Photos</h3>
                <p className="text-sm text-gray-500">Upload clear photos of your item</p>
              </div>
              {isGenerating && (
                <Badge className="bg-primary/10 text-primary border-primary/20 ml-auto">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Processing
                </Badge>
              )}
            </div>

            <div 
              className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer group ${
                uploadedImage 
                  ? 'border-primary/30 bg-primary/5' 
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-primary/50'
              } ${isUploading ? 'pointer-events-none' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              {uploadedImage ? (
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded item" 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center">
                      <Camera className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">Change Photo</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      {isUploading ? (
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      ) : (
                        <Camera className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {isUploading ? 'Processing Your Photo...' : 'Upload Item Photo'}
                      </h4>
                      <p className="text-gray-600 max-w-sm mx-auto">
                        {isUploading 
                          ? 'AI is analyzing your image and generating details automatically'
                          : 'Drag & drop your photo here, or click to browse'
                        }
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        JPG, PNG up to 10MB
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
          </div>

          {/* Item Details Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Item Details</h3>
                <p className="text-sm text-gray-500">Tell us about your item</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What are you listing? *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Canon DSLR Camera, Camping Tent, Ski Equipment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  placeholder="Describe your item's condition, brand, size, and any special features..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[120px] text-base border-gray-300 focus:border-primary focus:ring-primary resize-none"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categories & Tags *
                </label>
                <div className="space-y-3">
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors px-3 py-1 text-sm flex items-center gap-2"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(index)}
                            className="hover:bg-primary/30 rounded-full p-0.5 transition-colors"
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
                    placeholder="Add tags like 'outdoor', 'electronics', 'winter gear' (press Enter)"
                    onKeyPress={handleTagKeyPress}
                    className="w-full h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
                    disabled={isGenerating}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rental Details Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Rental Details</h3>
                <p className="text-sm text-gray-500">Set your pricing and availability</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Daily Rate ($) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="25.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full h-12 pl-10 text-base border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity Available
                </label>
                <Input
                  type="number"
                  placeholder="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pickup Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Waterloo, Ontario"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-12 pl-10 text-base border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-100 bg-gray-50/50">
          <p className="text-sm text-gray-500">
            * Required fields
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-6 h-11 border-gray-300 hover:bg-gray-50"
              disabled={isGenerating || isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary-dark text-white px-8 h-11 font-semibold shadow-lg"
              disabled={isGenerating || isSubmitting || !title || !description || !location || !price || tags.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Listing...
                </>
              ) : isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Processing...
                </>
              ) : (
                'List My Item'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddListingModal;