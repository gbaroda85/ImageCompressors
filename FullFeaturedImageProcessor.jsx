import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Settings, 
  Download, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Sliders, 
  Target, 
  FileImage,
  Trash2,
  Eye,
  BarChart3,
  X,
  Check,
  Loader2,
  ZoomIn,
  Palette,
  Crop,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const FullFeaturedImageProcessor = () => {
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('compression');
  const [isDragging, setIsDragging] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Settings state
  const [settings, setSettings] = useState({
    quality: 80,
    format: 'original',
    maxWidth: '',
    maxHeight: '',
    targetKB: '',
    removeExif: true,
    rotation: 0,
    flipH: false,
    flipV: false,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: false,
    sepia: false,
    blur: 0
  });

  // Stats state
  const [stats, setStats] = useState({
    totalFiles: 0,
    originalSize: 0,
    compressedSize: 0,
    totalSavings: 0,
    avgCompressionRatio: 0
  });

  const updateStats = (fileList) => {
    const totalFiles = fileList.length;
    const originalSize = fileList.reduce((sum, file) => sum + file.size, 0);
    const processedFiles = fileList.filter(file => file.processed);
    const compressedSize = processedFiles.reduce((sum, file) => sum + (file.processed?.size || file.size), 0);
    const totalSavings = originalSize - compressedSize;
    const avgCompressionRatio = processedFiles.length > 0 
      ? processedFiles.reduce((sum, file) => sum + ((file.size - (file.processed?.size || file.size)) / file.size * 100), 0) / processedFiles.length
      : 0;

    setStats({
      totalFiles,
      originalSize,
      compressedSize,
      totalSavings,
      avgCompressionRatio
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = useCallback((event) => {
    const uploadedFiles = Array.from(event.target.files);
    const imageFiles = uploadedFiles.filter(file => file.type.startsWith('image/'));
    
    const fileObjects = imageFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
      processed: null,
      processedPreview: null
    }));
    
    setFiles(prev => [...prev, ...fileObjects]);
    updateStats([...files, ...fileObjects]);
  }, [files]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    
    const fileObjects = imageFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
      processed: null,
      processedPreview: null
    }));
    
    setFiles(prev => [...prev, ...fileObjects]);
    updateStats([...files, ...fileObjects]);
  }, [files]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const processImages = async () => {
    setProcessing(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.status === 'completed') continue;

      // Update progress
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'processing', progress: 0 } : f
      ));

      try {
        const processedBlob = await processImage(file.file);
        const processedFile = new File([processedBlob], file.name, { type: processedBlob.type });
        const processedPreview = URL.createObjectURL(processedBlob);
        
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { 
            ...f, 
            processed: processedFile, 
            processedPreview,
            status: 'completed', 
            progress: 100 
          } : f
        ));
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'error', progress: 0 } : f
        ));
      }
    }

    setProcessing(false);
    updateStats(files);
  };

  const processImage = async (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate dimensions
        let { width, height } = img;
        
        if (settings.maxWidth && width > parseInt(settings.maxWidth)) {
          height = (height * parseInt(settings.maxWidth)) / width;
          width = parseInt(settings.maxWidth);
        }
        
        if (settings.maxHeight && height > parseInt(settings.maxHeight)) {
          width = (width * parseInt(settings.maxHeight)) / height;
          height = parseInt(settings.maxHeight);
        }

        canvas.width = width;
        canvas.height = height;

        // Apply transformations
        ctx.save();
        
        // Rotation
        if (settings.rotation !== 0) {
          ctx.translate(width / 2, height / 2);
          ctx.rotate((settings.rotation * Math.PI) / 180);
          ctx.translate(-width / 2, -height / 2);
        }

        // Flip
        if (settings.flipH || settings.flipV) {
          ctx.scale(settings.flipH ? -1 : 1, settings.flipV ? -1 : 1);
          ctx.translate(settings.flipH ? -width : 0, settings.flipV ? -height : 0);
        }

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Apply filters
        if (settings.brightness !== 100 || settings.contrast !== 100 || settings.saturation !== 100) {
          ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;
          ctx.drawImage(canvas, 0, 0);
        }

        if (settings.grayscale) {
          ctx.filter = 'grayscale(100%)';
          ctx.drawImage(canvas, 0, 0);
        }

        if (settings.sepia) {
          ctx.filter = 'sepia(100%)';
          ctx.drawImage(canvas, 0, 0);
        }

        if (settings.blur > 0) {
          ctx.filter = `blur(${settings.blur}px)`;
          ctx.drawImage(canvas, 0, 0);
        }

        ctx.restore();

        // Convert to blob
        const outputFormat = settings.format === 'original' ? file.type : `image/${settings.format}`;
        const quality = settings.quality / 100;
        
        canvas.toBlob(resolve, outputFormat, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const downloadFile = (fileObj) => {
    const link = document.createElement('a');
    link.href = fileObj.processedPreview || fileObj.preview;
    link.download = `processed_${fileObj.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    files.forEach((file, index) => {
      if (file.processed) {
        setTimeout(() => downloadFile(file), index * 100);
      }
    });
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    setStats({
      totalFiles: 0,
      originalSize: 0,
      compressedSize: 0,
      totalSavings: 0,
      avgCompressionRatio: 0
    });
  };

  const openPreview = (file) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const tabs = [
    { id: 'compression', label: 'Compression', icon: Target },
    { id: 'resize', label: 'Resize', icon: Crop },
    { id: 'transform', label: 'Transform', icon: RotateCw },
    { id: 'filters', label: 'Filters', icon: Palette },
    { id: 'format', label: 'Format', icon: FileImage },
    { id: 'batch', label: 'Batch', icon: Sliders },
    { id: 'advanced', label: 'Advanced', icon: Settings },
    { id: 'optimize', label: 'Optimize', icon: ZoomIn },
    { id: 'effects', label: 'Effects', icon: Filter }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <ImageIcon className="w-8 h-8 text-blue-600" />
          Professional Image Processor
        </h2>
        <p className="text-gray-600">
          Comprehensive image processing with compression, resizing, filters, and advanced editing tools.
        </p>
      </div>

      {/* Analytics Toggle */}
      <div className="flex justify-between items-center">
        <Button
          onClick={() => setShowAnalytics(!showAnalytics)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          {showAnalytics ? 'Hide' : 'Show'} Analytics
        </Button>
        
        {files.length > 0 && (
          <div className="flex gap-2">
            <Button
              onClick={processImages}
              disabled={processing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process All Images'
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
        )}
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Processing Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalFiles}</div>
              <div className="text-sm text-gray-600">Total Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatFileSize(stats.originalSize)}</div>
              <div className="text-sm text-gray-600">Original Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatFileSize(stats.compressedSize)}</div>
              <div className="text-sm text-gray-600">Compressed Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatFileSize(stats.totalSavings)}</div>
              <div className="text-sm text-gray-600">Space Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.avgCompressionRatio.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Avg Compression</div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
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
          {/* Settings Content */}
          {activeTab === 'compression' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Compression Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality: {settings.quality}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={settings.quality}
                    onChange={(e) => setSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Size (KB)
                  </label>
                  <input
                    type="number"
                    value={settings.targetKB}
                    onChange={(e) => setSettings(prev => ({ ...prev, targetKB: e.target.value }))}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resize' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Resize Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Width (px)
                  </label>
                  <input
                    type="number"
                    value={settings.maxWidth}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxWidth: e.target.value }))}
                    placeholder="Original width"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Height (px)
                  </label>
                  <input
                    type="number"
                    value={settings.maxHeight}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxHeight: e.target.value }))}
                    placeholder="Original height"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transform' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Transform Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotation: {settings.rotation}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={settings.rotation}
                    onChange={(e) => setSettings(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.flipH}
                      onChange={(e) => setSettings(prev => ({ ...prev, flipH: e.target.checked }))}
                      className="mr-2"
                    />
                    Flip Horizontal
                  </label>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.flipV}
                      onChange={(e) => setSettings(prev => ({ ...prev, flipV: e.target.checked }))}
                      className="mr-2"
                    />
                    Flip Vertical
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'filters' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Filter Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brightness: {settings.brightness}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={settings.brightness}
                    onChange={(e) => setSettings(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contrast: {settings.contrast}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={settings.contrast}
                    onChange={(e) => setSettings(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saturation: {settings.saturation}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={settings.saturation}
                    onChange={(e) => setSettings(prev => ({ ...prev, saturation: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.grayscale}
                    onChange={(e) => setSettings(prev => ({ ...prev, grayscale: e.target.checked }))}
                    className="mr-2"
                  />
                  Grayscale
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.sepia}
                    onChange={(e) => setSettings(prev => ({ ...prev, sepia: e.target.checked }))}
                    className="mr-2"
                  />
                  Sepia
                </label>
              </div>
            </div>
          )}

          {activeTab === 'format' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Format Settings</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Format
                </label>
                <select
                  value={settings.format}
                  onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="original">Keep Original</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.removeExif}
                    onChange={(e) => setSettings(prev => ({ ...prev, removeExif: e.target.checked }))}
                    className="mr-2"
                  />
                  Remove EXIF Data (Privacy)
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Upload Images
        </h3>
        <p className="text-gray-500 mb-4">
          Drag and drop your images here, or click to browse
        </p>
        <input
          ref={fileInputRef}
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((fileObj) => (
              <div key={fileObj.id} className="border border-gray-200 rounded-lg p-4">
                <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                  <img
                    src={fileObj.processedPreview || fileObj.preview}
                    alt={fileObj.name}
                    className="w-full h-full object-cover"
                  />
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
                    <div>Original: {formatFileSize(fileObj.size)}</div>
                    {fileObj.processed && (
                      <>
                        <div>Processed: {formatFileSize(fileObj.processed.size)}</div>
                        <div className="text-green-600 font-medium">
                          Saved: {(((fileObj.size - fileObj.processed.size) / fileObj.size) * 100).toFixed(1)}%
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => openPreview(fileObj)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    {fileObj.processed && (
                      <Button
                        onClick={() => downloadFile(fileObj)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Original</h4>
                  <img
                    src={previewFile.preview}
                    alt="Original"
                    className="w-full rounded-lg border border-gray-200"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Size: {formatFileSize(previewFile.size)}
                  </p>
                </div>
                {previewFile.processedPreview && (
                  <div>
                    <h4 className="font-medium mb-2">Processed</h4>
                    <img
                      src={previewFile.processedPreview}
                      alt="Processed"
                      className="w-full rounded-lg border border-gray-200"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Size: {formatFileSize(previewFile.processed.size)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullFeaturedImageProcessor;

