import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Header({ onSettingsClick }) {
    return (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🥗</span>
                        <span className="font-serif text-2xl font-bold text-foreground tracking-tight">
                            Crisper
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onSettingsClick}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Settings className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}

export default Header;
