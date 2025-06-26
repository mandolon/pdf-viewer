
import { useState, useRef, useEffect } from "react";
import { Toolbar } from "./Toolbar";
import { DocumentCanvas } from "./DocumentCanvas";
import { Sidebar } from "./Sidebar";
import * as pdfjsLib from "pdfjs-dist";
import { toast } from "sonner";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PDFDocument {
  numPages: number;
  getPage: (pageNum: number) => Promise<any>;
}

export const PDFViewer = () => {
  const [pdfDocument, setPdfDocument] = useState<PDFDocument | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
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

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const zoomIn = () => setScale(prev => Math.min(prev * 1.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.3));
  const resetZoom = () => setScale(1.0);
  const fitToWidth = () => setScale(1.2);

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
        onFitToWidth={fitToWidth}
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
        
        <div className="flex-1 bg-gray-600 flex items-center justify-center overflow-auto">
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
