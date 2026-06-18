import { authStore } from "@/store/auth.store";
import { useNavigate } from "react-router-dom";

const ProfileAvatar = () => {
  const navigate = useNavigate();
  const { user } = authStore();

  return (
    <button
      className="flex items-center cursor-pointer gap-2 bg-transparent border-0 p-0"
      onClick={() => navigate("/profile")}
    >
      <span className="text-sm text-muted-foreground">
        {user?.first_name || localStorage.getItem("user_name")}
      </span>
      <div className="w-10 h-10 border border-slate-100 rounded-full bg-secondary flex items-center justify-center">
        <img src={user?.image} className="object-cover rounded-full" alt={`${user?.first_name}'s avatar`} />
      </div>
    </button>
  );
};

export default ProfileAvatar;
