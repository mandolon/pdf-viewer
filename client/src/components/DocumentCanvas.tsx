
import { useEffect, useRef } from "react";
import { PDFDocument } from "./PDFViewer";

interface DocumentCanvasProps {
  pdfDocument: PDFDocument;
  currentPage: number;
  scale: number;
}

export const DocumentCanvas = ({ pdfDocument, currentPage, scale }: DocumentCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDocument || !canvasRef.current) return;

      try {
        const page = await pdfDocument.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;

        // Clear the canvas before rendering
        context.clearRect(0, 0, canvas.width, canvas.height);

        const viewport = page.getViewport({ scale });
        
        // Set canvas size based on the viewport
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Clear again after resize to ensure clean render
        context.clearRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (error) {
        console.error("Error rendering page:", error);
      }
    };

    renderPage();
  }, [pdfDocument, currentPage, scale]);

  return (
    <div className="p-4 min-h-full flex justify-center items-start">
      <div className="bg-white shadow-2xl rounded-sm overflow-visible">
        <canvas
          ref={canvasRef}
          className="block"
          style={{ 
            display: 'block'
          }}
        />
      </div>
    </div>
  );
};
