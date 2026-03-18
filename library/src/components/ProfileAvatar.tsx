import { authStore } from "@/store/auth.store";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileAvatar = () => {
  const navigate = useNavigate();
  const { user } = authStore();

  return (
    <div
      className="flex items-center cursor-pointer gap-2"
      onClick={() => navigate("/profile")}
    >
      <span className="text-sm text-muted-foreground">
        {user?.first_name || ""}
      </span>
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
        <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
      </div>
    </div>
  );
};

export default ProfileAvatar;
