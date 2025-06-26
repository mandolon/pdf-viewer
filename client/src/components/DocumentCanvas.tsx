
import { useEffect, useRef } from "react";
import { PDFDocument } from "./PDFViewer";

interface DocumentCanvasProps {
  pdfDocument: PDFDocument;
  currentPage: number;
  scale: number;
}

export const DocumentCanvas = ({ pdfDocument, currentPage, scale }: DocumentCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDocument || !canvasRef.current) return;

      try {
        const page = await pdfDocument.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;

        const viewport = page.getViewport({ scale });
        
        // Set up high DPI rendering for crisp text
        const devicePixelRatio = window.devicePixelRatio || 1;
        const scaledViewport = page.getViewport({ scale: scale * devicePixelRatio });
        
        // Set canvas size for high DPI
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        
        // Scale the canvas back down using CSS
        canvas.style.width = viewport.width + 'px';
        canvas.style.height = viewport.height + 'px';
        
        // Scale the drawing context so everything draws at the higher resolution
        context.scale(devicePixelRatio, devicePixelRatio);
        
        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        // Render text layer for text selection
        if (textLayerRef.current) {
          const textLayer = textLayerRef.current;
          textLayer.innerHTML = ''; // Clear previous text layer
          
          // Set text layer dimensions to match the viewport
          textLayer.style.width = `${viewport.width}px`;
          textLayer.style.height = `${viewport.height}px`;
          
          const textContent = await page.getTextContent();
          
          // Create text layer elements
          textContent.items.forEach((textItem: any) => {
            if (textItem.str && textItem.str.trim()) {
              const textDiv = document.createElement('div');
              const transform = textItem.transform;
              
              // Apply CSS transform to position text elements correctly
              const x = transform[4] * scale;
              const y = (viewport.height - transform[5] * scale);
              const scaleX = transform[0] * scale;
              const scaleY = Math.abs(transform[3]) * scale;
              
              textDiv.style.position = 'absolute';
              textDiv.style.left = `${x}px`;
              textDiv.style.top = `${y - scaleY}px`;
              textDiv.style.fontSize = `${scaleY}px`;
              textDiv.style.fontFamily = textItem.fontName || 'sans-serif';
              textDiv.style.transform = `scaleX(${scaleX / scaleY})`;
              textDiv.style.transformOrigin = '0% 0%';
              textDiv.style.color = 'transparent';
              textDiv.style.pointerEvents = 'all';
              textDiv.style.userSelect = 'text';
              textDiv.style.cursor = 'text';
              textDiv.style.whiteSpace = 'pre';
              textDiv.textContent = textItem.str;
              
              textLayer.appendChild(textDiv);
            }
          });
        }
      } catch (error) {
        console.error("Error rendering page:", error);
      }
    };

    renderPage();
  }, [pdfDocument, currentPage, scale]);

  return (
    <div className="p-4 min-h-full flex justify-center items-start">
      <div className="bg-white shadow-2xl rounded-sm overflow-visible relative">
        <canvas
          ref={canvasRef}
          className="block"
          style={{ 
            display: 'block'
          }}
        />
        <div
          ref={textLayerRef}
          className="textLayer"
          style={{
            userSelect: 'text',
            pointerEvents: 'auto'
          }}
        />
      </div>
    </div>
  );
};
