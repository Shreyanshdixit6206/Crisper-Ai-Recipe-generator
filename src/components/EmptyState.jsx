import { Button } from '@/components/ui/button';
import { exampleIngredients } from '../data/ingredients';

function EmptyState({ type, onAddExample }) {
    if (type === 'no-results') {
        return (
            <div className="text-center py-16 px-6 max-w-md mx-auto animate-fadeIn">
                <div className="flex items-center justify-center gap-2 text-4xl mb-6">
                    <span>🥒</span>
                    <span>➕</span>
                    <span>🍫</span>
                    <span>❓</span>
                </div>
                <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
                    Even we can't make dinner with that!
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                    Try adding more common ingredients or adjusting your filters. The more ingredients you add, the more recipe options we can create.
                </p>
                <div className="p-5 bg-muted/50 rounded-2xl">
                    <p className="text-sm font-medium text-foreground mb-3">💡 Try adding:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {['chicken', 'rice', 'garlic', 'olive oil'].map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-background border border-border rounded-full text-sm">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="text-center py-16 px-6 max-w-md mx-auto animate-fadeIn">
            <div className="mb-6">
                <span className="text-7xl inline-block animate-bounce">👩‍🍳</span>
            </div>
            <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
                Ready to cook something amazing?
            </h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
                Start by adding the ingredients you have at home. We'll find delicious recipes you can make right now!
            </p>

            <div className="mb-8">
                <p className="text-sm text-muted-foreground mb-3">Or try with these example ingredients:</p>
                <Button variant="outline" className="gap-2" onClick={() => onAddExample?.(exampleIngredients)}>
                    <span>🍗</span>
                    {exampleIngredients.join(', ')}
                </Button>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                {[
                    { icon: '📸', text: 'Upload fridge photo' },
                    { icon: '⚙️', text: 'Set preferences' },
                    { icon: '💾', text: 'Save favorites' }
                ].map(item => (
                    <div key={item.text} className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span>{item.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default EmptyState;
