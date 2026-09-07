import { useEffect, useRef, type PointerEvent } from "react";
import Icon from "./Icon";

export type Photograph = {
  src: string;
  title: string;
  location: string;
  alt: string;
  url: string;
  width: number;
  height: number;
};
export default function PhotoCollection({
  photos,
  paused,
}: {
  photos: Photograph[];
  paused: boolean;
}) {
  const collectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = collectionRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.dataset.visible = "true";
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const tilt = (event: PointerEvent<HTMLAnchorElement>) => {
    if (paused || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--rx", `${-y * 5}deg`);
    event.currentTarget.style.setProperty("--ry", `${x * 5}deg`);
    event.currentTarget.style.setProperty("--pan-x", `${-x * 1.5}%`);
    event.currentTarget.style.setProperty("--pan-y", `${-y * 1.5}%`);
  };
  const reset = (event: PointerEvent<HTMLAnchorElement>) => {
    for (const key of ["--rx", "--ry", "--pan-x", "--pan-y"])
      event.currentTarget.style.removeProperty(key);
  };
  return (
    <div className="photo-collection" ref={collectionRef}>
      {photos.map((photo, index) => (
        <a
          className="photo-sheet"
          key={photo.src}
          href={photo.url}
          target="_blank"
          rel="noreferrer"
          onPointerMove={tilt}
          onPointerLeave={reset}
          onPointerCancel={reset}
          aria-label={`View ${photo.title} by oadtz on Pixabay`}
        >
          <figure>
            <div className="photo-frame">
              <img
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
                sizes="(max-width: 700px) 82vw, 30vw"
              />
            </div>
            <figcaption>
              <div>
                <span className="photo-location">{photo.location}</span>
                <strong>{photo.title}</strong>
              </div>
              <span className="photo-counter">
                0{index + 1}
                <Icon name="external" />
              </span>
            </figcaption>
          </figure>
        </a>
      ))}
    </div>
  );
}
