import { useState, useRef, useEffect, useCallback } from "react";
import { Toolbar } from "./Toolbar";
import { DocumentCanvas } from "./DocumentCanvas";
import { Sidebar } from "./Sidebar";
import * as pdfjsLib from "pdfjs-dist";
import { toast } from "sonner";

// Configure PDF.js worker to use local file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export interface PDFDocument {
  numPages: number;
  getPage: (pageNum: number) => Promise<any>;
}

export const PDFViewer = () => {
  const [pdfDocument, setPdfDocument] = useState<PDFDocument | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [autoFit, setAutoFit] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPDF = async (file: File) => {
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      
      // Calculate auto-fit scale for the first page
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });
      const containerHeight = window.innerHeight - 120; // Account for toolbar and padding
      const autoScale = Math.min(containerHeight / viewport.height, 2.0); // Max 2x zoom
      
      setScale(autoScale);
      setAutoFit(true);
      
      toast.success(`PDF loaded successfully! ${pdf.numPages} pages`);
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast.error("Failed to load PDF file");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      loadPDF(file);
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const openFile = () => {
    fileInputRef.current?.click();
  };

  const goToPage = useCallback(async (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      
      // If auto-fit is enabled, recalculate scale for the new page
      if (autoFit && pdfDocument) {
        try {
          const page = await pdfDocument.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.0 });
          const containerHeight = window.innerHeight - 120;
          const autoScale = Math.min(containerHeight / viewport.height, 2.0);
          setScale(autoScale);
        } catch (error) {
          console.error("Error recalculating auto-fit scale:", error);
        }
      }
    }
  }, [totalPages, autoFit, pdfDocument]);

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  // Enhanced zoom functions with better scaling steps
  const zoomIn = useCallback(() => {
    setAutoFit(false);
    setScale(prev => {
      const newScale = prev * 1.25;
      return Math.min(newScale, 5.0);
    });
  }, []);

  const zoomOut = useCallback(() => {
    setAutoFit(false);
    setScale(prev => {
      const newScale = prev / 1.25;
      return Math.max(newScale, 0.25);
    });
  }, []);

  const resetZoom = useCallback(() => {
    setAutoFit(false);
    setScale(1.0);
  }, []);
  
  const fitToHeight = useCallback(async () => {
    if (!pdfDocument) return;
    
    try {
      const page = await pdfDocument.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.0 });
      const containerHeight = window.innerHeight - 120; // Account for toolbar and padding
      const autoScale = Math.min(containerHeight / viewport.height, 2.0); // Max 2x zoom
      
      setScale(autoScale);
      setAutoFit(true);
    } catch (error) {
      console.error("Error calculating fit to height:", error);
    }
  }, [pdfDocument, currentPage]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!pdfDocument) return;
      
      switch (event.key) {
        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault();
          prevPage();
          break;
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          event.preventDefault();
          nextPage();
          break;
        case 'Home':
          event.preventDefault();
          goToPage(1);
          break;
        case 'End':
          event.preventDefault();
          goToPage(totalPages);
          break;
        case '+':
        case '=':
          event.preventDefault();
          zoomIn();
          break;
        case '-':
          event.preventDefault();
          zoomOut();
          break;
        case '0':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            resetZoom();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pdfDocument, totalPages, goToPage, zoomIn, zoomOut, resetZoom]);

  // Handle window resize for auto-fit
  useEffect(() => {
    const handleResize = async () => {
      if (autoFit && pdfDocument) {
        try {
          const page = await pdfDocument.getPage(currentPage);
          const viewport = page.getViewport({ scale: 1.0 });
          const containerHeight = window.innerHeight - 120;
          const autoScale = Math.min(containerHeight / viewport.height, 2.0);
          setScale(autoScale);
        } catch (error) {
          console.error("Error recalculating auto-fit on resize:", error);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [autoFit, pdfDocument, currentPage]);

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <Toolbar
        currentPage={currentPage}
        totalPages={totalPages}
        scale={scale}
        onOpenFile={openFile}
        onPrevPage={prevPage}
        onNextPage={nextPage}
        onGoToPage={goToPage}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onFitToWidth={fitToHeight}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        loading={loading}
      />

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <Sidebar
            pdfDocument={pdfDocument}
            currentPage={currentPage}
            onPageSelect={goToPage}
          />
        )}
        
        <div className="flex-1 bg-gray-600 overflow-auto">
          {pdfDocument ? (
            <DocumentCanvas
              pdfDocument={pdfDocument}
              currentPage={currentPage}
              scale={scale}
            />
          ) : (
            <div className="text-center text-gray-300 p-8">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-xl mb-2">No PDF loaded</h2>
              <p className="text-gray-400 mb-4">Click "Open File" to select a PDF document</p>
              <button
                onClick={openFile}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                Open File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
