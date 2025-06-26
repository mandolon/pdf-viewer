
import { useEffect, useRef, useState } from "react";
import { PDFDocument } from "./PDFViewer";

interface DocumentCanvasProps {
  pdfDocument: PDFDocument;
  currentPage: number;
  scale: number;
}

export const DocumentCanvas = ({ pdfDocument, currentPage, scale }: DocumentCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDocument || !canvasRef.current) return;

      // Cancel any ongoing render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      setIsRendering(true);

      try {
        const page = await pdfDocument.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;

        // Calculate optimal rendering scale for crisp display
        const devicePixelRatio = window.devicePixelRatio || 1;
        const outputScale = devicePixelRatio * scale;
        const viewport = page.getViewport({ scale: outputScale });

        // Set canvas dimensions
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = Math.floor(viewport.width / devicePixelRatio) + 'px';
        canvas.style.height = Math.floor(viewport.height / devicePixelRatio) + 'px';

        // Reset transform and clear canvas
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Improved rendering context with intent and background
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          intent: 'display',
          enableWebGL: false,
          renderInteractiveForms: false,
          optionalContentConfigPromise: null,
        };

        // Start rendering with cancellation support
        renderTaskRef.current = page.render(renderContext);
        
        await renderTaskRef.current.promise;
        renderTaskRef.current = null;

        // Render text layer for text selection
        await renderTextLayer(page, scale);

      } catch (error) {
        if ((error as any)?.name !== 'RenderingCancelledException') {
          console.error("Error rendering page:", error);
        }
      } finally {
        setIsRendering(false);
      }
    };

    const renderTextLayer = async (page: any, currentScale: number) => {
      if (!textLayerRef.current) return;

      const textLayer = textLayerRef.current;
      textLayer.innerHTML = ''; // Clear previous text layer
      
      const viewport = page.getViewport({ scale: currentScale });
      
      // Set text layer dimensions to match canvas
      textLayer.style.width = `${viewport.width}px`;
      textLayer.style.height = `${viewport.height}px`;
      
      try {
        const textContent = await page.getTextContent();
        
        // Simplified text layer approach for better compatibility
        textContent.items.forEach((textItem: any) => {
          if (textItem.str && textItem.str.trim()) {
            const textDiv = document.createElement('div');
            const transform = textItem.transform;
            
            // Calculate position and scale
            const x = transform[4];
            const y = transform[5];
            const scaleX = transform[0];
            const scaleY = transform[3];
            
            // Calculate font size from the transformation matrix
            const fontSize = Math.abs(scaleY);
            
            // Position the text div
            textDiv.style.position = 'absolute';
            textDiv.style.left = `${x}px`;
            textDiv.style.top = `${viewport.height - y - fontSize}px`;
            textDiv.style.fontSize = `${fontSize}px`;
            textDiv.style.fontFamily = textItem.fontName || 'sans-serif';
            
            // Scale horizontally if needed
            if (Math.abs(scaleX) !== fontSize) {
              textDiv.style.transform = `scaleX(${scaleX / fontSize})`;
              textDiv.style.transformOrigin = '0% 0%';
            }
            
            // Essential styles for text selection
            textDiv.style.color = 'transparent';
            textDiv.style.userSelect = 'text';
            textDiv.style.pointerEvents = 'auto';
            textDiv.style.cursor = 'text';
            textDiv.style.whiteSpace = 'pre';
            textDiv.style.lineHeight = '1';
            textDiv.style.margin = '0';
            textDiv.style.padding = '0';
            textDiv.style.border = 'none';
            textDiv.style.background = 'transparent';
            
            textDiv.textContent = textItem.str;
            textLayer.appendChild(textDiv);
          }
        });
      } catch (error) {
        console.error("Error rendering text layer:", error);
      }
    };

    renderPage();

    // Cleanup function
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDocument, currentPage, scale]);

  return (
    <div className="p-4 min-h-full flex justify-center items-start">
      <div className="bg-white shadow-2xl rounded-sm overflow-visible relative pdf-container">
        {isRendering && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="block"
          style={{ 
            display: 'block',
            transition: 'opacity 0.2s ease-in-out',
            opacity: isRendering ? 0.5 : 1
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
