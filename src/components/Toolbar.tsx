
import { 
  Menu, 
  FolderOpen, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Maximize2,
  Loader2
} from "lucide-react";
import { useState } from "react";

interface ToolbarProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  onOpenFile: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToWidth: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  loading: boolean;
}

export const Toolbar = ({
  currentPage,
  totalPages,
  scale,
  onOpenFile,
  onPrevPage,
  onNextPage,
  onGoToPage,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToWidth,
  onToggleSidebar,
  sidebarOpen,
  loading
}: ToolbarProps) => {
  const [pageInput, setPageInput] = useState(currentPage.toString());

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput);
    if (!isNaN(pageNum)) {
      onGoToPage(pageNum);
    }
    setPageInput(currentPage.toString());
  };

  const scalePercentage = Math.round(scale * 100);

  return (
    <div className="bg-gray-700 border-b border-gray-600 px-4 py-2 flex items-center gap-4 text-white shadow-lg">
      {/* Left section - File operations */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded hover:bg-gray-600 transition-colors ${sidebarOpen ? 'bg-gray-600' : ''}`}
          title="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
        
        <button
          onClick={onOpenFile}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FolderOpen size={16} />
          )}
          Open
        </button>
      </div>

      {/* Center section - Navigation */}
      {totalPages > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            className="p-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          <form onSubmit={handlePageSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => setPageInput(currentPage.toString())}
              className="w-12 px-2 py-1 text-center bg-gray-800 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            <span className="text-sm text-gray-300">of {totalPages}</span>
          </form>

          <button
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className="p-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Right section - Zoom controls */}
      {totalPages > 0 && (
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onZoomOut}
            className="p-2 rounded hover:bg-gray-600 transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={18} />
          </button>

          <button
            onClick={onResetZoom}
            className="px-3 py-1 text-sm bg-gray-800 border border-gray-600 rounded hover:bg-gray-700 transition-colors min-w-[60px]"
            title="Reset zoom"
          >
            {scalePercentage}%
          </button>

          <button
            onClick={onZoomIn}
            className="p-2 rounded hover:bg-gray-600 transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={18} />
          </button>

          <div className="w-px h-6 bg-gray-600 mx-2" />

          <button
            onClick={onFitToWidth}
            className="p-2 rounded hover:bg-gray-600 transition-colors"
            title="Fit to width"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
