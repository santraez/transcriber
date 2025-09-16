import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface LangSelectProps {
  items: Record<string, string>;
  placeholder: string;
  defaultValue?: string;
  onValueChange: (value: string) => void;
}

export function LangSelect({
  items,
  placeholder,
  defaultValue,
  onValueChange,
}: LangSelectProps) {
  return (
    <Select defaultValue={defaultValue} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px] text-black">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(items).map(([k, v], i) => (
          <SelectItem key={i} value={k}>
            {titleCase(v)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function titleCase(str: string) {
  str = str.toLowerCase();
  return (str.match(/\w+.?/g) || [])
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
}
