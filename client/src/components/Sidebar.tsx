
import { useState, useEffect, useRef } from "react";
import { PDFDocument } from "./PDFViewer";

interface SidebarProps {
  pdfDocument: PDFDocument | null;
  currentPage: number;
  onPageSelect: (page: number) => void;
}

interface ThumbnailProps {
  pdfDocument: PDFDocument;
  pageNumber: number;
  isActive: boolean;
  onClick: () => void;
}

const Thumbnail = ({ pdfDocument, pageNumber, isActive, onClick }: ThumbnailProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const renderThumbnail = async () => {
      if (!pdfDocument || !canvasRef.current) return;

      try {
        const page = await pdfDocument.getPage(pageNumber);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;

        const viewport = page.getViewport({ scale: 0.2 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (error) {
        console.error("Error rendering thumbnail:", error);
      }
    };

    renderThumbnail();
  }, [pdfDocument, pageNumber]);

  return (
    <div
      onClick={onClick}
      className={`p-2 cursor-pointer transition-colors border-2 rounded ${
        isActive 
          ? 'border-blue-500 bg-blue-900/30' 
          : 'border-transparent hover:border-gray-500 hover:bg-gray-700'
      }`}
    >
      <div className="bg-white rounded shadow-sm">
        <canvas ref={canvasRef} className="block w-full h-auto" />
      </div>
      <div className="text-center text-xs text-gray-300 mt-1">
        {pageNumber}
      </div>
    </div>
  );
};

export const Sidebar = ({ pdfDocument, currentPage, onPageSelect }: SidebarProps) => {
  const [thumbnails, setThumbnails] = useState<number[]>([]);

  useEffect(() => {
    if (pdfDocument) {
      const pageNumbers = Array.from({ length: pdfDocument.numPages }, (_, i) => i + 1);
      setThumbnails(pageNumbers);
    }
  }, [pdfDocument]);

  if (!pdfDocument) return null;

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-600 flex flex-col">
      <div className="p-4 border-b border-gray-600">
        <h3 className="text-white font-medium">Page Thumbnails</h3>
      </div>
      
      <div className="flex-1 overflow-auto p-2 space-y-2">
        {thumbnails.map((pageNumber) => (
          <Thumbnail
            key={pageNumber}
            pdfDocument={pdfDocument}
            pageNumber={pageNumber}
            isActive={pageNumber === currentPage}
            onClick={() => onPageSelect(pageNumber)}
          />
        ))}
      </div>
    </div>
  );
};
