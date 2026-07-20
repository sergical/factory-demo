import { HandRaisedIcon } from "@heroicons/react/16/solid";

export function Logo() {
  return (
    <span className="flex items-center gap-1.5 font-semibold">
      <HandRaisedIcon className="size-4 shrink-0 fill-orange-600 dark:fill-orange-500" />
      Handraise
    </span>
  );
}
