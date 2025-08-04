import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, Monitor, Palette, Check } from "lucide-react";

export function ThemeSwitcherModal() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const themeOptions = [
    {
      id: 'light' as const,
      name: 'Light',
      description: 'Clean and bright interface',
      icon: Sun,
      preview: 'bg-white border-gray-200 text-gray-900',
    },
    {
      id: 'dark' as const,
      name: 'Dark',
      description: 'Easy on the eyes',
      icon: Moon,
      preview: 'bg-gray-900 border-gray-700 text-white',
    },
    {
      id: 'auto' as const,
      name: 'Auto',
      description: 'Follows system settings',
      icon: Monitor,
      preview: 'bg-gradient-to-r from-gray-100 to-gray-900 border-gray-400 text-gray-600',
    }
  ];

  const handleThemeChange = (newTheme: "dark" | "light" | "auto") => {
    setTheme(newTheme);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" data-theme-modal>
          <Palette className="h-4 w-4" />
          Theme
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Choose Theme
          </DialogTitle>
          <DialogDescription>
            Select your preferred interface theme
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          {themeOptions.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className={`justify-start h-auto p-4 ${
                theme === option.id 
                  ? 'ring-2 ring-blue-500 dark:ring-yellow-500 bg-blue-50 dark:bg-yellow-500/10' 
                  : ''
              }`}
              onClick={() => handleThemeChange(option.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg ${option.preview} border`}>
                  <option.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{option.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {option.description}
                  </div>
                </div>
                {theme === option.id && (
                  <Check className="h-4 w-4 text-blue-500 dark:text-yellow-500" />
                )}
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}