export function SectionHeading({
  eyebrow,
  title,
  copy,
  center = false,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  center?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <span className={`eyebrow ${center ? "justify-center before:hidden" : ""}`}>
        {eyebrow}
      </span>
      <h2 className="display-title mt-4 text-4xl leading-[1.05] sm:text-5xl">{title}</h2>
      {copy ? (
        <p className={`mt-5 text-base leading-8 ${dark ? "text-white/58" : "text-black/58"}`}>
          {copy}
        </p>
      ) : null}
    </div>
  );
}
