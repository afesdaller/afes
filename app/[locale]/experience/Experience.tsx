import { useTranslations } from "next-intl";
import Image from "next/image";

interface Props {
  company: string;
  period: string;
  responsibilities: string;
  jobTitle: string;
  crs: string;
}

export default function Experience(props: Props) {
  const t = useTranslations("Experience");
  return (
    <div className="flex flex-col items-center gap-[10px]">
      <div className="flex flex-col items-center gap-[5px]">
        <div className="flex items-center justify-center gap-[15px]">
          <Image
            src={props.crs}
            alt={props.company}
            width={50}
            height={50}
            className={`h-[30px] w-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]`}
          />
          <h3 className="text-shadow text-bold text-center">{props.company}</h3>
          <Image
            src={props.crs}
            alt={props.company}
            width={50}
            height={50}
            className={`h-[30px] w-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]`}
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-[5px]">
        <p className="text-shadow">{props.jobTitle}</p>
      </div>
      <div className="flex flex-col items-center gap-[5px]">
        <p className="text-shadow">{props.period}</p>
      </div>
      <div className="flex flex-col items-center gap-[5px]">
        <p className="text-shadow text-center whitespace-pre-line">{t(props.responsibilities)}</p>
      </div>
    </div>
  );
}
