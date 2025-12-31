import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function WelcomeScreen({ onDismiss }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-3xl p-8 text-center shadow-2xl animate-slideUp">
                <div className="mb-6">
                    <span className="text-7xl inline-block animate-bounce">🥗</span>
                </div>

                <h1 className="font-serif text-3xl font-bold text-foreground mb-3">Welcome to Crisper!</h1>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                    Your AI-powered kitchen companion that transforms ingredients into delicious meals
                </p>

                <div className="space-y-3 text-left mb-8">
                    {[
                        { emoji: '1️⃣', title: 'Add Your Ingredients', desc: 'Type what\'s in your fridge or snap a photo' },
                        { emoji: '2️⃣', title: 'Set Your Preferences', desc: 'Choose dietary needs, cooking time, and difficulty' },
                        { emoji: '3️⃣', title: 'Get Recipes', desc: 'AI generates personalized recipes just for you' }
                    ].map((step, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
                            <span className="text-xl">{step.emoji}</span>
                            <div>
                                <h3 className="font-semibold text-foreground text-sm">{step.title}</h3>
                                <p className="text-muted-foreground text-sm">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <Button size="lg" className="w-full gap-2" onClick={onDismiss}>
                    Let's Cook!
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}

export default WelcomeScreen;
