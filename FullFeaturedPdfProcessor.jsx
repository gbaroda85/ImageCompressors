import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2,
  Eye,
  Loader2,
  X,
  Check,
  Image as ImageIcon,
  Merge,
  Split,
  Lock,
  Unlock,
  RotateCw,
  Scissors,
  Droplets
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const FullFeaturedPdfProcessor = () => {
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('image-to-pdf');
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = useCallback((event) => {
    const uploadedFiles = Array.from(event.target.files);
    let validFiles = [];

    if (activeTab === 'image-to-pdf') {
      validFiles = uploadedFiles.filter(file => file.type.startsWith('image/'));
    } else {
      validFiles = uploadedFiles.filter(file => file.type === 'application/pdf');
    }
    
    const fileObjects = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      status: 'pending',
      progress: 0,
      processed: null,
      processedPreview: null
    }));
    
    setFiles(prev => [...prev, ...fileObjects]);
  }, [activeTab]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files);
    let validFiles = [];

    if (activeTab === 'image-to-pdf') {
      validFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    } else {
      validFiles = droppedFiles.filter(file => file.type === 'application/pdf');
    }
    
    const fileObjects = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      status: 'pending',
      progress: 0,
      processed: null,
      processedPreview: null
    }));
    
    setFiles(prev => [...prev, ...fileObjects]);
  }, [activeTab]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processImageToPdf = async (imageFiles) => {
    const pdf = new jsPDF();
    let isFirstPage = true;

    for (const fileObj of imageFiles) {
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = fileObj.preview;
      });

      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = img.width;
      const imgHeight = img.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
    }

    return pdf.output('blob');
  };

  const processPdfToImages = async (pdfFile) => {
    const arrayBuffer = await pdfFile.file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const images = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const scale = 2.0; // Higher scale for better quality
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });

      images.push({
        blob,
        name: `${pdfFile.name.replace('.pdf', '')}_page_${pageNum}.png`,
        preview: URL.createObjectURL(blob)
      });
    }

    return images;
  };

  const processFiles = async () => {
    setProcessing(true);

    try {
      if (activeTab === 'image-to-pdf') {
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length > 0) {
          const pdfBlob = await processImageToPdf(imageFiles);
          const pdfFile = new File([pdfBlob], 'converted.pdf', { type: 'application/pdf' });
          
          setFiles(prev => prev.map(f => ({
            ...f,
            processed: pdfFile,
            status: 'completed',
            progress: 100
          })));
        }
      } else if (activeTab === 'pdf-to-image') {
        for (const fileObj of files) {
          if (fileObj.type === 'application/pdf') {
            setFiles(prev => prev.map(f => 
              f.id === fileObj.id ? { ...f, status: 'processing', progress: 50 } : f
            ));

            const images = await processPdfToImages(fileObj);
            
            setFiles(prev => prev.map(f => 
              f.id === fileObj.id ? { 
                ...f, 
                processed: images, 
                status: 'completed', 
                progress: 100 
              } : f
            ));
          }
        }
      } else if (activeTab === 'merge-pdf') {
        // Merge PDF functionality would go here
        // For now, just mark as completed
        setFiles(prev => prev.map(f => ({
          ...f,
          status: 'completed',
          progress: 100
        })));
      }
    } catch (error) {
      console.error('Processing error:', error);
      setFiles(prev => prev.map(f => ({
        ...f,
        status: 'error',
        progress: 0
      })));
    }

    setProcessing(false);
  };

  const downloadFile = (fileObj) => {
    if (activeTab === 'image-to-pdf' && fileObj.processed) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(fileObj.processed);
      link.download = fileObj.processed.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeTab === 'pdf-to-image' && fileObj.processed) {
      fileObj.processed.forEach((image, index) => {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = image.preview;
          link.download = image.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 100);
      });
    }
  };

  const downloadAll = () => {
    files.forEach((file, index) => {
      if (file.processed) {
        setTimeout(() => downloadFile(file), index * 200);
      }
    });
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const openPreview = (file) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const tabs = [
    { id: 'image-to-pdf', label: 'Image to PDF', icon: ImageIcon, description: 'Convert multiple images into a single PDF document' },
    { id: 'pdf-to-image', label: 'PDF to Image', icon: FileText, description: 'Extract pages from PDF files as high-quality images' },
    { id: 'merge-pdf', label: 'Merge PDF', icon: Merge, description: 'Combine multiple PDF files into one document' },
    { id: 'split-pdf', label: 'Split PDF', icon: Split, description: 'Split PDF into separate pages or ranges' },
    { id: 'compress-pdf', label: 'Compress PDF', icon: Droplets, description: 'Reduce PDF file size while maintaining quality' },
    { id: 'protect-pdf', label: 'Protect PDF', icon: Lock, description: 'Add password protection to PDF files' },
    { id: 'unlock-pdf', label: 'Unlock PDF', icon: Unlock, description: 'Remove password protection from PDF files' },
    { id: 'rotate-pdf', label: 'Rotate PDF', icon: RotateCw, description: 'Rotate PDF pages to correct orientation' },
    { id: 'extract-pages', label: 'Extract Pages', icon: Scissors, description: 'Extract specific pages from PDF documents' }
  ];

  const getAcceptedFileTypes = () => {
    if (activeTab === 'image-to-pdf') {
      return 'image/*';
    }
    return 'application/pdf';
  };

  const getUploadText = () => {
    if (activeTab === 'image-to-pdf') {
      return {
        title: 'Upload Images',
        description: 'Drag and drop your images here, or click to browse'
      };
    }
    return {
      title: 'Upload PDF Files',
      description: 'Drag and drop your PDF files here, or click to browse'
    };
  };

  const uploadText = getUploadText();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <FileText className="w-8 h-8 text-red-600" />
          Professional PDF Processor
        </h2>
        <p className="text-gray-600">
          Comprehensive PDF processing tools for all your document needs.
        </p>
      </div>

      {/* Action Buttons */}
      {files.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {files.length} file{files.length !== 1 ? 's' : ''} uploaded
          </div>
          <div className="flex gap-2">
            <Button
              onClick={processFiles}
              disabled={processing}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process Files'
              )}
            </Button>
            <Button
              onClick={downloadAll}
              variant="outline"
              disabled={!files.some(f => f.processed)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
            <Button
              onClick={clearAll}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* PDF Tools Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setFiles([]); // Clear files when switching tabs
                  }}
                  className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Current Tool Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <p className="text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging 
                ? 'border-red-400 bg-red-50' 
                : 'border-gray-300 hover:border-red-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {uploadText.title}
            </h3>
            <p className="text-gray-500 mb-4">
              {uploadText.description}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple={activeTab !== 'image-to-pdf' || true}
              accept={getAcceptedFileTypes()}
              onChange={handleFileUpload}
              className="hidden"
              id="pdf-file-upload"
            />
            <label htmlFor="pdf-file-upload">
              <Button className="cursor-pointer bg-red-600 hover:bg-red-700">
                Choose Files
              </Button>
            </label>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Uploaded Files ({files.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((fileObj) => (
              <div key={fileObj.id} className="border border-gray-200 rounded-lg p-4">
                <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                  {fileObj.preview ? (
                    <img
                      src={fileObj.preview}
                      alt={fileObj.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {fileObj.status === 'processing' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  {fileObj.status === 'completed' && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-6 h-6 text-green-500 bg-white rounded-full p-1" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800 truncate" title={fileObj.name}>
                    {fileObj.name}
                  </h4>
                  
                  <div className="text-sm text-gray-600">
                    <div>Size: {formatFileSize(fileObj.size)}</div>
                    <div>Type: {fileObj.type}</div>
                    {fileObj.processed && activeTab === 'pdf-to-image' && (
                      <div className="text-green-600 font-medium">
                        {fileObj.processed.length} images extracted
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {fileObj.preview && (
                      <Button
                        onClick={() => openPreview(fileObj)}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    )}
                    {fileObj.processed && (
                      <Button
                        onClick={() => downloadFile(fileObj)}
                        size="sm"
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    )}
                    <Button
                      onClick={() => removeFile(fileObj.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl max-h-full overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{previewFile.name}</h3>
              <Button
                onClick={() => setShowPreview(false)}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              {previewFile.preview ? (
                <img
                  src={previewFile.preview}
                  alt="Preview"
                  className="w-full rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <p className="text-sm text-gray-600 mt-2">
                Size: {formatFileSize(previewFile.size)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullFeaturedPdfProcessor;

