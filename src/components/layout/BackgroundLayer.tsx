interface BackgroundLayerProps {
  image: string;
}

export default function BackgroundLayer({ image }: BackgroundLayerProps) {
  return <div className="bg-layer" style={{ backgroundImage: `url(${image})` }} />;
}