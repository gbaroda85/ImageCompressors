import React, { useState, useCallback } from 'react';
import { Upload, Download, FileText, Image as ImageIcon, Merge, Split, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFDocument, rgb } from 'pdf-lib';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfProcessor = () => {
  const [activeTab, setActiveTab] = useState('image-to-pdf');
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);

  const handleFileUpload = useCallback((event, fileType = 'any') => {
    const uploadedFiles = Array.from(event.target.files);
    let filteredFiles;
    
    if (fileType === 'image') {
      filteredFiles = uploadedFiles.filter(file => file.type.startsWith('image/'));
    } else if (fileType === 'pdf') {
      filteredFiles = uploadedFiles.filter(file => file.type === 'application/pdf');
    } else {
      filteredFiles = uploadedFiles;
    }
    
    const fileObjects = filteredFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    
    setFiles(prev => [...prev, ...fileObjects]);
  }, []);

  const handleDrop = useCallback((event, fileType = 'any') => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    let filteredFiles;
    
    if (fileType === 'image') {
      filteredFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    } else if (fileType === 'pdf') {
      filteredFiles = droppedFiles.filter(file => file.type === 'application/pdf');
    } else {
      filteredFiles = droppedFiles;
    }
    
    const fileObjects = filteredFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    
    setFiles(prev => [...prev, ...fileObjects]);
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const convertImagesToPdf = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const pdf = new jsPDF();
      let isFirstPage = true;
      
      for (const fileObj of files) {
        if (!fileObj.type.startsWith('image/')) continue;
        
        const img = new Image();
        img.src = fileObj.url;
        
        await new Promise((resolve) => {
          img.onload = () => {
            if (!isFirstPage) {
              pdf.addPage();
            }
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            const imgAspectRatio = img.width / img.height;
            const pageAspectRatio = pageWidth / pageHeight;
            
            let imgWidth, imgHeight;
            
            if (imgAspectRatio > pageAspectRatio) {
              imgWidth = pageWidth - 20;
              imgHeight = imgWidth / imgAspectRatio;
            } else {
              imgHeight = pageHeight - 20;
              imgWidth = imgHeight * imgAspectRatio;
            }
            
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;
            
            pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
            isFirstPage = false;
            resolve();
          };
        });
      }
      
      const pdfBlob = pdf.output('blob');
      const processedFile = {
        id: Date.now(),
        name: 'converted_images.pdf',
        blob: pdfBlob,
        url: URL.createObjectURL(pdfBlob),
        type: 'pdf'
      };
      
      setProcessedFiles([processedFile]);
    } catch (error) {
      console.error('PDF conversion error:', error);
      alert('Error converting images to PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const convertPdfToImages = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const processed = [];
      
      for (const fileObj of files) {
        if (fileObj.type !== 'application/pdf') continue;
        
        const arrayBuffer = await fileObj.file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const scale = 2.0;
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          const imageBlob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png');
          });
          
          processed.push({
            id: Date.now() + pageNum,
            name: `${fileObj.name.replace('.pdf', '')}_page_${pageNum}.png`,
            blob: imageBlob,
            url: URL.createObjectURL(imageBlob),
            type: 'image'
          });
        }
      }
      
      setProcessedFiles(processed);
    } catch (error) {
      console.error('PDF to image conversion error:', error);
      alert('Error converting PDF to images. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      alert('Please upload at least 2 PDF files to merge.');
      return;
    }
    
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const fileObj of files) {
        if (fileObj.type !== 'application/pdf') continue;
        
        const arrayBuffer = await fileObj.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      
      const pdfBytes = await mergedPdf.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      const processedFile = {
        id: Date.now(),
        name: 'merged_document.pdf',
        blob: pdfBlob,
        url: URL.createObjectURL(pdfBlob),
        type: 'pdf'
      };
      
      setProcessedFiles([processedFile]);
    } catch (error) {
      console.error('PDF merge error:', error);
      alert('Error merging PDFs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (processedFile) => {
    const link = document.createElement('a');
    link.href = processedFile.url;
    link.download = processedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    processedFiles.forEach((file, index) => {
      setTimeout(() => downloadFile(file), index * 100);
    });
  };

  const clearFiles = () => {
    setFiles([]);
    setProcessedFiles([]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tabs = [
    { id: 'image-to-pdf', label: 'Image to PDF', icon: FileText },
    { id: 'pdf-to-image', label: 'PDF to Image', icon: ImageIcon },
    { id: 'merge-pdf', label: 'Merge PDF', icon: Merge },
  ];

  const getAcceptedFileTypes = () => {
    switch (activeTab) {
      case 'image-to-pdf':
        return 'image/*';
      case 'pdf-to-image':
      case 'merge-pdf':
        return 'application/pdf';
      default:
        return '*/*';
    }
  };

  const getFileTypeFilter = () => {
    switch (activeTab) {
      case 'image-to-pdf':
        return 'image';
      case 'pdf-to-image':
      case 'merge-pdf':
        return 'pdf';
      default:
        return 'any';
    }
  };

  const getProcessFunction = () => {
    switch (activeTab) {
      case 'image-to-pdf':
        return convertImagesToPdf;
      case 'pdf-to-image':
        return convertPdfToImages;
      case 'merge-pdf':
        return mergePdfs;
      default:
        return () => {};
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'image-to-pdf':
        return 'Convert multiple images into a single PDF document';
      case 'pdf-to-image':
        return 'Extract pages from PDF files as high-quality images';
      case 'merge-pdf':
        return 'Combine multiple PDF files into one document';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <FileText className="w-8 h-8 text-red-600" />
          PDF Processor
        </h2>
        <p className="text-gray-600">
          Professional PDF processing tools for all your document needs.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    clearFiles();
                  }}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
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
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-gray-600">{getTabDescription()}</p>
          </div>

          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-red-400 transition-colors mb-6"
            onDrop={(e) => handleDrop(e, getFileTypeFilter())}
            onDragOver={handleDragOver}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Upload {activeTab === 'image-to-pdf' ? 'Images' : 'PDF Files'}
            </h3>
            <p className="text-gray-500 mb-4">
              Drag and drop your files here, or click to browse
            </p>
            <input
              type="file"
              multiple={activeTab !== 'pdf-to-image'}
              accept={getAcceptedFileTypes()}
              onChange={(e) => handleFileUpload(e, getFileTypeFilter())}
              className="hidden"
              id={`file-upload-${activeTab}`}
            />
            <label htmlFor={`file-upload-${activeTab}`}>
              <Button className="cursor-pointer bg-red-600 hover:bg-red-700">
                Choose Files
              </Button>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Uploaded Files ({files.length})
                </h4>
                <div className="space-x-2">
                  <Button
                    onClick={getProcessFunction()}
                    disabled={isProcessing}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isProcessing ? 'Processing...' : 'Process Files'}
                  </Button>
                  <Button
                    onClick={clearFiles}
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((fileObj) => (
                  <div key={fileObj.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      {fileObj.type.startsWith('image/') ? (
                        <img
                          src={fileObj.url}
                          alt={fileObj.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FileText className="w-12 h-12 text-red-600" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-800 truncate" title={fileObj.name}>
                        {fileObj.name}
                      </h5>
                      <div className="text-sm text-gray-600">
                        Size: {formatFileSize(fileObj.size)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processed Files */}
          {processedFiles.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-green-800">
                  Processing Complete!
                </h4>
                <Button
                  onClick={downloadAll}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {processedFiles.map((fileObj) => (
                  <div key={fileObj.id} className="bg-white border border-green-200 rounded-lg p-4">
                    <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      {fileObj.type === 'image' ? (
                        <img
                          src={fileObj.url}
                          alt={fileObj.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FileText className="w-12 h-12 text-red-600" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-800 truncate" title={fileObj.name}>
                        {fileObj.name}
                      </h5>
                      <Button
                        onClick={() => downloadFile(fileObj)}
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfProcessor;

