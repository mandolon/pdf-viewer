
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
      
      // Set text layer dimensions
      textLayer.style.width = `${viewport.width}px`;
      textLayer.style.height = `${viewport.height}px`;
      
      try {
        const textContent = await page.getTextContent();
        
        // Use PDF.js text layer builder approach
        textContent.items.forEach((textItem: any, index: number) => {
          if (textItem.str && textItem.str.trim()) {
            const textDiv = document.createElement('div');
            const transform = textItem.transform;
            
            // More accurate text positioning based on PDF.js source
            const tx = transform[4];
            const ty = transform[5];
            const rotation = Math.atan2(transform[1], transform[0]);
            
            let scaleX = Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]);
            let scaleY = Math.sqrt(transform[2] * transform[2] + transform[3] * transform[3]);
            
            if (transform[0] < 0) scaleX = -scaleX;
            if (transform[3] < 0) scaleY = -scaleY;
            
            const fontSize = Math.abs(scaleY);
            
            textDiv.style.position = 'absolute';
            textDiv.style.left = `${tx}px`;
            textDiv.style.top = `${ty - fontSize}px`;
            textDiv.style.fontSize = `${fontSize}px`;
            textDiv.style.fontFamily = textItem.fontName || 'sans-serif';
            textDiv.style.transformOrigin = '0% 0%';
            
            // Apply rotation and scaling
            let transform_str = `rotate(${rotation}rad)`;
            if (Math.abs(scaleX) !== fontSize) {
              transform_str += ` scaleX(${scaleX / fontSize})`;
            }
            textDiv.style.transform = transform_str;
            
            // Text layer styling for selection
            textDiv.style.color = 'transparent';
            textDiv.style.pointerEvents = 'all';
            textDiv.style.userSelect = 'text';
            textDiv.style.cursor = 'text';
            textDiv.style.whiteSpace = 'pre';
            textDiv.style.lineHeight = '1';
            textDiv.style.overflow = 'visible';
            
            // Handle text direction for RTL languages
            if (textItem.dir) {
              textDiv.dir = textItem.dir;
            }
            
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
            pointerEvents: 'auto',
            opacity: isRendering ? 0 : 1,
            transition: 'opacity 0.2s ease-in-out'
          }}
        />
      </div>
    </div>
  );
};
