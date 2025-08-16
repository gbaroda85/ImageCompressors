import React, { useState } from 'react';
import { Image as ImageIcon, FileText, Home, Info, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FullFeaturedImageProcessor from './components/FullFeaturedImageProcessor';
import FullFeaturedPdfProcessor from './components/FullFeaturedPdfProcessor';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'image-compressor':
        return <FullFeaturedImageProcessor />;
      case 'pdf-processor':
        return <FullFeaturedPdfProcessor />;
      case 'home':
      default:
        return (
          <div className="max-w-6xl mx-auto p-6 space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <h1 className="text-5xl font-bold text-gray-800 leading-tight">
                Professional Image & PDF
                <span className="block text-blue-600">Processing Tools</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Compress images, convert PDFs, merge documents, and more. All processing happens in your browser for complete privacy and security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setActiveTab('image-compressor')}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
                >
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Start Compressing Images
                </Button>
                <Button
                  onClick={() => setActiveTab('pdf-processor')}
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-2"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Process PDF Files
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Image Compression</h3>
                <p className="text-gray-600 mb-4">
                  Reduce image file sizes while maintaining quality. Supports JPEG, PNG, WebP, and more formats.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Adjustable quality settings</li>
                  <li>• Batch processing</li>
                  <li>• Multiple format support</li>
                  <li>• Real-time preview</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">PDF Processing</h3>
                <p className="text-gray-600 mb-4">
                  Convert images to PDF, extract images from PDFs, merge multiple documents, and more.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Image to PDF conversion</li>
                  <li>• PDF to image extraction</li>
                  <li>• Merge multiple PDFs</li>
                  <li>• High-quality output</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Privacy First</h3>
                <p className="text-gray-600 mb-4">
                  All processing happens locally in your browser. Your files never leave your device.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• No file uploads to servers</li>
                  <li>• Complete data privacy</li>
                  <li>• GDPR compliant</li>
                  <li>• Secure processing</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Fast & Efficient</h3>
                <p className="text-gray-600 mb-4">
                  Optimized algorithms ensure fast processing even for large files and batch operations.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Lightning-fast processing</li>
                  <li>• Batch operations</li>
                  <li>• Memory optimized</li>
                  <li>• No file size limits</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Info className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy to Use</h3>
                <p className="text-gray-600 mb-4">
                  Intuitive interface with drag-and-drop support. No technical knowledge required.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Drag & drop interface</li>
                  <li>• Real-time feedback</li>
                  <li>• Mobile responsive</li>
                  <li>• One-click downloads</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Professional Quality</h3>
                <p className="text-gray-600 mb-4">
                  Enterprise-grade tools that deliver professional results for all your document needs.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• High-quality output</li>
                  <li>• Professional algorithms</li>
                  <li>• Format preservation</li>
                  <li>• Metadata handling</li>
                </ul>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Files</h3>
                  <p className="text-gray-600">
                    Drag and drop your images or PDF files, or click to browse and select files from your device.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Process</h3>
                  <p className="text-gray-600">
                    Choose your settings and click process. All operations happen locally in your browser for privacy.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Download</h3>
                  <p className="text-gray-600">
                    Download your processed files individually or all at once. Files are ready in seconds.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-blue-600 rounded-2xl p-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">100%</div>
                  <div className="text-blue-100">Privacy Protected</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">∞</div>
                  <div className="text-blue-100">File Size Limit</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">10+</div>
                  <div className="text-blue-100">File Formats</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">0₹</div>
                  <div className="text-blue-100">Completely Free</div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Professional Tools
              </h1>
              <span className="ml-3 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Image & PDF Processing
              </span>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'home'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={() => setActiveTab('image-compressor')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'image-compressor'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Image Tools
              </button>
              <button
                onClick={() => setActiveTab('pdf-processor')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'pdf-processor'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                PDF Tools
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold mb-4">Professional Image & PDF Tools</h3>
              <p className="text-gray-300 mb-4">
                Free, secure, and powerful tools for all your image compression and PDF processing needs. 
                All processing happens locally in your browser for complete privacy.
              </p>
              <div className="flex space-x-4">
                <div className="bg-gray-700 px-3 py-1 rounded-full text-sm">Privacy First</div>
                <div className="bg-gray-700 px-3 py-1 rounded-full text-sm">100% Free</div>
                <div className="bg-gray-700 px-3 py-1 rounded-full text-sm">No Limits</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Image Tools</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Image Compression</li>
                <li>Format Conversion</li>
                <li>Batch Processing</li>
                <li>Quality Control</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">PDF Tools</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Image to PDF</li>
                <li>PDF to Image</li>
                <li>Merge PDFs</li>
                <li>Split PDFs</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Professional Image & PDF Tools. All rights reserved. 
              <span className="block mt-2">Secure • Fast • Privacy-First • Completely Free</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

