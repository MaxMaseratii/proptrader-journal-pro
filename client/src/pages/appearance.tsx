import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  Eye, 
  Settings,
  Check
} from "lucide-react";

export default function Appearance() {
  const { theme, setTheme } = useTheme();
  const [previewTheme, setPreviewTheme] = useState(theme);

  const themeOptions = [
    {
      id: 'light',
      name: 'Light',
      description: 'Clean and bright interface for daytime trading',
      icon: Sun,
      preview: 'bg-white border-gray-200 text-gray-900',
      recommended: false
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Easy on the eyes for extended trading sessions',
      icon: Moon,
      preview: 'bg-gray-900 border-gray-700 text-white',
      recommended: true
    },
    {
      id: 'auto',
      name: 'Auto',
      description: 'Automatically switches based on system settings',
      icon: Monitor,
      preview: 'bg-gradient-to-r from-gray-100 to-gray-900 border-gray-400 text-gray-600',
      recommended: false
    }
  ];

  const handleThemeChange = (newTheme: "dark" | "light" | "auto") => {
    setTheme(newTheme);
    setPreviewTheme(newTheme);
  };

  const previewApplyTheme = (selectedTheme: "dark" | "light" | "auto") => {
    setPreviewTheme(selectedTheme);
  };

  const resetPreview = () => {
    setPreviewTheme(theme);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Palette className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance Settings</h1>
              <p className="text-gray-600 dark:text-gray-400">Customize your trading interface theme</p>
            </div>
          </div>
          
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
            <Eye className="h-3 w-3 mr-1" />
            Optimized for prop traders
          </Badge>
        </div>

        {/* Theme Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Theme Mode</span>
            </CardTitle>
            <CardDescription>
              Choose your preferred interface theme. Dark mode is recommended for extended trading sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={theme} onValueChange={handleThemeChange} className="space-y-4">
              {themeOptions.map((option) => (
                <div key={option.id} className="relative">
                  <div 
                    className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      theme === option.id 
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => handleThemeChange(option.id as "dark" | "light" | "auto")}
                    onMouseEnter={() => previewApplyTheme(option.id as "dark" | "light" | "auto")}
                    onMouseLeave={resetPreview}
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <option.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={option.id} className="font-medium cursor-pointer">
                            {option.name}
                          </Label>
                          {option.recommended && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              Recommended
                            </Badge>
                          )}
                          {theme === option.id && (
                            <Check className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    {/* Theme Preview */}
                    <div className={`w-20 h-12 rounded border-2 ${option.preview} flex items-center justify-center text-xs font-medium transition-all duration-200`}>
                      Preview
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Additional Theme Info */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Benefits for Prop Traders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-900 text-white rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Moon className="h-5 w-5 text-yellow-400" />
                  <span className="font-medium">Dark Mode Benefits</span>
                </div>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Reduces eye strain during long sessions</li>
                  <li>• Better focus on charts and data</li>
                  <li>• Preferred by 90% of professional traders</li>
                  <li>• Saves battery on mobile devices</li>
                </ul>
              </div>
              
              <div className="p-4 bg-white text-gray-900 rounded-lg border">
                <div className="flex items-center space-x-2 mb-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Light Mode Benefits</span>
                </div>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Better readability in bright environments</li>
                  <li>• Ideal for documentation and reports</li>
                  <li>• Easier color differentiation</li>
                  <li>• Familiar interface for new users</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={() => {
              // Theme is already saved automatically
              window.history.back();
            }}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
          >
            <Check className="h-4 w-4 mr-2" />
            Settings Saved
          </Button>
        </div>
      </div>
    </div>
  );
}