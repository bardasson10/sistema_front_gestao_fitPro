

export const CircleColorView = ({ color, height, width }: { color: string | null | undefined, height?: number, width?: number }) => {
  return (
    <>
      {color ? (
        <div className="rounded-full border border-black dark:border-gray-500" style={{ backgroundColor: color, height: height || 16, width: width || 16 }} />
      ) :
        <div className="rounded-full" style={{ height: 0, width: width || 0 }} > nada </div>
      }
    </>

  );
}