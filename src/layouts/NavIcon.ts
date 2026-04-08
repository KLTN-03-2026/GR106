import {
  Wallet,
  Activity,
  Trees,
  GitFork,
  Sparkles,
  LucideIcon,
} from "lucide-react";

export interface NavIconItem {
  icon: LucideIcon;
  key: string;
}

export const NAV_ICONS: NavIconItem[] = [
  { icon: Wallet, key: "wallet" },
  { icon: Activity, key: "activity" },
  { icon: Trees, key: "tree" },
  { icon: GitFork, key: "task" },
  { icon: Sparkles, key: "gemini" },
];
