import { useState, useEffect, useCallback } from "react";

interface Point {
  x: number;
  y: number;
  age: number;
}

export default function MouseStyle() {
  const [points, setPoints] = useState<Point[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Constantes para valores que se repiten
  const UPDATE_POINTS_MAX_LENGTH = 95;
  const POINTS_AGE_LIMIT = 15;
  const INTERVAL_MS = 12;
  const STROKE_WIDTH_START = 4;
  const LAST_TIME_COMPARISON = 3000;
  const FPS = 200;

  // Color RGB original
  const STROKE_COLOR_RGB = [130, 130, 130];
  const STROKE_OPACITY = 1;

  const updatePoints = useCallback((newPoint: Point) => {
    setPoints((prevPoints) => {
      const updatedPoints = [...prevPoints, newPoint];
      if (updatedPoints.length > UPDATE_POINTS_MAX_LENGTH) {
        return updatedPoints.slice(-UPDATE_POINTS_MAX_LENGTH);
      }
      return updatedPoints;
    });
  }, []);

  useEffect(() => {
    let lastTime = 0;
    const AGE = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const currentTime = performance.now();
      if (currentTime - lastTime > LAST_TIME_COMPARISON / FPS) {
        const newPoint = { x: event.clientX, y: event.clientY, age: AGE };
        updatePoints(newPoint);
        setIsVisible(true);
        lastTime = currentTime;
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const updatePointsAge = () => {
      setPoints((prevPoints) =>
        prevPoints
          .map((point) => ({ ...point, age: point.age + 1 }))
          .filter((point) => point.age < POINTS_AGE_LIMIT),
      );
    };

    const intervalId = setInterval(updatePointsAge, INTERVAL_MS);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearInterval(intervalId);
    };
  }, [updatePoints]);

  const createPath = (points: Point[]) => {
    if (points.length < 2) return "";

    const start = points[0];
    let path = `M ${start.x} ${start.y}`;

    for (let i = 1; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];

      const controlPointX = (current.x + next.x) / 2;
      const controlPointY = (current.y + next.y) / 2;

      path += ` Q ${current.x} ${current.y}, ${controlPointX} ${controlPointY}`;
    }

    return path;
  };

  return (
    <>
      {isVisible && (
        <svg className="pointer-events-none fixed left-0 top-0 h-full w-full">
          <path
            d={createPath(points)}
            fill="none"
            stroke={`rgba(${STROKE_COLOR_RGB.join(",")}, ${STROKE_OPACITY})`} // Color original RGB
            strokeWidth={STROKE_WIDTH_START}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );
}
