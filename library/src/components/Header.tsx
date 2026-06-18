import ProfileAvatar from "./ProfileAvatar";

const Header = ({ title }: { title: string }) => {
  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-border bg-card/50 backdrop-blur-md">
      <div className="text-sm text-muted-foreground pl-12 sm:pl-0">{title}</div>

      <ProfileAvatar />
    </header>
  );
};

export default Header;
