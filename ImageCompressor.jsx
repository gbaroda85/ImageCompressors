import React, { useState, useCallback } from 'react';
import { Upload, Download, Settings, Image as ImageIcon, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import imageCompression from 'browser-image-compression';

const ImageCompressor = () => {
  const [files, setFiles] = useState([]);
  const [compressedFiles, setCompressedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);

  const handleFileUpload = useCallback((event) => {
    const uploadedFiles = Array.from(event.target.files);
    const imageFiles = uploadedFiles.filter(file => file.type.startsWith('image/'));
    
    const fileObjects = imageFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    
    setFiles(prev => [...prev, ...fileObjects]);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    
    const fileObjects = imageFiles.map(file => ({
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

  const compressImages = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    const compressed = [];
    
    try {
      for (const fileObj of files) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: Math.max(maxWidth, maxHeight),
          useWebWorker: true,
          quality: quality
        };
        
        const compressedFile = await imageCompression(fileObj.file, options);
        
        compressed.push({
          id: fileObj.id,
          originalFile: fileObj,
          compressedFile,
          originalSize: fileObj.size,
          compressedSize: compressedFile.size,
          compressionRatio: ((fileObj.size - compressedFile.size) / fileObj.size * 100).toFixed(1),
          url: URL.createObjectURL(compressedFile)
        });
      }
      
      setCompressedFiles(compressed);
    } catch (error) {
      console.error('Compression error:', error);
      alert('Error compressing images. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (compressedFileObj) => {
    const link = document.createElement('a');
    link.href = compressedFileObj.url;
    link.download = `compressed_${compressedFileObj.originalFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    compressedFiles.forEach(fileObj => {
      setTimeout(() => downloadFile(fileObj), 100);
    });
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setCompressedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    setCompressedFiles([]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <ImageIcon className="w-8 h-8 text-blue-600" />
          Image Compressor
        </h2>
        <p className="text-gray-600">
          Compress your images while maintaining quality. Supports JPEG, PNG, WebP formats.
        </p>
      </div>

      {/* Settings Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Compression Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality: {Math.round(quality * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Width (px)
            </label>
            <input
              type="number"
              value={maxWidth}
              onChange={(e) => setMaxWidth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Height (px)
            </label>
            <input
              type="number"
              value={maxHeight}
              onChange={(e) => setMaxHeight(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Upload Images
        </h3>
        <p className="text-gray-500 mb-4">
          Drag and drop your images here, or click to browse
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button className="cursor-pointer">
            Choose Files
          </Button>
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Uploaded Images ({files.length})
            </h3>
            <div className="space-x-2">
              <Button
                onClick={compressImages}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? 'Compressing...' : 'Compress All'}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((fileObj) => {
              const compressed = compressedFiles.find(c => c.id === fileObj.id);
              
              return (
                <div key={fileObj.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={fileObj.url}
                      alt={fileObj.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800 truncate" title={fileObj.name}>
                      {fileObj.name}
                    </h4>
                    
                    <div className="text-sm text-gray-600">
                      <div>Original: {formatFileSize(fileObj.size)}</div>
                      {compressed && (
                        <>
                          <div>Compressed: {formatFileSize(compressed.compressedSize)}</div>
                          <div className="text-green-600 font-medium">
                            Saved: {compressed.compressionRatio}%
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {compressed && (
                        <Button
                          onClick={() => downloadFile(compressed)}
                          size="sm"
                          className="flex-1"
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
              );
            })}
          </div>
        </div>
      )}

      {/* Results Summary */}
      {compressedFiles.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-green-800">
              Compression Complete!
            </h3>
            <Button
              onClick={downloadAll}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {compressedFiles.length}
              </div>
              <div className="text-sm text-gray-600">Images Processed</div>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {formatFileSize(
                  compressedFiles.reduce((total, file) => total + file.originalSize, 0)
                )}
              </div>
              <div className="text-sm text-gray-600">Original Size</div>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {formatFileSize(
                  compressedFiles.reduce((total, file) => total + file.compressedSize, 0)
                )}
              </div>
              <div className="text-sm text-gray-600">Compressed Size</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCompressor;

