import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AccountFormModal() {
  return (
    <Button 
      className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:from-yellow-500 hover:to-yellow-700"
    >
      <Plus className="w-4 h-4 mr-2" />
      Create New Account
    </Button>
  );
}