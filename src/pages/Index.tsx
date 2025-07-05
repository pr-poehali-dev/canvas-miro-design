import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface CanvasElement {
  id: string;
  type: "sticky" | "text" | "rectangle" | "circle";
  x: number;
  y: number;
  content: string;
  color?: string;
  width?: number;
  height?: number;
}

const Index = () => {
  const [selectedTool, setSelectedTool] = useState<string>("cursor");
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const tools = [
    { id: "cursor", icon: "MousePointer", label: "Курсор" },
    { id: "hand", icon: "Hand", label: "Рука" },
    { id: "rectangle", icon: "Square", label: "Прямоугольник" },
    { id: "circle", icon: "Circle", label: "Круг" },
    { id: "pen", icon: "Pen", label: "Ручка" },
    { id: "sticky", icon: "StickyNote", label: "Стикер" },
    { id: "text", icon: "Type", label: "Текст" },
    { id: "image", icon: "Image", label: "Изображение" },
  ];

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (selectedTool === "cursor" || selectedTool === "hand" || isPanning)
      return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - canvasOffset.x) / zoom;
    const y = (e.clientY - rect.top - canvasOffset.y) / zoom;

    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: selectedTool as CanvasElement["type"],
      x,
      y,
      content:
        selectedTool === "sticky"
          ? "Новая заметка"
          : selectedTool === "text"
            ? "Текст"
            : "",
      color:
        selectedTool === "sticky"
          ? "#FEF7CD"
          : selectedTool === "rectangle"
            ? "#E3F2FD"
            : selectedTool === "circle"
              ? "#F3E5F5"
              : "#4285F4",
      width:
        selectedTool === "rectangle"
          ? 120
          : selectedTool === "circle"
            ? 80
            : 160,
      height:
        selectedTool === "rectangle"
          ? 80
          : selectedTool === "circle"
            ? 80
            : 100,
    };

    setElements([...elements, newElement]);
  };

  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    if (selectedTool !== "cursor") return;

    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    setDraggedElement(elementId);
    setDragOffset({
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedElement) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setElements(
      elements.map((el) => (el.id === draggedElement ? { ...el, x, y } : el)),
    );
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
    setIsPanning(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (selectedTool === "hand") {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.3));
  };

  const handleResetView = () => {
    setZoom(1);
    setCanvasOffset({ x: 0, y: 0 });
  };

  const renderElement = (element: CanvasElement) => {
    const baseClasses = "canvas-element absolute select-none";

    switch (element.type) {
      case "sticky":
        return (
          <Card
            key={element.id}
            className={`${baseClasses} p-3 shadow-md`}
            style={{
              left: element.x,
              top: element.y,
              backgroundColor: element.color,
              width: element.width,
              height: element.height,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element.id)}
          >
            <div className="text-sm font-medium text-gray-800">
              {element.content}
            </div>
          </Card>
        );
      case "text":
        return (
          <div
            key={element.id}
            className={`${baseClasses} p-2 text-lg font-semibold text-gray-800`}
            style={{ left: element.x, top: element.y }}
            onMouseDown={(e) => handleElementMouseDown(e, element.id)}
          >
            {element.content}
          </div>
        );
      case "rectangle":
        return (
          <div
            key={element.id}
            className={`${baseClasses} border-2 border-primary bg-primary/10 rounded-md`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element.id)}
          />
        );
      case "circle":
        return (
          <div
            key={element.id}
            className={`${baseClasses} border-2 border-primary bg-primary/10 rounded-full`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element.id)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-center">
        <div className="flex items-center space-x-1 bg-gray-700 rounded-xl p-1">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? "default" : "ghost"}
              size="sm"
              className={`w-12 h-12 rounded-xl transition-all duration-200 ${
                selectedTool === tool.id
                  ? "bg-white text-gray-800 shadow-lg"
                  : "hover:bg-gray-600 text-gray-300"
              }`}
              onClick={() => setSelectedTool(tool.id)}
              title={tool.label}
            >
              <Icon name={tool.icon} size={20} />
            </Button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          className="canvas-container w-full h-full absolute inset-0 bg-white"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            cursor:
              selectedTool === "hand"
                ? "grab"
                : isPanning
                  ? "grabbing"
                  : "default",
          }}
          onClick={handleCanvasClick}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Canvas elements */}
          {elements.map(renderElement)}

          {/* Instructions */}
          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-400 animate-fade-in">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                  <Icon
                    name="Sparkles"
                    size={48}
                    className="mx-auto mb-4 text-blue-400"
                  />
                  <h2 className="text-xl font-semibold mb-2 text-gray-700">
                    Выберите инструмент и кликните на холсте
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Создавайте стикеры, заметки, фигуры и диаграммы
                  </p>
                  <div className="flex justify-center space-x-4">
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Icon name="StickyNote" size={16} />
                      <span>Стикеры</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Icon name="Square" size={16} />
                      <span>Фигуры</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Icon name="Type" size={16} />
                      <span>Текст</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-gray-100 border-t px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Элементов: {elements.length}</span>
          <span>
            Инструмент: {tools.find((t) => t.id === selectedTool)?.label}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500"
            title="Увеличить"
            onClick={handleZoomIn}
          >
            <Icon name="ZoomIn" size={16} className="mr-1" />
            {Math.round(zoom * 100)}%
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500"
            title="Уменьшить"
            onClick={handleZoomOut}
          >
            <Icon name="ZoomOut" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500"
            title="Сбросить вид"
            onClick={handleResetView}
          >
            <Icon name="RotateCcw" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500"
            title="Очистить холст"
            onClick={() => setElements([])}
          >
            <Icon name="Trash2" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
