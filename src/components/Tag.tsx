import type { TagId } from "@/lib/data";

const TAG_COLORS: Record<TagId, string> = {
  digital: "#5CC3FF",
  traditional: "#2150DD",
  concept: "#FF8740",
  sketch: "#F5CF11",
  comission: "#F14343",
  landscape: "#B3E460",
};

export function tagColor(id: TagId) {
  return TAG_COLORS[id];
}

interface TagProps {
  id: TagId;
  label: string;
  variant?: "outline" | "filled";
  active?: boolean;
  onClick?: () => void;
  as?: "button" | "span";
}

export default function Tag({
  id,
  label,
  variant = "outline",
  active = false,
  onClick,
  as = "span",
}: TagProps) {
  const color = TAG_COLORS[id];
  const filled = variant === "filled" || active;

  const style = filled
    ? { backgroundColor: color, borderColor: color, color: "#FBFAF6" }
    : { borderColor: color, color, backgroundColor: "transparent" };

  const className =
    "inline-flex items-center rounded-full border px-[18px] py-[5px] font-archivo text-[16px] font-medium leading-none transition-colors md:text-[18px]";

  if (as === "button") {
    return (
      <button type="button" onClick={onClick} className={className} style={style}>
        {label}
      </button>
    );
  }

  return (
    <span className={className} style={style}>
      {label}
    </span>
  );
}
